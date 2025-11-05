import ComprehensiveHospitalImportService from '../src/services/comprehensiveHospitalImportService.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting comprehensive import of ALL South African hospitals...');
  console.log('⏰ This may take 30-60 minutes depending on API response times');
  console.log('📊 Estimated hospitals to import: 5,000-15,000 facilities\n');

  const importService = new ComprehensiveHospitalImportService();

  try {
    // Start the comprehensive import
    await importService.importAllSouthAfricanHospitals();
    
    console.log('\n🎉 SUCCESS! All South African hospitals have been imported!');
    console.log('🌐 Your MedRate SA platform now has comprehensive hospital coverage!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Import interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Import terminated');
  await prisma.$disconnect();
  process.exit(0);
});

main().catch(console.error);
