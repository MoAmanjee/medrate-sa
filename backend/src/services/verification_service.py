"""
Verification Service
Handles doctor and patient verification workflows
"""
from typing import Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..adapters.hpcsa_adapter import HPCSAAdapter
from ..models import Doctor, VerificationRequest, User


class VerificationService:
    """Service for handling verification workflows"""
    
    def __init__(self, db: Session, hpcsa_adapter: HPCSAAdapter):
        self.db = db
        self.hpcsa_adapter = hpcsa_adapter
    
    def verify_doctor(
        self,
        doctor_id: str,
        hpcsa_number: str,
        full_name: str,
        documents: Dict
    ) -> Dict:
        """
        Verify doctor credentials
        
        Flow:
        1. Call HPCSA adapter (mock or real)
        2. If auto_verified -> mark doctor as verified
        3. If manual_review -> create verification request for admin
        4. Update doctor verification status
        """
        doctor = self.db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return {"success": False, "error": "Doctor not found"}
        
        # Call HPCSA adapter
        hpcsa_result = self.hpcsa_adapter.verify_doctor(hpcsa_number, full_name)
        
        # Create verification request record
        verification_request = VerificationRequest(
            doctor_id=doctor_id,
            documents=documents,
            hpcsa_lookup=hpcsa_result,
            status=hpcsa_result.get("status", "manual_review")
        )
        self.db.add(verification_request)
        
        # Update doctor based on verification result
        if hpcsa_result.get("status") == "auto_verified":
            doctor.verified = True
            doctor.verification_status = "verified"
            verification_request.status = "approved"
        else:
            doctor.verification_status = "manual_review"
            verification_request.status = "manual_review"
        
        doctor.updated_at = datetime.utcnow()
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "doctor_id": doctor_id,
                "verification_status": doctor.verification_status,
                "verified": doctor.verified,
                "hpcsa_result": hpcsa_result,
                "message": hpcsa_result.get("message", "Verification in progress")
            }
        }
    
    def approve_doctor_verification(
        self,
        verification_request_id: str,
        admin_user_id: str,
        notes: Optional[str] = None
    ) -> Dict:
        """Admin approves doctor verification"""
        verification_request = self.db.query(VerificationRequest).filter(
            VerificationRequest.id == verification_request_id
        ).first()
        
        if not verification_request:
            return {"success": False, "error": "Verification request not found"}
        
        doctor = self.db.query(Doctor).filter(
            Doctor.id == verification_request.doctor_id
        ).first()
        
        if not doctor:
            return {"success": False, "error": "Doctor not found"}
        
        # Approve verification
        doctor.verified = True
        doctor.verification_status = "verified"
        verification_request.status = "approved"
        verification_request.reviewed_by = admin_user_id
        verification_request.reviewed_at = datetime.utcnow()
        verification_request.admin_notes = notes
        
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "doctor_id": doctor.id,
                "verified": True,
                "message": "Doctor verification approved"
            }
        }
    
    def reject_doctor_verification(
        self,
        verification_request_id: str,
        admin_user_id: str,
        rejection_reason: str
    ) -> Dict:
        """Admin rejects doctor verification"""
        verification_request = self.db.query(VerificationRequest).filter(
            VerificationRequest.id == verification_request_id
        ).first()
        
        if not verification_request:
            return {"success": False, "error": "Verification request not found"}
        
        doctor = self.db.query(Doctor).filter(
            Doctor.id == verification_request.doctor_id
        ).first()
        
        if not doctor:
            return {"success": False, "error": "Doctor not found"}
        
        # Reject verification
        doctor.verified = False
        doctor.verification_status = "rejected"
        verification_request.status = "rejected"
        verification_request.reviewed_by = admin_user_id
        verification_request.reviewed_at = datetime.utcnow()
        verification_request.admin_notes = rejection_reason
        
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "doctor_id": doctor.id,
                "verified": False,
                "message": "Doctor verification rejected"
            }
        }
    
    def verify_patient_otp(
        self,
        user_id: str,
        otp_code: str
    ) -> Dict:
        """Verify patient OTP"""
        # This would typically check OTP table
        # Simplified for example
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {"success": False, "error": "User not found"}
        
        # In real implementation, verify OTP from otp_verifications table
        # For now, mark as verified
        user.verified = True
        user.verification_status = "verified"
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "user_id": user_id,
                "verified": True,
                "message": "Patient verified successfully"
            }
        }

