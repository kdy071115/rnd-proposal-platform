"""User model."""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserEx(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    full_name = Column(String(100))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True)
    email_verified = Column(String(10), default="false")  # "true" or "false"
    verification_token = Column(String(255), nullable=True, unique=True)

    company = relationship("CompanyEx")
