import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

class TelemedicineService {
  constructor() {
    // Video service configuration
    this.providers = {
      DAILY_CO: {
        apiKey: process.env.DAILY_CO_API_KEY,
        baseUrl: 'https://api.daily.co/v1',
        timeout: 30000
      },
      AGORA: {
        appId: process.env.AGORA_APP_ID,
        appCertificate: process.env.AGORA_APP_CERTIFICATE,
        baseUrl: 'https://api.agora.io/v1',
        timeout: 30000
      },
      ZOOM: {
        apiKey: process.env.ZOOM_API_KEY,
        apiSecret: process.env.ZOOM_API_SECRET,
        baseUrl: 'https://api.zoom.us/v2',
        timeout: 30000
      }
    };
    
    this.defaultProvider = 'DAILY_CO'; // Default to Daily.co for simplicity
  }

  /**
   * Create a telemedicine session
   */
  async createSession(bookingId, provider = this.defaultProvider) {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          doctor: {
            include: { user: true }
          },
          patient: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (!booking.isTelemedicine) {
        throw new Error('This booking is not for telemedicine');
      }

      // Create session based on provider
      let sessionData;
      switch (provider) {
        case 'DAILY_CO':
          sessionData = await this.createDailyCoSession(booking);
          break;
        case 'AGORA':
          sessionData = await this.createAgoraSession(booking);
          break;
        case 'ZOOM':
          sessionData = await this.createZoomSession(booking);
          break;
        default:
          throw new Error('Unsupported video provider');
      }

      // Save session to database
      const session = await prisma.telemedicineSession.create({
        data: {
          bookingId,
          sessionId: sessionData.sessionId,
          provider,
          roomUrl: sessionData.roomUrl,
          scheduledStart: booking.appointmentDate,
          status: 'SCHEDULED'
        }
      });

      return {
        success: true,
        data: {
          session,
          roomUrl: sessionData.roomUrl,
          sessionId: sessionData.sessionId,
          provider
        }
      };
    } catch (error) {
      console.error('Error creating telemedicine session:', error);
      return {
        success: false,
        message: 'Failed to create telemedicine session',
        error: error.message
      };
    }
  }

  /**
   * Create Daily.co session
   */
  async createDailyCoSession(booking) {
    const config = this.providers.DAILY_CO;
    
    if (!config.apiKey) {
      throw new Error('Daily.co API key not configured');
    }

    const roomName = `medrate-${booking.id}-${Date.now()}`;
    const roomUrl = `https://medrate.daily.co/${roomName}`;

    try {
      const response = await axios.post(
        `${config.baseUrl}/rooms`,
        {
          name: roomName,
          privacy: 'private',
          properties: {
            enable_recording: true,
            enable_screenshare: true,
            enable_chat: true,
            max_participants: 2,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiry
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: config.timeout
        }
      );

      return {
        sessionId: response.data.id,
        roomUrl: response.data.url
      };
    } catch (error) {
      console.error('Daily.co API error:', error.response?.data || error.message);
      throw new Error('Failed to create Daily.co room');
    }
  }

  /**
   * Create Agora session
   */
  async createAgoraSession(booking) {
    const config = this.providers.AGORA;
    
    if (!config.appId || !config.appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    const channelName = `medrate-${booking.id}-${Date.now()}`;
    const sessionId = `session-${Date.now()}`;

    // Generate Agora token (simplified - in production, use proper token generation)
    const token = this.generateAgoraToken(channelName, sessionId);

    return {
      sessionId,
      roomUrl: `agora://${channelName}`,
      token,
      appId: config.appId
    };
  }

  /**
   * Create Zoom session
   */
  async createZoomSession(booking) {
    const config = this.providers.ZOOM;
    
    if (!config.apiKey || !config.apiSecret) {
      throw new Error('Zoom credentials not configured');
    }

    try {
      // Create Zoom meeting
      const response = await axios.post(
        `${config.baseUrl}/users/me/meetings`,
        {
          topic: `Medical Consultation - ${booking.doctor.user.firstName} ${booking.doctor.user.lastName}`,
          type: 2, // Scheduled meeting
          start_time: booking.appointmentDate.toISOString(),
          duration: booking.duration,
          password: this.generateMeetingPassword(),
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            recording: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.getZoomAccessToken()}`,
            'Content-Type': 'application/json'
          },
          timeout: config.timeout
        }
      );

      return {
        sessionId: response.data.id.toString(),
        roomUrl: response.data.join_url
      };
    } catch (error) {
      console.error('Zoom API error:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  /**
   * Start a telemedicine session
   */
  async startSession(sessionId, userId, userType) {
    try {
      const session = await prisma.telemedicineSession.findUnique({
        where: { id: sessionId },
        include: {
          booking: {
            include: {
              doctor: true,
              patient: true
            }
          }
        }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Verify user authorization
      const isAuthorized = userType === 'DOCTOR' 
        ? session.booking.doctor.userId === userId
        : session.booking.patientId === userId;

      if (!isAuthorized) {
        throw new Error('Unauthorized to access this session');
      }

      // Update session status
      const updatedSession = await prisma.telemedicineSession.update({
        where: { id: sessionId },
        data: {
          status: 'STARTED',
          actualStart: new Date(),
          ...(userType === 'DOCTOR' ? { doctorJoined: true } : { patientJoined: true })
        }
      });

      return {
        success: true,
        data: updatedSession
      };
    } catch (error) {
      console.error('Error starting telemedicine session:', error);
      return {
        success: false,
        message: 'Failed to start telemedicine session',
        error: error.message
      };
    }
  }

  /**
   * End a telemedicine session
   */
  async endSession(sessionId, userId, userType) {
    try {
      const session = await prisma.telemedicineSession.findUnique({
        where: { id: sessionId },
        include: {
          booking: {
            include: {
              doctor: true,
              patient: true
            }
          }
        }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Verify user authorization
      const isAuthorized = userType === 'DOCTOR' 
        ? session.booking.doctor.userId === userId
        : session.booking.patientId === userId;

      if (!isAuthorized) {
        throw new Error('Unauthorized to end this session');
      }

      const actualEnd = new Date();
      const duration = session.actualStart 
        ? Math.round((actualEnd.getTime() - session.actualStart.getTime()) / (1000 * 60))
        : 0;

      // Update session status
      const updatedSession = await prisma.telemedicineSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          actualEnd,
          duration
        }
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: session.bookingId },
        data: {
          status: 'COMPLETED'
        }
      });

      return {
        success: true,
        data: updatedSession
      };
    } catch (error) {
      console.error('Error ending telemedicine session:', error);
      return {
        success: false,
        message: 'Failed to end telemedicine session',
        error: error.message
      };
    }
  }

  /**
   * Get session details
   */
  async getSession(sessionId, userId) {
    try {
      const session = await prisma.telemedicineSession.findUnique({
        where: { id: sessionId },
        include: {
          booking: {
            include: {
              doctor: {
                include: { user: true }
              },
              patient: true
            }
          }
        }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Verify user authorization
      const isAuthorized = session.booking.doctor.userId === userId || 
                          session.booking.patientId === userId;

      if (!isAuthorized) {
        throw new Error('Unauthorized to access this session');
      }

      return {
        success: true,
        data: session
      };
    } catch (error) {
      console.error('Error getting telemedicine session:', error);
      return {
        success: false,
        message: 'Failed to get telemedicine session',
        error: error.message
      };
    }
  }

  /**
   * Get user's telemedicine sessions
   */
  async getUserSessions(userId, userType, limit = 10, offset = 0) {
    try {
      const whereClause = userType === 'DOCTOR' 
        ? { booking: { doctor: { userId } } }
        : { booking: { patientId: userId } };

      const sessions = await prisma.telemedicineSession.findMany({
        where: whereClause,
        include: {
          booking: {
            include: {
              doctor: {
                include: { user: true }
              },
              patient: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return {
        success: true,
        data: sessions
      };
    } catch (error) {
      console.error('Error getting user telemedicine sessions:', error);
      return {
        success: false,
        message: 'Failed to get telemedicine sessions',
        error: error.message
      };
    }
  }

  /**
   * Generate Agora token (simplified)
   */
  generateAgoraToken(channelName, uid) {
    // In production, implement proper Agora token generation
    // This is a simplified version
    return 'agora-token-placeholder';
  }

  /**
   * Get Zoom access token
   */
  getZoomAccessToken() {
    // In production, implement proper Zoom OAuth flow
    // This is a placeholder
    return 'zoom-access-token-placeholder';
  }

  /**
   * Generate meeting password
   */
  generateMeetingPassword() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Check if doctor has telemedicine enabled
   */
  async isTelemedicineEnabled(doctorId) {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { telemedicineEnabled: true, subscriptionLevel: true }
      });

      if (!doctor) {
        return false;
      }

      // Check if doctor has active subscription with telemedicine access
      return doctor.telemedicineEnabled && doctor.subscriptionLevel !== 'FREE';
    } catch (error) {
      console.error('Error checking telemedicine status:', error);
      return false;
    }
  }
}

export default TelemedicineService;