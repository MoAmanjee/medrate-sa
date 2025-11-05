"""
Authentication Middleware
JWT token verification with hospital admin support
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.enhanced_models import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    from app.services.auth_service import AuthService
    
    token = credentials.credentials
    
    auth_service = AuthService(db)
    user = auth_service.get_user_from_token(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify admin role"""
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user


def get_doctor_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify doctor role"""
    if current_user.role.value != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor access required"
        )
    
    return current_user


def get_hospital_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify hospital admin role"""
    if current_user.role.value not in ["hospital_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hospital admin access required"
        )
    
    return current_user


def get_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify they are verified"""
    if not current_user.verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User verification required"
        )
    
    return current_user
