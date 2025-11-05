import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get verification applications (admin only)
router.get('/applications', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = {};
    if (status) whereConditions.status = status;
    if (role) whereConditions.role = role;

    const verifications = await prisma.verification.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalCount = await prisma.verification.count({ where: whereConditions });

    res.json({
      verifications: verifications.map(verification => ({
        id: verification.id,
        status: verification.status,
        role: verification.role,
        documents: verification.documents,
        rejectionReason: verification.rejectionReason,
        reviewedBy: verification.reviewedBy,
        reviewedAt: verification.reviewedAt,
        createdAt: verification.createdAt,
        user: verification.user
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get verification applications error:', error);
    res.status(500).json({
      error: 'Failed to fetch verification applications',
      message: 'An error occurred while fetching verification applications'
    });
  }
});

// Approve verification application (admin only)
router.patch('/:verificationId/approve', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { verificationId } = req.params;
    const adminId = req.user.id;

    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        user: true
      }
    });

    if (!verification) {
      return res.status(404).json({
        error: 'Verification not found',
        message: 'The requested verification application does not exist'
      });
    }

    if (verification.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Verification already processed',
        message: 'This verification application has already been processed'
      });
    }

    // Update verification status
    await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        verificationStatus: 'APPROVED'
      }
    });

    res.json({
      message: 'Verification approved successfully'
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      error: 'Verification approval failed',
      message: 'An error occurred while approving the verification'
    });
  }
});

// Reject verification application (admin only)
router.patch('/:verificationId/reject', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const verification = await prisma.verification.findUnique({
      where: { id: verificationId }
    });

    if (!verification) {
      return res.status(404).json({
        error: 'Verification not found',
        message: 'The requested verification application does not exist'
      });
    }

    if (verification.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Verification already processed',
        message: 'This verification application has already been processed'
      });
    }

    // Update verification status
    await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        verificationStatus: 'REJECTED'
      }
    });

    res.json({
      message: 'Verification rejected successfully'
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      error: 'Verification rejection failed',
      message: 'An error occurred while rejecting the verification'
    });
  }
});

// Get user's verification status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const verification = await prisma.verification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      verification: verification ? {
        id: verification.id,
        status: verification.status,
        role: verification.role,
        rejectionReason: verification.rejectionReason,
        reviewedAt: verification.reviewedAt,
        createdAt: verification.createdAt
      } : null
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      error: 'Failed to fetch verification status',
      message: 'An error occurred while fetching verification status'
    });
  }
});

export default router;
