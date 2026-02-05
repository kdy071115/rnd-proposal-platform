"""Company service for business logic."""
from app.models.company import CompanyEx
from app.schemas.company import (
    CompanyResponse,
    FinancialBase,
    ProjectBase,
    Score,
    ScoreBreakdown,
)


def calculate_company_score(db_company: CompanyEx) -> CompanyResponse:
    """Calculate company suitability score based on financials, tech, and experience."""
    
    # 1. Financial Score (Max 30)
    financial_score = 25 
    if db_company.financials and len(db_company.financials) > 0:
        latest_financial = db_company.financials[0]
        if latest_financial.debt_ratio < 100:
             financial_score = 28
        elif latest_financial.debt_ratio > 300:
             financial_score = 15

    # 2. Tech Score (Max 40)
    tech_score = 35

    # 3. Experience Score (Max 30)
    exp_score = 10 
    if len(db_company.projects) > 0:
        exp_score = 25
    
    total = financial_score + tech_score + exp_score
    grade = "B"
    if total >= 80:
        grade = "S"
    elif total >= 70:
        grade = "A"

    return CompanyResponse(
        id=db_company.id,
        name=db_company.name,
        ceo=db_company.ceo,
        address=db_company.address,
        sector=db_company.sector,
        founded_date=db_company.founded_date,
        financials=[
            FinancialBase(
                year=f.year,
                revenue=f.revenue,
                operating_profit=f.operating_profit,
                debt_ratio=f.debt_ratio,
                company_id=f.company_id
            ) for f in db_company.financials
        ],
        projects=[ProjectBase(title=p.title, result=p.result) for p in db_company.projects],
        patents={"registered": 5, "pending": 2, "grade": "A"},
        score=Score(
            total=total,
            grade=grade,
            breakdown=ScoreBreakdown(
                financial=financial_score,
                technology=tech_score,
                experience=exp_score
            )
        )
    )
