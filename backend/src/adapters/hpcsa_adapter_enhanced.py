"""
Enhanced HPCSA Adapter
Supports API, web scraping, and mock modes
"""
import os
import requests
import re
from typing import Dict, Optional, Any
from datetime import datetime
from bs4 import BeautifulSoup  # For web scraping
from ratelimit import limits, sleep_and_retry


class HPCSAAdapterEnhanced:
    """Enhanced HPCSA adapter with multiple verification methods"""
    
    def __init__(self):
        self.api_url = os.getenv("HPCSA_API_URL", "https://api.hpcsa.co.za/v1")
        self.api_key = os.getenv("HPCSA_API_KEY")
        self.mock_mode = os.getenv("HPCSA_MOCK_MODE", "true").lower() == "true"
        self.use_web_scraping = os.getenv("HPCSA_USE_WEB_SCRAPING", "false").lower() == "true"
        self.web_scrape_url = os.getenv("HPCSA_WEB_URL", "https://www.hpcsa.co.za/verify")
    
    def verify_doctor(
        self,
        hpcsa_number: str,
        full_name: str
    ) -> Dict[str, Any]:
        """
        Verify doctor credentials with HPCSA
        
        Tries methods in order:
        1. Mock mode (if enabled)
        2. Public API (if available)
        3. Web scraping (if enabled and API unavailable)
        """
        # Validate HPCSA number format
        if not self.validate_hpcsa_format(hpcsa_number):
            return {
                "verified": False,
                "status": "auto_failed",
                "error": "Invalid HPCSA number format",
                "hpcsa_number": hpcsa_number
            }
        
        if self.mock_mode:
            return self._mock_verify(hpcsa_number, full_name)
        elif self.api_key:
            result = self._api_verify(hpcsa_number, full_name)
            if result.get("error") and self.use_web_scraping:
                # Fallback to web scraping if API fails
                return self._web_scrape_verify(hpcsa_number, full_name)
            return result
        elif self.use_web_scraping:
            return self._web_scrape_verify(hpcsa_number, full_name)
        else:
            return {
                "verified": False,
                "status": "manual_review",
                "error": "No verification method available",
                "hpcsa_number": hpcsa_number
            }
    
    def validate_hpcsa_format(self, hpcsa_number: str) -> bool:
        """
        Validate HPCSA number format and checksum
        
        Format: 2 letters + 6 digits (e.g., MP123456, DT123456)
        """
        hpcsa_number = hpcsa_number.strip().upper()
        
        # Format validation
        pattern = r'^[A-Z]{2}\d{6}$'
        if not re.match(pattern, hpcsa_number):
            return False
        
        # Checksum validation (if HPCSA uses checksum)
        # This is a placeholder - implement actual checksum if known
        # checksum = calculate_checksum(hpcsa_number)
        # return validate_checksum(hpcsa_number, checksum)
        
        return True
    
    def _mock_verify(self, hpcsa_number: str, full_name: str) -> Dict[str, Any]:
        """Mock verification for development/testing"""
        hpcsa_number = hpcsa_number.strip().upper()
        
        # Mock verification logic
        if hpcsa_number.startswith("MP") and len(hpcsa_number) == 8:
            return {
                "verified": True,
                "status": "auto_verified",
                "hpcsa_number": hpcsa_number,
                "name": full_name,
                "name_match": True,
                "registration_status": "active",
                "registration_date": "2010-01-15",
                "expiry_date": "2025-12-31",
                "specialization": "Medical Practitioner",
                "verified_at": datetime.utcnow().isoformat(),
                "method": "mock",
                "message": "HPCSA verification successful (mock mode)"
            }
        elif hpcsa_number.startswith("DT") and len(hpcsa_number) == 8:
            return {
                "verified": True,
                "status": "auto_verified",
                "hpcsa_number": hpcsa_number,
                "name": full_name,
                "name_match": True,
                "registration_status": "active",
                "registration_date": "2015-03-20",
                "expiry_date": "2025-12-31",
                "specialization": "Dentist",
                "verified_at": datetime.utcnow().isoformat(),
                "method": "mock",
                "message": "HPCSA verification successful (mock mode)"
            }
        else:
            return {
                "verified": False,
                "status": "manual_review",
                "hpcsa_number": hpcsa_number,
                "error": "HPCSA number format not recognized in mock mode",
                "method": "mock",
                "message": "Manual review required"
            }
    
    def _api_verify(self, hpcsa_number: str, full_name: str) -> Dict[str, Any]:
        """Verify using HPCSA public API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            params = {
                "hpcsa": hpcsa_number
            }
            
            response = requests.get(
                f"{self.api_url}/verify",
                params=params,
                headers=headers,
                timeout=10
            )
            
            response.raise_for_status()
            data = response.json()
            
            # Extract name from response and match
            hpcsa_name = data.get("name", "")
            name_match = self._fuzzy_match_names(full_name, hpcsa_name)
            
            return {
                "verified": data.get("verified", False) and name_match,
                "status": "auto_verified" if (data.get("verified") and name_match) else "manual_review",
                "hpcsa_number": hpcsa_number,
                "name": hpcsa_name,
                "name_match": name_match,
                "name_similarity": self._calculate_name_similarity(full_name, hpcsa_name),
                "registration_status": data.get("status", "unknown"),
                "registration_date": data.get("registration_date"),
                "expiry_date": data.get("expiry_date"),
                "specialization": data.get("specialization"),
                "verified_at": datetime.utcnow().isoformat(),
                "method": "api",
                "raw_result": data,
                "message": "HPCSA API verification completed"
            }
            
        except requests.RequestException as e:
            return {
                "verified": False,
                "status": "manual_review",
                "hpcsa_number": hpcsa_number,
                "error": str(e),
                "method": "api",
                "message": "HPCSA API unavailable, manual review required"
            }
    
    @sleep_and_retry
    @limits(calls=10, period=60)  # Rate limit: 10 calls per minute
    def _web_scrape_verify(self, hpcsa_number: str, full_name: str) -> Dict[str, Any]:
        """
        Verify using web scraping (rate-limited, compliant)
        
        Note: This is a placeholder. Implement actual scraping logic
        based on HPCSA website structure.
        """
        try:
            # Example scraping structure (adjust based on actual HPCSA website)
            payload = {
                "hpcsa_number": hpcsa_number,
                "verify": "true"
            }
            
            response = requests.post(
                self.web_scrape_url,
                data=payload,
                timeout=15,
                headers={
                    "User-Agent": "RateTheDoctor/1.0 (Compliant Web Scraper)"
                }
            )
            
            response.raise_for_status()
            
            # Parse HTML response
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract registration details (adjust selectors based on actual site)
            # This is example structure
            name_element = soup.find("span", class_="registrant-name")
            status_element = soup.find("span", class_="registration-status")
            
            if not name_element or not status_element:
                return {
                    "verified": False,
                    "status": "manual_review",
                    "hpcsa_number": hpcsa_number,
                    "error": "Could not parse HPCSA website",
                    "method": "web_scrape",
                    "message": "Web scraping failed, manual review required"
                }
            
            hpcsa_name = name_element.get_text().strip()
            status = status_element.get_text().strip().lower()
            
            name_match = self._fuzzy_match_names(full_name, hpcsa_name)
            is_active = status == "active" or status == "registered"
            
            return {
                "verified": is_active and name_match,
                "status": "auto_verified" if (is_active and name_match) else "manual_review",
                "hpcsa_number": hpcsa_number,
                "name": hpcsa_name,
                "name_match": name_match,
                "name_similarity": self._calculate_name_similarity(full_name, hpcsa_name),
                "registration_status": status,
                "verified_at": datetime.utcnow().isoformat(),
                "method": "web_scrape",
                "message": "Web scraping verification completed"
            }
            
        except Exception as e:
            return {
                "verified": False,
                "status": "manual_review",
                "hpcsa_number": hpcsa_number,
                "error": str(e),
                "method": "web_scrape",
                "message": "Web scraping failed, manual review required"
            }
    
    def _fuzzy_match_names(self, name1: str, name2: str, threshold: float = 0.85) -> bool:
        """Fuzzy match names using similarity ratio"""
        from difflib import SequenceMatcher
        
        similarity = SequenceMatcher(
            None,
            name1.lower().strip(),
            name2.lower().strip()
        ).ratio()
        
        return similarity >= threshold
    
    def _calculate_name_similarity(self, name1: str, name2: str) -> float:
        """Calculate name similarity score (0-1)"""
        from difflib import SequenceMatcher
        
        return SequenceMatcher(
            None,
            name1.lower().strip(),
            name2.lower().strip()
        ).ratio()
    
    def lookup(self, hpcsa_number: str) -> Dict[str, Any]:
        """
        Standardized lookup endpoint
        Returns: name, status, specialties, valid_until, raw_result
        """
        result = self.verify_doctor(hpcsa_number, "")
        
        return {
            "hpcsa_number": hpcsa_number,
            "name": result.get("name", ""),
            "status": result.get("registration_status", "unknown"),
            "specialties": result.get("specialization", ""),
            "valid_until": result.get("expiry_date"),
            "verified": result.get("verified", False),
            "raw_result": result
        }


# Factory function
def get_hpcsa_adapter_enhanced() -> HPCSAAdapterEnhanced:
    """Factory function for dependency injection"""
    return HPCSAAdapterEnhanced()

