"""
Payment Adapter
Supports Paystack (primary) and Stripe (alternative) with mock mode
"""
import os
from typing import Dict, Optional, Literal
from enum import Enum


class PaymentProvider(Enum):
    PAYSTACK = "paystack"
    STRIPE = "stripe"
    MOCK = "mock"


class PaymentAdapter:
    """Adapter for payment processing (Paystack/Stripe)"""
    
    def __init__(self):
        provider = os.getenv("PAYMENT_PROVIDER", "paystack").lower()
        self.mock_mode = os.getenv("PAYMENT_MOCK_MODE", "true").lower() == "true"
        
        if self.mock_mode:
            self.provider = PaymentProvider.MOCK
        elif provider == "stripe":
            self.provider = PaymentProvider.STRIPE
        else:
            self.provider = PaymentProvider.PAYSTACK
        
        self.api_key = os.getenv("PAYMENT_PROVIDER_KEY")
    
    def create_subscription(
        self,
        doctor_id: str,
        plan: str,
        amount: float,
        currency: str = "ZAR",
        billing_cycle: str = "monthly"
    ) -> Dict:
        """Create a subscription payment"""
        if self.provider == PaymentProvider.MOCK:
            return self._mock_create_subscription(doctor_id, plan, amount, currency)
        elif self.provider == PaymentProvider.PAYSTACK:
            return self._paystack_create_subscription(doctor_id, plan, amount, currency)
        else:
            return self._stripe_create_subscription(doctor_id, plan, amount, currency)
    
    def verify_payment(self, reference: str) -> Dict:
        """Verify a payment transaction"""
        if self.provider == PaymentProvider.MOCK:
            return self._mock_verify_payment(reference)
        elif self.provider == PaymentProvider.PAYSTACK:
            return self._paystack_verify_payment(reference)
        else:
            return self._stripe_verify_payment(reference)
    
    def cancel_subscription(self, subscription_id: str) -> Dict:
        """Cancel a subscription"""
        if self.provider == PaymentProvider.MOCK:
            return self._mock_cancel_subscription(subscription_id)
        elif self.provider == PaymentProvider.PAYSTACK:
            return self._paystack_cancel_subscription(subscription_id)
        else:
            return self._stripe_cancel_subscription(subscription_id)
    
    # Mock implementations
    def _mock_create_subscription(
        self,
        doctor_id: str,
        plan: str,
        amount: float,
        currency: str
    ) -> Dict:
        """Mock subscription creation"""
        return {
            "success": True,
            "data": {
                "subscription_id": f"mock_sub_{doctor_id}",
                "payment_url": f"https://mock-payment.com/pay/mock_sub_{doctor_id}",
                "amount": amount,
                "currency": currency,
                "plan": plan,
                "status": "pending",
                "message": "Mock payment created. Use test card: 4084084084084081"
            }
        }
    
    def _mock_verify_payment(self, reference: str) -> Dict:
        """Mock payment verification"""
        # In mock mode, always return success
        return {
            "success": True,
            "data": {
                "reference": reference,
                "status": "success",
                "amount": 299.00,
                "currency": "ZAR",
                "paid_at": "2024-01-15T10:00:00Z"
            }
        }
    
    def _mock_cancel_subscription(self, subscription_id: str) -> Dict:
        """Mock subscription cancellation"""
        return {
            "success": True,
            "data": {
                "subscription_id": subscription_id,
                "status": "cancelled",
                "message": "Mock subscription cancelled"
            }
        }
    
    # Paystack implementations
    def _paystack_create_subscription(
        self,
        doctor_id: str,
        plan: str,
        amount: float,
        currency: str
    ) -> Dict:
        """Create subscription with Paystack"""
        import requests
        
        try:
            url = "https://api.paystack.co/subscription"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "customer": doctor_id,
                "plan": plan,
                "amount": int(amount * 100),  # Paystack uses kobo/cents
                "currency": currency.lower()
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": data.get("status", False),
                "data": {
                    "subscription_id": data["data"]["subscription_code"],
                    "payment_url": data["data"]["authorization_url"],
                    "amount": amount,
                    "currency": currency,
                    "plan": plan,
                    "status": data["data"]["status"]
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _paystack_verify_payment(self, reference: str) -> Dict:
        """Verify payment with Paystack"""
        import requests
        
        try:
            url = f"https://api.paystack.co/transaction/verify/{reference}"
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": data.get("status", False),
                "data": {
                    "reference": reference,
                    "status": data["data"]["status"],
                    "amount": data["data"]["amount"] / 100,  # Convert from kobo
                    "currency": data["data"]["currency"],
                    "paid_at": data["data"]["paid_at"]
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _paystack_cancel_subscription(self, subscription_id: str) -> Dict:
        """Cancel subscription with Paystack"""
        import requests
        
        try:
            url = f"https://api.paystack.co/subscription/{subscription_id}"
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            response = requests.delete(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": data.get("status", False),
                "data": {
                    "subscription_id": subscription_id,
                    "status": "cancelled"
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    # Stripe implementations
    def _stripe_create_subscription(
        self,
        doctor_id: str,
        plan: str,
        amount: float,
        currency: str
    ) -> Dict:
        """Create subscription with Stripe"""
        import stripe
        
        stripe.api_key = self.api_key
        
        try:
            # Create or get customer
            customer = stripe.Customer.create(
                metadata={"doctor_id": doctor_id}
            )
            
            # Create subscription
            subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{
                    "price_data": {
                        "currency": currency.lower(),
                        "unit_amount": int(amount * 100),  # Stripe uses cents
                        "recurring": {"interval": "month"},
                        "product_data": {
                            "name": f"RateTheDoctor {plan} Plan"
                        }
                    }
                }]
            )
            
            return {
                "success": True,
                "data": {
                    "subscription_id": subscription.id,
                    "payment_url": subscription.latest_invoice.hosted_invoice_url,
                    "amount": amount,
                    "currency": currency,
                    "plan": plan,
                    "status": subscription.status
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _stripe_verify_payment(self, reference: str) -> Dict:
        """Verify payment with Stripe"""
        import stripe
        
        stripe.api_key = self.api_key
        
        try:
            payment_intent = stripe.PaymentIntent.retrieve(reference)
            
            return {
                "success": payment_intent.status == "succeeded",
                "data": {
                    "reference": reference,
                    "status": payment_intent.status,
                    "amount": payment_intent.amount / 100,  # Convert from cents
                    "currency": payment_intent.currency.upper()
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _stripe_cancel_subscription(self, subscription_id: str) -> Dict:
        """Cancel subscription with Stripe"""
        import stripe
        
        stripe.api_key = self.api_key
        
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            cancelled = subscription.cancel()
            
            return {
                "success": True,
                "data": {
                    "subscription_id": subscription_id,
                    "status": cancelled.status
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_provider(self) -> str:
        """Get current payment provider"""
        return self.provider.value


# Factory function
def get_payment_adapter() -> PaymentAdapter:
    """Factory function for dependency injection"""
    return PaymentAdapter()

