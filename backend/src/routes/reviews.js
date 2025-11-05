import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireVerification } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create a review
router.post('/', authMiddleware, requireVerification, async (req, res) => {
  try {
    const { doctorId, hospitalId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate that either doctorId or hospitalId is provided
    if (!doctorId && !hospitalId) {
      return res.status(400).json({
        error: 'Invalid review target',
        message: 'Either doctorId or hospitalId must be provided'
      });
    }

    if (doctorId && hospitalId) {
      return res.status(400).json({
        error: 'Invalid review target',
        message: 'Cannot review both doctor and hospital in the same review'
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user has already reviewed this doctor/hospital
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        OR: [
          { doctorId: doctorId || null },
          { hospitalId: hospitalId || null }
        ]
      }
    });

    if (existingReview) {
      return res.status(400).json({
        error: 'Review already exists',
        message: 'You have already reviewed this doctor/hospital'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        doctorId: doctorId || null,
        hospitalId: hospitalId || null,
        rating: parseInt(rating),
        comment: comment || null,
        isVerified: req.user.verificationStatus === 'APPROVED'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            verificationStatus: true
          }
        }
      }
    });

    // Update average rating for doctor or hospital
    if (doctorId) {
      await updateDoctorRating(doctorId);
    } else if (hospitalId) {
      await updateHospitalRating(hospitalId);
    }

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        isVerified: review.isVerified,
        createdAt: review.createdAt,
        user: {
          name: `${review.user.firstName} ${review.user.lastName}`,
          verificationStatus: review.user.verificationStatus
        }
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      error: 'Review creation failed',
      message: 'An error occurred while creating the review'
    });
  }
});

// Get reviews for a doctor or hospital
router.get('/', async (req, res) => {
  try {
    const { doctorId, hospitalId, page = 1, limit = 10, verified } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!doctorId && !hospitalId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Either doctorId or hospitalId must be provided'
      });
    }

    const whereConditions = {
      OR: [
        { doctorId: doctorId || null },
        { hospitalId: hospitalId || null }
      ]
    };

    if (verified === 'true') {
      whereConditions.isVerified = true;
    }

    const reviews = await prisma.review.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            verificationStatus: true
          }
        }
      },
      orderBy: [
        { isVerified: 'desc' }, // Verified reviews first
        { createdAt: 'desc' }
      ],
      skip,
      take: parseInt(limit)
    });

    const totalCount = await prisma.review.count({ where: whereConditions });

    res.json({
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        isVerified: review.isVerified,
        createdAt: review.createdAt,
        user: {
          name: `${review.user.firstName} ${review.user.lastName}`,
          verificationStatus: review.user.verificationStatus
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
    console.error('Get reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: 'An error occurred while fetching reviews'
    });
  }
});

// Report a review
router.post('/:reviewId/report', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Update review as reported
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isReported: true,
        reportReason: reason
      }
    });

    res.json({
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      error: 'Review reporting failed',
      message: 'An error occurred while reporting the review'
    });
  }
});

// Helper function to update doctor rating
async function updateDoctorRating(doctorId) {
  const reviews = await prisma.review.findMany({
    where: { doctorId },
    select: { rating: true }
  });

  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length
      }
    });
  }
}

// Helper function to update hospital rating
async function updateHospitalRating(hospitalId) {
  const reviews = await prisma.review.findMany({
    where: { hospitalId },
    select: { rating: true }
  });

  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length
      }
    });
  }
}

export default router;
