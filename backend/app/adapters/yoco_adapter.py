"""
Yoco Payment Adapter
South African payment gateway integration
"""
import os
import requests
from typing import Dict
from datetime import datetime


class YocoAdapter:
    """Yoco payment gateway adapter"""
    
    def __init__(self):
        self.secret_key = os.getenv("YOCO_SECRET_KEY")
        self.public_key = os.getenv("YOCO_PUBLIC_KEY")
        self.mock_mode = os.getenv("PAYMENT_MOCK_MODE", "true").lower() == "true"
        self.sandbox = os.getenv("YOCO_SANDBOX", "true").lower() == "true"
        
        if self.sandbox:
            self.base_url = "https://api.yoco.com/v1"
        else:
            self.base_url = "https://api.yoco.com/v1"
    
    def create_subscription(
        self,
        doctor_id: str,
        plan: str,
        amount: float,
        billing_cycle: str = "monthly",
        customer_email: str = None
    ) -> Dict:
        """Create subscription payment"""
        if self.mock_mode:
            return self._mock_create_subscription(doctor_id, plan, amount)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            # Yoco charges API
            payload = {
                "amount": int(amount * 100),  # Convert to cents
                "currency": "ZAR",
                "metadata": {
                    "doctor_id": doctor_id,
                    "plan": plan,
                    "billing_cycle": billing_cycle
                }
            }
            
            if customer_email:
                payload["receipt"] = {
                    "email": customer_email
                }
            
            response = requests.post(
                f"{self.base_url}/charges",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": True,
                "data": {
                    "charge_id": data.get("id"),
                    "status": data.get("status"),
                    "amount": amount,
                    "payment_url": data.get("redirectUrl") or f"{self.base_url}/pay/{data.get('id')}",
                    "subscription_id": f"yoco_sub_{doctor_id}"
                }
            }
            
        except requests.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Yoco payment failed"
            }
    
    def verify_webhook(self, signature: str, payload: str) -> bool:
        """Verify Yoco webhook signature"""
        if self.mock_mode:
            return True
        
        # Yoco webhook signature verification
        import hmac
        import hashlib
        
        calculated_signature = hmac.new(
            self.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return calculated_signature == signature
    
    def handle_webhook(self, data: Dict) -> Dict:
        """Handle Yoco webhook"""
        event_type = data.get("type")
        charge_data = data.get("data", {})
        
        if event_type == "charge.succeeded":
            metadata = charge_data.get("metadata", {})
            return {
                "success": True,
                "event": "subscription.active",
                "charge_id": charge_data.get("id"),
                "doctor_id": metadata.get("doctor_id"),
                "amount": charge_data.get("amount", 0) / 100,  # Convert from cents
                "message": "Payment successful"
            }
        elif event_type == "charge.failed":
            return {
                "success": False,
                "event": "subscription.failed",
                "charge_id": charge_data.get("id"),
                "message": "Payment failed"
            }
        
        return {
            "success": True,
            "event": "unknown",
            "message": "Webhook processed"
        }
    
    def _mock_create_subscription(self, doctor_id: str, plan: str, amount: float) -> Dict:
        """Mock subscription creation"""
        return {
            "success": True,
            "data": {
                "payment_url": f"https://mock-yoco.com/pay?subscription_id=yoco_sub_{doctor_id}",
                "subscription_id": f"yoco_sub_{doctor_id}",
                "amount": amount,
                "plan": plan,
                "status": "pending",
                "message": "Mock Yoco payment created"
            }
        }


# Factory function
def get_yoco_adapter() -> YocoAdapter:
    """Factory function for dependency injection"""
    return YocoAdapter()

