import { PrismaClient } from '@prisma/client';
import OverpassService from './overpassService.js';

const prisma = new PrismaClient();
const overpassService = new OverpassService();

class HospitalImportService {
  constructor() {
    this.batchSize = 100; // Process hospitals in batches
    this.duplicateThreshold = 0.8; // Similarity threshold for duplicate detection
  }

  /**
   * Import all healthcare facilities from OpenStreetMap
   * @returns {Promise<Object>} Import statistics
   */
  async importAllHealthcareFacilities() {
    try {
      console.log('Starting comprehensive healthcare facility import...');
      
      // Fetch all healthcare facilities from OpenStreetMap
      const facilities = await overpassService.fetchSouthAfricanHealthcareFacilities();
      
      console.log(`Fetched ${facilities.length} facilities from OpenStreetMap`);
      
      // Process facilities in batches
      const results = await this.processFacilitiesInBatches(facilities);
      
      // Generate summary statistics
      const summary = await this.generateImportSummary();
      
      console.log('Healthcare facility import completed successfully');
      return {
        success: true,
        message: 'Healthcare facilities imported successfully',
        data: {
          totalFetched: facilities.length,
          totalProcessed: results.processed,
          totalInserted: results.inserted,
          totalUpdated: results.updated,
          totalSkipped: results.skipped,
          summary: summary
        }
      };
      
    } catch (error) {
      console.error('Error importing healthcare facilities:', error);
      return {
        success: false,
        message: 'Failed to import healthcare facilities',
        error: error.message
      };
    }
  }

  /**
   * Process facilities in batches to avoid memory issues
   * @param {Array} facilities - Array of facilities to process
   * @returns {Promise<Object>} Processing results
   */
  async processFacilitiesInBatches(facilities) {
    let processed = 0;
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < facilities.length; i += this.batchSize) {
      const batch = facilities.slice(i, i + this.batchSize);
      console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(facilities.length / this.batchSize)}`);
      
      const batchResults = await this.processBatch(batch);
      
      processed += batchResults.processed;
      inserted += batchResults.inserted;
      updated += batchResults.updated;
      skipped += batchResults.skipped;
    }

    return { processed, inserted, updated, skipped };
  }

  /**
   * Process a batch of facilities
   * @param {Array} batch - Batch of facilities to process
   * @returns {Promise<Object>} Batch processing results
   */
  async processBatch(batch) {
    let processed = 0;
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const facility of batch) {
      try {
        const result = await this.processFacility(facility);
        
        if (result.action === 'inserted') {
          inserted++;
        } else if (result.action === 'updated') {
          updated++;
        } else {
          skipped++;
        }
        
        processed++;
      } catch (error) {
        console.warn(`Error processing facility ${facility.name}:`, error.message);
        skipped++;
        processed++;
      }
    }

    return { processed, inserted, updated, skipped };
  }

  /**
   * Process individual facility
   * @param {Object} facility - Facility data
   * @returns {Promise<Object>} Processing result
   */
  async processFacility(facility) {
    // Check for existing facility by OSM ID or name/location
    const existingFacility = await this.findExistingFacility(facility);
    
    if (existingFacility) {
      // Update existing facility
      await this.updateFacility(existingFacility.id, facility);
      return { action: 'updated', id: existingFacility.id };
    } else {
      // Insert new facility
      const newFacility = await this.insertFacility(facility);
      return { action: 'inserted', id: newFacility.id };
    }
  }

  /**
   * Find existing facility by OSM ID or name/location similarity
   * @param {Object} facility - Facility data
   * @returns {Promise<Object|null>} Existing facility or null
   */
  async findExistingFacility(facility) {
    // First try to find by OSM ID
    if (facility.osmId) {
      const byOsmId = await prisma.hospital.findFirst({
        where: {
          osmId: facility.osmId,
          osmType: facility.osmType
        }
      });
      
      if (byOsmId) {
        return byOsmId;
      }
    }

    // If not found by OSM ID, try to find by name and location similarity
    const nearbyFacilities = await prisma.hospital.findMany({
      where: {
        name: {
          contains: facility.name
        },
        city: facility.city,
        province: facility.province
      }
    });

    // Check for exact matches first
    for (const existing of nearbyFacilities) {
      if (this.isExactMatch(existing, facility)) {
        return existing;
      }
    }

    // Check for similar matches
    for (const existing of nearbyFacilities) {
      if (this.isSimilarMatch(existing, facility)) {
        return existing;
      }
    }

    return null;
  }

  /**
   * Check if two facilities are exact matches
   * @param {Object} existing - Existing facility
   * @param {Object} newFacility - New facility
   * @returns {boolean} True if exact match
   */
  isExactMatch(existing, newFacility) {
    return existing.name.toLowerCase() === newFacility.name.toLowerCase() &&
           existing.city.toLowerCase() === newFacility.city.toLowerCase() &&
           existing.province === newFacility.province;
  }

  /**
   * Check if two facilities are similar matches
   * @param {Object} existing - Existing facility
   * @param {Object} newFacility - New facility
   * @returns {boolean} True if similar match
   */
  isSimilarMatch(existing, newFacility) {
    const nameSimilarity = this.calculateSimilarity(existing.name, newFacility.name);
    const locationSimilarity = existing.city === newFacility.city && existing.province === newFacility.province;
    
    return nameSimilarity >= this.duplicateThreshold && locationSimilarity;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Insert new facility into database
   * @param {Object} facility - Facility data
   * @returns {Promise<Object>} Created facility
   */
  async insertFacility(facility) {
    const facilityData = {
      name: facility.name,
      type: facility.type,
      classification: facility.classification,
      address: facility.address,
      city: facility.city,
      province: facility.province,
      postalCode: facility.postalCode,
      phone: facility.phone,
      email: facility.email,
      website: facility.website,
      latitude: facility.latitude,
      longitude: facility.longitude,
      verified: facility.verified,
      autoPopulated: facility.autoPopulated,
      dataSource: facility.dataSource,
      osmId: facility.osmId,
      osmType: facility.osmType,
      lastUpdated: facility.lastUpdated,
      isPublic: facility.type === 'PUBLIC'
    };

    return await prisma.hospital.create({
      data: facilityData
    });
  }

  /**
   * Update existing facility
   * @param {string} facilityId - Facility ID
   * @param {Object} facility - Updated facility data
   * @returns {Promise<Object>} Updated facility
   */
  async updateFacility(facilityId, facility) {
    const updateData = {
      name: facility.name,
      type: facility.type,
      classification: facility.classification,
      address: facility.address,
      city: facility.city,
      province: facility.province,
      postalCode: facility.postalCode,
      phone: facility.phone,
      email: facility.email,
      website: facility.website,
      latitude: facility.latitude,
      longitude: facility.longitude,
      dataSource: facility.dataSource,
      osmId: facility.osmId,
      osmType: facility.osmType,
      lastUpdated: facility.lastUpdated,
      isPublic: facility.type === 'PUBLIC'
    };

    return await prisma.hospital.update({
      where: { id: facilityId },
      data: updateData
    });
  }

  /**
   * Generate import summary statistics
   * @returns {Promise<Object>} Summary statistics
   */
  async generateImportSummary() {
    const totalHospitals = await prisma.hospital.count({
      where: { autoPopulated: true }
    });

    const byType = await prisma.hospital.groupBy({
      by: ['type'],
      where: { autoPopulated: true },
      _count: { id: true }
    });

    const byProvince = await prisma.hospital.groupBy({
      by: ['province'],
      where: { autoPopulated: true },
      _count: { id: true }
    });

    const byDataSource = await prisma.hospital.groupBy({
      by: ['dataSource'],
      where: { autoPopulated: true },
      _count: { id: true }
    });

    const withCoordinates = await prisma.hospital.count({
      where: {
        autoPopulated: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    return {
      totalHospitals,
      byType: byType.map(item => ({ type: item.type, count: item._count.id })),
      byProvince: byProvince.map(item => ({ province: item.province, count: item._count.id })),
      byDataSource: byDataSource.map(item => ({ source: item.dataSource, count: item._count.id })),
      withCoordinates,
      lastUpdated: new Date()
    };
  }

  /**
   * Import facilities by specific type
   * @param {string} amenityType - Amenity type (hospital, clinic, etc.)
   * @returns {Promise<Object>} Import results
   */
  async importFacilitiesByType(amenityType) {
    try {
      console.log(`Importing ${amenityType} facilities...`);
      
      const facilities = await overpassService.fetchFacilitiesByType(amenityType);
      const results = await this.processFacilitiesInBatches(facilities);
      
      return {
        success: true,
        message: `${amenityType} facilities imported successfully`,
        data: {
          totalFetched: facilities.length,
          totalProcessed: results.processed,
          totalInserted: results.inserted,
          totalUpdated: results.updated,
          totalSkipped: results.skipped
        }
      };
    } catch (error) {
      console.error(`Error importing ${amenityType} facilities:`, error);
      return {
        success: false,
        message: `Failed to import ${amenityType} facilities`,
        error: error.message
      };
    }
  }

  /**
   * Import facilities within a specific geographic area
   * @param {Object} bounds - Bounding box {north, south, east, west}
   * @param {string} amenityType - Optional amenity type filter
   * @returns {Promise<Object>} Import results
   */
  async importFacilitiesInArea(bounds, amenityType = null) {
    try {
      console.log(`Importing facilities in area: ${JSON.stringify(bounds)}`);
      
      const facilities = await overpassService.fetchFacilitiesInBounds(bounds, amenityType);
      const results = await this.processFacilitiesInBatches(facilities);
      
      return {
        success: true,
        message: 'Area facilities imported successfully',
        data: {
          totalFetched: facilities.length,
          totalProcessed: results.processed,
          totalInserted: results.inserted,
          totalUpdated: results.updated,
          totalSkipped: results.skipped
        }
      };
    } catch (error) {
      console.error('Error importing area facilities:', error);
      return {
        success: false,
        message: 'Failed to import area facilities',
        error: error.message
      };
    }
  }

  /**
   * Clean up duplicate facilities
   * @returns {Promise<Object>} Cleanup results
   */
  async cleanupDuplicates() {
    try {
      console.log('Starting duplicate cleanup...');
      
      const duplicates = await this.findDuplicates();
      let removed = 0;
      
      for (const duplicateGroup of duplicates) {
        // Keep the first one, remove the rest
        const toRemove = duplicateGroup.slice(1);
        
        for (const duplicate of toRemove) {
          await prisma.hospital.delete({
            where: { id: duplicate.id }
          });
          removed++;
        }
      }
      
      return {
        success: true,
        message: 'Duplicate cleanup completed',
        data: {
          duplicateGroups: duplicates.length,
          removedDuplicates: removed
        }
      };
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      return {
        success: false,
        message: 'Failed to cleanup duplicates',
        error: error.message
      };
    }
  }

  /**
   * Find duplicate facilities
   * @returns {Promise<Array>} Array of duplicate groups
   */
  async findDuplicates() {
    const hospitals = await prisma.hospital.findMany({
      where: { autoPopulated: true },
      orderBy: { createdAt: 'asc' }
    });

    const duplicates = [];
    const processed = new Set();

    for (let i = 0; i < hospitals.length; i++) {
      if (processed.has(hospitals[i].id)) continue;

      const group = [hospitals[i]];
      processed.add(hospitals[i].id);

      for (let j = i + 1; j < hospitals.length; j++) {
        if (processed.has(hospitals[j].id)) continue;

        if (this.isExactMatch(hospitals[i], hospitals[j])) {
          group.push(hospitals[j]);
          processed.add(hospitals[j].id);
        }
      }

      if (group.length > 1) {
        duplicates.push(group);
      }
    }

    return duplicates;
  }
}

export default HospitalImportService;
