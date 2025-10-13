import HospitalImportService from '../src/services/hospitalImportService.js';

async function runHospitalImport() {
  const importService = new HospitalImportService();
  
  try {
    console.log('🚀 Starting comprehensive healthcare facility import...');
    console.log('This will fetch all hospitals, clinics, and healthcare facilities from OpenStreetMap');
    console.log('Please be patient as this may take several minutes...\n');
    
    const result = await importService.importAllHealthcareFacilities();
    
    if (result.success) {
      console.log('\n✅ Import completed successfully!');
      console.log(`📊 Statistics:`);
      console.log(`   - Total fetched: ${result.data.totalFetched}`);
      console.log(`   - Total processed: ${result.data.totalProcessed}`);
      console.log(`   - Total inserted: ${result.data.totalInserted}`);
      console.log(`   - Total updated: ${result.data.totalUpdated}`);
      console.log(`   - Total skipped: ${result.data.totalSkipped}`);
      
      console.log('\n📈 Summary by Type:');
      result.data.summary.byType.forEach(item => {
        console.log(`   - ${item.type}: ${item.count} facilities`);
      });
      
      console.log('\n🗺️ Summary by Province:');
      result.data.summary.byProvince.forEach(item => {
        console.log(`   - ${item.province}: ${item.count} facilities`);
      });
      
      console.log(`\n📍 Facilities with coordinates: ${result.data.summary.withCoordinates}`);
      console.log(`📅 Last updated: ${result.data.summary.lastUpdated}`);
      
    } else {
      console.error('\n❌ Import failed:', result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
    }
    
  } catch (error) {
    console.error('\n💥 Unexpected error during import:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the import
runHospitalImport();
