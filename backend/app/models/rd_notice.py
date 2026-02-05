"""R&D Notice model."""
from sqlalchemy import Column, Integer, String

from app.core.database import Base


class RDNoticeEx(Base):
    __tablename__ = "rd_notices"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    department = Column(String(50))
    sector = Column(String(100))
    min_year = Column(Integer)
    max_year = Column(Integer)
    grant_amount = Column(Integer)
    deadline = Column(String(20))
