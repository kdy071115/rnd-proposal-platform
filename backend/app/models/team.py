"""Team member model."""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class TeamMemberEx(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100))
    role = Column(String(50))
    status = Column(String(20))
    company_id = Column(String(36), ForeignKey("companies.id"))
    invitation_token = Column(String(255), nullable=True, unique=True)

    company = relationship("CompanyEx", back_populates="members")
