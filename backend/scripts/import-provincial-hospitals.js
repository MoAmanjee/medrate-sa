import HospitalImportService from '../src/services/hospitalImportService.js';

async function runProvincialImport() {
  const importService = new HospitalImportService();
  
  // South African provinces with their bounding boxes
  const provinces = [
    {
      name: 'Western Cape',
      bounds: { north: -31.0, south: -35.0, east: 20.0, west: 16.0 }
    },
    {
      name: 'Eastern Cape', 
      bounds: { north: -30.0, south: -35.0, east: 30.0, west: 20.0 }
    },
    {
      name: 'Northern Cape',
      bounds: { north: -25.0, south: -35.0, east: 20.0, west: 16.0 }
    },
    {
      name: 'Free State',
      bounds: { north: -26.0, south: -31.0, east: 30.0, west: 24.0 }
    },
    {
      name: 'KwaZulu-Natal',
      bounds: { north: -25.0, south: -31.0, east: 33.0, west: 28.0 }
    },
    {
      name: 'North West',
      bounds: { north: -24.0, south: -28.0, east: 28.0, west: 22.0 }
    },
    {
      name: 'Gauteng',
      bounds: { north: -24.0, south: -27.0, east: 29.0, west: 26.0 }
    },
    {
      name: 'Mpumalanga',
      bounds: { north: -23.0, south: -27.0, east: 32.0, west: 28.0 }
    },
    {
      name: 'Limpopo',
      bounds: { north: -22.0, south: -25.0, east: 32.0, west: 26.0 }
    }
  ];
  
  try {
    console.log('🚀 Starting provincial healthcare facility import...');
    console.log('This will import facilities province by province to avoid timeouts\n');
    
    let totalFetched = 0;
    let totalProcessed = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    
    for (const province of provinces) {
      console.log(`\n📍 Importing facilities for ${province.name}...`);
      
      try {
        const result = await importService.importFacilitiesInArea(province.bounds);
        
        if (result.success) {
          console.log(`✅ ${province.name}: ${result.data.totalFetched} facilities fetched`);
          
          totalFetched += result.data.totalFetched;
          totalProcessed += result.data.totalProcessed;
          totalInserted += result.data.totalInserted;
          totalUpdated += result.data.totalUpdated;
          totalSkipped += result.data.totalSkipped;
        } else {
          console.error(`❌ ${province.name}: ${result.message}`);
        }
        
        // Small delay between provinces to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`💥 Error importing ${province.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Provincial import completed!');
    console.log(`📊 Final Statistics:`);
    console.log(`   - Total fetched: ${totalFetched}`);
    console.log(`   - Total processed: ${totalProcessed}`);
    console.log(`   - Total inserted: ${totalInserted}`);
    console.log(`   - Total updated: ${totalUpdated}`);
    console.log(`   - Total skipped: ${totalSkipped}`);
    
    // Generate final summary
    const summary = await importService.generateImportSummary();
    console.log('\n📈 Summary by Type:');
    summary.byType.forEach(item => {
      console.log(`   - ${item.type}: ${item.count} facilities`);
    });
    
    console.log('\n🗺️ Summary by Province:');
    summary.byProvince.forEach(item => {
      console.log(`   - ${item.province}: ${item.count} facilities`);
    });
    
    console.log(`\n📍 Facilities with coordinates: ${summary.withCoordinates}`);
    console.log(`📅 Last updated: ${summary.lastUpdated}`);
    
  } catch (error) {
    console.error('\n💥 Unexpected error during provincial import:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the provincial import
runProvincialImport();

