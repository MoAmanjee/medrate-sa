"""
Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.database import get_db
from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

# Log when router is created
print("[DEBUG] Auth router created", flush=True)


class RegisterRequest(BaseModel):
    email: str
    phone: str
    full_name: str
    password: str
    role: str = "patient"
    
    class Config:
        # Allow extra fields to prevent validation errors
        extra = "ignore"


class LoginRequest(BaseModel):
    email: str
    password: str


class VerifyIDRequest(BaseModel):
    user_id: str
    id_number: str
    id_document_url: Optional[str] = None


@router.post("/register", response_model=None)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """User registration"""
    import sys
    try:
        print(f"[DEBUG] Registration request: email={user_data.email}, phone={user_data.phone}", flush=True)
        
        # Quick validation
        if not user_data.email or not user_data.password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        print("[DEBUG] Creating AuthService...", flush=True)
        auth_service = AuthService(db)
        print("[DEBUG] Calling register_user...", flush=True)
        
        result = auth_service.register_user(
            email=user_data.email,
            phone=user_data.phone,
            full_name=user_data.full_name,
            password=user_data.password,
            role=user_data.role
        )
        
        print(f"[DEBUG] Register result: success={result.get('success')}", flush=True)
        
        if not result.get("success"):
            error_msg = result.get("error", "Registration failed")
            print(f"[ERROR] Registration failed: {error_msg}", flush=True)
            raise HTTPException(status_code=400, detail=error_msg)
        
        print("[DEBUG] Registration successful!", flush=True)
        return result["data"]
    except HTTPException as he:
        print(f"[ERROR] HTTPException: {he.status_code} - {he.detail}", flush=True)
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        error_msg = str(e)
        error_type = type(e).__name__
        print(f"[ERROR] Registration exception: {error_type}: {error_msg}", flush=True)
        print(error_trace, flush=True)
        # Return error as string for compatibility
        raise HTTPException(status_code=500, detail=f"{error_type}: {error_msg}")


@router.post("/login", response_model=None)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """User login - requires ID verification"""
    try:
        auth_service = AuthService(db)
        result = auth_service.login_user(
            email=credentials.email,
            password=credentials.password
        )
        
        if not result.get("success"):
            # If verification is required, return special response
            if result.get("requires_verification"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "error": result.get("error"),
                        "requires_verification": True,
                        "user_id": result.get("user_id")
                    }
                )
            raise HTTPException(status_code=401, detail=result.get("error"))
        
        return result["data"]
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Login error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/verify-id", response_model=None)
async def verify_id(
    verification_data: VerifyIDRequest,
    db: Session = Depends(get_db)
):
    """Verify user ID during login process"""
    auth_service = AuthService(db)
    result = auth_service.verify_login_id(
        user_id=verification_data.user_id,
        id_number=verification_data.id_number,
        id_document_url=verification_data.id_document_url
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result["data"]


@router.get("/me")
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    auth_service = AuthService(db)
    token = credentials.credentials
    user = auth_service.get_user_from_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "success": True,
        "data": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "verified": user.verified
        }
    }

