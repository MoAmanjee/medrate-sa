"""
Enhanced Review Service
Multiple rating categories, AI moderation, weighted algorithm
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.enhanced_models import Review, Appointment, User, Doctor
from app.services.ai_service import AIService


class EnhancedReviewService:
    """Enhanced review service with multiple categories and AI moderation"""
    
    def __init__(self, db: Session, ai_service: Optional[AIService] = None):
        self.db = db
        self.ai_service = ai_service
    
    def create_review(
        self,
        user_id: str,
        doctor_id: str,
        appointment_id: str,
        overall_rating: int,
        communication_rating: Optional[int] = None,
        wait_time_rating: Optional[int] = None,
        diagnosis_accuracy_rating: Optional[int] = None,
        professionalism_rating: Optional[int] = None,
        comment: Optional[str] = None
    ) -> Dict:
        """
        Create review with multiple rating categories
        
        Validation:
        - User must be verified
        - Appointment must exist and be completed
        - Only one review per appointment
        """
        # Validate user
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.verified:
            return {
                "success": False,
                "error": "Only verified users can leave reviews"
            }
        
        # Validate appointment
        appointment = self.db.query(Appointment).filter(
            and_(
                Appointment.id == appointment_id,
                Appointment.user_id == user_id,
                Appointment.doctor_id == doctor_id,
                Appointment.status == "completed"
            )
        ).first()
        
        if not appointment:
            return {
                "success": False,
                "error": "Appointment not found or not completed"
            }
        
        # Check for duplicate
        existing_review = self.db.query(Review).filter(
            Review.appointment_id == appointment_id
        ).first()
        
        if existing_review:
            return {
                "success": False,
                "error": "Review already exists for this appointment"
            }
        
        # Validate ratings (1-5)
        ratings = {
            "overall": overall_rating,
            "communication": communication_rating,
            "wait_time": wait_time_rating,
            "diagnosis_accuracy": diagnosis_accuracy_rating,
            "professionalism": professionalism_rating
        }
        
        for key, value in ratings.items():
            if value and (value < 1 or value > 5):
                return {
                    "success": False,
                    "error": f"{key} rating must be between 1 and 5"
                }
        
        # Create review
        review = Review(
            patient_id=user_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            overall_rating=overall_rating,
            communication_rating=communication_rating,
            wait_time_rating=wait_time_rating,
            diagnosis_accuracy_rating=diagnosis_accuracy_rating,
            professionalism_rating=professionalism_rating,
            comment=comment,
            verified_visit=True
        )
        
        # AI Moderation
        if comment and self.ai_service:
            classification = self.ai_service.classify_review(comment)
            review.ai_moderated = True
            review.ai_sentiment = classification.get("sentiment", "neutral")
            review.ai_categories = classification.get("categories", [])
            
            # Check for inappropriate content
            if self._is_inappropriate(comment, classification):
                review.is_flagged = True
                review.flag_reason = "AI detected inappropriate content"
        
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        # Update doctor ratings (weighted algorithm)
        self._update_doctor_ratings(doctor_id)
        
        return {
            "success": True,
            "data": {
                "review": {
                    "id": str(review.id),
                    "overall_rating": overall_rating,
                    "verified_visit": True,
                    "is_flagged": review.is_flagged,
                    "sentiment": review.ai_sentiment
                }
            }
        }
    
    def _update_doctor_ratings(self, doctor_id: str):
        """Update doctor ratings using weighted algorithm"""
        doctor = self.db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return
        
        # Get all verified reviews
        reviews = self.db.query(Review).filter(
            and_(
                Review.doctor_id == doctor_id,
                Review.verified_visit == True,
                Review.is_flagged == False
            )
        ).all()
        
        if not reviews:
            doctor.rating_avg = 0.0
            doctor.total_reviews = 0
        else:
            # Weighted average (more recent reviews have higher weight)
            total_weighted_rating = 0.0
            total_weight = 0.0
            
            for review in reviews:
                # Weight: 1.0 for reviews < 30 days, 0.8 for 30-90 days, 0.6 for > 90 days
                days_old = (datetime.utcnow() - review.created_at).days
                if days_old < 30:
                    weight = 1.0
                elif days_old < 90:
                    weight = 0.8
                else:
                    weight = 0.6
                
                total_weighted_rating += review.overall_rating * weight
                total_weight += weight
            
            doctor.rating_avg = round(total_weighted_rating / total_weight, 2) if total_weight > 0 else 0.0
            doctor.total_reviews = len(reviews)
        
        self.db.commit()
    
    def _is_inappropriate(self, comment: str, classification: Dict) -> bool:
        """Check if comment is inappropriate"""
        # Check sentiment
        if classification.get("sentiment") == "negative" and classification.get("sentiment_score", 0) < 0.2:
            # Extremely negative might be spam
            if len(comment) < 50:
                return True
        
        # Check for spam indicators
        spam_keywords = ["click here", "visit", "buy", "www.", "http"]
        comment_lower = comment.lower()
        if any(keyword in comment_lower for keyword in spam_keywords):
            return True
        
        return False
    
    def get_doctor_reviews(
        self,
        doctor_id: str,
        page: int = 1,
        limit: int = 20,
        sort: str = "recent"  # recent, rating_high, rating_low
    ) -> Dict:
        """Get reviews for doctor with sorting"""
        query = self.db.query(Review).filter(
            and_(
                Review.doctor_id == doctor_id,
                Review.verified_visit == True,
                Review.is_flagged == False
            )
        )
        
        # Sorting
        if sort == "rating_high":
            query = query.order_by(Review.overall_rating.desc(), Review.created_at.desc())
        elif sort == "rating_low":
            query = query.order_by(Review.overall_rating.asc(), Review.created_at.desc())
        else:  # recent
            query = query.order_by(Review.created_at.desc())
        
        total = query.count()
        reviews = query.offset((page - 1) * limit).limit(limit).all()
        
        return {
            "success": True,
            "data": {
                "reviews": [
                    {
                        "id": str(r.id),
                        "overall_rating": r.overall_rating,
                        "communication_rating": r.communication_rating,
                        "wait_time_rating": r.wait_time_rating,
                        "diagnosis_accuracy_rating": r.diagnosis_accuracy_rating,
                        "professionalism_rating": r.professionalism_rating,
                        "comment": r.comment,
                        "verified_visit": r.verified_visit,
                        "created_at": r.created_at.isoformat()
                    }
                    for r in reviews
                ],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": (total + limit - 1) // limit
                },
                "average_ratings": self._calculate_average_ratings(doctor_id)
            }
        }
    
    def _calculate_average_ratings(self, doctor_id: str) -> Dict:
        """Calculate average ratings for each category"""
        reviews = self.db.query(Review).filter(
            and_(
                Review.doctor_id == doctor_id,
                Review.verified_visit == True,
                Review.is_flagged == False
            )
        ).all()
        
        if not reviews:
            return {
                "overall": 0.0,
                "communication": 0.0,
                "wait_time": 0.0,
                "diagnosis_accuracy": 0.0,
                "professionalism": 0.0
            }
        
        return {
            "overall": round(sum(r.overall_rating for r in reviews) / len(reviews), 2),
            "communication": round(sum(r.communication_rating or 0 for r in reviews) / len([r for r in reviews if r.communication_rating]), 2) if any(r.communication_rating for r in reviews) else 0.0,
            "wait_time": round(sum(r.wait_time_rating or 0 for r in reviews) / len([r for r in reviews if r.wait_time_rating]), 2) if any(r.wait_time_rating for r in reviews) else 0.0,
            "diagnosis_accuracy": round(sum(r.diagnosis_accuracy_rating or 0 for r in reviews) / len([r for r in reviews if r.diagnosis_accuracy_rating]), 2) if any(r.diagnosis_accuracy_rating for r in reviews) else 0.0,
            "professionalism": round(sum(r.professionalism_rating or 0 for r in reviews) / len([r for r in reviews if r.professionalism_rating]), 2) if any(r.professionalism_rating for r in reviews) else 0.0
        }


# Factory function
def get_enhanced_review_service(db: Session, ai_service: Optional[AIService] = None) -> EnhancedReviewService:
    """Factory function for dependency injection"""
    return EnhancedReviewService(db, ai_service)

