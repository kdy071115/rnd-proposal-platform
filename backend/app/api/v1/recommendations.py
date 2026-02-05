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


@router.get("/", response_model=List[RDNoticeResponse])
def get_recommendations(
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get R&D recommendations for current user's company."""
    company = db.query(CompanyEx).filter(CompanyEx.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company info not found. Please complete profile.")

    return get_rd_recommendations(company, db)
