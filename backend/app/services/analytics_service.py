"""
Analytics Service
Doctor analytics and insights
"""
from typing import Dict, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.enhanced_models import DoctorAnalytics, Appointment, Review, Doctor


class AnalyticsService:
    """Service for analytics and reporting"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_doctor_analytics(
        self,
        doctor_id: str,
        period: str = "monthly",  # daily, weekly, monthly, yearly
        start_date: datetime = None,
        end_date: datetime = None
    ) -> Dict:
        """Get analytics for doctor"""
        doctor = self.db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return {"success": False, "error": "Doctor not found"}
        
        # Set date range if not provided
        if not end_date:
            end_date = datetime.utcnow()
        if not start_date:
            if period == "daily":
                start_date = end_date - timedelta(days=1)
            elif period == "weekly":
                start_date = end_date - timedelta(days=7)
            elif period == "monthly":
                start_date = end_date - timedelta(days=30)
            else:  # yearly
                start_date = end_date - timedelta(days=365)
        
        # Get appointments
        appointments = self.db.query(Appointment).filter(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.created_at >= start_date,
                Appointment.created_at <= end_date
            )
        ).all()
        
        # Get reviews
        reviews = self.db.query(Review).filter(
            and_(
                Review.doctor_id == doctor_id,
                Review.created_at >= start_date,
                Review.created_at <= end_date,
                Review.verified_visit == True
            )
        ).all()
        
        # Calculate metrics
        total_appointments = len(appointments)
        completed = len([a for a in appointments if a.status.value == "completed"])
        cancelled = len([a for a in appointments if a.status.value == "cancelled"])
        no_show = len([a for a in appointments if a.status.value == "no_show"])
        
        new_reviews = len(reviews)
        avg_rating = sum(r.overall_rating for r in reviews) / len(reviews) if reviews else 0.0
        
        # Profile views (would come from analytics table)
        profile_views = self._get_profile_views(doctor_id, start_date, end_date)
        
        return {
            "success": True,
            "data": {
                "doctor_id": doctor_id,
                "period": period,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "metrics": {
                    "profile_views": profile_views,
                    "booking_requests": total_appointments,
                    "completed_appointments": completed,
                    "cancelled_appointments": cancelled,
                    "no_show_appointments": no_show,
                    "completion_rate": round(completed / total_appointments * 100, 2) if total_appointments > 0 else 0,
                    "new_reviews": new_reviews,
                    "average_rating": round(avg_rating, 2),
                    "total_reviews": doctor.total_reviews
                },
                "revenue": {
                    "total_revenue": self._calculate_revenue(doctor_id, start_date, end_date),
                    "appointments_count": completed
                },
                "demographics": self._get_demographics(doctor_id, start_date, end_date)
            }
        }
    
    def _get_profile_views(self, doctor_id: str, start_date: datetime, end_date: datetime) -> int:
        """Get profile views from analytics table"""
        analytics = self.db.query(DoctorAnalytics).filter(
            and_(
                DoctorAnalytics.doctor_id == doctor_id,
                DoctorAnalytics.period_start >= start_date,
                DoctorAnalytics.period_end <= end_date
            )
        ).all()
        
        return sum(a.profile_views for a in analytics)
    
    def _calculate_revenue(self, doctor_id: str, start_date: datetime, end_date: datetime) -> float:
        """Calculate revenue from completed appointments"""
        # This would calculate from appointment fees
        # For now, return 0 (would need fee data)
        return 0.0
    
    def _get_demographics(self, doctor_id: str, start_date: datetime, end_date: datetime) -> Dict:
        """Get patient demographics (anonymized)"""
        appointments = self.db.query(Appointment).filter(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.status == "completed",
                Appointment.created_at >= start_date,
                Appointment.created_at <= end_date
            )
        ).all()
        
        # This would aggregate anonymized demographic data
        return {
            "age_groups": {},
            "gender_distribution": {}
        }


# Factory function
def get_analytics_service(db: Session) -> AnalyticsService:
    """Factory function for dependency injection"""
    return AnalyticsService(db)

