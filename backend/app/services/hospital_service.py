"""
Hospital Service
Manages hospital claims, verification, promotions, and search
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from app.adapters.payment_adapter import PaymentAdapter, get_payment_adapter

# Import hospital models
try:
    from app.models.hospital_models import Hospital, HospitalClaim, HospitalPromotion
except ImportError:
    # Fallback if models are in enhanced_models
    from app.models.enhanced_models import Base
    Hospital = None  # Will be set when models are integrated
    HospitalClaim = None
    HospitalPromotion = None


class HospitalService:
    """Service for hospital operations"""
    
    def __init__(self, db: Session, payment_adapter: Optional[PaymentAdapter] = None):
        self.db = db
        self.payment_adapter = payment_adapter or get_payment_adapter()
    
    def search_hospitals(
        self,
        q: Optional[str] = None,
        city: Optional[str] = None,
        type_filter: Optional[str] = None,
        rating: Optional[float] = None,
        verified_only: bool = True,
        page: int = 1,
        limit: int = 20
    ) -> Dict:
        """
        Search hospitals with filters
        Only claimed & verified hospitals appear by default
        Featured hospitals appear first
        """
        query = self.db.query(Hospital)
        
        # Default: only show claimed and verified
        if verified_only:
            query = query.filter(
                and_(
                    Hospital.claimed == True,
                    Hospital.verification_status == "verified"
                )
            )
        
        # Search query
        if q:
            search_term = f"%{q.lower()}%"
            query = query.filter(
                or_(
                    func.lower(Hospital.name).like(search_term),
                    func.lower(Hospital.city).like(search_term),
                    func.lower(Hospital.description).like(search_term)
                )
            )
        
        # Filters
        if city:
            query = query.filter(func.lower(Hospital.city).like(f"%{city.lower()}%"))
        
        if type_filter:
            query = query.filter(Hospital.type == type_filter)
        
        if rating:
            query = query.filter(Hospital.rating_avg >= rating)
        
        # Get total count
        total = query.count()
        
        # Sort: Featured first, then by rating
        query = query.order_by(
            desc(Hospital.is_featured),
            desc(Hospital.featured_until),
            desc(Hospital.rating_avg),
            desc(Hospital.total_reviews)
        )
        
        # Pagination
        offset = (page - 1) * limit
        hospitals = query.offset(offset).limit(limit).all()
        
        return {
            "success": True,
            "data": {
                "hospitals": [
                    {
                        "id": str(h.id),
                        "name": h.name,
                        "type": h.type,
                        "city": h.city,
                        "province": h.province,
                        "rating": float(h.rating_avg) if h.rating_avg else 0.0,
                        "totalReviews": h.total_reviews,
                        "verified": h.verification_status == "verified",
                        "claimed": h.claimed,
                        "featured": h.is_featured,
                        "promotionTier": h.promotion_tier,
                        "phone": h.phone,
                        "address": h.address,
                        "emergencyServices": h.emergency_services,
                        "departments": h.departments or [],
                        "specialties": h.specialties or [],
                    }
                    for h in hospitals
                ],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "totalPages": (total + limit - 1) // limit
                }
            }
        }
    
    def initiate_claim(
        self,
        hospital_id: str,
        email: str,
        user_id: Optional[str] = None
    ) -> Dict:
        """Initiate hospital claim process"""
        hospital = self.db.query(Hospital).filter(Hospital.id == hospital_id).first()
        
        if not hospital:
            return {"success": False, "error": "Hospital not found"}
        
        if hospital.claimed:
            return {"success": False, "error": "Hospital already claimed"}
        
        # Generate claim token
        import secrets
        claim_token = secrets.token_urlsafe(32)
        
        # Create claim request
        claim = HospitalClaim(
            hospital_id=hospital_id,
            user_id=user_id,
            claim_email=email,
            claim_token=claim_token,
            claim_status="pending"
        )
        
        self.db.add(claim)
        self.db.commit()
        
        # Send email with claim link (in production)
        # email_service.send_claim_email(email, claim_token, hospital.name)
        
        return {
            "success": True,
            "data": {
                "claim_id": str(claim.id),
                "claim_token": claim_token,  # In production, send via email only
                "message": "Claim request created. Check your email for verification link."
            }
        }
    
    def verify_claim_token(self, claim_token: str) -> Dict:
        """Verify claim token and complete claim"""
        claim = self.db.query(HospitalClaim).filter(
            and_(
                HospitalClaim.claim_token == claim_token,
                HospitalClaim.claim_status == "pending"
            )
        ).first()
        
        if not claim:
            return {"success": False, "error": "Invalid or expired claim token"}
        
        # Check if token expired (24 hours)
        if datetime.utcnow() - claim.submitted_at > timedelta(hours=24):
            claim.claim_status = "expired"
            self.db.commit()
            return {"success": False, "error": "Claim token expired"}
        
        return {
            "success": True,
            "data": {
                "claim_id": str(claim.id),
                "hospital_id": str(claim.hospital_id),
                "email": claim.claim_email
            }
        }
    
    def complete_claim(
        self,
        claim_id: str,
        user_id: str,
        documents: Dict
    ) -> Dict:
        """Complete hospital claim with documents"""
        claim = self.db.query(HospitalClaim).filter(HospitalClaim.id == claim_id).first()
        
        if not claim:
            return {"success": False, "error": "Claim not found"}
        
        if claim.user_id and claim.user_id != user_id:
            return {"success": False, "error": "Unauthorized"}
        
        # Update claim
        claim.user_id = user_id
        claim.documents = documents
        claim.claim_status = "approved"
        claim.reviewed_at = datetime.utcnow()
        
        # Update hospital
        hospital = self.db.query(Hospital).filter(Hospital.id == claim.hospital_id).first()
        hospital.claimed = True
        hospital.claimed_by_user_id = user_id
        hospital.claimed_at = datetime.utcnow()
        hospital.verification_status = "in_progress"  # Needs admin verification
        
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "hospital_id": str(hospital.id),
                "message": "Hospital claimed successfully. Awaiting admin verification."
            }
        }
    
    def purchase_promotion(
        self,
        hospital_id: str,
        promotion_tier: str,
        payment_provider: str = "payfast"
    ) -> Dict:
        """Purchase hospital promotion"""
        hospital = self.db.query(Hospital).filter(Hospital.id == hospital_id).first()
        
        if not hospital:
            return {"success": False, "error": "Hospital not found"}
        
        if not hospital.claimed or hospital.verification_status != "verified":
            return {"success": False, "error": "Hospital must be verified to purchase promotions"}
        
        # Promotion pricing
        pricing = {
            "standard": {"amount": 1999.00, "days": 7},
            "premium": {"amount": 7999.00, "days": 30}
        }
        
        price_info = pricing.get(promotion_tier)
        if not price_info:
            return {"success": False, "error": "Invalid promotion tier"}
        
        
        # Create payment session
        payment_result = self.payment_adapter.create_payment(
            amount=price_info["amount"],
            currency="ZAR",
            description=f"Hospital Promotion: {promotion_tier}",
            metadata={
                "hospital_id": hospital_id,
                "promotion_tier": promotion_tier,
                "days": price_info["days"]
            }
        )
        
        return {
            "success": True,
            "data": {
                "payment_url": payment_result.get("payment_url"),
                "payment_id": payment_result.get("payment_id"),
                "amount": price_info["amount"],
                "days": price_info["days"]
            }
        }
    
    def activate_promotion(
        self,
        hospital_id: str,
        promotion_tier: str,
        payment_transaction_id: str,
        days: int,
        amount: float
    ) -> Dict:
        """Activate promotion after payment"""
        hospital = self.db.query(Hospital).filter(Hospital.id == hospital_id).first()
        
        if not hospital:
            return {"success": False, "error": "Hospital not found"}
        
        # Create promotion record
        promotion = HospitalPromotion(
            hospital_id=hospital_id,
            promotion_tier=promotion_tier,
            amount_paid=amount,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=days),
            payment_provider="payfast",  # From payment result
            payment_transaction_id=payment_transaction_id,
            status="active"
        )
        
        self.db.add(promotion)
        self.db.commit()
        
        # Trigger will update hospital.is_featured
        
        return {
            "success": True,
            "data": {
                "promotion_id": str(promotion.id),
                "featured_until": promotion.end_date.isoformat(),
                "message": "Promotion activated"
            }
        }
    
    def get_hospital_profile(self, hospital_id: str) -> Dict:
        """Get hospital profile details"""
        hospital = self.db.query(Hospital).filter(Hospital.id == hospital_id).first()
        
        if not hospital:
            return {"success": False, "error": "Hospital not found"}
        
        return {
            "success": True,
            "data": {
                "id": str(hospital.id),
                "name": hospital.name,
                "type": hospital.type,
                "claimed": hospital.claimed,
                "verified": hospital.verification_status == "verified",
                "location": {
                    "address": hospital.address,
                    "city": hospital.city,
                    "province": hospital.province,
                    "postal_code": hospital.postal_code,
                    "latitude": float(hospital.latitude) if hospital.latitude else None,
                    "longitude": float(hospital.longitude) if hospital.longitude else None,
                },
                "contact": {
                    "phone": hospital.phone,
                    "email": hospital.email,
                    "website": hospital.website,
                },
                "profile": {
                    "logo_url": hospital.logo_url,
                    "description": hospital.description,
                    "emergency_services": hospital.emergency_services,
                },
                "services": {
                    "departments": hospital.departments or [],
                    "specialties": hospital.specialties or [],
                },
                "ratings": {
                    "rating_avg": float(hospital.rating_avg) if hospital.rating_avg else 0.0,
                    "total_reviews": hospital.total_reviews,
                },
                "promotion": {
                    "is_featured": hospital.is_featured,
                    "featured_until": hospital.featured_until.isoformat() if hospital.featured_until else None,
                    "promotion_tier": hospital.promotion_tier,
                }
            }
        }


# Factory function
def get_hospital_service(db: Session, payment_adapter: Optional[PaymentAdapter] = None) -> HospitalService:
    """Factory function for dependency injection"""
    return HospitalService(db, payment_adapter)

