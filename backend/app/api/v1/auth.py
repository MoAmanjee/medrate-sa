"""
Authentication Routes
JWT + Firebase Auth integration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import AuthService, get_auth_service
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, IDVerificationRequest
from app.middleware.rate_limit import auth_rate_limit

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=TokenResponse)
@auth_rate_limit
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """User registration (optional for web, mandatory for mobile)"""
    result = auth_service.register_user(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        password=user_data.password,
        role=user_data.role or "patient"
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result["data"]


@router.post("/login")
@auth_rate_limit
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """User login - requires ID verification"""
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("error")
        )
    
    return result["data"]


@router.post("/verify-id")
@auth_rate_limit
async def verify_id(
    verification_data: IDVerificationRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Verify user ID during login process"""
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


@router.post("/firebase-login")
@auth_rate_limit
async def firebase_login(
    firebase_token: str,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Firebase authentication (for mobile app)"""
    result = auth_service.verify_firebase_token(firebase_token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("error")
        )
    
    return result["data"]


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Refresh JWT token"""
    result = auth_service.refresh_token(refresh_token)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("error")
        )
    
    return result["data"]


@router.get("/me")
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Get current user information"""
    token = credentials.credentials
    user = auth_service.get_user_from_token(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
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

