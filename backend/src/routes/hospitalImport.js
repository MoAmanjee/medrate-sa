import express from 'express';
import { PrismaClient } from '@prisma/client';
import HospitalImportService from '../services/hospitalImportService.js';

const router = express.Router();
const prisma = new PrismaClient();
const hospitalImportService = new HospitalImportService();

// Import all healthcare facilities from OpenStreetMap
router.post('/import-all', async (req, res) => {
  try {
    console.log('Starting comprehensive healthcare facility import...');
    
    const result = await hospitalImportService.importAllHealthcareFacilities();
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import healthcare facilities',
      error: error.message
    });
  }
});

// Import facilities by specific type
router.post('/import-by-type/:amenityType', async (req, res) => {
  try {
    const { amenityType } = req.params;
    
    if (!['hospital', 'clinic', 'doctors', 'dentist', 'pharmacy'].includes(amenityType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amenity type. Must be one of: hospital, clinic, doctors, dentist, pharmacy'
      });
    }
    
    const result = await hospitalImportService.importFacilitiesByType(amenityType);
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Import by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import facilities by type',
      error: error.message
    });
  }
});

// Import facilities in specific geographic area
router.post('/import-in-area', async (req, res) => {
  try {
    const { bounds, amenityType } = req.body;
    
    if (!bounds || !bounds.north || !bounds.south || !bounds.east || !bounds.west) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bounds. Must include north, south, east, west coordinates'
      });
    }
    
    const result = await hospitalImportService.importFacilitiesInArea(bounds, amenityType);
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Import in area error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import facilities in area',
      error: error.message
    });
  }
});

// Clean up duplicate facilities
router.post('/cleanup-duplicates', async (req, res) => {
  try {
    const result = await hospitalImportService.cleanupDuplicates();
    
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Cleanup duplicates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup duplicates',
      error: error.message
    });
  }
});

// Get import statistics
router.get('/import-statistics', async (req, res) => {
  try {
    const summary = await hospitalImportService.generateImportSummary();
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get import statistics',
      error: error.message
    });
  }
});

// Get hospitals with radius-based search
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, limit = 50 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);
    
    // Calculate bounding box for radius search
    const earthRadius = 6371; // Earth's radius in kilometers
    const latDelta = (radiusKm / earthRadius) * (180 / Math.PI);
    const lonDelta = (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
    
    const hospitals = await prisma.hospital.findMany({
      where: {
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta
        },
        longitude: {
          gte: lon - lonDelta,
          lte: lon + lonDelta
        },
        autoPopulated: true
      },
      take: parseInt(limit),
      orderBy: { averageRating: 'desc' }
    });
    
    // Calculate actual distances and filter by radius
    const nearbyHospitals = hospitals
      .map(hospital => {
        const distance = calculateDistance(lat, lon, hospital.latitude, hospital.longitude);
        return { ...hospital, distance };
      })
      .filter(hospital => hospital.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
    
    res.status(200).json({
      success: true,
      data: {
        hospitals: nearbyHospitals,
        total: nearbyHospitals.length,
        center: { latitude: lat, longitude: lon },
        radius: radiusKm
      }
    });
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search nearby hospitals',
      error: error.message
    });
  }
});

// Get hospitals with advanced filtering
router.get('/search', async (req, res) => {
  try {
    const { 
      query, 
      province, 
      type, 
      hasCoordinates, 
      verified, 
      limit = 50, 
      offset = 0,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    const where = {
      autoPopulated: true,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } }
        ]
      }),
      ...(province && { province }),
      ...(type && { type }),
      ...(hasCoordinates === 'true' && { 
        latitude: { not: null },
        longitude: { not: null }
      }),
      ...(verified !== undefined && { verified: verified === 'true' })
    };
    
    const orderBy = {};
    if (sortBy === 'rating') {
      orderBy.averageRating = sortOrder;
    } else if (sortBy === 'reviews') {
      orderBy.totalReviews = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'updated') {
      orderBy.lastUpdated = sortOrder;
    }
    
    const hospitals = await prisma.hospital.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : { name: 'asc' },
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
          take: 5,
          orderBy: { createdAt: 'desc' },
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
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search hospitals',
      error: error.message
    });
  }
});

// Get hospital by ID with full details
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
    console.error('Get hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hospital',
      error: error.message
    });
  }
});

// Get all hospitals with basic filtering
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
        }
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

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;

