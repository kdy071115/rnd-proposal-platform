"""R&D recommendation service with enhanced matching algorithm."""
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.models.company import CompanyEx
from app.models.rd_notice import RDNoticeEx
from app.schemas.rd_notice import RDNoticeResponse


def get_rd_recommendations(company: CompanyEx, db: Session) -> List[RDNoticeResponse]:
    """
    Get R&D recommendations for a company based on enhanced matching criteria.
    
    Matching Score (100 points):
    - Sector Match: 30 points
    - Company Age: 20 points
    - Financial Health: 20 points
    - Technology Level: 15 points
    - Project History: 10 points
    - Grant Size Fit: 5 points
    """
    
    # Calculate company age
    founded_year = int(company.founded_date.split("-")[0])
    current_year = datetime.now().year
    company_age = current_year - founded_year

    # Fetch all notices
    notices = db.query(RDNoticeEx).all()
    recommendations = []

    for notice in notices:
        score = 0
        reasons = []

        # 1. Sector Match (30 points)
        sector_score, sector_reason = _calculate_sector_score(company.sector, notice.sector)
        score += sector_score
        if sector_reason:
            reasons.append(sector_reason)

        # 2. Company Age (20 points)
        age_score, age_reason = _calculate_age_score(company_age, notice.min_year, notice.max_year)
        score += age_score
        if age_reason:
            reasons.append(age_reason)
        
        # Skip if age is not eligible
        if age_score == 0 and notice.min_year > 0:
            continue

        # 3. Financial Health (20 points)
        financial_score, financial_reason = _calculate_financial_score(company)
        score += financial_score
        if financial_reason:
            reasons.append(financial_reason)

        # 4. Technology Level (15 points)
        tech_score, tech_reason = _calculate_tech_score(company)
        score += tech_score
        if tech_reason:
            reasons.append(tech_reason)

        # 5. Project History (10 points)
        history_score, history_reason = _calculate_history_score(company)
        score += history_score
        if history_reason:
            reasons.append(history_reason)

        # 6. Grant Size Fit (5 points)
        grant_score, grant_reason = _calculate_grant_fit_score(company, notice.grant_amount)
        score += grant_score
        if grant_reason:
            reasons.append(grant_reason)

        if score > 0:
            recommendations.append(RDNoticeResponse(
                id=notice.id,
                title=notice.title,
                department=notice.department,
                sector=notice.sector,
                grant_amount=notice.grant_amount,
                deadline=notice.deadline,
                match_score=score,
                match_reason=" | ".join(reasons)
            ))
    
    # Sort by score desc
    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    return recommendations


def _calculate_sector_score(company_sector: str, notice_sector: str) -> tuple[int, str]:
    """Calculate sector matching score (max 30 points)."""
    if notice_sector == "All":
        return 25, "전 업종 대상"
    
    if notice_sector == company_sector:
        return 30, "업종 완전 일치"
    
    # Similar sectors
    similar_sectors = {
        "IT/Software": ["IT", "Software", "정보통신"],
        "Bio/Health": ["Bio", "Health", "바이오", "헬스케어"],
        "Manufacturing": ["제조", "Manufacturing"],
    }
    
    for key, values in similar_sectors.items():
        if key in company_sector or company_sector in values:
            if key in notice_sector or notice_sector in values:
                return 20, "유사 업종"
    
    return 0, ""


def _calculate_age_score(company_age: int, min_year: int, max_year: int) -> tuple[int, str]:
    """Calculate company age eligibility score (max 20 points)."""
    if min_year <= company_age <= max_year:
        return 20, f"업력 적합 ({company_age}년차)"
    
    return 0, ""


def _calculate_financial_score(company: CompanyEx) -> tuple[int, str]:
    """Calculate financial health score (max 20 points)."""
    if not company.financials or len(company.financials) == 0:
        return 5, "재무 정보 미등록"
    
    latest_financial = company.financials[0]
    debt_ratio = latest_financial.debt_ratio
    revenue = latest_financial.revenue
    
    score = 0
    reasons = []
    
    # Debt ratio evaluation
    if debt_ratio < 100:
        score += 12
        reasons.append("부채비율 우수")
    elif debt_ratio < 200:
        score += 6
        reasons.append("부채비율 양호")
    
    # Revenue evaluation
    if revenue > 50:
        score += 8
        reasons.append("매출 규모 양호")
    elif revenue > 10:
        score += 4
    
    return score, " · ".join(reasons) if reasons else ""


def _calculate_tech_score(company: CompanyEx) -> tuple[int, str]:
    """Calculate technology level score (max 15 points)."""
    # Currently using mock patent data
    # In production, this would query actual patent database
    patent_count = 0  # In production, this would query actual patent database
    
    if patent_count >= 5:
        return 15, "특허 보유 우수"
    elif patent_count >= 3:
        return 10, "특허 보유 양호"
    elif patent_count >= 1:
        return 5, "특허 보유"
    
    return 0, ""


def _calculate_history_score(company: CompanyEx) -> tuple[int, str]:
    """Calculate project history score (max 10 points)."""
    if not company.projects or len(company.projects) == 0:
        return 0, ""
    
    total_projects = len(company.projects)
    successful_projects = sum(1 for p in company.projects if p.result == "성공")
    
    if total_projects == 0:
        return 0, ""
    
    success_rate = successful_projects / total_projects
    
    if success_rate >= 0.8:
        return 10, f"과제 수행 우수 ({successful_projects}/{total_projects})"
    elif success_rate >= 0.5:
        return 6, f"과제 수행 양호 ({successful_projects}/{total_projects})"
    elif total_projects > 0:
        return 3, f"과제 수행 경험 ({total_projects}건)"
    
    return 0, ""


def _calculate_grant_fit_score(company: CompanyEx, grant_amount: int) -> tuple[int, str]:
    """Calculate grant size fit score (max 5 points)."""
    if not company.financials or len(company.financials) == 0:
        return 0, ""
    
    revenue = company.financials[0].revenue
    
    # Grant should be reasonable compared to company size
    if revenue == 0:
        return 0, ""
    
    grant_to_revenue_ratio = (grant_amount * 100) / revenue  # Convert 억원 to same unit
    
    if 10 <= grant_to_revenue_ratio <= 50:
        return 5, "지원금 규모 적정"
    elif 5 <= grant_to_revenue_ratio <= 100:
        return 3, ""
    
    return 0, ""
