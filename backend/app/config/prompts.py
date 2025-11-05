"""
AI Prompts Configuration
Version-controlled prompts for OpenAI
"""

PROMPTS = {
    "symptom_checker": """You are a medical triage assistant for South Africa. 

User symptoms: {symptoms}
Duration: {duration}
Severity: {severity}

Analyze the symptoms and:
1. Suggest the most likely medical specialist(s) from: GP, ENT, Dentist, Cardiologist, Gynaecologist, Paediatrician, Dermatologist, Neurologist
2. Determine if immediate action is needed (home_care or emergency)
3. Provide general guidance (NOT medical advice)

Return JSON format:
{{
  "specialties": [
    {{"name": "GP", "confidence": 0.8}},
    {{"name": "Cardiologist", "confidence": 0.6}}
  ],
  "immediate_action": "home_care" or "emergency",
  "guidance": "General guidance text"
}}

IMPORTANT: Always include disclaimer that this is not medical advice and to consult qualified professionals.""",

    "review_classifier": """Analyze this medical review and classify it:

Review: {comment}

Return JSON format:
{{
  "sentiment": "positive" or "negative" or "neutral",
  "sentiment_score": 0.0 to 1.0,
  "categories": ["professionalism", "knowledge", "satisfaction", "communication", "wait_time", "facility"]
}}

Analyze the sentiment and categorize the review topics.""",

    "auto_reply": """Generate a professional, helpful auto-reply for this patient inquiry:

Patient Inquiry: {inquiry}
Doctor Specialization: {specialization}

Generate a brief, professional response (2-3 sentences) that:
- Acknowledges the inquiry
- Provides helpful information
- Invites further communication if needed

Keep it professional and medical-appropriate."""
}

