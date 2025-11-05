"""
Check-in Service
Handles appointment check-in with OTP and QR codes
"""
import secrets
import qrcode
from io import BytesIO
import base64
from typing import Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models import Appointment, User


class CheckInService:
    """Service for appointment check-in"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_checkin_code(self, appointment_id: str) -> Dict:
        """
        Generate check-in code (OTP or QR) for appointment
        
        Returns:
        - otp_code: 6-digit OTP
        - qr_code_data: Base64 encoded QR code image
        - expires_at: Expiration timestamp
        """
        appointment = self.db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()
        
        if not appointment:
            return {"success": False, "error": "Appointment not found"}
        
        # Generate OTP
        otp_code = secrets.token_hex(3).upper()[:6]  # 6-character code
        
        # Generate QR code data
        qr_data = {
            "appointment_id": appointment_id,
            "otp_code": otp_code,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Create QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(str(qr_data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Update appointment
        appointment.checkin_otp = otp_code
        appointment.checkin_qr_code = qr_image_base64
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "appointment_id": appointment_id,
                "otp_code": otp_code,
                "qr_code_data": f"data:image/png;base64,{qr_image_base64}",
                "expires_at": (datetime.utcnow() + timedelta(hours=2)).isoformat()
            }
        }
    
    def verify_checkin_otp(
        self,
        appointment_id: str,
        otp_code: str,
        verified_by: str  # 'doctor' or 'clinic_staff'
    ) -> Dict:
        """Verify OTP check-in code"""
        appointment = self.db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()
        
        if not appointment:
            return {"success": False, "error": "Appointment not found"}
        
        if not appointment.checkin_otp:
            return {"success": False, "error": "No check-in code generated for this appointment"}
        
        if appointment.checkin_otp.upper() != otp_code.upper():
            return {"success": False, "error": "Invalid check-in code"}
        
        # Mark as checked in
        appointment.checked_in = True
        appointment.checked_in_at = datetime.utcnow()
        
        # Update status if still booked
        if appointment.status == "booked":
            appointment.status = "confirmed"
        
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "appointment_id": appointment_id,
                "checked_in": True,
                "checked_in_at": appointment.checked_in_at.isoformat(),
                "verified_by": verified_by
            }
        }
    
    def verify_checkin_qr(
        self,
        qr_data: Dict,
        verified_by: str
    ) -> Dict:
        """Verify QR code check-in"""
        appointment_id = qr_data.get("appointment_id")
        otp_code = qr_data.get("otp_code")
        
        if not appointment_id or not otp_code:
            return {"success": False, "error": "Invalid QR code data"}
        
        return self.verify_checkin_otp(appointment_id, otp_code, verified_by)
    
    def doctor_confirm_appointment(
        self,
        appointment_id: str,
        doctor_id: str
    ) -> Dict:
        """Doctor manually confirms appointment completion"""
        appointment = self.db.query(Appointment).filter(
            Appointment.id == appointment_id,
            Appointment.doctor_id == doctor_id
        ).first()
        
        if not appointment:
            return {"success": False, "error": "Appointment not found"}
        
        # Mark as doctor confirmed and completed
        appointment.doctor_confirmed = True
        appointment.doctor_confirmed_at = datetime.utcnow()
        appointment.status = "completed"
        
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "appointment_id": appointment_id,
                "doctor_confirmed": True,
                "status": "completed",
                "confirmed_at": appointment.doctor_confirmed_at.isoformat()
            }
        }

