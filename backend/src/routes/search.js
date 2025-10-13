import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Search doctors and hospitals with location-based filtering
router.get('/search', async (req, res) => {
  try {
    const {
      query,
      type, // 'doctor', 'hospital', or 'all'
      specialization,
      province,
      city,
      isPublic,
      verified,
      radius = 50, // km
      latitude,
      longitude,
      page = 1,
      limit = 20,
      sortBy = 'rating', // 'rating', 'distance', 'name', 'price'
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search conditions
    const whereConditions = {
      user: {
        isActive: true,
        verificationStatus: verified === 'true' ? 'APPROVED' : undefined
      }
    };

    // Add type-specific conditions
    if (type === 'doctor') {
      whereConditions.specialization = specialization ? {
        contains: specialization,
        mode: 'insensitive'
      } : undefined;
      
      whereConditions.practiceProvince = province ? {
        contains: province,
        mode: 'insensitive'
      } : undefined;
      
      whereConditions.practiceCity = city ? {
        contains: city,
        mode: 'insensitive'
      } : undefined;
    } else if (type === 'hospital') {
      whereConditions.province = province ? {
        contains: province,
        mode: 'insensitive'
      } : undefined;
      
      whereConditions.city = city ? {
        contains: city,
        mode: 'insensitive'
      } : undefined;
      
      whereConditions.isPublic = isPublic ? isPublic === 'true' : undefined;
    }

    // Add text search
    if (query) {
      if (type === 'doctor') {
        whereConditions.OR = [
          { specialization: { contains: query, mode: 'insensitive' } },
          { practiceCity: { contains: query, mode: 'insensitive' } },
          { practiceProvince: { contains: query, mode: 'insensitive' } },
          { user: { firstName: { contains: query, mode: 'insensitive' } } },
          { user: { lastName: { contains: query, mode: 'insensitive' } } }
        ];
      } else if (type === 'hospital') {
        whereConditions.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { province: { contains: query, mode: 'insensitive' } }
        ];
      }
    }

    // Execute search based on type
    let results = [];
    let totalCount = 0;

    if (type === 'doctor' || type === 'all') {
      const doctors = await prisma.doctor.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              verificationStatus: true,
              phone: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? Math.ceil(limitNum / 2) : limitNum,
        orderBy: getSortOrder(sortBy, sortOrder, 'doctor')
      });

      const doctorResults = doctors.map(doctor => ({
        id: doctor.id,
        type: 'doctor',
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        specialization: doctor.specialization,
        experience: doctor.experience,
        location: {
          address: doctor.practiceAddress,
          city: doctor.practiceCity,
          province: doctor.practiceProvince,
          postalCode: doctor.practicePostalCode
        },
        rating: doctor.averageRating,
        totalReviews: doctor.totalReviews,
        consultationFee: doctor.consultationFee,
        isAvailable: doctor.isAvailable,
        verificationStatus: doctor.user.verificationStatus,
        phone: doctor.user.phone,
        // Calculate distance if coordinates provided
        distance: calculateDistance(
          latitude, longitude,
          doctor.practiceLatitude, doctor.practiceLongitude
        )
      }));

      results = [...results, ...doctorResults];
    }

    if (type === 'hospital' || type === 'all') {
      const hospitals = await prisma.hospital.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              verificationStatus: true,
              phone: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          doctors: {
            include: {
              doctor: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? Math.ceil(limitNum / 2) : limitNum,
        orderBy: getSortOrder(sortBy, sortOrder, 'hospital')
      });

      const hospitalResults = hospitals.map(hospital => ({
        id: hospital.id,
        type: 'hospital',
        name: hospital.name,
        location: {
          address: hospital.address,
          city: hospital.city,
          province: hospital.province,
          postalCode: hospital.postalCode
        },
        rating: hospital.averageRating,
        totalReviews: hospital.totalReviews,
        isPublic: hospital.isPublic,
        phone: hospital.phone,
        email: hospital.email,
        website: hospital.website,
        verificationStatus: hospital.user.verificationStatus,
        doctorCount: hospital.doctors.length,
        // Calculate distance if coordinates provided
        distance: calculateDistance(
          latitude, longitude,
          hospital.latitude, hospital.longitude
        )
      }));

      results = [...results, ...hospitalResults];
    }

    // Filter by radius if coordinates provided
    if (latitude && longitude && radius) {
      results = results.filter(item => 
        !item.distance || item.distance <= parseFloat(radius)
      );
    }

    // Sort results
    results = sortResults(results, sortBy, sortOrder);

    // Paginate results
    const startIndex = skip;
    const endIndex = skip + limitNum;
    const paginatedResults = results.slice(startIndex, endIndex);

    // Get total count for pagination
    if (type === 'doctor') {
      totalCount = await prisma.doctor.count({ where: whereConditions });
    } else if (type === 'hospital') {
      totalCount = await prisma.hospital.count({ where: whereConditions });
    } else {
      totalCount = results.length;
    }

    res.json({
      results: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: endIndex < totalCount,
        hasPrev: pageNum > 1
      },
      filters: {
        query,
        type,
        specialization,
        province,
        city,
        isPublic,
        verified,
        radius,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred during search'
    });
  }
});

// Get specializations for filter dropdown
router.get('/specializations', async (req, res) => {
  try {
    const specializations = await prisma.doctor.findMany({
      select: {
        specialization: true
      },
      distinct: ['specialization'],
      where: {
        user: {
          isActive: true,
          verificationStatus: 'APPROVED'
        }
      }
    });

    const specializationList = specializations
      .map(d => d.specialization)
      .filter(Boolean)
      .sort();

    res.json({ specializations: specializationList });
  } catch (error) {
    console.error('Specializations error:', error);
    res.status(500).json({
      error: 'Failed to fetch specializations',
      message: 'An error occurred while fetching specializations'
    });
  }
});

// Get provinces and cities for filter dropdown
router.get('/locations', async (req, res) => {
  try {
    const [doctorLocations, hospitalLocations] = await Promise.all([
      prisma.doctor.findMany({
        select: {
          practiceProvince: true,
          practiceCity: true
        },
        distinct: ['practiceProvince', 'practiceCity'],
        where: {
          user: {
            isActive: true,
            verificationStatus: 'APPROVED'
          }
        }
      }),
      prisma.hospital.findMany({
        select: {
          province: true,
          city: true
        },
        distinct: ['province', 'city'],
        where: {
          user: {
            isActive: true,
            verificationStatus: 'APPROVED'
          }
        }
      })
    ]);

    const provinces = new Set();
    const cities = new Set();

    doctorLocations.forEach(location => {
      if (location.practiceProvince) provinces.add(location.practiceProvince);
      if (location.practiceCity) cities.add(location.practiceCity);
    });

    hospitalLocations.forEach(location => {
      if (location.province) provinces.add(location.province);
      if (location.city) cities.add(location.city);
    });

    res.json({
      provinces: Array.from(provinces).sort(),
      cities: Array.from(cities).sort()
    });
  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).json({
      error: 'Failed to fetch locations',
      message: 'An error occurred while fetching locations'
    });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to get sort order for Prisma
function getSortOrder(sortBy, sortOrder, type) {
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  
  switch (sortBy) {
    case 'rating':
      return { averageRating: order };
    case 'name':
      return type === 'doctor' 
        ? { user: { firstName: order } }
        : { name: order };
    case 'price':
      return type === 'doctor' ? { consultationFee: order } : undefined;
    case 'distance':
      // Distance sorting will be handled after fetching
      return { averageRating: 'desc' };
    default:
      return { averageRating: 'desc' };
  }
}

// Helper function to sort results
function sortResults(results, sortBy, sortOrder) {
  const order = sortOrder === 'asc' ? 1 : -1;
  
  return results.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (a.rating - b.rating) * order;
      case 'name':
        return a.name.localeCompare(b.name) * order;
      case 'price':
        return (a.consultationFee - b.consultationFee) * order;
      case 'distance':
        if (!a.distance && !b.distance) return 0;
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return (a.distance - b.distance) * order;
      default:
        return (a.rating - b.rating) * order;
    }
  });
}

export default router;
