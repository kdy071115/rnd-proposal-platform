"""R&D recommendation service."""
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.models.company import CompanyEx
from app.models.rd_notice import RDNoticeEx
from app.schemas.rd_notice import RDNoticeResponse


def get_rd_recommendations(company: CompanyEx, db: Session) -> List[RDNoticeResponse]:
    """Get R&D recommendations for a company based on matching criteria."""
    
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

        # 1. Sector Match
        if notice.sector == "All" or notice.sector == company.sector:
            score += 50
            reasons.append("업종 일치")
        elif "SW" in notice.sector and "IT" in company.sector:
            score += 40
            reasons.append("유사 업종")

        # 2. Age Eligibility
        is_eligible_age = True
        if notice.min_year and company_age < notice.min_year:
            is_eligible_age = False
        if notice.max_year and company_age > notice.max_year:
            is_eligible_age = False
        
        if is_eligible_age:
            score += 30
            reasons.append(f"업력 적합 ({company_age}년차)")
        else:
             score = 0

        if score > 0:
            recommendations.append(RDNoticeResponse(
                id=notice.id,
                title=notice.title,
                department=notice.department,
                sector=notice.sector,
                grant_amount=notice.grant_amount,
                deadline=notice.deadline,
                match_score=score,
                match_reason=", ".join(reasons)
            ))
    
    # Sort by score desc
    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    return recommendations
