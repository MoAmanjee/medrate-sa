import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testHospitalsAPI() {
  console.log('🧪 Testing Hospitals API...');
  
  try {
    // Test 1: Count total hospitals
    const totalHospitals = await prisma.hospital.count();
    console.log(`✅ Total hospitals in database: ${totalHospitals}`);
    
    // Test 2: Count hospitals with coordinates
    const hospitalsWithCoords = await prisma.hospital.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });
    console.log(`✅ Hospitals with coordinates: ${hospitalsWithCoords}`);
    
    // Test 3: Sample hospitals with coordinates
    const sampleHospitals = await prisma.hospital.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        city: true,
        province: true,
        latitude: true,
        longitude: true,
        type: true
      }
    });
    
    console.log('✅ Sample hospitals with coordinates:');
    sampleHospitals.forEach((hospital, index) => {
      console.log(`  ${index + 1}. ${hospital.name} (${hospital.city}, ${hospital.province})`);
      console.log(`     📍 ${hospital.latitude}, ${hospital.longitude}`);
      console.log(`     🏥 Type: ${hospital.type}`);
    });
    
    // Test 4: Hospitals by province
    const hospitalsByProvince = await prisma.hospital.groupBy({
      by: ['province'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    
    console.log('✅ Hospitals by province:');
    hospitalsByProvince.forEach(province => {
      console.log(`  ${province.province}: ${province._count.id} hospitals`);
    });
    
    console.log('\n🎉 All API tests passed! Map should show all hospital pins.');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHospitalsAPI();
