"""
Rate Limiting Middleware
Simple rate limiting for development
"""
from functools import wraps
from typing import Callable

def auth_rate_limit(func: Callable) -> Callable:
    """
    Rate limit decorator for auth endpoints
    For development, this is a no-op. In production, implement actual rate limiting.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper


def general_rate_limit(func: Callable) -> Callable:
    """
    Rate limit decorator for general endpoints
    For development, this is a no-op. In production, implement actual rate limiting.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper


def ai_rate_limit(func: Callable) -> Callable:
    """
    Rate limit decorator for AI endpoints
    For development, this is a no-op. In production, implement actual rate limiting.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper


def get_rate_limiter():
    """Get rate limiter instance (mock for development)"""
    return None


def rate_limit_exceeded_handler(request, exc):
    """Handle rate limit exceeded (mock)"""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=429,
        content={"error": "Rate limit exceeded"}
    )

