"""
Enhanced Database Models
SQLAlchemy models for Rate The Doctor
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid
import enum

Base = declarative_base()


class UserRole(enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class VerificationStatus(enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"


class AppointmentStatus(enum.Enum):
    BOOKED = "booked"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class SubscriptionPlan(enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"


class User(Base):
    """User model (patients)"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255))  # For non-Firebase auth
    
    # Firebase Auth
    firebase_uid = Column(String(128), unique=True, index=True)
    
    # Verification
    verified = Column(Boolean, default=False, index=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING)
    verification_provider = Column(String(50))  # smile_identity, trulioo, manual
    verification_data = Column(JSONB)  # Store verification response
    
    # ID Verification
    id_number = Column(String(20))  # SA ID number
    id_document_url = Column(String(500))  # S3 URL
    
    # Profile
    profile_picture_url = Column(String(500))
    date_of_birth = Column(DateTime)
    gender = Column(String(20))
    preferred_language = Column(String(10), default="en")  # en, af, zu
    
    # Location
    city = Column(String(100))
    province = Column(String(50))
    address = Column(Text)
    
    # Role
    role = Column(SQLEnum(UserRole), default=UserRole.PATIENT, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    appointments = relationship("Appointment", back_populates="patient", foreign_keys="Appointment.patient_id")
    reviews = relationship("Review", back_populates="patient")
    user_verification = relationship("UserVerification", back_populates="user", uselist=False)


class Doctor(Base):
    """Doctor model"""
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Basic Info
    display_name = Column(String(255), nullable=False, index=True)
    specialization = Column(String(100), nullable=False, index=True)
    title = Column(String(50))  # Dr., Prof., etc.
    bio = Column(Text)
    
    # HPCSA Verification
    hpcsa_number = Column(String(20), unique=True, index=True)
    hpcsa_verified = Column(Boolean, default=False)
    hpcsa_verification_data = Column(JSONB)  # HPCSA API response
    
    # Manual Verification Documents
    license_document_url = Column(String(500))  # S3 URL
    id_document_url = Column(String(500))  # S3 URL
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, index=True)
    verified_at = Column(DateTime)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))  # Admin user ID
    
    # Practice Details
    practice_name = Column(String(255))
    practice_number = Column(String(50))
    practice_address = Column(Text)
    practice_city = Column(String(100), index=True)
    practice_province = Column(String(50), index=True)
    practice_postal_code = Column(String(10))
    
    # Location (PostGIS)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Contact
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(500))
    
    # Features
    accepts_medical_aid = Column(Boolean, default=False, index=True)
    telehealth_available = Column(Boolean, default=False, index=True)
    languages_spoken = Column(JSONB)  # ["en", "af", "zu"]
    gender = Column(String(20), index=True)
    
    # Subscription
    subscription_plan = Column(SQLEnum(SubscriptionPlan), default=SubscriptionPlan.FREE, index=True)
    subscription_start_date = Column(DateTime)
    subscription_end_date = Column(DateTime)
    
    # Ratings (calculated)
    rating_avg = Column(Float, default=0.0, index=True)
    total_reviews = Column(Integer, default=0)
    
    # Profile
    profile_picture_url = Column(String(500))
    gallery_images = Column(JSONB)  # Array of image URLs
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    reviews = relationship("Review", back_populates="doctor")
    subscriptions = relationship("Subscription", back_populates="doctor")
    analytics = relationship("DoctorAnalytics", back_populates="doctor")
    availability = relationship("DoctorAvailability", back_populates="doctor")


class UserVerification(Base):
    """User verification records"""
    __tablename__ = "user_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Verification Provider
    provider = Column(String(50))  # smile_identity, trulioo
    provider_response = Column(JSONB)
    
    # Verification Status
    status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING)
    verified_at = Column(DateTime)
    
    # Documents
    id_document_url = Column(String(500))
    selfie_url = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="user_verification")


class Appointment(Base):
    """Appointment model"""
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Participants
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False, index=True)
    
    # Appointment Details
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer, default=30)
    
    # Status
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.BOOKED, index=True)
    booking_reference = Column(String(50), unique=True, index=True)
    
    # Type
    is_telehealth = Column(Boolean, default=False)
    telehealth_link = Column(String(500))  # Twilio Video room link
    
    # Check-in
    checkin_otp = Column(String(10))
    checkin_qr_code = Column(Text)  # Base64 QR code
    checked_in = Column(Boolean, default=False)
    checked_in_at = Column(DateTime)
    
    # Notes
    patient_notes = Column(Text)
    doctor_notes = Column(Text)
    
    # Google Calendar
    google_calendar_event_id = Column(String(255))
    calendar_synced = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("User", back_populates="appointments", foreign_keys=[patient_id])
    doctor = relationship("Doctor", back_populates="appointments")
    review = relationship("Review", back_populates="appointment", uselist=False)


class Review(Base):
    """Review model with multiple rating categories"""
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Relationships
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False, index=True)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), unique=True, nullable=False, index=True)
    
    # Ratings (Multiple Categories)
    overall_rating = Column(Integer, nullable=False)  # 1-5
    communication_rating = Column(Integer)  # 1-5
    wait_time_rating = Column(Integer)  # 1-5
    diagnosis_accuracy_rating = Column(Integer)  # 1-5
    professionalism_rating = Column(Integer)  # 1-5
    
    # Review Content
    comment = Column(Text)
    
    # Verification
    verified_visit = Column(Boolean, default=False, index=True)
    is_verified = Column(Boolean, default=False)  # Admin verified
    
    # AI Moderation
    ai_moderated = Column(Boolean, default=False)
    ai_sentiment = Column(String(20))  # positive, negative, neutral
    ai_categories = Column(JSONB)  # ["professionalism", "communication"]
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("User", back_populates="reviews")
    doctor = relationship("Doctor", back_populates="reviews")
    appointment = relationship("Appointment", back_populates="review")


class Subscription(Base):
    """Doctor subscription model"""
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False, index=True)
    
    # Plan Details
    plan = Column(SQLEnum(SubscriptionPlan), nullable=False)
    billing_cycle = Column(String(20))  # monthly, yearly
    
    # Payment
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="ZAR")
    payment_provider = Column(String(20))  # payfast, yoco
    provider_subscription_id = Column(String(255))
    provider_customer_id = Column(String(255))
    
    # Status
    status = Column(String(20), default="pending")  # pending, active, cancelled, expired
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    doctor = relationship("Doctor", back_populates="subscriptions")


class DoctorAvailability(Base):
    """Doctor availability schedule"""
    __tablename__ = "doctor_availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False, index=True)
    
    # Day of week (0=Monday, 6=Sunday)
    day_of_week = Column(Integer, nullable=False)  # 0-6
    
    # Time slots
    start_time = Column(String(10), nullable=False)  # "09:00"
    end_time = Column(String(10), nullable=False)  # "17:00"
    
    # Recurring
    is_recurring = Column(Boolean, default=True)
    specific_date = Column(DateTime)  # For one-time availability
    
    # Status
    is_available = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    doctor = relationship("Doctor", back_populates="availability")


class DoctorAnalytics(Base):
    """Doctor analytics data"""
    __tablename__ = "doctor_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False, index=True)
    
    # Period
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False)
    period_type = Column(String(20))  # daily, weekly, monthly
    
    # Metrics
    profile_views = Column(Integer, default=0)
    booking_requests = Column(Integer, default=0)
    completed_appointments = Column(Integer, default=0)
    cancelled_appointments = Column(Integer, default=0)
    new_reviews = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    
    # Revenue (for premium plans)
    total_revenue = Column(Float, default=0.0)
    
    # Demographics (anonymized)
    patient_age_groups = Column(JSONB)
    patient_gender_distribution = Column(JSONB)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    doctor = relationship("Doctor", back_populates="analytics")

