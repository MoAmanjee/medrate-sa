import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleHospitals = [
  {
    name: 'Groote Schuur Hospital',
    type: 'PUBLIC',
    classification: 'TERTIARY',
    address: 'Main Road, Observatory',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '+27 21 404 9111',
    email: 'info@grooteschuur.co.za',
    website: 'https://www.grooteschuur.co.za',
    latitude: -33.9382,
    longitude: 18.4701,
    verified: true,
    autoPopulated: true,
    averageRating: 4.2,
    totalReviews: 156
  },
  {
    name: 'Netcare Christiaan Barnard Memorial Hospital',
    type: 'PRIVATE',
    classification: 'TERTIARY',
    address: '181 Longmarket Street',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '+27 21 480 6111',
    email: 'info@netcare.co.za',
    website: 'https://www.netcare.co.za',
    latitude: -33.9249,
    longitude: 18.4241,
    verified: true,
    autoPopulated: true,
    averageRating: 4.5,
    totalReviews: 89
  },
  {
    name: 'Charlotte Maxeke Johannesburg Academic Hospital',
    type: 'PUBLIC',
    classification: 'TERTIARY',
    address: '17 Jubilee Road, Parktown',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '+27 11 488 4911',
    email: 'info@cmjah.co.za',
    website: 'https://www.cmjah.co.za',
    latitude: -26.1715,
    longitude: 28.0416,
    verified: true,
    autoPopulated: true,
    averageRating: 3.8,
    totalReviews: 203
  },
  {
    name: 'Life Healthcare Group',
    type: 'PRIVATE',
    classification: 'TERTIARY',
    address: '76 Rivonia Road, Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '+27 11 219 9000',
    email: 'info@lifehealthcare.co.za',
    website: 'https://www.lifehealthcare.co.za',
    latitude: -26.1073,
    longitude: 28.0567,
    verified: true,
    autoPopulated: true,
    averageRating: 4.3,
    totalReviews: 312
  },
  {
    name: 'Addington Hospital',
    type: 'PUBLIC',
    classification: 'SECONDARY',
    address: '101 Erskine Terrace, South Beach',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    phone: '+27 31 327 2000',
    email: 'info@addingtonhospital.co.za',
    website: 'https://www.addingtonhospital.co.za',
    latitude: -29.8587,
    longitude: 31.0218,
    verified: true,
    autoPopulated: true,
    averageRating: 4.0,
    totalReviews: 127
  },
  {
    name: 'Mediclinic Southern Africa',
    type: 'PRIVATE',
    classification: 'TERTIARY',
    address: '1 Heerengracht Street',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '+27 21 480 6111',
    email: 'info@mediclinic.co.za',
    website: 'https://www.mediclinic.co.za',
    latitude: -33.9249,
    longitude: 18.4241,
    verified: true,
    autoPopulated: true,
    averageRating: 4.4,
    totalReviews: 245
  },
  {
    name: 'Steve Biko Academic Hospital',
    type: 'PUBLIC',
    classification: 'TERTIARY',
    address: 'Malcolm X Street, Steve Biko Road',
    city: 'Pretoria',
    province: 'Gauteng',
    phone: '+27 12 354 1000',
    email: 'info@stevebiko.co.za',
    website: 'https://www.stevebiko.co.za',
    latitude: -25.7479,
    longitude: 28.2293,
    verified: true,
    autoPopulated: true,
    averageRating: 3.9,
    totalReviews: 178
  },
  {
    name: 'Tygerberg Hospital',
    type: 'PUBLIC',
    classification: 'TERTIARY',
    address: 'Francie van Zijl Drive, Parow Valley',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '+27 21 938 4911',
    email: 'info@tygerberg.co.za',
    website: 'https://www.tygerberg.co.za',
    latitude: -33.8847,
    longitude: 18.6004,
    verified: true,
    autoPopulated: true,
    averageRating: 4.1,
    totalReviews: 198
  },
  {
    name: 'King Edward VIII Hospital',
    type: 'PUBLIC',
    classification: 'TERTIARY',
    address: '2nd Avenue, Umbilo',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    phone: '+27 31 360 3111',
    email: 'info@kingedward.co.za',
    website: 'https://www.kingedward.co.za',
    latitude: -29.8587,
    longitude: 31.0218,
    verified: true,
    autoPopulated: true,
    averageRating: 3.7,
    totalReviews: 142
  },
  {
    name: 'Sunninghill Hospital',
    type: 'PRIVATE',
    classification: 'TERTIARY',
    address: '1 Cillie Avenue, Sunninghill',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '+27 11 806 1500',
    email: 'info@sunninghill.co.za',
    website: 'https://www.sunninghill.co.za',
    latitude: -26.0267,
    longitude: 28.0431,
    verified: true,
    autoPopulated: true,
    averageRating: 4.6,
    totalReviews: 267
  },
  {
    name: 'Port Elizabeth Provincial Hospital',
    type: 'PUBLIC',
    classification: 'SECONDARY',
    address: '1 Cape Road, Port Elizabeth',
    city: 'Gqeberha',
    province: 'Eastern Cape',
    phone: '+27 41 391 9111',
    email: 'info@peprovincial.co.za',
    website: 'https://www.peprovincial.co.za',
    latitude: -33.9608,
    longitude: 25.6022,
    verified: true,
    autoPopulated: true,
    averageRating: 3.6,
    totalReviews: 89
  },
  {
    name: 'Bloemfontein Academic Hospital',
    type: 'PUBLIC',
    classification: 'TERTIARY',
    address: '1 Parfitt Avenue, Bloemfontein',
    city: 'Bloemfontein',
    province: 'Free State',
    phone: '+27 51 405 1911',
    email: 'info@bloemacademic.co.za',
    website: 'https://www.bloemacademic.co.za',
    latitude: -29.1211,
    longitude: 26.2140,
    verified: true,
    autoPopulated: true,
    averageRating: 3.8,
    totalReviews: 134
  }
];

async function seedHospitals() {
  try {
    console.log('🌱 Seeding hospitals database...');
    
    // Clear existing hospitals
    await prisma.hospital.deleteMany({});
    console.log('✅ Cleared existing hospitals');
    
    // Insert sample hospitals
    for (const hospital of sampleHospitals) {
      await prisma.hospital.create({
        data: hospital
      });
    }
    
    console.log(`✅ Successfully seeded ${sampleHospitals.length} hospitals`);
    
    // Verify the data
    const count = await prisma.hospital.count();
    console.log(`📊 Total hospitals in database: ${count}`);
    
    const provinces = await prisma.hospital.groupBy({
      by: ['province'],
      _count: { id: true }
    });
    
    console.log('📈 Hospitals by province:');
    provinces.forEach(province => {
      console.log(`  ${province.province}: ${province._count.id} hospitals`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedHospitals();
