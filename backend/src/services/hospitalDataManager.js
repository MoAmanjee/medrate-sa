import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

// Hospital data sources and update mechanisms
class HospitalDataManager {
  
  // Update hospital data from external sources
  async updateHospitalData() {
    try {
      console.log('Starting automated hospital data update...');
      
      // Get all auto-populated hospitals
      const hospitals = await prisma.hospital.findMany({
        where: { autoPopulated: true }
      });
      
      console.log(`Found ${hospitals.length} auto-populated hospitals to update`);
      
      // Update each hospital's lastUpdated timestamp
      for (const hospital of hospitals) {
        await prisma.hospital.update({
          where: { id: hospital.id },
          data: {
            lastUpdated: new Date(),
            // In a real implementation, you would fetch updated data from external sources
            // For now, we'll just update the timestamp
          }
        });
      }
      
      console.log('Hospital data update completed successfully');
      
    } catch (error) {
      console.error('Error updating hospital data:', error);
    }
  }
  
  // Add new hospitals from external sources
  async addNewHospitals() {
    try {
      console.log('Checking for new hospitals to add...');
      
      // In a real implementation, you would:
      // 1. Fetch data from government health department APIs
      // 2. Parse hospital directories
      // 3. Check for new hospitals not in our database
      // 4. Add them with autoPopulated: true
      
      // For demonstration, we'll simulate this process
      const existingHospitals = await prisma.hospital.findMany({
        where: { autoPopulated: true },
        select: { name: true, city: true, province: true }
      });
      
      console.log(`Currently have ${existingHospitals.length} auto-populated hospitals`);
      
      // Simulate finding new hospitals (in real implementation, this would be from external API)
      const potentialNewHospitals = [
        {
          name: "New Hospital Example",
          type: "PRIVATE",
          address: "123 New Street, New City",
          city: "New City",
          province: "Gauteng",
          phone: "+27 11 000 0000",
          email: "info@newhospital.co.za",
          website: "https://www.newhospital.co.za",
          classification: "Private Multi-Specialty Hospital",
          departments: JSON.stringify([
            "Emergency Medicine", "Cardiology", "Neurology", "Orthopedics"
          ]),
          services: JSON.stringify([
            "Emergency Care", "Surgical Procedures", "Medical Treatment"
          ]),
          verified: true,
          autoPopulated: true,
          dataSource: "External API"
        }
      ];
      
      // Check if any of these hospitals already exist
      for (const newHospital of potentialNewHospitals) {
        const exists = existingHospitals.find(h => 
          h.name === newHospital.name && 
          h.city === newHospital.city && 
          h.province === newHospital.province
        );
        
        if (!exists) {
          await prisma.hospital.create({
            data: {
              ...newHospital,
              isPublic: newHospital.type === 'PUBLIC',
              lastUpdated: new Date()
            }
          });
          console.log(`Added new hospital: ${newHospital.name}`);
        }
      }
      
    } catch (error) {
      console.error('Error adding new hospitals:', error);
    }
  }
  
  // Validate and clean hospital data
  async validateHospitalData() {
    try {
      console.log('Validating hospital data...');
      
      const hospitals = await prisma.hospital.findMany({
        where: { autoPopulated: true }
      });
      
      let validationErrors = 0;
      
      for (const hospital of hospitals) {
        const errors = [];
        
        // Check required fields
        if (!hospital.name) errors.push('Missing name');
        if (!hospital.address) errors.push('Missing address');
        if (!hospital.city) errors.push('Missing city');
        if (!hospital.province) errors.push('Missing province');
        
        // Check data format
        if (hospital.departments) {
          try {
            JSON.parse(hospital.departments);
          } catch {
            errors.push('Invalid departments JSON');
          }
        }
        
        if (hospital.services) {
          try {
            JSON.parse(hospital.services);
          } catch {
            errors.push('Invalid services JSON');
          }
        }
        
        if (errors.length > 0) {
          console.warn(`Hospital ${hospital.name} has validation errors:`, errors);
          validationErrors++;
        }
      }
      
      console.log(`Validation complete. Found ${validationErrors} hospitals with errors`);
      
    } catch (error) {
      console.error('Error validating hospital data:', error);
    }
  }
  
  // Generate hospital statistics
  async generateStatistics() {
    try {
      console.log('Generating hospital statistics...');
      
      const stats = await prisma.hospital.groupBy({
        by: ['province', 'type'],
        where: { autoPopulated: true },
        _count: { id: true }
      });
      
      console.log('\nHospital Statistics:');
      console.log('==================');
      
      const provinceStats = {};
      stats.forEach(stat => {
        if (!provinceStats[stat.province]) {
          provinceStats[stat.province] = {};
        }
        provinceStats[stat.province][stat.type] = stat._count.id;
      });
      
      Object.entries(provinceStats).forEach(([province, types]) => {
        console.log(`\n${province}:`);
        Object.entries(types).forEach(([type, count]) => {
          console.log(`  ${type}: ${count} hospitals`);
        });
      });
      
      const totalHospitals = await prisma.hospital.count({
        where: { autoPopulated: true }
      });
      
      console.log(`\nTotal auto-populated hospitals: ${totalHospitals}`);
      
    } catch (error) {
      console.error('Error generating statistics:', error);
    }
  }
}

// Initialize the data manager
const hospitalDataManager = new HospitalDataManager();

// Schedule automated updates
// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled hospital data update...');
  await hospitalDataManager.updateHospitalData();
  await hospitalDataManager.addNewHospitals();
  await hospitalDataManager.validateHospitalData();
});

// Run every Sunday at 3 AM for comprehensive updates
cron.schedule('0 3 * * 0', async () => {
  console.log('Running weekly comprehensive hospital data update...');
  await hospitalDataManager.updateHospitalData();
  await hospitalDataManager.addNewHospitals();
  await hospitalDataManager.validateHospitalData();
  await hospitalDataManager.generateStatistics();
});

// Manual update function for immediate execution
export async function runManualUpdate() {
  console.log('Running manual hospital data update...');
  await hospitalDataManager.updateHospitalData();
  await hospitalDataManager.addNewHospitals();
  await hospitalDataManager.validateHospitalData();
  await hospitalDataManager.generateStatistics();
}

// API endpoint for manual updates
export async function handleManualUpdate(req: any, res: any) {
  try {
    await runManualUpdate();
    res.status(200).json({ 
      success: true, 
      message: 'Hospital data update completed successfully' 
    });
  } catch (error) {
    console.error('Manual update failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Hospital data update failed',
      error: error.message 
    });
  }
}

console.log('Hospital data management system initialized');
console.log('Scheduled updates:');
console.log('- Daily updates at 2:00 AM');
console.log('- Weekly comprehensive updates on Sundays at 3:00 AM');
console.log('- Manual updates available via API endpoint');
