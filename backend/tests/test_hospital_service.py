"""
Tests for Hospital Service
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.hospital_models import Base, Hospital, HospitalClaim, HospitalPromotion
from app.services.hospital_service import HospitalService
from app.adapters.payment_adapter import PaymentAdapter


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
def hospital_service(db_session):
    """Create hospital service instance"""
    return HospitalService(db_session)


@pytest.fixture
def sample_hospital(db_session):
    """Create sample hospital"""
    hospital = Hospital(
        id="test-hospital-id",
        name="Test Hospital",
        type="Private Hospital",
        city="Johannesburg",
        province="Gauteng",
        claimed=False,
        verification_status="pending"
    )
    db_session.add(hospital)
    db_session.commit()
    return hospital


class TestHospitalSearch:
    """Test hospital search functionality"""
    
    def test_search_no_filters(self, hospital_service, db_session, sample_hospital):
        """Test search with no filters"""
        result = hospital_service.search_hospitals(verified_only=False)
        assert result["success"] is True
        assert len(result["data"]["hospitals"]) > 0
    
    def test_search_with_city_filter(self, hospital_service, db_session, sample_hospital):
        """Test search with city filter"""
        result = hospital_service.search_hospitals(city="Johannesburg", verified_only=False)
        assert result["success"] is True
        hospitals = result["data"]["hospitals"]
        assert all(h["city"] == "Johannesburg" for h in hospitals)
    
    def test_search_verified_only(self, hospital_service, db_session, sample_hospital):
        """Test search with verified_only=True"""
        # Unclaimed hospital should not appear
        result = hospital_service.search_hospitals(verified_only=True)
        assert result["success"] is True
        hospitals = result["data"]["hospitals"]
        assert all(h["claimed"] is True and h["verified"] is True for h in hospitals)


class TestHospitalClaim:
    """Test hospital claim workflow"""
    
    def test_initiate_claim(self, hospital_service, db_session, sample_hospital):
        """Test claim initiation"""
        result = hospital_service.initiate_claim(
            hospital_id=str(sample_hospital.id),
            email="test@example.com"
        )
        assert result["success"] is True
        assert "claim_token" in result["data"]
    
    def test_verify_claim_token(self, hospital_service, db_session, sample_hospital):
        """Test claim token verification"""
        # Initiate claim
        claim_result = hospital_service.initiate_claim(
            hospital_id=str(sample_hospital.id),
            email="test@example.com"
        )
        claim_token = claim_result["data"]["claim_token"]
        
        # Verify token
        verify_result = hospital_service.verify_claim_token(claim_token)
        assert verify_result["success"] is True
        assert verify_result["data"]["hospital_id"] == str(sample_hospital.id)
    
    def test_complete_claim(self, hospital_service, db_session, sample_hospital):
        """Test claim completion"""
        # Initiate and verify claim
        claim_result = hospital_service.initiate_claim(
            hospital_id=str(sample_hospital.id),
            email="test@example.com"
        )
        claim_id = claim_result["data"]["claim_id"]
        
        # Complete claim
        complete_result = hospital_service.complete_claim(
            claim_id=claim_id,
            user_id="test-user-id",
            documents={"license": "url1", "registration": "url2"}
        )
        assert complete_result["success"] is True
        
        # Verify hospital is now claimed
        hospital = db_session.query(Hospital).filter(Hospital.id == sample_hospital.id).first()
        assert hospital.claimed is True


class TestHospitalPromotion:
    """Test hospital promotion purchase"""
    
    def test_purchase_promotion_standard(self, hospital_service, db_session, sample_hospital):
        """Test standard promotion purchase"""
        # Mark hospital as verified
        sample_hospital.claimed = True
        sample_hospital.verification_status = "verified"
        db_session.commit()
        
        result = hospital_service.purchase_promotion(
            hospital_id=str(sample_hospital.id),
            promotion_tier="standard",
            payment_provider="payfast"
        )
        assert result["success"] is True
        assert result["data"]["amount"] == 1999.00
        assert result["data"]["days"] == 7
    
    def test_purchase_promotion_premium(self, hospital_service, db_session, sample_hospital):
        """Test premium promotion purchase"""
        sample_hospital.claimed = True
        sample_hospital.verification_status = "verified"
        db_session.commit()
        
        result = hospital_service.purchase_promotion(
            hospital_id=str(sample_hospital.id),
            promotion_tier="premium",
            payment_provider="payfast"
        )
        assert result["success"] is True
        assert result["data"]["amount"] == 7999.00
        assert result["data"]["days"] == 30
    
    def test_promotion_requires_verification(self, hospital_service, db_session, sample_hospital):
        """Test that unverified hospitals cannot purchase promotions"""
        result = hospital_service.purchase_promotion(
            hospital_id=str(sample_hospital.id),
            promotion_tier="standard"
        )
        assert result["success"] is False
        assert "verified" in result["error"].lower()

