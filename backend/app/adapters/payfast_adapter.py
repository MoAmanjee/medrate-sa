"""
PayFast Payment Adapter
South African payment gateway integration
"""
import os
import requests
import hashlib
from typing import Dict, Optional
from urllib.parse import urlencode


class PayFastAdapter:
    """PayFast payment gateway adapter"""
    
    def __init__(self):
        self.merchant_id = os.getenv("PAYFAST_MERCHANT_ID")
        self.merchant_key = os.getenv("PAYFAST_MERCHANT_KEY")
        self.passphrase = os.getenv("PAYFAST_PASSPHRASE")
        self.mock_mode = os.getenv("PAYMENT_MOCK_MODE", "true").lower() == "true"
        self.sandbox = os.getenv("PAYFAST_SANDBOX", "true").lower() == "true"
        
        if self.sandbox:
            self.base_url = "https://sandbox.payfast.co.za"
        else:
            self.base_url = "https://www.payfast.co.za"
    
    def create_subscription(
        self,
        doctor_id: str,
        plan: str,
        amount: float,
        billing_cycle: str = "monthly",
        return_url: str = None,
        cancel_url: str = None
    ) -> Dict:
        """Create subscription payment session"""
        if self.mock_mode:
            return self._mock_create_subscription(doctor_id, plan, amount)
        
        # PayFast subscription parameters
        frequency = 3 if billing_cycle == "monthly" else 6  # 3=Monthly, 6=Yearly
        
        data = {
            "merchant_id": self.merchant_id,
            "merchant_key": self.merchant_key,
            "return_url": return_url or f"{os.getenv('APP_URL')}/payment/success",
            "cancel_url": cancel_url or f"{os.getenv('APP_URL')}/payment/cancel",
            "notify_url": f"{os.getenv('API_URL')}/api/payments/payfast/webhook",
            "name_first": "Doctor",
            "name_last": "Subscription",
            "email_address": f"doctor_{doctor_id}@ratethedoctor.co.za",
            "cell_number": "0820000000",
            "m_payment_id": f"sub_{doctor_id}",
            "amount": f"{amount:.2f}",
            "item_name": f"RateTheDoctor {plan.upper()} Plan",
            "subscription_type": 1,  # Subscription
            "billing_date": self._get_next_billing_date(billing_cycle),
            "recurring_amount": f"{amount:.2f}",
            "frequency": frequency,
            "cycles": 0,  # 0 = indefinite
        }
        
        # Generate signature
        signature = self._generate_signature(data)
        data["signature"] = signature
        
        # Create payment URL
        payment_url = f"{self.base_url}/eng/process"
        
        return {
            "success": True,
            "data": {
                "payment_url": payment_url,
                "payment_data": data,
                "method": "POST",  # PayFast uses POST form submission
                "subscription_id": f"sub_{doctor_id}"
            }
        }
    
    def verify_webhook(self, data: Dict, signature: str) -> bool:
        """Verify PayFast webhook signature"""
        if self.mock_mode:
            return True
        
        # Generate signature from received data
        calculated_signature = self._generate_signature(data)
        return calculated_signature == signature
    
    def handle_webhook(self, data: Dict) -> Dict:
        """Handle PayFast webhook"""
        payment_status = data.get("payment_status", "").lower()
        m_payment_id = data.get("m_payment_id", "")
        
        # Extract doctor_id from m_payment_id
        doctor_id = m_payment_id.replace("sub_", "") if m_payment_id.startswith("sub_") else None
        
        if payment_status == "complete":
            return {
                "success": True,
                "event": "subscription.active",
                "subscription_id": m_payment_id,
                "doctor_id": doctor_id,
                "amount": float(data.get("amount_gross", 0)),
                "message": "Subscription activated"
            }
        elif payment_status == "failed":
            return {
                "success": False,
                "event": "subscription.failed",
                "subscription_id": m_payment_id,
                "doctor_id": doctor_id,
                "message": "Payment failed"
            }
        elif payment_status == "cancelled":
            return {
                "success": True,
                "event": "subscription.cancelled",
                "subscription_id": m_payment_id,
                "doctor_id": doctor_id,
                "message": "Subscription cancelled"
            }
        
        return {
            "success": True,
            "event": "unknown",
            "message": "Webhook processed"
        }
    
    def _generate_signature(self, data: Dict) -> str:
        """Generate PayFast signature"""
        # Remove empty values and signature itself
        clean_data = {k: v for k, v in data.items() if v and k != "signature"}
        
        # Sort by key
        sorted_data = sorted(clean_data.items())
        
        # Create parameter string
        param_string = "&".join([f"{k}={v}" for k, v in sorted_data])
        
        if self.passphrase:
            param_string += f"&passphrase={self.passphrase}"
        
        # Generate MD5 hash
        signature = hashlib.md5(param_string.encode()).hexdigest()
        return signature
    
    def _get_next_billing_date(self, billing_cycle: str) -> str:
        """Get next billing date in PayFast format"""
        from datetime import datetime, timedelta
        
        if billing_cycle == "monthly":
            next_date = datetime.now() + timedelta(days=30)
        else:  # yearly
            next_date = datetime.now() + timedelta(days=365)
        
        return next_date.strftime("%Y-%m-%d")
    
    def _mock_create_subscription(self, doctor_id: str, plan: str, amount: float) -> Dict:
        """Mock subscription creation"""
        return {
            "success": True,
            "data": {
                "payment_url": f"https://mock-payment.com/pay?subscription_id=sub_{doctor_id}",
                "subscription_id": f"sub_{doctor_id}",
                "amount": amount,
                "plan": plan,
                "status": "pending",
                "message": "Mock payment created"
            }
        }


# Factory function
def get_payfast_adapter() -> PayFastAdapter:
    """Factory function for dependency injection"""
    return PayFastAdapter()

