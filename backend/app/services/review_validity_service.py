"""
Review Validity & Anti-Fraud Service
Ensures only legitimate reviews from verified patients
"""
from typing import Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Review, Appointment, User
from app.services.ai_service import AIService


class ReviewValidityService:
    """Service for validating and preventing fraudulent reviews"""
    
    def __init__(self, db: Session, ai_service: Optional[AIService] = None):
        self.db = db
        self.ai_service = ai_service
        self.max_days_after_appointment = 90  # Reviews allowed within 90 days
    
    def validate_review_creation(
        self,
        user_id: str,
        doctor_id: str,
        appointment_id: str,
        rating: int,
        comment: Optional[str] = None
    ) -> Dict:
        """
        Validate review creation with multiple checks
        
        Returns validation result with success/error
        """
        # 1. Check user is verified
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"valid": False, "error": "User not found"}
        
        if not user.verified:
            return {
                "valid": False,
                "error": "Only verified patients can leave reviews"
            }
        
        # 2. Check appointment exists and belongs to user
        appointment = self.db.query(Appointment).filter(
            and_(
                Appointment.id == appointment_id,
                Appointment.user_id == user_id,
                Appointment.doctor_id == doctor_id
            )
        ).first()
        
        if not appointment:
            return {
                "valid": False,
                "error": "Appointment not found or does not belong to user"
            }
        
        # 3. Check appointment is completed
        if appointment.status != "completed":
            return {
                "valid": False,
                "error": "Review can only be created for completed appointments",
                "details": {"appointment_status": appointment.status}
            }
        
        # 4. Check appointment was checked in or doctor confirmed
        if not appointment.checked_in and not appointment.doctor_confirmed:
            return {
                "valid": False,
                "error": "Appointment must be checked in or confirmed by doctor"
            }
        
        # 5. Check timestamp (review within X days of appointment)
        appointment_date = appointment.start_time
        days_since = (datetime.utcnow() - appointment_date).days
        
        if days_since > self.max_days_after_appointment:
            return {
                "valid": False,
                "error": f"Review must be submitted within {self.max_days_after_appointment} days of appointment"
            }
        
        # 6. Check for duplicate review (same user, same appointment)
        existing_review = self.db.query(Review).filter(
            and_(
                Review.user_id == user_id,
                Review.appointment_id == appointment_id
            )
        ).first()
        
        if existing_review:
            return {
                "valid": False,
                "error": "Review already exists for this appointment"
            }
        
        # 7. Check for multiple reviews from same user for same doctor
        user_reviews_count = self.db.query(Review).filter(
            and_(
                Review.user_id == user_id,
                Review.doctor_id == doctor_id
            )
        ).count()
        
        # Allow multiple reviews if they're for different appointments
        # This is already handled by the appointment_id check above
        
        # 8. Rate limiting check (per user)
        recent_reviews = self.db.query(Review).filter(
            and_(
                Review.user_id == user_id,
                Review.created_at >= datetime.utcnow() - timedelta(hours=24)
            )
        ).count()
        
        if recent_reviews >= 10:  # Max 10 reviews per day
            return {
                "valid": False,
                "error": "Rate limit exceeded. Maximum 10 reviews per day."
            }
        
        # 9. AI fraud detection (if comment provided)
        fraud_detected = False
        if comment and self.ai_service:
            classification = self.ai_service.classify_review(comment)
            
            # Check for bot/fake style indicators
            if self._detect_bot_style(comment, classification):
                return {
                    "valid": False,
                    "error": "Review flagged for review. Please contact support.",
                    "flagged": True
                }
        
        # All checks passed
        return {
            "valid": True,
            "verified_visit": True,
            "fraud_detected": fraud_detected
        }
    
    def _detect_bot_style(self, comment: str, classification: Dict) -> bool:
        """
        Detect bot/fake review style using heuristics and AI
        
        Returns True if suspicious
        """
        # Heuristic checks
        comment_lower = comment.lower()
        
        # Too short or too long
        if len(comment) < 10 or len(comment) > 1000:
            return True
        
        # Excessive repetition
        words = comment_lower.split()
        if len(set(words)) < len(words) * 0.3:  # Less than 30% unique words
            return True
        
        # Suspicious patterns
        suspicious_patterns = [
            "click here", "visit now", "buy now",
            "http://", "https://", "www.",
            "guaranteed", "100%", "best price"
        ]
        
        if any(pattern in comment_lower for pattern in suspicious_patterns):
            return True
        
        # AI classification flags
        if classification.get("sentiment_score") < 0.1 or classification.get("sentiment_score") > 0.9:
            # Extremely positive or negative might be suspicious
            if len(comment) < 50:  # Short extreme reviews are suspicious
                return True
        
        return False
    
    def create_review(
        self,
        user_id: str,
        doctor_id: str,
        appointment_id: str,
        rating: int,
        comment: Optional[str] = None
    ) -> Dict:
        """
        Create review after validation
        
        Returns created review or error
        """
        # Validate first
        validation = self.validate_review_creation(
            user_id, doctor_id, appointment_id, rating, comment
        )
        
        if not validation.get("valid"):
            return {
                "success": False,
                "error": validation.get("error"),
                "flagged": validation.get("flagged", False)
            }
        
        # Create review
        review = Review(
            user_id=user_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            rating=rating,
            comment=comment,
            verified_visit=True,
            is_verified=False  # Admin can verify later
        )
        
        # AI sentiment analysis
        if comment and self.ai_service:
            classification = self.ai_service.classify_review(comment)
            review.sentiment = classification.get("sentiment", "neutral")
        
        # Check if flagged
        if comment:
            classification = self.ai_service.classify_review(comment) if self.ai_service else {}
            if self._detect_bot_style(comment, classification):
                review.is_flagged = True
                review.flag_reason = "AI fraud detection"
        
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        # Trigger will automatically update doctor's rating_avg and num_reviews
        
        return {
            "success": True,
            "data": {
                "review": {
                    "id": str(review.id),
                    "rating": rating,
                    "comment": comment,
                    "verified_visit": True,
                    "is_flagged": review.is_flagged,
                    "sentiment": review.sentiment
                }
            }
        }


# Factory function
def get_review_validity_service(db: Session, ai_service: Optional[AIService] = None) -> ReviewValidityService:
    """Factory function for dependency injection"""
    return ReviewValidityService(db, ai_service)

