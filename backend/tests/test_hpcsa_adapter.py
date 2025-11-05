"""
Tests for HPCSA Adapter
"""
import pytest
import os
from src.adapters.hpcsa_adapter import HPCSAAdapter


@pytest.fixture
def hpcsa_adapter():
    """Create HPCSA adapter instance"""
    os.environ["HPCSA_MOCK_MODE"] = "true"
    return HPCSAAdapter()


def test_mock_verification_success(hpcsa_adapter):
    """Test successful mock verification"""
    result = hpcsa_adapter.verify_doctor("MP123456", "Dr. Test")
    
    assert result["verified"] == True
    assert result["status"] == "auto_verified"
    assert result["hpcsa_number"] == "MP123456"
    assert "registration_status" in result


def test_mock_verification_manual_review(hpcsa_adapter):
    """Test manual review required"""
    result = hpcsa_adapter.verify_doctor("INVALID123", "Dr. Test")
    
    assert result["verified"] == False
    assert result["status"] == "manual_review"
    assert "error" in result


def test_dentist_verification(hpcsa_adapter):
    """Test dentist verification"""
    result = hpcsa_adapter.verify_doctor("DT123456", "Dr. Dentist")
    
    assert result["verified"] == True
    assert result["status"] == "auto_verified"
    assert "Dentist" in result.get("specialization", "")

