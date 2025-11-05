"""
AI Service - OpenAI Integration
Symptom checker, review classification, auto-reply suggestions
"""
import os
import json
import openai
from typing import Dict, List, Optional
from app.config.prompts import PROMPTS


class AIService:
    """AI service for medical assistance and review analysis"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.mock_mode = os.getenv("OPENAI_MOCK_MODE", "false").lower() == "true"
        
        if not self.mock_mode and self.api_key:
            openai.api_key = self.api_key
    
    def suggest_specialty_from_symptoms(
        self,
        symptoms: str,
        duration: Optional[str] = None,
        severity: Optional[str] = None
    ) -> Dict:
        """
        Suggest medical specialties based on symptoms
        
        Returns:
        - specialties: List of {name, confidence}
        - immediate_action: {home_care, emergency}
        """
        prompt = PROMPTS["symptom_checker"].format(
            symptoms=symptoms,
            duration=duration or "Not specified",
            severity=severity or "Not specified"
        )
        
        if self.mock_mode:
            return self._mock_symptom_analysis(symptoms)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical triage assistant for South Africa. Always recommend consulting qualified medical professionals. This is informational only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            
            # Parse JSON response
            try:
                result = json.loads(content)
            except:
                # Fallback parsing
                result = self._parse_symptom_response(content)
            
            # Add disclaimer
            result["disclaimer"] = "This is not medical advice. Please consult a qualified medical professional."
            
            # Check for red flags
            if self._check_red_flags(symptoms):
                result["immediate_action"] = "emergency"
                result["urgent_message"] = "Please seek immediate medical attention or call emergency services."
            
            return result
            
        except Exception as e:
            # Fallback to mock on error
            return self._mock_symptom_analysis(symptoms)
    
    def classify_review(self, comment: str) -> Dict:
        """
        Classify review sentiment and categories
        
        Returns:
        - sentiment: positive, negative, neutral
        - categories: List of categories
        - sentiment_score: 0-1
        """
        prompt = PROMPTS["review_classifier"].format(comment=comment)
        
        if self.mock_mode:
            return self._mock_review_classification(comment)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a review classification system. Analyze medical reviews for sentiment and categories."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=200
            )
            
            content = response.choices[0].message.content
            
            try:
                result = json.loads(content)
            except:
                result = self._parse_review_response(content)
            
            return result
            
        except Exception as e:
            return self._mock_review_classification(comment)
    
    def suggest_auto_reply(
        self,
        patient_inquiry: str,
        doctor_specialization: str
    ) -> str:
        """
        Suggest professional auto-reply for doctor
        
        Returns suggested reply text
        """
        prompt = PROMPTS["auto_reply"].format(
            inquiry=patient_inquiry,
            specialization=doctor_specialization
        )
        
        if self.mock_mode:
            return "Thank you for your inquiry. We will get back to you soon."
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional medical assistant. Generate professional, helpful responses for patient inquiries."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return "Thank you for your inquiry. We will get back to you soon."
    
    def _check_red_flags(self, symptoms: str) -> bool:
        """Check for emergency red flag symptoms"""
        red_flags = [
            "chest pain", "heart attack", "stroke", "severe bleeding",
            "difficulty breathing", "unconscious", "severe trauma",
            "severe allergic reaction", "overdose"
        ]
        
        symptoms_lower = symptoms.lower()
        return any(flag in symptoms_lower for flag in red_flags)
    
    def _mock_symptom_analysis(self, symptoms: str) -> Dict:
        """Mock symptom analysis"""
        symptoms_lower = symptoms.lower()
        
        if "chest" in symptoms_lower or "heart" in symptoms_lower:
            return {
                "specialties": [
                    {"name": "Cardiologist", "confidence": 0.9},
                    {"name": "General Practitioner", "confidence": 0.7}
                ],
                "immediate_action": "emergency",
                "urgent_message": "Please seek immediate medical attention."
            }
        
        return {
            "specialties": [
                {"name": "General Practitioner", "confidence": 0.8}
            ],
            "immediate_action": "home_care",
            "disclaimer": "This is not medical advice. Please consult a qualified medical professional."
        }
    
    def _mock_review_classification(self, comment: str) -> Dict:
        """Mock review classification"""
        comment_lower = comment.lower()
        
        positive_words = ["excellent", "great", "good", "wonderful", "professional"]
        negative_words = ["bad", "terrible", "awful", "poor", "disappointed"]
        
        positive_count = sum(1 for word in positive_words if word in comment_lower)
        negative_count = sum(1 for word in negative_words if word in comment_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            score = 0.8
        elif negative_count > positive_count:
            sentiment = "negative"
            score = 0.2
        else:
            sentiment = "neutral"
            score = 0.5
        
        return {
            "sentiment": sentiment,
            "sentiment_score": score,
            "categories": ["professionalism", "satisfaction"]
        }
    
    def _parse_symptom_response(self, content: str) -> Dict:
        """Parse symptom response if JSON parsing fails"""
        return {
            "specialties": [{"name": "General Practitioner", "confidence": 0.7}],
            "immediate_action": "home_care"
        }
    
    def _parse_review_response(self, content: str) -> Dict:
        """Parse review response if JSON parsing fails"""
        return {
            "sentiment": "neutral",
            "sentiment_score": 0.5,
            "categories": []
        }


# Factory function
def get_ai_service() -> AIService:
    """Factory function for dependency injection"""
    return AIService()

