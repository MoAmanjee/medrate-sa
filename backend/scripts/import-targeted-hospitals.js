import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

class TargetedHospitalImportService {
  constructor() {
    this.overpassServers = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter'
    ];
    this.currentServerIndex = 0;
    this.stats = { imported: 0, updated: 0, errors: 0, skipped: 0 };
  }

  async importMajorHospitals() {
    console.log('🏥 Importing major hospitals and healthcare facilities...');
    
    // Clear existing auto-populated hospitals
    await this.clearExistingHospitals();
    
    // Import in phases for better reliability
    await this.importPhase1_MajorHospitals();
    await this.delay(5000);
    
    await this.importPhase2_Clinics();
    await this.delay(5000);
    
    await this.importPhase3_Pharmacies();
    await this.delay(5000);
    
    await this.importPhase4_HealthcarePractices();
    
    await this.printStats();
  }

  async clearExistingHospitals() {
    console.log('🧹 Clearing existing hospitals...');
    const deleted = await prisma.hospital.deleteMany({
      where: { autoPopulated: true }
    });
    console.log(`✅ Cleared ${deleted.count} existing hospitals`);
  }

  async importPhase1_MajorHospitals() {
    console.log('\n📋 Phase 1: Importing major hospitals...');
    
    const queries = [
      // Major hospitals
      `[out:json][timeout:300];
      (
        node["amenity"="hospital"]["addr:country"="ZA"];
        way["amenity"="hospital"]["addr:country"="ZA"];
        relation["amenity"="hospital"]["addr:country"="ZA"];
      );
      out center meta;`,
      
      // Healthcare hospitals
      `[out:json][timeout:300];
      (
        node["healthcare"="hospital"]["addr:country"="ZA"];
        way["healthcare"="hospital"]["addr:country"="ZA"];
        relation["healthcare"="hospital"]["addr:country"="ZA"];
      );
      out center meta;`
    ];

    for (const query of queries) {
      await this.executeQuery(query, 'Major Hospitals');
    }
  }

  async importPhase2_Clinics() {
    console.log('\n📋 Phase 2: Importing clinics...');
    
    const queries = [
      // Clinics
      `[out:json][timeout:300];
      (
        node["amenity"="clinic"]["addr:country"="ZA"];
        way["amenity"="clinic"]["addr:country"="ZA"];
        relation["amenity"="clinic"]["addr:country"="ZA"];
      );
      out center meta;`,
      
      // Healthcare clinics
      `[out:json][timeout:300];
      (
        node["healthcare"="clinic"]["addr:country"="ZA"];
        way["healthcare"="clinic"]["addr:country"="ZA"];
        relation["healthcare"="clinic"]["addr:country"="ZA"];
      );
      out center meta;`
    ];

    for (const query of queries) {
      await this.executeQuery(query, 'Clinics');
    }
  }

  async importPhase3_Pharmacies() {
    console.log('\n📋 Phase 3: Importing pharmacies...');
    
    const queries = [
      // Pharmacies
      `[out:json][timeout:300];
      (
        node["amenity"="pharmacy"]["addr:country"="ZA"];
        way["amenity"="pharmacy"]["addr:country"="ZA"];
        relation["amenity"="pharmacy"]["addr:country"="ZA"];
      );
      out center meta;`,
      
      // Healthcare pharmacies
      `[out:json][timeout:300];
      (
        node["healthcare"="pharmacy"]["addr:country"="ZA"];
        way["healthcare"="pharmacy"]["addr:country"="ZA"];
        relation["healthcare"="pharmacy"]["addr:country"="ZA"];
      );
      out center meta;`
    ];

    for (const query of queries) {
      await this.executeQuery(query, 'Pharmacies');
    }
  }

  async importPhase4_HealthcarePractices() {
    console.log('\n📋 Phase 4: Importing healthcare practices...');
    
    const practiceTypes = ['doctor', 'dentist', 'physiotherapist', 'psychotherapist'];
    
    for (const practiceType of practiceTypes) {
      const query = `[out:json][timeout:300];
      (
        node["healthcare"="${practiceType}"]["addr:country"="ZA"];
        way["healthcare"="${practiceType}"]["addr:country"="ZA"];
        relation["healthcare"="${practiceType}"]["addr:country"="ZA"];
      );
      out center meta;`;
      
      await this.executeQuery(query, `${practiceType} practices`);
    }
  }

  async executeQuery(query, facilityType) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const server = this.overpassServers[this.currentServerIndex];
        console.log(`🌐 Querying ${facilityType} from ${server}...`);

        const response = await axios.post(server, query, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 60000
        });

        if (response.data && response.data.elements) {
          console.log(`📊 Found ${response.data.elements.length} ${facilityType}`);
          await this.processElements(response.data.elements, facilityType);
          return;
        }

      } catch (error) {
        attempts++;
        console.warn(`⚠️  Attempt ${attempts} failed for ${facilityType}: ${error.message}`);
        
        if (error.response?.status === 429 || error.response?.status === 504) {
          this.currentServerIndex = (this.currentServerIndex + 1) % this.overpassServers.length;
          await this.delay(5000);
        } else if (attempts < maxAttempts) {
          await this.delay(2000);
        }
      }
    }

    console.error(`❌ Failed to import ${facilityType} after ${maxAttempts} attempts`);
    this.stats.errors++;
  }

  async processElements(elements, facilityType) {
    for (const element of elements) {
      try {
        const hospitalData = this.extractHospitalData(element, facilityType);
        
        if (this.isValidHospital(hospitalData)) {
          await this.saveHospital(hospitalData);
        } else {
          this.stats.skipped++;
        }
      } catch (error) {
        console.error('❌ Error processing element:', error.message);
        this.stats.errors++;
      }
    }
  }

  extractHospitalData(element, facilityType) {
    const tags = element.tags || {};
    const coords = this.extractCoordinates(element);

    return {
      name: tags.name || tags['name:en'] || 'Unnamed Facility',
      type: this.determineFacilityType(tags, facilityType),
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

  determineFacilityType(tags, facilityType) {
    if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') {
      return tags.hospital_type === 'public' ? 'PUBLIC' : 'PRIVATE';
    }
    
    if (tags.amenity === 'clinic' || tags.healthcare === 'clinic') {
      return 'CLINIC';
    }
    
    if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') {
      return 'PHARMACY';
    }
    
    if (facilityType.includes('doctor') || facilityType.includes('dentist')) {
      return 'CLINIC';
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

  async saveHospital(hospitalData) {
    try {
      // Check if hospital already exists
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
        await prisma.hospital.update({
          where: { id: existing.id },
          data: { ...hospitalData, updatedAt: new Date() }
        });
        this.stats.updated++;
        console.log(`🔄 Updated: ${hospitalData.name} in ${hospitalData.city}`);
      } else {
        await prisma.hospital.create({ data: hospitalData });
        this.stats.imported++;
        console.log(`✅ Imported: ${hospitalData.name} in ${hospitalData.city}`);
      }
    } catch (error) {
      console.error(`❌ Error saving ${hospitalData.name}:`, error.message);
      this.stats.errors++;
    }
  }

  async printStats() {
    console.log('\n📊 IMPORT COMPLETE!');
    console.log('==================');
    console.log(`✅ New hospitals imported: ${this.stats.imported}`);
    console.log(`🔄 Existing hospitals updated: ${this.stats.updated}`);
    console.log(`⏭️  Facilities skipped: ${this.stats.skipped}`);
    console.log(`❌ Errors encountered: ${this.stats.errors}`);
    
    const totalInDb = await prisma.hospital.count();
    console.log(`🏥 Total hospitals in database: ${totalInDb}`);
    
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

async function main() {
  console.log('🚀 Starting targeted import of South African hospitals...');
  console.log('⏰ This will take 10-20 minutes\n');

  const importService = new TargetedHospitalImportService();

  try {
    await importService.importMajorHospitals();
    console.log('\n🎉 SUCCESS! South African hospitals imported!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

process.on('SIGINT', async () => {
  console.log('\n⏹️  Import interrupted');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch(console.error);
