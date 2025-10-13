// Test script to verify frontend API connection
async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Connection...');
  
  try {
    // Test 1: Basic API call
    console.log('📡 Fetching hospitals from API...');
    const response = await fetch('http://localhost:5001/api/hospitals?limit=2000');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response Status: ${data.success}`);
    console.log(`✅ Total hospitals received: ${data.data.hospitals.length}`);
    
    // Test 2: Check hospitals with coordinates
    const hospitalsWithCoords = data.data.hospitals.filter(h => h.latitude && h.longitude);
    console.log(`✅ Hospitals with coordinates: ${hospitalsWithCoords.length}`);
    
    // Test 3: Sample hospital data
    console.log('✅ Sample hospital data:');
    hospitalsWithCoords.slice(0, 3).forEach((hospital, index) => {
      console.log(`  ${index + 1}. ${hospital.name}`);
      console.log(`     📍 ${hospital.latitude}, ${hospital.longitude}`);
      console.log(`     🏥 ${hospital.type} - ${hospital.city}, ${hospital.province}`);
    });
    
    // Test 4: Check for any missing coordinates
    const hospitalsWithoutCoords = data.data.hospitals.filter(h => !h.latitude || !h.longitude);
    if (hospitalsWithoutCoords.length > 0) {
      console.log(`⚠️ Hospitals without coordinates: ${hospitalsWithoutCoords.length}`);
      hospitalsWithoutCoords.slice(0, 3).forEach(hospital => {
        console.log(`  - ${hospital.name} (${hospital.city})`);
      });
    } else {
      console.log('✅ All hospitals have coordinates!');
    }
    
    console.log('\n🎉 Frontend API test completed successfully!');
    console.log('🗺️ Map should display all hospital pins correctly.');
    
  } catch (error) {
    console.error('❌ Frontend API test failed:', error);
    console.log('💡 Make sure the backend server is running on port 5001');
  }
}

// Run the test
testFrontendAPI();
