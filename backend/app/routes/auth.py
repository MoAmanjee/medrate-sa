"""
Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import AuthService, get_auth_service
from app.middleware.rate_limit import auth_rate_limit

router = APIRouter()
security = HTTPBearer()


@router.post("/register")
@auth_rate_limit
async def register(
    user_data: dict,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """User registration"""
    result = auth_service.register_user(
        email=user_data.get("email"),
        phone=user_data.get("phone"),
        full_name=user_data.get("full_name"),
        password=user_data.get("password"),
        role=user_data.get("role", "patient")
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result["data"]


@router.post("/login")
@auth_rate_limit
async def login(
    credentials: dict,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service)
):
    """User login"""
    result = auth_service.login_user(
        email=credentials.get("email"),
        password=credentials.get("password")
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=401, detail=result.get("error"))
    
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

