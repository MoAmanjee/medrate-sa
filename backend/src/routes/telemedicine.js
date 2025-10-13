import express from 'express';
import { PrismaClient } from '@prisma/client';
import TelemedicineService from '../services/telemedicineService.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const telemedicineService = new TelemedicineService();

// Create telemedicine session
router.post('/sessions', async (req, res) => {
  try {
    const { bookingId, provider } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const result = await telemedicineService.createSession(bookingId, provider);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating telemedicine session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create telemedicine session',
      error: error.message
    });
  }
});

// Start telemedicine session
router.post('/sessions/:sessionId/start', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, userType } = req.body;
    
    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and user type are required'
      });
    }

    if (!['DOCTOR', 'PATIENT'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be DOCTOR or PATIENT'
      });
    }

    const result = await telemedicineService.startSession(sessionId, userId, userType);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error starting telemedicine session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start telemedicine session',
      error: error.message
    });
  }
});

// End telemedicine session
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, userType } = req.body;
    
    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and user type are required'
      });
    }

    if (!['DOCTOR', 'PATIENT'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be DOCTOR or PATIENT'
      });
    }

    const result = await telemedicineService.endSession(sessionId, userId, userType);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error ending telemedicine session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end telemedicine session',
      error: error.message
    });
  }
});

// Get telemedicine session details
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await telemedicineService.getSession(sessionId, userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error getting telemedicine session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get telemedicine session',
      error: error.message
    });
  }
});

// Get user's telemedicine sessions
router.get('/users/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType, limit = 10, offset = 0 } = req.query;
    
    if (!userType) {
      return res.status(400).json({
        success: false,
        message: 'User type is required'
      });
    }

    if (!['DOCTOR', 'PATIENT'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be DOCTOR or PATIENT'
      });
    }

    const result = await telemedicineService.getUserSessions(
      userId, 
      userType, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting user telemedicine sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get telemedicine sessions',
      error: error.message
    });
  }
});

// Check if doctor has telemedicine enabled
router.get('/doctors/:doctorId/telemedicine-status', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const isEnabled = await telemedicineService.isTelemedicineEnabled(doctorId);
    
    res.status(200).json({
      success: true,
      data: { isEnabled }
    });
  } catch (error) {
    console.error('Error checking telemedicine status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check telemedicine status',
      error: error.message
    });
  }
});

// Enable telemedicine for doctor
router.put('/doctors/:doctorId/enable-telemedicine', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { telemedicineFee } = req.body;
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor has active subscription with telemedicine access
    const hasActiveSubscription = await subscriptionService.isDoctorSubscriptionActive(doctorId);
    
    if (!hasActiveSubscription && doctor.subscriptionLevel === 'FREE') {
      return res.status(403).json({
        success: false,
        message: 'Telemedicine requires a Pro or Premium subscription'
      });
    }

    // Update doctor's telemedicine settings
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        telemedicineEnabled: true,
        telemedicineFee: telemedicineFee || doctor.consultationFee
      }
    });

    res.status(200).json({
      success: true,
      message: 'Telemedicine enabled successfully',
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Error enabling telemedicine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable telemedicine',
      error: error.message
    });
  }
});

// Disable telemedicine for doctor
router.put('/doctors/:doctorId/disable-telemedicine', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update doctor's telemedicine settings
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        telemedicineEnabled: false,
        telemedicineFee: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Telemedicine disabled successfully',
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Error disabling telemedicine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable telemedicine',
      error: error.message
    });
  }
});

// Get available video providers
router.get('/providers', async (req, res) => {
  try {
    const providers = [
      {
        id: 'DAILY_CO',
        name: 'Daily.co',
        description: 'Simple video calling API',
        features: ['Screen sharing', 'Recording', 'Chat', 'Up to 2 participants'],
        pricing: 'Pay per minute'
      },
      {
        id: 'AGORA',
        name: 'Agora',
        description: 'Real-time communication platform',
        features: ['High quality video', 'Low latency', 'Scalable', 'Customizable'],
        pricing: 'Pay per minute'
      },
      {
        id: 'ZOOM',
        name: 'Zoom',
        description: 'Video conferencing platform',
        features: ['Meeting rooms', 'Recording', 'Waiting room', 'Breakout rooms'],
        pricing: 'Subscription based'
      }
    ];

    res.status(200).json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error getting video providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video providers',
      error: error.message
    });
  }
});

export default router;

