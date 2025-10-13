import express from 'express';
import { PrismaClient } from '@prisma/client';
import SubscriptionService, { SUBSCRIPTION_PLANS } from '../services/subscriptionService.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const subscriptionService = new SubscriptionService();

// Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const { type } = req.query; // DOCTOR, HOSPITAL, COMPANY
    
    if (type) {
      const plans = subscriptionService.getPlansByType(type);
      res.status(200).json({
        success: true,
        data: plans
      });
    } else {
      res.status(200).json({
        success: true,
        data: SUBSCRIPTION_PLANS
      });
    }
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
});

// Get doctor subscription details
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const subscription = await subscriptionService.getDoctorSubscription(doctorId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching doctor subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor subscription',
      error: error.message
    });
  }
});

// Get hospital subscription details
router.get('/hospital/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    const subscription = await subscriptionService.getHospitalSubscription(hospitalId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching hospital subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital subscription',
      error: error.message
    });
  }
});

// Create doctor subscription
router.post('/doctor/:doctorId/subscribe', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { planId, paymentMethod, paymentId, billingCycle } = req.body;
    
    // Validate required fields
    if (!planId || !paymentMethod || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: planId, paymentMethod, paymentId'
      });
    }
    
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
    
    const subscription = await subscriptionService.createDoctorSubscription(
      doctorId,
      planId,
      paymentMethod,
      paymentId,
      billingCycle || 'MONTHLY'
    );
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error creating doctor subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor subscription',
      error: error.message
    });
  }
});

// Create hospital subscription
router.post('/hospital/:hospitalId/subscribe', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { planId, paymentMethod, paymentId, billingCycle } = req.body;
    
    // Validate required fields
    if (!planId || !paymentMethod || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: planId, paymentMethod, paymentId'
      });
    }
    
    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    });
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }
    
    const subscription = await subscriptionService.createHospitalSubscription(
      hospitalId,
      planId,
      paymentMethod,
      paymentId,
      billingCycle || 'MONTHLY'
    );
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error creating hospital subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hospital subscription',
      error: error.message
    });
  }
});

// Create company subscription
router.post('/company/subscribe', async (req, res) => {
  try {
    const { 
      companyName, 
      contactEmail, 
      contactPhone, 
      industry, 
      employeeCount,
      planId, 
      paymentMethod, 
      paymentId, 
      billingCycle 
    } = req.body;
    
    // Validate required fields
    if (!companyName || !contactEmail || !planId || !paymentMethod || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: companyName, contactEmail, planId, paymentMethod, paymentId'
      });
    }
    
    const company = await subscriptionService.createCompanySubscription(
      {
        companyName,
        contactEmail,
        contactPhone,
        industry,
        employeeCount
      },
      planId,
      paymentMethod,
      paymentId,
      billingCycle || 'MONTHLY'
    );
    
    res.status(201).json({
      success: true,
      message: 'Company subscription created successfully',
      data: company
    });
  } catch (error) {
    console.error('Error creating company subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company subscription',
      error: error.message
    });
  }
});

// Change subscription (upgrade/downgrade)
router.put('/:type/:entityId/change', async (req, res) => {
  try {
    const { type, entityId } = req.params;
    const { planId, paymentMethod, paymentId, billingCycle } = req.body;
    
    // Validate type
    if (!['DOCTOR', 'HOSPITAL'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be DOCTOR or HOSPITAL'
      });
    }
    
    // Validate required fields
    if (!planId || !paymentMethod || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: planId, paymentMethod, paymentId'
      });
    }
    
    const subscription = await subscriptionService.changeSubscription(
      entityId,
      planId,
      type,
      paymentMethod,
      paymentId,
      billingCycle || 'MONTHLY'
    );
    
    res.status(200).json({
      success: true,
      message: 'Subscription changed successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error changing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change subscription',
      error: error.message
    });
  }
});

// Cancel subscription
router.put('/:type/:subscriptionId/cancel', async (req, res) => {
  try {
    const { type, subscriptionId } = req.params;
    
    // Validate type
    if (!['DOCTOR', 'HOSPITAL', 'COMPANY'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be DOCTOR, HOSPITAL, or COMPANY'
      });
    }
    
    const subscription = await subscriptionService.cancelSubscription(subscriptionId, type);
    
    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

// Check subscription status
router.get('/:type/:entityId/status', async (req, res) => {
  try {
    const { type, entityId } = req.params;
    
    let isActive = false;
    
    if (type === 'DOCTOR') {
      isActive = await subscriptionService.isDoctorSubscriptionActive(entityId);
    } else if (type === 'HOSPITAL') {
      isActive = await subscriptionService.isHospitalSubscriptionActive(entityId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be DOCTOR or HOSPITAL'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { isActive }
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription status',
      error: error.message
    });
  }
});

// Check subscription limits
router.get('/:type/:entityId/limits/:limitType', async (req, res) => {
  try {
    const { type, entityId, limitType } = req.params;
    
    // Validate type
    if (!['DOCTOR', 'HOSPITAL'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be DOCTOR or HOSPITAL'
      });
    }
    
    const hasAccess = await subscriptionService.checkSubscriptionLimits(entityId, type, limitType);
    
    res.status(200).json({
      success: true,
      data: { hasAccess }
    });
  } catch (error) {
    console.error('Error checking subscription limits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription limits',
      error: error.message
    });
  }
});

export default router;

