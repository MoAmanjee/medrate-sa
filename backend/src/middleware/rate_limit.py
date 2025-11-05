"""
Rate Limiting Middleware
Implements rate limiting for all API endpoints
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Callable
import os


# Rate limit configurations
RATE_LIMITS = {
    "general": "100/minute",
    "auth": "5/minute",
    "ai": "10/minute",
    "admin": "50/minute",
    "webhook": "1000/hour"  # Webhooks can have higher limits
}


def get_rate_limiter() -> Limiter:
    """Create rate limiter instance"""
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[RATE_LIMITS["general"]],
        storage_uri=os.getenv("REDIS_URL", "memory://")
    )
    return limiter


def rate_limit(limit: str) -> Callable:
    """
    Decorator for rate limiting endpoints
    
    Usage:
        @rate_limit("100/minute")
        async def my_endpoint():
            pass
    """
    limiter = get_rate_limiter()
    
    def decorator(func: Callable) -> Callable:
        return limiter.limit(limit)(func)
    
    return decorator


# Predefined rate limit decorators
def general_rate_limit(func: Callable) -> Callable:
    """General endpoint rate limit: 100/minute"""
    return rate_limit(RATE_LIMITS["general"])(func)


def auth_rate_limit(func: Callable) -> Callable:
    """Authentication endpoint rate limit: 5/minute"""
    return rate_limit(RATE_LIMITS["auth"])(func)


def ai_rate_limit(func: Callable) -> Callable:
    """AI endpoint rate limit: 10/minute"""
    return rate_limit(RATE_LIMITS["ai"])(func)


def admin_rate_limit(func: Callable) -> Callable:
    """Admin endpoint rate limit: 50/minute"""
    return rate_limit(RATE_LIMITS["admin"])(func)


def webhook_rate_limit(func: Callable) -> Callable:
    """Webhook endpoint rate limit: 1000/hour"""
    return rate_limit(RATE_LIMITS["webhook"])(func)


# Rate limit error handler
def rate_limit_exceeded_handler(request, exc):
    """Handle rate limit exceeded errors"""
    return {
        "success": False,
        "error": {
            "code": "RATE_LIMIT_EXCEEDED",
            "message": f"Rate limit exceeded. Limit: {exc.limit}",
            "details": {
                "limit": exc.limit,
                "retry_after": exc.retry_after
            }
        }
    }, 429

