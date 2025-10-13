import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Manual hospital data update endpoint
router.post('/update-hospitals', async (req, res) => {
  try {
    console.log('Manual hospital data update requested...');
    
    // Get all auto-populated hospitals
    const hospitals = await prisma.hospital.findMany({
      where: { autoPopulated: true }
    });
    
    // Update lastUpdated timestamp for all hospitals
    for (const hospital of hospitals) {
      await prisma.hospital.update({
        where: { id: hospital.id },
        data: {
          lastUpdated: new Date()
        }
      });
    }
    
    // Generate statistics
    const stats = await prisma.hospital.groupBy({
      by: ['province', 'type'],
      where: { autoPopulated: true },
      _count: { id: true }
    });
    
    const totalHospitals = await prisma.hospital.count({
      where: { autoPopulated: true }
    });
    
    res.status(200).json({
      success: true,
      message: 'Hospital data update completed successfully',
      data: {
        totalHospitals,
        updatedHospitals: hospitals.length,
        statistics: stats
      }
    });
    
  } catch (error) {
    console.error('Hospital data update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Hospital data update failed',
      error: error.message
    });
  }
});

// Get hospital statistics endpoint
router.get('/statistics', async (req, res) => {
  try {
    const stats = await prisma.hospital.groupBy({
      by: ['province', 'type'],
      where: { autoPopulated: true },
      _count: { id: true }
    });
    
    const totalHospitals = await prisma.hospital.count({
      where: { autoPopulated: true }
    });
    
    const totalDoctors = await prisma.doctor.count();
    
    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        totalDoctors,
        statistics: stats,
        lastUpdated: new Date()
      }
    });
    
  } catch (error) {
    console.error('Failed to get statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// Get all hospitals with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      province, 
      type, 
      verified, 
      limit = 50, 
      offset = 0 
    } = req.query;
    
    const where = {
      autoPopulated: true,
      ...(province && { province }),
      ...(type && { type }),
      ...(verified !== undefined && { verified: verified === 'true' })
    };
    
    const hospitals = await prisma.hospital.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        classification: true,
        address: true,
        city: true,
        province: true,
        phone: true,
        email: true,
        website: true,
        latitude: true,
        longitude: true,
        averageRating: true,
        totalReviews: true,
        verified: true,
        autoPopulated: true,
        lastUpdated: true
      }
    });
    
    const total = await prisma.hospital.count({ where });
    
    res.status(200).json({
      success: true,
      data: {
        hospitals,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
    
  } catch (error) {
    console.error('Failed to get hospitals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hospitals',
      error: error.message
    });
  }
});

// Get specific hospital by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        doctors: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    verificationStatus: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                verificationStatus: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: hospital
    });
    
  } catch (error) {
    console.error('Failed to get hospital:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hospital',
      error: error.message
    });
  }
});

export default router;