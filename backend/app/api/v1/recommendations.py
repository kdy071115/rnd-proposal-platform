"""R&D recommendation routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import UserEx
from app.models.company import CompanyEx
from app.schemas.rd_notice import RDNoticeResponse
from app.services.rd_service import get_rd_recommendations

router = APIRouter()


def _get_recommendations_impl(
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[RDNoticeResponse]:
    """Internal implementation for recommendations."""
    print(f"[DEBUG] Recommendations requested by user: {current_user.email}")
    print(f"[DEBUG] User company_id: {current_user.company_id}")
    
    company = db.query(CompanyEx).filter(CompanyEx.id == current_user.company_id).first()
    if not company:
        print("[DEBUG] Company not found!")
        raise HTTPException(status_code=404, detail="Company info not found. Please complete profile.")
    
    print(f"[DEBUG] Found company: {company.name}")
    recommendations = get_rd_recommendations(company, db)
    print(f"[DEBUG] Returning {len(recommendations)} recommendations")
    
    return recommendations


@router.get("/", response_model=List[RDNoticeResponse])
def get_recommendations_with_slash(
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get R&D recommendations (with trailing slash)."""
    return _get_recommendations_impl(current_user, db)


@router.get("", response_model=List[RDNoticeResponse])
def get_recommendations_without_slash(
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get R&D recommendations (without trailing slash)."""
    return _get_recommendations_impl(current_user, db)
