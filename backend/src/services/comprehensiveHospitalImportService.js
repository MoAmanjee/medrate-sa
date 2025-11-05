import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

class ComprehensiveHospitalImportService {
  constructor() {
    this.overpassServers = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter',
      'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
    ];
    this.currentServerIndex = 0;
    this.importStats = {
      totalFound: 0,
      imported: 0,
      updated: 0,
      errors: 0,
      skipped: 0
    };
  }

  async importAllSouthAfricanHospitals() {
    console.log('🏥 Starting comprehensive import of ALL South African hospitals...');
    
    try {
      // Clear existing auto-populated hospitals first
      await this.clearExistingHospitals();
      
      // Import different types of healthcare facilities
      const facilityTypes = [
        { amenity: 'hospital', name: 'Hospitals' },
        { amenity: 'clinic', name: 'Clinics' },
        { amenity: 'pharmacy', name: 'Pharmacies' },
        { healthcare: 'hospital', name: 'Healthcare Hospitals' },
        { healthcare: 'clinic', name: 'Healthcare Clinics' },
        { healthcare: 'pharmacy', name: 'Healthcare Pharmacies' },
        { healthcare: 'doctor', name: 'Doctor Practices' },
        { healthcare: 'dentist', name: 'Dental Practices' },
        { healthcare: 'physiotherapist', name: 'Physiotherapy Practices' },
        { healthcare: 'psychotherapist', name: 'Psychology Practices' }
      ];

      for (const facilityType of facilityTypes) {
        console.log(`\n📋 Importing ${facilityType.name}...`);
        await this.importFacilityType(facilityType);
        
        // Add delay between different facility types to avoid rate limiting
        await this.delay(2000);
      }

      // Import by provinces for better coverage
      const provinces = [
        'Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape',
        'Free State', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West'
      ];

      for (const province of provinces) {
        console.log(`\n🗺️  Importing facilities in ${province}...`);
        await this.importByProvince(province);
        await this.delay(3000);
      }

      // Final statistics
      await this.printFinalStats();
      
    } catch (error) {
      console.error('❌ Comprehensive import failed:', error);
      throw error;
    }
  }

  async clearExistingHospitals() {
    console.log('🧹 Clearing existing auto-populated hospitals...');
    const deleted = await prisma.hospital.deleteMany({
      where: { autoPopulated: true }
    });
    console.log(`✅ Cleared ${deleted.count} existing hospitals`);
  }

  async importFacilityType(facilityType) {
    const queries = this.buildQueriesForFacilityType(facilityType);
    
    for (const query of queries) {
      try {
        await this.executeOverpassQuery(query, facilityType.name);
        await this.delay(1000); // Delay between queries
      } catch (error) {
        console.error(`❌ Error importing ${facilityType.name}:`, error.message);
        this.importStats.errors++;
      }
    }
  }

  buildQueriesForFacilityType(facilityType) {
    const queries = [];
    
    // Main query for the facility type
    if (facilityType.amenity) {
      queries.push(`
        [out:json][timeout:300];
        (
          node["amenity"="${facilityType.amenity}"]["addr:country"="ZA"];
          way["amenity"="${facilityType.amenity}"]["addr:country"="ZA"];
          relation["amenity"="${facilityType.amenity}"]["addr:country"="ZA"];
        );
        out center meta;
      `);
    }
    
    if (facilityType.healthcare) {
      queries.push(`
        [out:json][timeout:300];
        (
          node["healthcare"="${facilityType.healthcare}"]["addr:country"="ZA"];
          way["healthcare"="${facilityType.healthcare}"]["addr:country"="ZA"];
          relation["healthcare"="${facilityType.healthcare}"]["addr:country"="ZA"];
        );
        out center meta;
      `);
    }

    // Additional queries for specific tags
    queries.push(`
      [out:json][timeout:300];
      (
        node["amenity"="${facilityType.amenity || facilityType.healthcare}"]["addr:province"];
        way["amenity"="${facilityType.amenity || facilityType.healthcare}"]["addr:province"];
        relation["amenity"="${facilityType.amenity || facilityType.healthcare}"]["addr:province"];
      );
      out center meta;
    `);

    return queries;
  }

  async importByProvince(province) {
    const provinceQueries = this.buildProvinceQueries(province);
    
    for (const query of provinceQueries) {
      try {
        await this.executeOverpassQuery(query, `${province} facilities`);
        await this.delay(1500);
      } catch (error) {
        console.error(`❌ Error importing ${province}:`, error.message);
        this.importStats.errors++;
      }
    }
  }

  buildProvinceQueries(province) {
    const provinceCode = this.getProvinceCode(province);
    
    return [
      // Hospitals in province
      `[out:json][timeout:300];
      (
        node["amenity"="hospital"]["addr:province"="${province}"];
        way["amenity"="hospital"]["addr:province"="${province}"];
        relation["amenity"="hospital"]["addr:province"="${province}"];
      );
      out center meta;`,
      
      // Clinics in province
      `[out:json][timeout:300];
      (
        node["amenity"="clinic"]["addr:province"="${province}"];
        way["amenity"="clinic"]["addr:province"="${province}"];
        relation["amenity"="clinic"]["addr:province"="${province}"];
      );
      out center meta;`,
      
      // Healthcare facilities in province
      `[out:json][timeout:300];
      (
        node["healthcare"]["addr:province"="${province}"];
        way["healthcare"]["addr:province"="${province}"];
        relation["healthcare"]["addr:province"="${province}"];
      );
      out center meta;`
    ];
  }

  getProvinceCode(province) {
    const provinceMap = {
      'Western Cape': 'WC',
      'Gauteng': 'GP',
      'KwaZulu-Natal': 'KZN',
      'Eastern Cape': 'EC',
      'Free State': 'FS',
      'Limpopo': 'LP',
      'Mpumalanga': 'MP',
      'Northern Cape': 'NC',
      'North West': 'NW'
    };
    return provinceMap[province] || province;
  }

  async executeOverpassQuery(query, facilityType) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const server = this.overpassServers[this.currentServerIndex];
        console.log(`🌐 Querying ${server} for ${facilityType}...`);

        const response = await axios.post(server, query, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 60000
        });

        if (response.data && response.data.elements) {
          console.log(`📊 Found ${response.data.elements.length} ${facilityType}`);
          await this.processHospitalData(response.data.elements, facilityType);
          return;
        }

      } catch (error) {
        attempts++;
        console.warn(`⚠️  Attempt ${attempts} failed for ${facilityType}: ${error.message}`);
        
        if (error.response?.status === 429 || error.response?.status === 504) {
          // Rate limited or timeout - switch server
          this.currentServerIndex = (this.currentServerIndex + 1) % this.overpassServers.length;
          await this.delay(5000);
        } else if (attempts < maxAttempts) {
          await this.delay(2000);
        }
      }
    }

    throw new Error(`Failed to import ${facilityType} after ${maxAttempts} attempts`);
  }

  async processHospitalData(elements, facilityType) {
    this.importStats.totalFound += elements.length;

    for (const element of elements) {
      try {
        const hospitalData = this.extractHospitalData(element);
        
        if (this.isValidHospital(hospitalData)) {
          await this.saveOrUpdateHospital(hospitalData, facilityType);
        } else {
          this.importStats.skipped++;
        }
      } catch (error) {
        console.error('❌ Error processing hospital:', error.message);
        this.importStats.errors++;
      }
    }
  }

  extractHospitalData(element) {
    const tags = element.tags || {};
    const coords = this.extractCoordinates(element);

    return {
      name: tags.name || tags['name:en'] || 'Unnamed Facility',
      type: this.determineFacilityType(tags),
      classification: tags.hospital_type || tags.clinic_type || 'GENERAL',
      address: this.buildAddress(tags),
      city: tags['addr:city'] || tags.city || '',
      province: tags['addr:province'] || tags.province || '',
      postalCode: tags['addr:postcode'] || tags.postcode || '',
      phone: tags.phone || tags['contact:phone'] || '',
      email: tags.email || tags['contact:email'] || '',
      website: tags.website || tags['contact:website'] || '',
      latitude: coords.lat,
      longitude: coords.lng,
      verified: false,
      autoPopulated: true,
      averageRating: 0,
      totalReviews: 0,
      osmId: element.id?.toString(),
      osmType: element.type
    };
  }

  extractCoordinates(element) {
    if (element.lat && element.lon) {
      return { lat: parseFloat(element.lat), lng: parseFloat(element.lon) };
    }
    
    if (element.center) {
      return { lat: parseFloat(element.center.lat), lng: parseFloat(element.center.lon) };
    }
    
    return { lat: null, lng: null };
  }

  determineFacilityType(tags) {
    if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') {
      return tags.hospital_type === 'public' ? 'PUBLIC' : 'PRIVATE';
    }
    
    if (tags.amenity === 'clinic' || tags.healthcare === 'clinic') {
      return 'CLINIC';
    }
    
    if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') {
      return 'PHARMACY';
    }
    
    return 'CLINIC';
  }

  buildAddress(tags) {
    const parts = [];
    
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
    
    return parts.join(' ') || tags['addr:full'] || '';
  }

  isValidHospital(hospitalData) {
    return (
      hospitalData.name &&
      hospitalData.name !== 'Unnamed Facility' &&
      hospitalData.latitude &&
      hospitalData.longitude &&
      hospitalData.city &&
      hospitalData.province
    );
  }

  async saveOrUpdateHospital(hospitalData, facilityType) {
    try {
      // Check if hospital already exists by coordinates or name
      const existing = await prisma.hospital.findFirst({
        where: {
          OR: [
            {
              AND: [
                { latitude: { not: null } },
                { longitude: { not: null } },
                { latitude: { gte: hospitalData.latitude - 0.001 } },
                { latitude: { lte: hospitalData.latitude + 0.001 } },
                { longitude: { gte: hospitalData.longitude - 0.001 } },
                { longitude: { lte: hospitalData.longitude + 0.001 } }
              ]
            },
            {
              name: hospitalData.name,
              city: hospitalData.city
            }
          ]
        }
      });

      if (existing) {
        // Update existing hospital
        await prisma.hospital.update({
          where: { id: existing.id },
          data: {
            ...hospitalData,
            updatedAt: new Date()
          }
        });
        this.importStats.updated++;
        console.log(`🔄 Updated: ${hospitalData.name} in ${hospitalData.city}`);
      } else {
        // Create new hospital
        await prisma.hospital.create({
          data: hospitalData
        });
        this.importStats.imported++;
        console.log(`✅ Imported: ${hospitalData.name} in ${hospitalData.city}`);
      }
    } catch (error) {
      console.error(`❌ Error saving hospital ${hospitalData.name}:`, error.message);
      this.importStats.errors++;
    }
  }

  async printFinalStats() {
    console.log('\n📊 COMPREHENSIVE IMPORT COMPLETE!');
    console.log('=====================================');
    console.log(`📋 Total facilities found: ${this.importStats.totalFound}`);
    console.log(`✅ New hospitals imported: ${this.importStats.imported}`);
    console.log(`🔄 Existing hospitals updated: ${this.importStats.updated}`);
    console.log(`⏭️  Facilities skipped: ${this.importStats.skipped}`);
    console.log(`❌ Errors encountered: ${this.importStats.errors}`);
    
    // Get final count from database
    const totalInDb = await prisma.hospital.count();
    console.log(`🏥 Total hospitals in database: ${totalInDb}`);
    
    // Get breakdown by province
    const provinceStats = await prisma.hospital.groupBy({
      by: ['province'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    
    console.log('\n🗺️  Hospitals by Province:');
    provinceStats.forEach(stat => {
      console.log(`  ${stat.province}: ${stat._count.id} hospitals`);
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ComprehensiveHospitalImportService;
