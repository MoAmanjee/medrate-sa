"""
Hospital Routes
"""
from fastapi import APIRouter
from app.api.v1.hospitals import router

# Re-export router
router = router

