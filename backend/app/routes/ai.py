"""
AI Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from app.services.ai_service import AIService
from app.middleware.rate_limit import ai_rate_limit

router = APIRouter()


def get_ai_service() -> AIService:
    """Dependency to get AI service instance"""
    return AIService()


@router.post("/symptom-checker")
@ai_rate_limit
async def symptom_checker(
    symptoms_data: dict,
    ai_service: AIService = Depends(get_ai_service)
):
    """AI-powered symptom checker"""
    result = ai_service.suggest_specialty_from_symptoms(
        symptoms=symptoms_data.get("symptoms"),
        duration=symptoms_data.get("duration"),
        severity=symptoms_data.get("severity")
    )
    
    return {
        "success": True,
        "data": result
    }


@router.post("/analyze-sentiment")
@ai_rate_limit
async def analyze_sentiment(
    review_data: dict,
    ai_service: AIService = Depends(get_ai_service)
):
    """Analyze review sentiment"""
    result = ai_service.classify_review(review_data.get("text", ""))
    
    return {
        "success": True,
        "data": result
    }


@router.post("/suggest-reply")
@ai_rate_limit
async def suggest_reply(
    inquiry_data: dict,
    ai_service: AIService = Depends(get_ai_service)
):
    """Suggest auto-reply for doctor"""
    result = ai_service.suggest_auto_reply(
        patient_inquiry=inquiry_data.get("inquiry"),
        doctor_specialization=inquiry_data.get("specialization")
    )
    
    return {
        "success": True,
        "data": {
            "suggested_reply": result
        }
    }

