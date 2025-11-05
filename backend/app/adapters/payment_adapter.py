"""
Payment Adapter
Unified payment gateway interface (PayFast, Yoco, Paystack)
"""
import os
from typing import Dict, Optional
from app.adapters.payfast_adapter import PayFastAdapter, get_payfast_adapter
from app.adapters.yoco_adapter import YocoAdapter, get_yoco_adapter


class PaymentAdapter:
    """Unified payment adapter"""
    
    def __init__(self):
        self.provider = os.getenv("PAYMENT_PROVIDER", "payfast").lower()
        self.payfast = get_payfast_adapter()
        self.yoco = get_yoco_adapter()
    
    def create_payment(
        self,
        amount: float,
        currency: str = "ZAR",
        description: str = "",
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Create payment session"""
        if self.provider == "payfast":
            return self.payfast.create_payment(
                amount=amount,
                description=description,
                metadata=metadata or {}
            )
        elif self.provider == "yoco":
            return self.yoco.create_payment(
                amount=amount,
                description=description,
                metadata=metadata or {}
            )
        else:
            return {
                "success": False,
                "error": f"Payment provider {self.provider} not supported"
            }
    
    def handle_webhook(self, data: Dict, signature: str) -> Dict:
        """Handle payment webhook"""
        if self.provider == "payfast":
            return self.payfast.handle_webhook(data)
        elif self.provider == "yoco":
            return self.yoco.handle_webhook(data)
        else:
            return {
                "success": False,
                "error": "Webhook handler not available"
            }


# Factory function
def get_payment_adapter() -> PaymentAdapter:
    """Factory function for dependency injection"""
    return PaymentAdapter()

