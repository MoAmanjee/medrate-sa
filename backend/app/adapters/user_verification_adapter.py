"""
User Verification Adapters
Smile Identity and Trulioo integration for user verification
"""
import os
import requests
from typing import Dict, Optional, Any
from datetime import datetime
from enum import Enum


class VerificationProvider(Enum):
    SMILE_IDENTITY = "smile_identity"
    TRULIOO = "trulioo"
    MANUAL = "manual"
    MOCK = "mock"


class UserVerificationAdapter:
    """Adapter for user verification services"""
    
    def __init__(self):
        self.provider = os.getenv("USER_VERIFICATION_PROVIDER", "mock").lower()
        self.mock_mode = os.getenv("USER_VERIFICATION_MOCK_MODE", "true").lower() == "true"
        
        # Smile Identity config
        self.smile_api_key = os.getenv("SMILE_IDENTITY_API_KEY")
        self.smile_partner_id = os.getenv("SMILE_IDENTITY_PARTNER_ID")
        self.smile_api_url = os.getenv("SMILE_IDENTITY_API_URL", "https://api.smileidentity.com/v1")
        
        # Trulioo config
        self.trulioo_api_key = os.getenv("TRULIOO_API_KEY")
        self.trulioo_api_url = os.getenv("TRULIOO_API_URL", "https://api.globaldatacompany.com/verifications/v1")
    
    def verify_user(
        self,
        user_id: str,
        id_number: str,
        full_name: str,
        phone: str,
        email: str,
        id_document_url: Optional[str] = None,
        selfie_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verify user with 3rd-party service
        
        Returns verification result
        """
        if self.mock_mode:
            return self._mock_verify(id_number, full_name)
        
        if self.provider == "smile_identity":
            return self._smile_identity_verify(
                user_id, id_number, full_name, phone, email,
                id_document_url, selfie_url
            )
        elif self.provider == "trulioo":
            return self._trulioo_verify(
                id_number, full_name, phone, email
            )
        else:
            return {
                "verified": False,
                "status": "pending",
                "provider": "manual",
                "message": "Manual verification required"
            }
    
    def _mock_verify(self, id_number: str, full_name: str) -> Dict[str, Any]:
        """Mock verification for development"""
        # Mock logic: valid SA ID format
        if len(id_number) == 13 and id_number.isdigit():
            return {
                "verified": True,
                "status": "verified",
                "provider": "mock",
                "confidence_score": 0.95,
                "verified_at": datetime.utcnow().isoformat(),
                "message": "User verified (mock mode)"
            }
        else:
            return {
                "verified": False,
                "status": "pending",
                "provider": "mock",
                "message": "Invalid ID format (mock mode)"
            }
    
    def _smile_identity_verify(
        self,
        user_id: str,
        id_number: str,
        full_name: str,
        phone: str,
        email: str,
        id_document_url: Optional[str],
        selfie_url: Optional[str]
    ) -> Dict[str, Any]:
        """Verify using Smile Identity API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.smile_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "partner_id": self.smile_partner_id,
                "user_id": user_id,
                "id_number": id_number,
                "full_name": full_name,
                "phone": phone,
                "email": email,
                "country": "ZA",  # South Africa
                "id_type": "NATIONAL_ID"
            }
            
            if id_document_url:
                payload["id_document_url"] = id_document_url
            if selfie_url:
                payload["selfie_url"] = selfie_url
            
            response = requests.post(
                f"{self.smile_api_url}/verify",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            data = response.json()
            
            return {
                "verified": data.get("verified", False),
                "status": "verified" if data.get("verified") else "pending",
                "provider": "smile_identity",
                "confidence_score": data.get("confidence_score", 0.0),
                "verified_at": datetime.utcnow().isoformat() if data.get("verified") else None,
                "raw_response": data,
                "message": data.get("message", "Verification completed")
            }
            
        except requests.RequestException as e:
            return {
                "verified": False,
                "status": "pending",
                "provider": "smile_identity",
                "error": str(e),
                "message": "Smile Identity API unavailable"
            }
    
    def _trulioo_verify(
        self,
        id_number: str,
        full_name: str,
        phone: str,
        email: str
    ) -> Dict[str, Any]:
        """Verify using Trulioo API"""
        try:
            headers = {
                "x-trulioo-api-key": self.trulioo_api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "AcceptTruliooTermsAndConditions": True,
                "ConfigurationName": "Identity Verification",
                "CountryCode": "ZA",
                "DataFields": {
                    "PersonInfo": {
                        "FirstGivenName": full_name.split()[0] if full_name else "",
                        "FirstSurName": full_name.split()[-1] if full_name else "",
                        "MiddleName": " ".join(full_name.split()[1:-1]) if len(full_name.split()) > 2 else ""
                    },
                    "Communication": {
                        "MobileNumber": phone,
                        "EmailAddress": email
                    },
                    "NationalIds": [
                        {
                            "Number": id_number,
                            "Type": "NationalID"
                        }
                    ]
                }
            }
            
            response = requests.post(
                f"{self.trulioo_api_url}/verify",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            data = response.json()
            
            verified = data.get("Record", {}).get("RecordStatus") == "match"
            
            return {
                "verified": verified,
                "status": "verified" if verified else "pending",
                "provider": "trulioo",
                "confidence_score": data.get("Record", {}).get("Confidence", 0.0),
                "verified_at": datetime.utcnow().isoformat() if verified else None,
                "raw_response": data,
                "message": "Trulioo verification completed"
            }
            
        except requests.RequestException as e:
            return {
                "verified": False,
                "status": "pending",
                "provider": "trulioo",
                "error": str(e),
                "message": "Trulioo API unavailable"
            }


# Factory function
def get_user_verification_adapter() -> UserVerificationAdapter:
    """Factory function for dependency injection"""
    return UserVerificationAdapter()

