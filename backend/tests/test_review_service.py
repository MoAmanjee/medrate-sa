"""
Tests for Review Service
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.services.review_service import ReviewService
from src.models import Base, User, Doctor, Appointment, Review


# Test database setup
@pytest.fixture
def db_session():
    """Create test database session"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def test_user(db_session):
    """Create test user"""
    user = User(
        id="test-user-id",
        email="test@example.com",
        phone="+27123456789",
        full_name="Test User",
        verified=True,
        verification_status="verified"
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def test_doctor(db_session):
    """Create test doctor"""
    doctor = Doctor(
        id="test-doctor-id",
        user_id="test-user-id",
        display_name="Dr. Test",
        specialization="Cardiologist",
        hpcsa_number="MP123456",
        verified=True
    )
    db_session.add(doctor)
    db_session.commit()
    return doctor


@pytest.fixture
def completed_appointment(db_session, test_user, test_doctor):
    """Create completed appointment"""
    appointment = Appointment(
        id="test-appointment-id",
        user_id=test_user.id,
        doctor_id=test_doctor.id,
        start_time=datetime.utcnow() - timedelta(days=1),
        status="completed"
    )
    db_session.add(appointment)
    db_session.commit()
    return appointment


def test_create_review_success(db_session, test_user, test_doctor, completed_appointment):
    """Test successful review creation"""
    service = ReviewService(db_session)
    
    result = service.create_review(
        user_id=test_user.id,
        doctor_id=test_doctor.id,
        appointment_id=completed_appointment.id,
        rating=5,
        comment="Great doctor!"
    )
    
    assert result["success"] == True
    assert result["data"]["review"]["rating"] == 5
    assert result["data"]["review"]["verified_visit"] == True


def test_create_review_unverified_user(db_session, test_user, test_doctor, completed_appointment):
    """Test review creation fails for unverified user"""
    test_user.verified = False
    db_session.commit()
    
    service = ReviewService(db_session)
    
    result = service.create_review(
        user_id=test_user.id,
        doctor_id=test_doctor.id,
        appointment_id=completed_appointment.id,
        rating=5
    )
    
    assert result["success"] == False
    assert "verified" in result["error"].lower()


def test_create_review_incomplete_appointment(db_session, test_user, test_doctor):
    """Test review creation fails for incomplete appointment"""
    appointment = Appointment(
        id="incomplete-appointment-id",
        user_id=test_user.id,
        doctor_id=test_doctor.id,
        start_time=datetime.utcnow(),
        status="booked"  # Not completed
    )
    db_session.add(appointment)
    db_session.commit()
    
    service = ReviewService(db_session)
    
    result = service.create_review(
        user_id=test_user.id,
        doctor_id=test_doctor.id,
        appointment_id=appointment.id,
        rating=5
    )
    
    assert result["success"] == False
    assert "completed" in result["error"].lower()

