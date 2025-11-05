"""
Review Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User
from app.services.review_validity_service import ReviewValidityService, get_review_validity_service
from app.services.ai_service import AIService, get_ai_service
from app.middleware.rate_limit import general_rate_limit

router = APIRouter()


@router.post("")
@general_rate_limit
async def create_review(
    review_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service)
):
    """Create review (validated)"""
    review_service = get_review_validity_service(db, ai_service)
    
    result = review_service.create_review(
        user_id=current_user.id,
        doctor_id=review_data.get("doctorId"),
        appointment_id=review_data.get("appointmentId"),
        rating=review_data.get("rating"),
        comment=review_data.get("comment")
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.get("")
@general_rate_limit
async def get_reviews(
    doctor_id: str = None,
    verified_only: bool = False,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get reviews for doctor"""
    from app.services.review_service import ReviewService, get_review_service
    
    review_service = get_review_service(db)
    result = review_service.get_doctor_reviews(
        doctor_id=doctor_id,
        verified_only=verified_only,
        page=page,
        limit=limit
    )
    
    return result

