"""
HPCSA (Health Professions Council of South Africa) Adapter
Mock and real implementations for doctor credential verification
"""
import os
import requests
from typing import Dict, Optional, Any
from datetime import datetime


class HPCSAAdapter:
    """Adapter for HPCSA API verification"""
    
    def __init__(self):
        self.api_url = os.getenv("HPCSA_API_URL", "https://api.hpcsa.co.za/v1")
        self.api_key = os.getenv("HPCSA_API_KEY")
        self.mock_mode = os.getenv("HPCSA_MOCK_MODE", "true").lower() == "true"
    
    def verify_doctor(self, hpcsa_number: str, full_name: str) -> Dict[str, Any]:
        """
        Verify doctor credentials with HPCSA
        
        Args:
            hpcsa_number: HPCSA registration number
            full_name: Doctor's full name
            
        Returns:
            Dict with verification status and details
        """
        if self.mock_mode:
            return self._mock_verify(hpcsa_number, full_name)
        else:
            return self._real_verify(hpcsa_number, full_name)
    
    def _mock_verify(self, hpcsa_number: str, full_name: str) -> Dict[str, Any]:
        """
        Mock HPCSA verification for development/testing
        
        Mock logic:
        - If HPCSA number starts with "MP" and has 6 digits -> verified
        - If HPCSA number starts with "DT" and has 6 digits -> verified
        - Otherwise -> manual review required
        """
        hpcsa_number = hpcsa_number.strip().upper()
        
        # Mock verification logic
        if hpcsa_number.startswith("MP") and len(hpcsa_number) == 8:
            # Medical Practitioner - verified
            return {
                "verified": True,
                "status": "auto_verified",
                "hpcsa_number": hpcsa_number,
                "name_match": True,
                "registration_status": "active",
                "registration_date": "2010-01-15",
                "expiry_date": "2025-12-31",
                "specialization": "Medical Practitioner",
                "verified_at": datetime.utcnow().isoformat(),
                "message": "HPCSA verification successful"
            }
        elif hpcsa_number.startswith("DT") and len(hpcsa_number) == 8:
            # Dentist - verified
            return {
                "verified": True,
                "status": "auto_verified",
                "hpcsa_number": hpcsa_number,
                "name_match": True,
                "registration_status": "active",
                "registration_date": "2015-03-20",
                "expiry_date": "2025-12-31",
                "specialization": "Dentist",
                "verified_at": datetime.utcnow().isoformat(),
                "message": "HPCSA verification successful"
            }
        else:
            # Requires manual review
            return {
                "verified": False,
                "status": "manual_review",
                "hpcsa_number": hpcsa_number,
                "name_match": None,
                "registration_status": "unknown",
                "error": "HPCSA number format not recognized",
                "message": "Manual review required"
            }
    
    def _real_verify(self, hpcsa_number: str, full_name: str) -> Dict[str, Any]:
        """
        Real HPCSA API verification
        
        Note: This is a placeholder. Replace with actual HPCSA API integration
        when available.
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "hpcsa_number": hpcsa_number,
                "full_name": full_name
            }
            
            response = requests.post(
                f"{self.api_url}/verify",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            response.raise_for_status()
            data = response.json()
            
            return {
                "verified": data.get("verified", False),
                "status": "auto_verified" if data.get("verified") else "manual_review",
                "hpcsa_number": hpcsa_number,
                "name_match": data.get("name_match", False),
                "registration_status": data.get("status", "unknown"),
                "registration_date": data.get("registration_date"),
                "expiry_date": data.get("expiry_date"),
                "specialization": data.get("specialization"),
                "verified_at": datetime.utcnow().isoformat(),
                "message": data.get("message", "HPCSA verification completed")
            }
            
        except requests.RequestException as e:
            # On API failure, require manual review
            return {
                "verified": False,
                "status": "manual_review",
                "hpcsa_number": hpcsa_number,
                "error": str(e),
                "message": "HPCSA API unavailable, manual review required"
            }


# FastAPI usage example
def get_hpcsa_adapter() -> HPCSAAdapter:
    """Factory function for dependency injection"""
    return HPCSAAdapter()


# Example usage in FastAPI route
"""
from fastapi import APIRouter, Depends
from .adapters.hpcsa_adapter import get_hpcsa_adapter

router = APIRouter()

@router.post("/verify")
async def verify_doctor(
    hpcsa_number: str,
    full_name: str,
    adapter: HPCSAAdapter = Depends(get_hpcsa_adapter)
):
    result = adapter.verify_doctor(hpcsa_number, full_name)
    return result
"""

