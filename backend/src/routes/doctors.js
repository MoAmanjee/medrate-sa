import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { specialization, province, city, verified, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = {
      user: {
        isActive: true,
        verificationStatus: verified === 'true' ? 'APPROVED' : undefined
      }
    };

    if (specialization) {
      whereConditions.specialization = {
        contains: specialization,
        mode: 'insensitive'
      };
    }

    if (province) {
      whereConditions.practiceProvince = {
        contains: province,
        mode: 'insensitive'
      };
    }

    if (city) {
      whereConditions.practiceCity = {
        contains: city,
        mode: 'insensitive'
      };
    }

    const doctors = await prisma.doctor.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            verificationStatus: true,
            phone: true
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { averageRating: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalCount = await prisma.doctor.count({ where: whereConditions });

    res.json({
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        specialization: doctor.specialization,
        experience: doctor.experience,
        practiceAddress: doctor.practiceAddress,
        practiceCity: doctor.practiceCity,
        practiceProvince: doctor.practiceProvince,
        consultationFee: doctor.consultationFee,
        averageRating: doctor.averageRating,
        totalReviews: doctor.totalReviews,
        isAvailable: doctor.isAvailable,
        verificationStatus: doctor.user.verificationStatus,
        phone: doctor.user.phone,
        recentReviews: doctor.reviews
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      error: 'Failed to fetch doctors',
      message: 'An error occurred while fetching doctors'
    });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            verificationStatus: true,
            phone: true
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
        },
        bookings: {
          where: {
            status: 'CONFIRMED',
            appointmentDate: {
              gte: new Date()
            }
          },
          select: {
            appointmentDate: true,
            appointmentTime: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'The requested doctor does not exist'
      });
    }

    res.json({
      doctor: {
        id: doctor.id,
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        specialization: doctor.specialization,
        experience: doctor.experience,
        practiceAddress: doctor.practiceAddress,
        practiceCity: doctor.practiceCity,
        practiceProvince: doctor.practiceProvince,
        practicePostalCode: doctor.practicePostalCode,
        consultationFee: doctor.consultationFee,
        averageRating: doctor.averageRating,
        totalReviews: doctor.totalReviews,
        isAvailable: doctor.isAvailable,
        verificationStatus: doctor.user.verificationStatus,
        phone: doctor.user.phone,
        reviews: doctor.reviews,
        upcomingBookings: doctor.bookings
      }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      error: 'Failed to fetch doctor',
      message: 'An error occurred while fetching doctor details'
    });
  }
});

export default router;
