"""
Audit Service
Logs all admin actions and important system events
"""
from typing import Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import AuditLog, User
from ipaddress import ip_address


class AuditService:
    """Service for audit logging"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_action(
        self,
        action: str,
        entity_type: str,
        entity_id: str,
        admin_id: Optional[str] = None,
        user_id: Optional[str] = None,
        details: Optional[Dict] = None,
        ip_address_str: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        """
        Log an action to audit log
        
        Args:
            action: Action performed (e.g., 'verification_approved')
            entity_type: Type of entity (e.g., 'doctor', 'patient')
            entity_id: ID of entity
            admin_id: ID of admin who performed action
            user_id: ID of user affected
            details: Additional details (JSON)
            ip_address_str: IP address of requester
            user_agent: User agent string
        """
        # Validate IP address
        ip = None
        if ip_address_str:
            try:
                ip = ip_address(ip_address_str)
            except ValueError:
                pass  # Invalid IP, store as None
        
        audit_log = AuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            admin_id=admin_id,
            user_id=user_id,
            details=details or {},
            ip_address=ip,
            user_agent=user_agent,
            created_at=datetime.utcnow()
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        return audit_log
    
    def get_audit_logs(
        self,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        admin_id: Optional[str] = None,
        action: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict:
        """Get audit logs with filters"""
        from sqlalchemy import and_
        
        query = self.db.query(AuditLog)
        
        filters = []
        if entity_type:
            filters.append(AuditLog.entity_type == entity_type)
        if entity_id:
            filters.append(AuditLog.entity_id == entity_id)
        if admin_id:
            filters.append(AuditLog.admin_id == admin_id)
        if action:
            filters.append(AuditLog.action == action)
        
        if filters:
            query = query.filter(and_(*filters))
        
        total = query.count()
        logs = query.order_by(AuditLog.created_at.desc()).offset(
            (page - 1) * limit
        ).limit(limit).all()
        
        return {
            "success": True,
            "data": {
                "logs": [
                    {
                        "id": str(log.id),
                        "action": log.action,
                        "entity_type": log.entity_type,
                        "entity_id": log.entity_id,
                        "admin_id": log.admin_id,
                        "user_id": log.user_id,
                        "details": log.details,
                        "ip_address": str(log.ip_address) if log.ip_address else None,
                        "user_agent": log.user_agent,
                        "created_at": log.created_at.isoformat()
                    }
                    for log in logs
                ],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": (total + limit - 1) // limit
                }
            }
        }


# Factory function
def get_audit_service(db: Session) -> AuditService:
    """Factory function for dependency injection"""
    return AuditService(db)

