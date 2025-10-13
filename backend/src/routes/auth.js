import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateToken, generateRefreshToken, authMiddleware } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

// Register new user
router.post('/register', uploadSingle('idDocument'), handleUploadError, async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      // Doctor specific fields
      hpcsaNumber,
      specialization,
      experience,
      practiceAddress,
      practiceCity,
      practiceProvince,
      practicePostalCode,
      consultationFee,
      // Hospital specific fields
      hospitalName,
      registrationNumber,
      hospitalAddress,
      hospitalCity,
      hospitalProvince,
      hospitalPostalCode,
      hospitalPhone,
      hospitalEmail,
      hospitalWebsite,
      isPublic
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'PATIENT',
        verificationStatus: role === 'PATIENT' ? 'NOT_VERIFIED' : 'PENDING'
      }
    });

    // Create role-specific profile
    if (role === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          hpcsaNumber,
          specialization,
          experience: parseInt(experience),
          practiceAddress,
          practiceCity,
          practiceProvince,
          practicePostalCode,
          consultationFee: parseFloat(consultationFee),
          idDocument: req.file?.path
        }
      });

      // Create verification record
      await prisma.verification.create({
        data: {
          userId: user.id,
          role: 'DOCTOR',
          documents: {
            idDocument: req.file?.path,
            hpcsaNumber,
            specialization,
            experience,
            practiceAddress
          }
        }
      });
    } else if (role === 'HOSPITAL') {
      await prisma.hospital.create({
        data: {
          userId: user.id,
          name: hospitalName,
          registrationNumber,
          address: hospitalAddress,
          city: hospitalCity,
          province: hospitalProvince,
          postalCode: hospitalPostalCode,
          phone: hospitalPhone,
          email: hospitalEmail,
          website: hospitalWebsite,
          isPublic: isPublic === 'true'
        }
      });

      // Create verification record
      await prisma.verification.create({
        data: {
          userId: user.id,
          role: 'HOSPITAL',
          documents: {
            registrationNumber,
            hospitalName,
            address: hospitalAddress
          }
        }
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verificationStatus: user.verificationStatus
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        hospital: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verificationStatus: user.verificationStatus,
        profile: user.doctor || user.hospital
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verificationStatus: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    const newToken = generateToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid refresh token'
    });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctor: true,
        hospital: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        verificationStatus: user.verificationStatus,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profile: user.doctor || user.hospital || user.admin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'An error occurred while fetching profile'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    message: 'Logout successful'
  });
});

export default router;
