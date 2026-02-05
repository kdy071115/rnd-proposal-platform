"""Company schemas."""
from typing import List
from pydantic import BaseModel


class FinancialBase(BaseModel):
    year: int
    revenue: float
    operating_profit: float
    debt_ratio: float
    company_id: str | None = None


class ProjectBase(BaseModel):
    title: str
    result: str


class CompanyBase(BaseModel):
    id: str
    name: str
    ceo: str
    address: str
    sector: str 
    founded_date: str


class CompanyCreate(CompanyBase):
    pass


class ScoreBreakdown(BaseModel):
    financial: int
    technology: int
    experience: int


class Score(BaseModel):
    total: int
    grade: str
    breakdown: ScoreBreakdown


class CompanyResponse(CompanyBase):
    financials: List[FinancialBase] = []
    projects: List[ProjectBase] = []
    patents: dict = {"registered": 5, "pending": 2, "grade": "A"}
    score: Score = Score(total=0, grade="B", breakdown=ScoreBreakdown(financial=0, technology=0, experience=0))

    class Config:
        from_attributes = True
