"""
Models package
Centralized model exports
"""
from app.models.enhanced_models import (
    Base,
    User,
    Doctor,
    Appointment,
    Review,
    Subscription,
    UserVerification,
    UserRole,
    VerificationStatus,
    SubscriptionPlan,
    AppointmentStatus
)

# Import hospital models if they exist separately
try:
    from app.models.hospital_models import (
        Hospital,
        HospitalClaim,
        HospitalPromotion,
        HospitalType,
        PromotionTier
    )
except ImportError:
    # If hospital models are integrated into enhanced_models, use those
    Hospital = None
    HospitalClaim = None
    HospitalPromotion = None

__all__ = [
    "Base",
    "User",
    "Doctor",
    "Hospital",
    "HospitalClaim",
    "HospitalPromotion",
    "Appointment",
    "Review",
    "Subscription",
    "UserVerification",
    "UserRole",
    "VerificationStatus",
    "SubscriptionPlan",
    "AppointmentStatus",
    "HospitalType",
    "PromotionTier",
]

