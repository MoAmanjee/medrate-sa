"""
Payment Service
Handles subscriptions, payments, webhooks
"""
from typing import Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Subscription, Doctor
from app.adapters.payment_adapter import PaymentAdapter, get_payment_adapter
from app.services.invoice_service import InvoiceService


class PaymentService:
    """Service for payment and subscription management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.payment_adapter = get_payment_adapter()
        self.invoice_service = InvoiceService()
    
    def create_subscription(
        self,
        doctor_id: str,
        plan: str,
        billing_cycle: str = "monthly"
    ) -> Dict:
        """
        Create subscription payment session
        
        Plans: free, standard, featured
        Billing: monthly, yearly
        """
        doctor = self.db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doctor:
            return {"success": False, "error": "Doctor not found"}
        
        # Calculate amount based on plan
        plan_pricing = {
            "standard": {"monthly": 199.00, "yearly": 1990.00},
            "featured": {"monthly": 299.00, "yearly": 2990.00}
        }
        
        if plan == "free":
            # Free plan - no payment needed
            subscription = Subscription(
                doctor_id=doctor_id,
                plan="free",
                start_date=datetime.utcnow().date(),
                end_date=(datetime.utcnow() + timedelta(days=365)).date(),
                payment_status="paid",
                amount=0.00
            )
            self.db.add(subscription)
            doctor.subscription_plan = "free"
            self.db.commit()
            
            return {
                "success": True,
                "data": {
                    "subscription_id": str(subscription.id),
                    "plan": "free",
                    "status": "active"
                }
            }
        
        amount = plan_pricing.get(plan, {}).get(billing_cycle, 0)
        
        if amount == 0:
            return {"success": False, "error": "Invalid plan or billing cycle"}
        
        # Create payment session
        payment_result = self.payment_adapter.create_subscription(
            doctor_id=doctor_id,
            plan=plan,
            amount=amount,
            currency="ZAR",
            billing_cycle=billing_cycle
        )
        
        if not payment_result.get("success"):
            return payment_result
        
        # Create subscription record (pending payment)
        subscription = Subscription(
            doctor_id=doctor_id,
            plan=plan,
            start_date=datetime.utcnow().date(),
            end_date=self._calculate_end_date(billing_cycle),
            payment_status="pending",
            amount=amount,
            provider=self.payment_adapter.get_provider(),
            provider_subscription_id=payment_result["data"].get("subscription_id")
        )
        
        self.db.add(subscription)
        self.db.commit()
        
        return {
            "success": True,
            "data": {
                "subscription_id": str(subscription.id),
                "payment_url": payment_result["data"].get("payment_url"),
                "plan": plan,
                "amount": amount,
                "status": "pending"
            }
        }
    
    def handle_payment_webhook(
        self,
        provider: str,
        event_data: Dict
    ) -> Dict:
        """
        Handle payment provider webhook
        
        Updates subscription status on payment success
        """
        subscription_id = event_data.get("subscription_id") or event_data.get("reference")
        
        if not subscription_id:
            return {"success": False, "error": "Missing subscription ID"}
        
        # Find subscription by provider ID
        subscription = self.db.query(Subscription).filter(
            Subscription.provider_subscription_id == subscription_id
        ).first()
        
        if not subscription:
            return {"success": False, "error": "Subscription not found"}
        
        # Update based on event
        event_type = event_data.get("event") or event_data.get("type")
        
        if event_type in ["charge.success", "payment_intent.succeeded"]:
            subscription.payment_status = "paid"
            subscription.start_date = datetime.utcnow().date()
            subscription.end_date = self._calculate_end_date(
                subscription.billing_cycle or "monthly"
            )
            
            # Update doctor subscription
            doctor = self.db.query(Doctor).filter(
                Doctor.id == subscription.doctor_id
            ).first()
            if doctor:
                doctor.subscription_plan = subscription.plan
                doctor.subscription_end_date = subscription.end_date
            
            # Generate invoice
            invoice = self.invoice_service.generate_invoice(subscription)
            
            self.db.commit()
            
            return {
                "success": True,
                "message": "Subscription activated",
                "invoice_url": invoice.get("url")
            }
        
        elif event_type in ["charge.failed", "payment_intent.payment_failed"]:
            subscription.payment_status = "failed"
            self.db.commit()
            
            return {"success": True, "message": "Payment failed"}
        
        return {"success": True, "message": "Webhook processed"}
    
    def cancel_subscription(self, subscription_id: str) -> Dict:
        """Cancel subscription"""
        subscription = self.db.query(Subscription).filter(
            Subscription.id == subscription_id
        ).first()
        
        if not subscription:
            return {"success": False, "error": "Subscription not found"}
        
        # Cancel with provider
        if subscription.provider_subscription_id:
            result = self.payment_adapter.cancel_subscription(
                subscription.provider_subscription_id
            )
        
        # Update subscription
        subscription.payment_status = "cancelled"
        subscription.end_date = datetime.utcnow().date()
        
        # Update doctor
        doctor = self.db.query(Doctor).filter(
            Doctor.id == subscription.doctor_id
        ).first()
        if doctor:
            doctor.subscription_plan = "free"
            doctor.subscription_end_date = None
        
        self.db.commit()
        
        return {"success": True, "message": "Subscription cancelled"}
    
    def _calculate_end_date(self, billing_cycle: str) -> datetime.date:
        """Calculate subscription end date"""
        if billing_cycle == "yearly":
            return (datetime.utcnow() + timedelta(days=365)).date()
        else:  # monthly
            return (datetime.utcnow() + timedelta(days=30)).date()


# Factory function
def get_payment_service(db: Session) -> PaymentService:
    """Factory function for dependency injection"""
    return PaymentService(db)

