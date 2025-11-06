"""
Hospital Models
SQLAlchemy models for hospitals, claims, and promotions
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
import enum

Base = declarative_base()


class HospitalType(enum.Enum):
    PUBLIC_HOSPITAL = "Public Hospital"
    PRIVATE_HOSPITAL = "Private Hospital"
    CLINIC = "Clinic"
    GP_PRACTICE = "GP Practice"
    PHARMACY = "Pharmacy"


class VerificationStatus(enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"


class PromotionTier(enum.Enum):
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"


class Hospital(Base):
    """Hospital model with claim and promotion support"""
    __tablename__ = "hospitals"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic Info
    name = Column(String(255), nullable=False, index=True)
    type = Column(SQLEnum(HospitalType), nullable=False, index=True)
    
    # Claim & Verification
    claimed = Column(Boolean, default=False, index=True)
    claimed_by_user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    claimed_at = Column(DateTime)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, index=True)
    verified_at = Column(DateTime)
    verified_by_admin_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    
    # Location
    address = Column(Text)
    city = Column(String(100), nullable=False, index=True)
    province = Column(String(50), nullable=False, index=True)
    postal_code = Column(String(10))
    latitude = Column(Float)
    longitude = Column(Float)
    # PostGIS location (set via trigger or manually)
    
    # Contact
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(500))
    
    # Profile
    logo_url = Column(String(500))
    description = Column(Text)
    emergency_services = Column(Boolean, default=False, index=True)
    
    # Services
    departments = Column(JSONB, default=[])  # Array of department names
    specialties = Column(JSONB, default=[])  # Array of specialty names
    
    # Ratings
    rating_avg = Column(Float, default=0.0, index=True)
    total_reviews = Column(Integer, default=0)
    
    # Promotion
    is_featured = Column(Boolean, default=False, index=True)
    featured_until = Column(DateTime, index=True)
    promotion_tier = Column(SQLEnum(PromotionTier), default=PromotionTier.BASIC, index=True)
    
    # Metadata
    source = Column(String(50), default="preloaded")  # preloaded, claimed, manual
    preload_data = Column(JSONB)  # Store original preload data
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    claims = relationship("HospitalClaim", back_populates="hospital")
    promotions = relationship("HospitalPromotion", back_populates="hospital")
    appointments = relationship("Appointment", back_populates="hospital")
    reviews = relationship("Review", back_populates="hospital")


class HospitalClaim(Base):
    """Hospital claim requests"""
    __tablename__ = "hospital_claims"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    hospital_id = Column(UUID(as_uuid=False), ForeignKey("hospitals.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    
    claim_token = Column(String(255), unique=True, nullable=False, index=True)
    claim_email = Column(String(255), nullable=False)
    claim_status = Column(String(20), default="pending", index=True)  # pending, approved, rejected, expired
    
    documents = Column(JSONB, default={})  # License, registration, ID URLs
    admin_notes = Column(Text)
    
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    
    # Relationships
    hospital = relationship("Hospital", back_populates="claims")


class HospitalPromotion(Base):
    """Hospital promotion purchases"""
    __tablename__ = "hospital_promotions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    hospital_id = Column(UUID(as_uuid=False), ForeignKey("hospitals.id"), nullable=False, index=True)
    
    promotion_tier = Column(SQLEnum(PromotionTier), nullable=False)
    amount_paid = Column(Float, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False, index=True)
    
    payment_provider = Column(String(50))  # payfast, yoco, paystack
    payment_transaction_id = Column(String(255))
    
    status = Column(String(20), default="active", index=True)  # active, expired, cancelled
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    hospital = relationship("Hospital", back_populates="promotions")

