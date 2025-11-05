"""
Appointment Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User
from app.services.booking_service import BookingService, get_booking_service
from app.services.checkin_service import CheckInService, get_checkin_service
from app.services.notification_service import NotificationService, get_notification_service
from app.middleware.rate_limit import general_rate_limit

router = APIRouter()


@router.post("")
@general_rate_limit
async def create_appointment(
    appointment_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    booking_service: BookingService = Depends(get_booking_service),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Create appointment"""
    result = booking_service.create_appointment(
        user_id=current_user.id,
        doctor_id=appointment_data.get("doctorId"),
        clinic_id=appointment_data.get("clinicId"),
        start_time=appointment_data.get("startTime"),
        notes=appointment_data.get("notes")
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    # Generate check-in code
    checkin_service = get_checkin_service(db)
    checkin_result = checkin_service.generate_checkin_code(result["data"]["appointment"]["id"])
    
    # Send notifications
    notification_service.send_booking_confirmation(
        phone=current_user.phone,
        email=current_user.email,
        appointment_details={
            "doctor_name": "Dr. Example",  # Fetch from DB
            "date": appointment_data.get("startTime"),
            "time": appointment_data.get("startTime"),
            "booking_reference": result["data"]["appointment"]["booking_reference"]
        },
        checkin_code=checkin_result["data"] if checkin_result.get("success") else None
    )
    
    # Add check-in code to response
    if checkin_result.get("success"):
        result["data"]["appointment"]["checkinCode"] = checkin_result["data"]
    
    return result


@router.post("/{appointment_id}/checkin")
@general_rate_limit
async def verify_checkin(
    appointment_id: str,
    checkin_data: dict,
    db: Session = Depends(get_db),
    checkin_service: CheckInService = Depends(get_checkin_service)
):
    """Verify check-in (OTP or QR)"""
    result = checkin_service.verify_checkin_otp(
        appointment_id=appointment_id,
        otp_code=checkin_data.get("otpCode"),
        verified_by="clinic_staff"
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result


@router.post("/{appointment_id}/doctor-confirm")
async def doctor_confirm(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    checkin_service: CheckInService = Depends(get_checkin_service)
):
    """Doctor confirms appointment completion"""
    # Verify user is doctor and owns appointment
    # ... validation logic ...
    
    result = checkin_service.doctor_confirm_appointment(
        appointment_id=appointment_id,
        doctor_id=current_user.id  # Assuming user has doctor_id
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result

