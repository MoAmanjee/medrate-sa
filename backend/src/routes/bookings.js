import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole, requireVerification } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new booking
router.post('/', authMiddleware, requireVerification, async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      duration = 30,
      patientNotes
    } = req.body;

    const patientId = req.user.id;

    // Validate doctor exists and is available
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
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

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found',
        message: 'The requested doctor does not exist'
      });
    }

    if (!doctor.isAvailable) {
      return res.status(400).json({
        error: 'Doctor not available',
        message: 'This doctor is currently not accepting new appointments'
      });
    }

    if (doctor.user.verificationStatus !== 'APPROVED') {
      return res.status(400).json({
        error: 'Doctor not verified',
        message: 'You can only book appointments with verified doctors'
      });
    }

    // Check for existing booking at the same time
    const existingBooking = await prisma.booking.findFirst({
      where: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        error: 'Time slot unavailable',
        message: 'This time slot is already booked'
      });
    }

    // Calculate fees
    const consultationFee = doctor.consultationFee;
    const platformCommissionPercentage = parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE) || 10;
    const platformFee = (consultationFee * platformCommissionPercentage) / 100;
    const totalAmount = consultationFee + platformFee;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        doctorId,
        patientId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        duration: parseInt(duration),
        consultationFee,
        platformFee,
        totalAmount,
        patientNotes,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      }
    });

    // Create commission record
    await prisma.commission.create({
      data: {
        bookingId: booking.id,
        amount: platformFee,
        percentage: platformCommissionPercentage,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        doctorId: booking.doctorId,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        duration: booking.duration,
        consultationFee: booking.consultationFee,
        platformFee: booking.platformFee,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: 'Booking creation failed',
      message: 'An error occurred while creating the booking'
    });
  }
});

// Create payment intent for booking
router.post('/:bookingId/payment', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethodId } = req.body;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'The requested booking does not exist'
      });
    }

    if (booking.patientId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only pay for your own bookings'
      });
    }

    if (booking.paymentStatus !== 'PENDING') {
      return res.status(400).json({
        error: 'Payment already processed',
        message: 'This booking has already been paid for'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: 'zar', // South African Rand
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        bookingId: booking.id,
        doctorId: booking.doctorId,
        patientId: booking.patientId
      },
      description: `Appointment with Dr. ${booking.doctor.user.firstName} ${booking.doctor.user.lastName} on ${booking.appointmentDate.toDateString()} at ${booking.appointmentTime}`
    });

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: paymentIntent.id,
        paymentMethod: paymentMethodId
      }
    });

    res.json({
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    
    if (error.type === 'StripeCardError') {
      res.status(400).json({
        error: 'Payment failed',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Payment processing failed',
        message: 'An error occurred while processing payment'
      });
    }
  }
});

// Confirm payment and update booking status
router.post('/:bookingId/confirm-payment', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentIntentId } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not completed',
        message: 'Payment has not been completed successfully'
      });
    }

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED'
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update commission status
    await prisma.commission.update({
      where: { bookingId },
      data: { status: 'PAID' }
    });

    // TODO: Send confirmation emails/SMS to both doctor and patient
    // await sendBookingConfirmation(booking);

    res.json({
      message: 'Payment confirmed and booking confirmed',
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        doctor: {
          name: `${booking.doctor.user.firstName} ${booking.doctor.user.lastName}`,
          specialization: booking.doctor.specialization
        }
      }
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      error: 'Payment confirmation failed',
      message: 'An error occurred while confirming payment'
    });
  }
});

// Get user's bookings
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereConditions = {
      patientId: userId
    };

    if (status) {
      whereConditions.status = status.toUpperCase();
    }

    const bookings = await prisma.booking.findMany({
      where: whereConditions,
      include: {
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalCount = await prisma.booking.count({ where: whereConditions });

    res.json({
      bookings: bookings.map(booking => ({
        id: booking.id,
        doctor: {
          id: booking.doctor.id,
          name: `${booking.doctor.user.firstName} ${booking.doctor.user.lastName}`,
          specialization: booking.doctor.specialization,
          phone: booking.doctor.user.phone
        },
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        duration: booking.duration,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        consultationFee: booking.consultationFee,
        platformFee: booking.platformFee,
        totalAmount: booking.totalAmount,
        patientNotes: booking.patientNotes,
        createdAt: booking.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: 'An error occurred while fetching bookings'
    });
  }
});

// Cancel booking
router.patch('/:bookingId/cancel', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        patient: {
          select: { id: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'The requested booking does not exist'
      });
    }

    if (booking.patientId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel your own bookings'
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        error: 'Booking already cancelled',
        message: 'This booking has already been cancelled'
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        error: 'Cannot cancel completed booking',
        message: 'You cannot cancel a completed appointment'
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        doctorNotes: reason
      }
    });

    // If payment was completed, initiate refund
    if (booking.paymentStatus === 'COMPLETED' && booking.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          reason: 'requested_by_customer'
        });

        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'REFUNDED' }
        });
      } catch (refundError) {
        console.error('Refund error:', refundError);
        // Continue with cancellation even if refund fails
      }
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      error: 'Booking cancellation failed',
      message: 'An error occurred while cancelling the booking'
    });
  }
});

export default router;
