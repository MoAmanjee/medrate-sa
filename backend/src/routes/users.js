import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, verificationStatus } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = {};
    if (role) whereConditions.role = role;
    if (verificationStatus) whereConditions.verificationStatus = verificationStatus;

    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verificationStatus: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalCount = await prisma.user.count({ where: whereConditions });

    res.json({
      users,
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

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        verificationStatus: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating profile'
    });
  }
});

export default router;
