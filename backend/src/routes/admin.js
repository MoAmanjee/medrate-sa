import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get admin dashboard statistics
router.get('/dashboard', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalHospitals,
      totalBookings,
      pendingVerifications,
      totalRevenue,
      recentBookings,
      topRatedDoctors,
      topRatedHospitals
    ] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.hospital.count(),
      prisma.booking.count(),
      prisma.verification.count({
        where: { status: 'PENDING' }
      }),
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      prisma.booking.findMany({
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
          },
          patient: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.doctor.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { averageRating: 'desc' },
        take: 5
      }),
      prisma.hospital.findMany({
        orderBy: { averageRating: 'desc' },
        take: 5
      })
    ]);

    res.json({
      statistics: {
        totalUsers,
        totalDoctors,
        totalHospitals,
        totalBookings,
        pendingVerifications,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        doctor: `${booking.doctor.user.firstName} ${booking.doctor.user.lastName}`,
        patient: `${booking.patient.firstName} ${booking.patient.lastName}`,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        status: booking.status,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt
      })),
      topRatedDoctors: topRatedDoctors.map(doctor => ({
        id: doctor.id,
        name: `${doctor.user.firstName} ${doctor.user.lastName}`,
        specialization: doctor.specialization,
        averageRating: doctor.averageRating,
        totalReviews: doctor.totalReviews
      })),
      topRatedHospitals: topRatedHospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        city: hospital.city,
        province: hospital.province,
        averageRating: hospital.averageRating,
        totalReviews: hospital.totalReviews
      }))
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: 'An error occurred while fetching dashboard statistics'
    });
  }
});

// Get all users with filters (admin only)
router.get('/users', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { role, verificationStatus, isActive, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = {};
    if (role) whereConditions.role = role;
    if (verificationStatus) whereConditions.verificationStatus = verificationStatus;
    if (isActive !== undefined) whereConditions.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        doctor: {
          select: {
            specialization: true,
            averageRating: true,
            totalReviews: true
          }
        },
        hospital: {
          select: {
            name: true,
            city: true,
            province: true,
            averageRating: true,
            totalReviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalCount = await prisma.user.count({ where: whereConditions });

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verificationStatus: user.verificationStatus,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profile: user.doctor || user.hospital
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'An error occurred while fetching users'
    });
  }
});

// Toggle user active status (admin only)
router.patch('/users/:userId/toggle-status', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    res.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      error: 'Failed to toggle user status',
      message: 'An error occurred while updating user status'
    });
  }
});

// Get reported reviews (admin only)
router.get('/reported-reviews', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await prisma.review.findMany({
      where: { isReported: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        hospital: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalCount = await prisma.review.count({ where: { isReported: true } });

    res.json({
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reportReason: review.reportReason,
        createdAt: review.createdAt,
        user: {
          name: `${review.user.firstName} ${review.user.lastName}`,
          email: review.user.email
        },
        target: review.doctor ? {
          type: 'doctor',
          name: `${review.doctor.user.firstName} ${review.doctor.user.lastName}`,
          specialization: review.doctor.specialization
        } : {
          type: 'hospital',
          name: review.hospital.name
        }
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reported reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reported reviews',
      message: 'An error occurred while fetching reported reviews'
    });
  }
});

export default router;
