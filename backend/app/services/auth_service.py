"""
Authentication Service
JWT + Firebase Auth integration
"""
import os
try:
    import jwt
except ImportError:
    import PyJWT as jwt

from datetime import datetime, timedelta
from typing import Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.enhanced_models import User, UserRole

# Optional Firebase - only import if available
try:
    from firebase_admin import auth as firebase_auth
    import firebase_admin
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")
        self.jwt_algorithm = "HS256"
        self.jwt_expiry = timedelta(hours=24)
        self.refresh_expiry = timedelta(days=30)
        
        # Initialize Firebase if not already initialized
        if FIREBASE_AVAILABLE:
            try:
                firebase_admin.get_app()
            except ValueError:
                if os.getenv("FIREBASE_CREDENTIALS_PATH"):
                    cred = firebase_admin.credentials.Certificate(
                        os.getenv("FIREBASE_CREDENTIALS_PATH")
                    )
                    firebase_admin.initialize_app(cred)
    
    def register_user(
        self,
        email: str,
        phone: str,
        full_name: str,
        password: str,
        role: str = "patient"
    ) -> Dict:
        """Register new user"""
        # Check if user exists
        existing_user = self.db.query(User).filter(
            (User.email == email) | (User.phone == phone)
        ).first()
        
        if existing_user:
            return {
                "success": False,
                "error": "User with this email or phone already exists"
            }
        
        # Hash password
        password_hash = pwd_context.hash(password)
        
        # Create user
        user = User(
            email=email,
            phone=phone,
            full_name=full_name,
            password_hash=password_hash,
            role=UserRole(role),
            verified=False
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        # Generate tokens
        tokens = self._generate_tokens(user)
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role.value,
                    "verified": user.verified
                },
                **tokens
            }
        }
    
    def login_user(self, email: str, password: str) -> Dict:
        """User login with email/password"""
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user:
            return {
                "success": False,
                "error": "Invalid email or password"
            }
        
        if not user.password_hash:
            return {
                "success": False,
                "error": "Password authentication not available. Please use Firebase login."
            }
        
        # Verify password
        if not pwd_context.verify(password, user.password_hash):
            return {
                "success": False,
                "error": "Invalid email or password"
            }
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        # Generate tokens
        tokens = self._generate_tokens(user)
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role.value,
                    "verified": user.verified
                },
                **tokens
            }
        }
    
    def verify_firebase_token(self, firebase_token: str) -> Dict:
        """Verify Firebase token and create/update user"""
        if not FIREBASE_AVAILABLE:
            return {
                "success": False,
                "error": "Firebase not configured. Install firebase-admin package."
            }
        
        try:
            # Verify Firebase token
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            firebase_uid = decoded_token.get("uid")
            email = decoded_token.get("email")
            phone = decoded_token.get("phone_number")
            
            # Find or create user
            user = self.db.query(User).filter(
                User.firebase_uid == firebase_uid
            ).first()
            
            if not user:
                # Create new user
                user = User(
                    firebase_uid=firebase_uid,
                    email=email or "",
                    phone=phone or "",
                    full_name=decoded_token.get("name", ""),
                    role=UserRole.PATIENT,
                    verified=False
                )
                self.db.add(user)
                self.db.commit()
                self.db.refresh(user)
            else:
                # Update last login
                user.last_login = datetime.utcnow()
                self.db.commit()
            
            # Generate tokens
            tokens = self._generate_tokens(user)
            
            return {
                "success": True,
                "data": {
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role.value,
                        "verified": user.verified
                    },
                    **tokens
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Firebase token verification failed: {str(e)}"
            }
    
    def refresh_token(self, refresh_token: str) -> Dict:
        """Refresh JWT token"""
        try:
            payload = jwt.decode(
                refresh_token,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm]
            )
            
            user_id = payload.get("sub")
            user = self.db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return {
                    "success": False,
                    "error": "User not found"
                }
            
            # Generate new tokens
            tokens = self._generate_tokens(user)
            
            return {
                "success": True,
                "data": tokens
            }
            
        except jwt.ExpiredSignatureError:
            return {
                "success": False,
                "error": "Refresh token expired"
            }
        except jwt.InvalidTokenError:
            return {
                "success": False,
                "error": "Invalid refresh token"
            }
    
    def get_user_from_token(self, token: str) -> Optional[User]:
        """Get user from JWT token"""
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm]
            )
            
            user_id = payload.get("sub")
            return self.db.query(User).filter(User.id == user_id).first()
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def _generate_tokens(self, user: User) -> Dict:
        """Generate JWT access and refresh tokens"""
        now = datetime.utcnow()
        
        access_payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "exp": now + self.jwt_expiry,
            "iat": now
        }
        
        refresh_payload = {
            "sub": str(user.id),
            "type": "refresh",
            "exp": now + self.refresh_expiry,
            "iat": now
        }
        
        access_token = jwt.encode(access_payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        refresh_token = jwt.encode(refresh_payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": int(self.jwt_expiry.total_seconds())
        }


# Factory function
def get_auth_service(db: Session) -> AuthService:
    """Factory function for dependency injection"""
    return AuthService(db)

