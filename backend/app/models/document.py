"""Document model."""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class DocumentEx(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    content = Column(String(10000))
    company_id = Column(String(36), ForeignKey("companies.id"))
    created_at = Column(String(50))
    
    company = relationship("CompanyEx", back_populates="documents")
