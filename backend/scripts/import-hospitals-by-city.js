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

class CityBasedHospitalImportService {
  constructor() {
    this.overpassServers = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter'
    ];
    this.currentServerIndex = 0;
    this.stats = { imported: 0, updated: 0, errors: 0, skipped: 0 };
    
    // Major South African cities with coordinates
    this.majorCities = [
      { name: 'Cape Town', lat: -33.9249, lng: 18.4241, radius: 50000 },
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, radius: 50000 },
      { name: 'Durban', lat: -29.8587, lng: 31.0218, radius: 50000 },
      { name: 'Pretoria', lat: -25.7479, lng: 28.2293, radius: 50000 },
      { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, radius: 50000 },
      { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596, radius: 50000 },
      { name: 'East London', lat: -33.0292, lng: 27.8546, radius: 50000 },
      { name: 'Nelspruit', lat: -25.4745, lng: 30.9703, radius: 50000 },
      { name: 'Polokwane', lat: -23.9045, lng: 29.4689, radius: 50000 },
      { name: 'Kimberley', lat: -28.7282, lng: 24.7499, radius: 50000 },
      { name: 'Pietermaritzburg', lat: -29.6006, lng: 30.3794, radius: 50000 },
      { name: 'Rustenburg', lat: -25.6676, lng: 27.2421, radius: 50000 },
      { name: 'Welkom', lat: -27.9881, lng: 26.7067, radius: 50000 },
      { name: 'Potchefstroom', lat: -26.7145, lng: 27.0979, radius: 50000 },
      { name: 'Vereeniging', lat: -26.6731, lng: 27.9261, radius: 50000 }
    ];
  }

  async importAllHospitalsByCity() {
    console.log('🏥 Importing hospitals by major South African cities...');
    console.log(`📍 Will search ${this.majorCities.length} major cities\n`);
    
    // Clear existing hospitals
    await this.clearExistingHospitals();
    
    for (const city of this.majorCities) {
      console.log(`\n🏙️  Searching hospitals in ${city.name}...`);
      await this.importHospitalsInCity(city);
      await this.delay(3000); // Delay between cities to avoid rate limiting
    }
    
    await this.printStats();
  }

  async clearExistingHospitals() {
    console.log('🧹 Clearing existing hospitals...');
    const deleted = await prisma.hospital.deleteMany({
      where: { autoPopulated: true }
    });
    console.log(`✅ Cleared ${deleted.count} existing hospitals`);
  }

  async importHospitalsInCity(city) {
    const queries = [
      // Hospitals in city area
      `[out:json][timeout:300];
      (
        node["amenity"="hospital"](around:${city.radius},${city.lat},${city.lng});
        way["amenity"="hospital"](around:${city.radius},${city.lat},${city.lng});
        relation["amenity"="hospital"](around:${city.radius},${city.lat},${city.lng});
      );
      out center meta;`,
      
      // Clinics in city area
      `[out:json][timeout:300];
      (
        node["amenity"="clinic"](around:${city.radius},${city.lat},${city.lng});
        way["amenity"="clinic"](around:${city.radius},${city.lat},${city.lng});
        relation["amenity"="clinic"](around:${city.radius},${city.lat},${city.lng});
      );
      out center meta;`,
      
      // Healthcare facilities in city area
      `[out:json][timeout:300];
      (
        node["healthcare"](around:${city.radius},${city.lat},${city.lng});
        way["healthcare"](around:${city.radius},${city.lat},${city.lng});
        relation["healthcare"](around:${city.radius},${city.lat},${city.lng});
      );
      out center meta;`,
      
      // Pharmacies in city area
      `[out:json][timeout:300];
      (
        node["amenity"="pharmacy"](around:${city.radius},${city.lat},${city.lng});
        way["amenity"="pharmacy"](around:${city.radius},${city.lat},${city.lng});
        relation["amenity"="pharmacy"](around:${city.radius},${city.lat},${city.lng});
      );
      out center meta;`
    ];

    for (const query of queries) {
      await this.executeQuery(query, city.name);
      await this.delay(1000); // Delay between queries
    }
  }

  async executeQuery(query, cityName) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const server = this.overpassServers[this.currentServerIndex];
        console.log(`🌐 Querying ${cityName} from ${server}...`);

        const response = await axios.post(server, query, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 60000
        });

        if (response.data && response.data.elements) {
          console.log(`📊 Found ${response.data.elements.length} facilities in ${cityName}`);
          await this.processElements(response.data.elements, cityName);
          return;
        }

      } catch (error) {
        attempts++;
        console.warn(`⚠️  Attempt ${attempts} failed for ${cityName}: ${error.message}`);
        
        if (error.response?.status === 429 || error.response?.status === 504) {
          this.currentServerIndex = (this.currentServerIndex + 1) % this.overpassServers.length;
          await this.delay(5000);
        } else if (attempts < maxAttempts) {
          await this.delay(2000);
        }
      }
    }

    console.error(`❌ Failed to import ${cityName} after ${maxAttempts} attempts`);
    this.stats.errors++;
  }

  async processElements(elements, cityName) {
    for (const element of elements) {
      try {
        const hospitalData = this.extractHospitalData(element, cityName);
        
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

  extractHospitalData(element, cityName) {
    const tags = element.tags || {};
    const coords = this.extractCoordinates(element);

    return {
      name: tags.name || tags['name:en'] || 'Unnamed Facility',
      type: this.determineFacilityType(tags),
      classification: tags.hospital_type || tags.clinic_type || 'GENERAL',
      address: this.buildAddress(tags),
      city: tags['addr:city'] || tags.city || cityName,
      province: tags['addr:province'] || tags.province || this.getProvinceForCity(cityName),
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
    
    if (tags.healthcare === 'doctor' || tags.healthcare === 'dentist') {
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

  getProvinceForCity(cityName) {
    const cityProvinceMap = {
      'Cape Town': 'Western Cape',
      'Johannesburg': 'Gauteng',
      'Pretoria': 'Gauteng',
      'Durban': 'KwaZulu-Natal',
      'Pietermaritzburg': 'KwaZulu-Natal',
      'Port Elizabeth': 'Eastern Cape',
      'East London': 'Eastern Cape',
      'Bloemfontein': 'Free State',
      'Welkom': 'Free State',
      'Nelspruit': 'Mpumalanga',
      'Polokwane': 'Limpopo',
      'Kimberley': 'Northern Cape',
      'Rustenburg': 'North West',
      'Potchefstroom': 'North West',
      'Vereeniging': 'Gauteng'
    };
    return cityProvinceMap[cityName] || '';
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
    console.log('\n📊 CITY-BASED IMPORT COMPLETE!');
    console.log('==============================');
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

    const cityStats = await prisma.hospital.groupBy({
      by: ['city'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });
    
    console.log('\n🏙️  Top Cities by Hospital Count:');
    cityStats.forEach(stat => {
      console.log(`  ${stat.city}: ${stat._count.id} hospitals`);
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  console.log('🚀 Starting city-based import of South African hospitals...');
  console.log('⏰ This will take 15-30 minutes\n');

  const importService = new CityBasedHospitalImportService();

  try {
    await importService.importAllHospitalsByCity();
    console.log('\n🎉 SUCCESS! All South African hospitals imported by city!');
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
