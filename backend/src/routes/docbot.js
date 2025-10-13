import express from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DocBot chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id || null;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        message: 'Please provide a message describing your symptoms'
      });
    }

    // Generate AI response using OpenAI
    const aiResponse = await generateDoctorRecommendation(message);

    // Store chat interaction
    const chatRecord = await prisma.docBotChat.create({
      data: {
        userId,
        sessionId: sessionId || generateSessionId(),
        userMessage: message,
        botResponse: aiResponse.response,
        doctorType: aiResponse.doctorType,
        searchQuery: aiResponse.searchQuery
      }
    });

    res.json({
      message: aiResponse.response,
      doctorType: aiResponse.doctorType,
      searchQuery: aiResponse.searchQuery,
      chatId: chatRecord.id,
      disclaimer: "Disclaimer: This is an AI recommendation only. Consult a licensed doctor before taking action."
    });
  } catch (error) {
    console.error('DocBot chat error:', error);
    res.status(500).json({
      error: 'Chat processing failed',
      message: 'An error occurred while processing your request'
    });
  }
});

// Get chat history for a user or session
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { sessionId, limit = 20 } = req.query;
    const userId = req.user?.id;

    const whereConditions = {};
    if (userId) {
      whereConditions.userId = userId;
    } else if (sessionId) {
      whereConditions.sessionId = sessionId;
    }

    const chats = await prisma.docBotChat.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      chats: chats.map(chat => ({
        id: chat.id,
        userMessage: chat.userMessage,
        botResponse: chat.botResponse,
        doctorType: chat.doctorType,
        searchQuery: chat.searchQuery,
        createdAt: chat.createdAt
      }))
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history',
      message: 'An error occurred while fetching chat history'
    });
  }
});

// Get DocBot analytics (admin only)
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin access required'
      });
    }

    const [
      totalChats,
      uniqueUsers,
      popularSymptoms,
      doctorTypeRecommendations
    ] = await Promise.all([
      prisma.docBotChat.count(),
      prisma.docBotChat.groupBy({
        by: ['userId'],
        where: { userId: { not: null } }
      }).then(result => result.length),
      prisma.docBotChat.groupBy({
        by: ['userMessage'],
        _count: { userMessage: true },
        orderBy: { _count: { userMessage: 'desc' } },
        take: 10
      }),
      prisma.docBotChat.groupBy({
        by: ['doctorType'],
        _count: { doctorType: true },
        where: { doctorType: { not: null } },
        orderBy: { _count: { doctorType: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      analytics: {
        totalChats,
        uniqueUsers,
        popularSymptoms: popularSymptoms.map(item => ({
          symptom: item.userMessage,
          count: item._count.userMessage
        })),
        doctorTypeRecommendations: doctorTypeRecommendations.map(item => ({
          doctorType: item.doctorType,
          count: item._count.doctorType
        }))
      }
    });
  } catch (error) {
    console.error('Get DocBot analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'An error occurred while fetching analytics'
    });
  }
});

// Helper function to generate doctor recommendation using OpenAI
async function generateDoctorRecommendation(symptoms) {
  const prompt = `
You are DocBot, an AI assistant for MedRate SA, a South African healthcare platform. Your role is to recommend the appropriate type of doctor based on symptoms described by users.

IMPORTANT RULES:
1. You can ONLY recommend doctor types/specializations - NO medical advice, diagnoses, or treatments
2. Always be brief, friendly, and professional
3. Focus on South African healthcare context
4. Include a disclaimer in every response
5. Suggest specific doctor types like "General Practitioner", "Cardiologist", "Dermatologist", etc.

User symptoms: "${symptoms}"

Respond with a JSON object containing:
{
  "response": "Brief friendly response recommending doctor type with disclaimer",
  "doctorType": "Specific doctor type/specialization",
  "searchQuery": "Search terms for finding this doctor type"
}

Example response format:
"Hi! Based on your symptoms, you may want to see a **General Practitioner (GP)**. They can help assess your condition and refer you to a specialist if needed.

_Disclaimer: This is an AI recommendation only. Consult a licensed doctor before taking action._"
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are DocBot, a helpful AI assistant for MedRate SA that recommends doctor types based on symptoms. Always include disclaimers and never provide medical advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return {
        response: parsedResponse.response,
        doctorType: parsedResponse.doctorType,
        searchQuery: parsedResponse.searchQuery
      };
    } catch (parseError) {
      // Fallback if AI doesn't return proper JSON
      return {
        response: aiResponse,
        doctorType: "General Practitioner",
        searchQuery: "general practitioner"
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response if OpenAI fails
    return {
      response: `Hi! Based on your symptoms, you may want to see a **General Practitioner (GP)**. They can help assess your condition and provide appropriate care.

_Disclaimer: This is an AI recommendation only. Consult a licensed doctor before taking action._`,
      doctorType: "General Practitioner",
      searchQuery: "general practitioner"
    };
  }
}

// Helper function to generate session ID
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

export default router;
