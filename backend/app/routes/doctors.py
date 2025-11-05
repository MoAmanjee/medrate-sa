"""
Doctor Routes
Search, listing, and promotion functionality
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional
from app.database import get_db
from app.models.enhanced_models import Doctor, SubscriptionPlan
from enum import Enum

router = APIRouter()


@router.get("/search")
async def search_doctors(
    q: Optional[str] = Query(None, description="Search query"),
    specialization: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    rating: Optional[float] = Query(None, ge=0, le=5),
    verified: Optional[bool] = Query(True),
    medicalAid: Optional[bool] = Query(None),
    telehealth: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search for doctors with filters
    Promoted doctors (Premium plan) appear first
    """
    query = db.query(Doctor)
    
    # Build filters
    if q:
        search_term = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Doctor.display_name).like(search_term),
                func.lower(Doctor.specialization).like(search_term),
                func.lower(Doctor.practice_city).like(search_term),
                func.lower(Doctor.practice_name).like(search_term)
            )
        )
    
    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))
    
    if location:
        query = query.filter(
            or_(
                Doctor.practice_city.ilike(f"%{location}%"),
                Doctor.practice_province.ilike(f"%{location}%")
            )
        )
    
    if rating:
        query = query.filter(Doctor.rating_avg >= rating)
    
    if verified:
        query = query.filter(Doctor.verification_status == "verified")
    
    if medicalAid:
        query = query.filter(Doctor.accepts_medical_aid == True)
    
    if telehealth:
        query = query.filter(Doctor.telehealth_available == True)
    
    # Get total count
    total = query.count()
    
    # Sort: Premium (promoted) first, then by rating
    # Premium = 3, Standard = 2, Free = 1 (based on enum values)
    query = query.order_by(
        Doctor.subscription_plan.desc(),  # Premium > Standard > Free
        Doctor.rating_avg.desc(),
        Doctor.total_reviews.desc()
    )
    
    # Pagination
    offset = (page - 1) * limit
    doctors = query.offset(offset).limit(limit).all()
    
    return {
        "success": True,
        "data": {
            "doctors": [
                {
                    "id": str(d.id),
                    "name": d.display_name,
                    "specialization": d.specialization,
                    "location": f"{d.practice_city}, {d.practice_province}",
                    "rating": float(d.rating_avg) if d.rating_avg else 0.0,
                    "totalReviews": d.total_reviews,
                    "verified": d.verification_status == "verified",
                    "promoted": d.subscription_plan == SubscriptionPlan.PREMIUM,
                    "medicalAid": d.accepts_medical_aid,
                    "telehealth": d.telehealth_available,
                    "phone": d.phone,
                    "practiceName": d.practice_name,
                }
                for d in doctors
            ],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "totalPages": (total + limit - 1) // limit
            }
        }
    }


@router.get("/{doctor_id}")
async def get_doctor(
    doctor_id: str,
    db: Session = Depends(get_db)
):
    """Get doctor details by ID"""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    
    if not doctor:
        return {
            "success": False,
            "error": "Doctor not found"
        }
    
    return {
        "success": True,
        "data": {
            "id": str(doctor.id),
            "name": doctor.display_name,
            "specialization": doctor.specialization,
            "location": {
                "city": doctor.practice_city,
                "province": doctor.practice_province,
                "address": doctor.practice_address,
            },
            "rating": float(doctor.rating_avg) if doctor.rating_avg else 0.0,
            "totalReviews": doctor.total_reviews,
            "verified": doctor.verification_status == "verified",
            "promoted": doctor.subscription_plan == SubscriptionPlan.PREMIUM,
            "medicalAid": doctor.accepts_medical_aid,
            "telehealth": doctor.telehealth_available,
            "phone": doctor.phone,
            "email": doctor.email,
            "practiceName": doctor.practice_name,
            "bio": doctor.bio,
            "languages": doctor.languages_spoken or [],
        }
    }


@router.post("/{doctor_id}/promote")
async def promote_doctor(
    doctor_id: str,
    plan: str = Query(..., description="plan: premium for promotion"),
    db: Session = Depends(get_db)
):
    """
    Promote doctor to Premium plan
    Premium doctors appear first in search results
    """
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    
    if not doctor:
        return {
            "success": False,
            "error": "Doctor not found"
        }
    
    # Update subscription plan
    if plan == "premium":
        doctor.subscription_plan = SubscriptionPlan.PREMIUM
    elif plan == "standard":
        doctor.subscription_plan = SubscriptionPlan.STANDARD
    else:
        doctor.subscription_plan = SubscriptionPlan.FREE
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Doctor promoted to {plan} plan",
        "data": {
            "doctor_id": str(doctor.id),
            "plan": doctor.subscription_plan.value,
            "promoted": doctor.subscription_plan == SubscriptionPlan.PREMIUM
        }
    }
