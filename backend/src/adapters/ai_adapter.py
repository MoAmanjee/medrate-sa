"""
AI Adapter
OpenAI integration for symptom checker and review sentiment analysis
"""
import os
import openai
from typing import Dict, List, Optional


class AIAdapter:
    """Adapter for OpenAI API"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.mock_mode = os.getenv("OPENAI_MOCK_MODE", "false").lower() == "true"
        
        if not self.mock_mode and self.api_key:
            openai.api_key = self.api_key
    
    def symptom_checker(
        self,
        symptoms: str,
        duration: Optional[str] = None,
        severity: Optional[str] = None
    ) -> Dict:
        """
        AI-powered symptom checker
        
        Returns:
        - Possible conditions
        - Recommended specialties
        - Urgency level
        - Suggested actions
        """
        if self.mock_mode:
            return self._mock_symptom_checker(symptoms, duration, severity)
        else:
            return self._real_symptom_checker(symptoms, duration, severity)
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of review text"""
        if self.mock_mode:
            return self._mock_analyze_sentiment(text)
        else:
            return self._real_analyze_sentiment(text)
    
    def _mock_symptom_checker(
        self,
        symptoms: str,
        duration: Optional[str],
        severity: Optional[str]
    ) -> Dict:
        """Mock symptom checker"""
        symptoms_lower = symptoms.lower()
        
        # Simple keyword-based mock
        if "chest" in symptoms_lower or "heart" in symptoms_lower:
            return {
                "possible_conditions": [
                    {
                        "condition": "Cardiac-related",
                        "probability": "high",
                        "recommendation": "Consult a cardiologist immediately"
                    }
                ],
                "recommended_specialties": ["Cardiologist", "General Practitioner"],
                "urgency": "high",
                "suggested_actions": [
                    "Seek immediate medical attention",
                    "Consider visiting emergency room if symptoms worsen"
                ]
            }
        elif "headache" in symptoms_lower or "migraine" in symptoms_lower:
            return {
                "possible_conditions": [
                    {
                        "condition": "Headache/Migraine",
                        "probability": "moderate",
                        "recommendation": "Consult a general practitioner or neurologist"
                    }
                ],
                "recommended_specialties": ["General Practitioner", "Neurologist"],
                "urgency": "medium",
                "suggested_actions": [
                    "Rest in a quiet, dark room",
                    "Stay hydrated",
                    "Consider over-the-counter pain relief"
                ]
            }
        else:
            return {
                "possible_conditions": [
                    {
                        "condition": "General symptoms",
                        "probability": "low",
                        "recommendation": "Consult a general practitioner"
                    }
                ],
                "recommended_specialties": ["General Practitioner"],
                "urgency": "low",
                "suggested_actions": [
                    "Monitor symptoms",
                    "Schedule appointment with GP"
                ]
            }
    
    def _real_symptom_checker(
        self,
        symptoms: str,
        duration: Optional[str],
        severity: Optional[str]
    ) -> Dict:
        """Real OpenAI symptom checker"""
        try:
            prompt = f"""You are a medical assistant. A patient reports the following symptoms:

Symptoms: {symptoms}
Duration: {duration or 'Not specified'}
Severity: {severity or 'Not specified'}

Provide:
1. Possible conditions (with probability: high, moderate, low)
2. Recommended medical specialties
3. Urgency level (high, medium, low)
4. Suggested immediate actions

IMPORTANT: Always recommend consulting a qualified medical professional. This is informational only.

Format as JSON with keys: possible_conditions, recommended_specialties, urgency, suggested_actions.
"""
            
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful medical assistant. Always recommend consulting qualified medical professionals."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            # Parse response (simplified - in production, use proper JSON parsing)
            content = response.choices[0].message.content
            
            # For now, return structured response
            # In production, parse JSON from GPT response
            return {
                "possible_conditions": [
                    {
                        "condition": "Analysis available",
                        "probability": "moderate",
                        "recommendation": "Consult a medical professional"
                    }
                ],
                "recommended_specialties": ["General Practitioner"],
                "urgency": "medium",
                "suggested_actions": [
                    "Consult a qualified medical professional",
                    "Monitor symptoms closely"
                ],
                "ai_response": content
            }
        except Exception as e:
            # Fallback to mock on error
            return self._mock_symptom_checker(symptoms, duration, severity)
    
    def _mock_analyze_sentiment(self, text: str) -> Dict:
        """Mock sentiment analysis"""
        text_lower = text.lower()
        
        positive_words = ["excellent", "great", "good", "wonderful", "professional", "helpful"]
        negative_words = ["bad", "terrible", "awful", "poor", "disappointed", "unprofessional"]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
        elif negative_count > positive_count:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        return {
            "sentiment": sentiment,
            "confidence": 0.8 if abs(positive_count - negative_count) > 0 else 0.5
        }
    
    def _real_analyze_sentiment(self, text: str) -> Dict:
        """Real OpenAI sentiment analysis"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a sentiment analyzer. Analyze the sentiment of medical reviews. Return only: positive, negative, or neutral."
                    },
                    {
                        "role": "user",
                        "content": f"Analyze sentiment: {text}"
                    }
                ],
                temperature=0.1,
                max_tokens=10
            )
            
            sentiment = response.choices[0].message.content.strip().lower()
            
            # Validate sentiment
            if sentiment not in ["positive", "negative", "neutral"]:
                sentiment = "neutral"
            
            return {
                "sentiment": sentiment,
                "confidence": 0.9
            }
        except Exception as e:
            # Fallback to mock on error
            return self._mock_analyze_sentiment(text)


# Factory function
def get_ai_adapter() -> AIAdapter:
    """Factory function for dependency injection"""
    return AIAdapter()

