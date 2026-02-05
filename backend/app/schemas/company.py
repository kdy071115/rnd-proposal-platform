"""Company schemas."""
from typing import List, Optional
from pydantic import BaseModel


class FinancialBase(BaseModel):
    year: int
    revenue: float
    operating_profit: float
    net_profit: Optional[float] = 0.0
    total_assets: Optional[float] = 0.0
    debt_ratio: float


class FinancialCreate(FinancialBase):
    pass


class ProjectBase(BaseModel):
    title: str
    year: Optional[int] = None
    agency: Optional[str] = None
    amount: Optional[float] = 0.0
    result: str


class ProjectCreate(ProjectBase):
    pass


class CompanyBase(BaseModel):
    name: str
    ceo: str
    address: str
    sector: str 
    founded_date: str
    business_id: Optional[str] = None


class CompanyCreate(CompanyBase):
    id: str


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    ceo: Optional[str] = None
    address: Optional[str] = None
    sector: Optional[str] = None
    founded_date: Optional[str] = None
    business_id: Optional[str] = None


class ScoreBreakdown(BaseModel):
    financial: int
    technology: int
    experience: int


class Score(BaseModel):
    total: int
    grade: str
    breakdown: ScoreBreakdown


class CompanyResponse(CompanyBase):
    id: str
    financials: List[FinancialBase] = []
    projects: List[ProjectBase] = []
    patents: dict = {"registered": 0, "pending": 0, "grade": "-"}
    score: Score = Score(total=0, grade="-", breakdown=ScoreBreakdown(financial=0, technology=0, experience=0))

    class Config:
        from_attributes = True
