"""
Review Service
Handles review creation and validation
Ensures only verified patients with completed appointments can review
"""
from typing import Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models import Review, Appointment, User, Doctor
from ..adapters.ai_adapter import AIAdapter


class ReviewService:
    """Service for handling reviews"""
    
    def __init__(self, db: Session, ai_adapter: Optional[AIAdapter] = None):
        self.db = db
        self.ai_adapter = ai_adapter
    
    def create_review(
        self,
        user_id: str,
        doctor_id: str,
        appointment_id: str,
        rating: int,
        comment: Optional[str] = None
    ) -> Dict:
        """
        Create a review
        
        Validation:
        1. User must be verified
        2. Appointment must exist and belong to user
        3. Appointment must be completed
        4. User can only review once per appointment
        """
        # Check if user exists and is verified
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": False, "error": "User not found"}
        
        if not user.verified:
            return {
                "success": False,
                "error": "Only verified patients can leave reviews"
            }
        
        # Check if appointment exists and belongs to user
        appointment = self.db.query(Appointment).filter(
            and_(
                Appointment.id == appointment_id,
                Appointment.user_id == user_id,
                Appointment.doctor_id == doctor_id
            )
        ).first()
        
        if not appointment:
            return {
                "success": False,
                "error": "Appointment not found or does not belong to user"
            }
        
        # Check if appointment is completed
        if appointment.status != "completed":
            return {
                "success": False,
                "error": "Review can only be created for completed appointments",
                "details": {
                    "appointment_status": appointment.status
                }
            }
        
        # Check if review already exists for this appointment
        existing_review = self.db.query(Review).filter(
            and_(
                Review.user_id == user_id,
                Review.appointment_id == appointment_id
            )
        ).first()
        
        if existing_review:
            return {
                "success": False,
                "error": "Review already exists for this appointment"
            }
        
        # Validate rating
        if rating < 1 or rating > 5:
            return {
                "success": False,
                "error": "Rating must be between 1 and 5"
            }
        
        # Create review
        review = Review(
            user_id=user_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            rating=rating,
            comment=comment,
            verified_visit=True,  # Set by trigger, but explicit here
            is_verified=False  # Admin can verify later
        )
        
        # Analyze sentiment if AI adapter available
        if self.ai_adapter and comment:
            sentiment_result = self.ai_adapter.analyze_sentiment(comment)
            review.sentiment = sentiment_result.get("sentiment", "neutral")
        
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        # Trigger will automatically update doctor's rating_avg and num_reviews
        
        return {
            "success": True,
            "data": {
                "review": {
                    "id": str(review.id),
                    "user_id": user_id,
                    "doctor_id": doctor_id,
                    "appointment_id": appointment_id,
                    "rating": rating,
                    "comment": comment,
                    "verified_visit": review.verified_visit,
                    "sentiment": review.sentiment,
                    "created_at": review.created_at.isoformat()
                },
                "message": "Review created successfully"
            }
        }
    
    def get_doctor_reviews(
        self,
        doctor_id: str,
        verified_only: bool = False,
        page: int = 1,
        limit: int = 20
    ) -> Dict:
        """Get reviews for a doctor"""
        query = self.db.query(Review).filter(Review.doctor_id == doctor_id)
        
        if verified_only:
            query = query.filter(Review.verified_visit == True)
        
        total = query.count()
        reviews = query.order_by(Review.created_at.desc()).offset(
            (page - 1) * limit
        ).limit(limit).all()
        
        return {
            "success": True,
            "data": {
                "reviews": [
                    {
                        "id": str(r.id),
                        "rating": r.rating,
                        "comment": r.comment,
                        "verified_visit": r.verified_visit,
                        "sentiment": r.sentiment,
                        "created_at": r.created_at.isoformat(),
                        "patient_name": "Anonymous"  # Privacy: don't expose full name
                    }
                    for r in reviews
                ],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": (total + limit - 1) // limit
                }
            }
        }

