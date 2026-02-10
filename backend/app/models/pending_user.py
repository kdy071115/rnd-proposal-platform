"""Pending user registration model."""
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.core.database import Base


class PendingUserEx(Base):
    """Pending user registrations awaiting email verification."""
    __tablename__ = "pending_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    full_name = Column(String(100))
    company_name = Column(String(200))
    verification_token = Column(String(255), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)  # 24시간 후 만료
