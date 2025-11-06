"""
Authentication Schemas
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserRegister(BaseModel):
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8)
    role: Optional[str] = "patient"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    user: dict
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class IDVerificationRequest(BaseModel):
    user_id: str
    id_number: str = Field(..., min_length=13, max_length=20, description="South African ID number or passport number")
    id_document_url: Optional[str] = None
