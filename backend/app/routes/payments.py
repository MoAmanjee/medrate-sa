"""
Payment Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User
from app.services.payment_service import PaymentService, get_payment_service
from app.middleware.rate_limit import webhook_rate_limit

router = APIRouter()


@router.post("/doctors/{doctor_id}/subscribe")
async def create_subscription(
    doctor_id: str,
    subscription_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    payment_service: PaymentService = Depends(get_payment_service)
):
    """Create subscription payment session"""
    # Verify user is doctor
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can subscribe")
    
    result = payment_service.create_subscription(
        doctor_id=doctor_id,
        plan=subscription_data.get("plan"),
        billing_cycle=subscription_data.get("billingCycle", "monthly")
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/webhook")
@webhook_rate_limit
async def payment_webhook(
    request: Request,
    provider: str = "paystack",
    db: Session = Depends(get_db),
    payment_service: PaymentService = Depends(get_payment_service)
):
    """Handle payment provider webhook"""
    # Verify webhook signature
    # ... signature verification logic ...
    
    event_data = await request.json()
    
    result = payment_service.handle_payment_webhook(
        provider=provider,
        event_data=event_data
    )
    
    return result

