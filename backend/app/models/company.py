"""Company-related models."""
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class CompanyEx(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100))
    ceo = Column(String(50))
    address = Column(String(200))
    sector = Column(String(100))
    founded_date = Column(String(20))
    
    financials = relationship("FinancialEx", back_populates="company")
    projects = relationship("ProjectHistoryEx", back_populates="company")
    documents = relationship("DocumentEx", back_populates="company")
    members = relationship("TeamMemberEx", back_populates="company")


class FinancialEx(Base):
    __tablename__ = "financials"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"))
    year = Column(Integer)
    revenue = Column(Float)
    operating_profit = Column(Float)
    debt_ratio = Column(Float)
    
    company = relationship("CompanyEx", back_populates="financials")


class ProjectHistoryEx(Base):
    __tablename__ = "project_histories"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"))
    title = Column(String(200))
    result = Column(String(20))
    
    company = relationship("CompanyEx", back_populates="projects")
