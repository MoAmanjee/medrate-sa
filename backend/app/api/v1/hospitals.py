"""
Hospital API Routes
Search, claim, promotion, and profile management
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.hospital_service import HospitalService, get_hospital_service
from app.middleware.auth import get_current_user, get_hospital_admin_user
from app.models.enhanced_models import User

router = APIRouter()


@router.get("/search")
async def search_hospitals(
    q: Optional[str] = Query(None, description="Search query"),
    city: Optional[str] = Query(None),
    type: Optional[str] = Query(None, description="Hospital type filter"),
    rating: Optional[float] = Query(None, ge=0, le=5),
    verified_only: bool = Query(True, description="Show only verified hospitals"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    hospital_service: HospitalService = Depends(get_hospital_service)
):
    """
    Search hospitals with filters
    - Only claimed & verified hospitals shown by default
    - Featured hospitals appear first
    """
    result = hospital_service.search_hospitals(
        q=q,
        city=city,
        type_filter=type,
        rating=rating,
        verified_only=verified_only,
        page=page,
        limit=limit
    )
    
    return result


@router.get("/{hospital_id}")
async def get_hospital(
    hospital_id: str,
    db: Session = Depends(get_db),
    hospital_service: HospitalService = Depends(get_hospital_service)
):
    """Get hospital profile details"""
    result = hospital_service.get_hospital_profile(hospital_id)
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    return result


@router.post("/{hospital_id}/claim/initiate")
async def initiate_claim(
    hospital_id: str,
    email: str = Query(..., description="Email to receive claim link"),
    db: Session = Depends(get_db),
    hospital_service: HospitalService = Depends(get_hospital_service)
):
    """Initiate hospital claim process"""
    result = hospital_service.initiate_claim(hospital_id, email)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.get("/claim/verify/{claim_token}")
async def verify_claim_token(
    claim_token: str,
    db: Session = Depends(get_db),
    hospital_service: HospitalService = Depends(get_hospital_service)
):
    """Verify claim token from email link"""
    result = hospital_service.verify_claim_token(claim_token)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/claim/complete")
async def complete_claim(
    claim_id: str,
    documents: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    hospital_service: HospitalService = Depends(get_hospital_service)
):
    """Complete hospital claim with document upload"""
    result = hospital_service.complete_claim(
        claim_id=claim_id,
        user_id=str(current_user.id),
        documents=documents
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/{hospital_id}/promotion/purchase")
async def purchase_promotion(
    hospital_id: str,
    promotion_tier: str = Query(..., description="standard or premium"),
    payment_provider: str = Query("payfast", description="payfast, yoco, or paystack"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_hospital_admin_user),
    hospital_service: HospitalService = Depends(get_hospital_service)
):
    """Purchase hospital promotion"""
    result = hospital_service.purchase_promotion(
        hospital_id=hospital_id,
        promotion_tier=promotion_tier,
        payment_provider=payment_provider
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/promotion/webhook")
async def promotion_webhook(
    data: dict,
    db: Session = Depends(get_db),
    hospital_service: HospitalService = Depends(get_hospital_service)
):
    """Handle payment webhook for promotion activation"""
    # Verify webhook signature (implementation depends on provider)
    # Extract payment details
    payment_transaction_id = data.get("transaction_id")
    hospital_id = data.get("metadata", {}).get("hospital_id")
    promotion_tier = data.get("metadata", {}).get("promotion_tier")
    days = data.get("metadata", {}).get("days", 7)
    
    if not all([payment_transaction_id, hospital_id, promotion_tier]):
        raise HTTPException(status_code=400, detail="Invalid webhook data")
    
    amount = data.get("amount", 0)
    
    result = hospital_service.activate_promotion(
        hospital_id=hospital_id,
        promotion_tier=promotion_tier,
        payment_transaction_id=payment_transaction_id,
        days=days,
        amount=amount
    )
    
    return result

