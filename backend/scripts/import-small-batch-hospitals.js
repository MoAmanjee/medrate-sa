import HospitalImportService from '../src/services/hospitalImportService.js';

async function runSmallBatchImport() {
  const importService = new HospitalImportService();
  
  try {
    console.log('🚀 Starting small batch healthcare facility import...');
    console.log('This will import facilities in smaller batches to avoid rate limiting\n');
    
    // Import just hospitals first (smaller dataset)
    console.log('📍 Importing hospitals only...');
    const hospitalResult = await importService.importFacilitiesByType('hospital');
    
    if (hospitalResult.success) {
      console.log(`✅ Hospitals: ${hospitalResult.data.totalFetched} facilities fetched`);
      console.log(`   - Inserted: ${hospitalResult.data.totalInserted}`);
      console.log(`   - Updated: ${hospitalResult.data.totalUpdated}`);
      console.log(`   - Skipped: ${hospitalResult.data.totalSkipped}`);
    } else {
      console.error(`❌ Hospitals: ${hospitalResult.message}`);
    }
    
    // Wait between requests
    console.log('\n⏳ Waiting 10 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Import clinics
    console.log('📍 Importing clinics...');
    const clinicResult = await importService.importFacilitiesByType('clinic');
    
    if (clinicResult.success) {
      console.log(`✅ Clinics: ${clinicResult.data.totalFetched} facilities fetched`);
      console.log(`   - Inserted: ${clinicResult.data.totalInserted}`);
      console.log(`   - Updated: ${clinicResult.data.totalUpdated}`);
      console.log(`   - Skipped: ${clinicResult.data.totalSkipped}`);
    } else {
      console.error(`❌ Clinics: ${clinicResult.message}`);
    }
    
    // Wait between requests
    console.log('\n⏳ Waiting 10 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Import doctors
    console.log('📍 Importing doctor practices...');
    const doctorsResult = await importService.importFacilitiesByType('doctors');
    
    if (doctorsResult.success) {
      console.log(`✅ Doctor practices: ${doctorsResult.data.totalFetched} facilities fetched`);
      console.log(`   - Inserted: ${doctorsResult.data.totalInserted}`);
      console.log(`   - Updated: ${doctorsResult.data.totalUpdated}`);
      console.log(`   - Skipped: ${doctorsResult.data.totalSkipped}`);
    } else {
      console.error(`❌ Doctor practices: ${doctorsResult.message}`);
    }
    
    console.log('\n🎉 Small batch import completed!');
    
    // Generate final summary
    const summary = await importService.generateImportSummary();
    console.log('\n📈 Final Summary by Type:');
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
    console.error('\n💥 Unexpected error during small batch import:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the small batch import
runSmallBatchImport();

