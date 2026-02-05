"""Team member routes."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import UserEx
from app.models.team import TeamMemberEx
from app.schemas.team import TeamMemberCreate, TeamMemberResponse

router = APIRouter()


@router.post("/invite", response_model=TeamMemberResponse)
def invite_member(
    member: TeamMemberCreate,
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite a new team member."""
    db_member = TeamMemberEx(
        name=member.name,
        email=member.email,
        role=member.role,
        company_id=current_user.company_id,
        status="Pending"
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.get("/", response_model=List[TeamMemberResponse])
def get_team_members(current_user: UserEx = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all team members for current user's company."""
    return db.query(TeamMemberEx).filter(TeamMemberEx.company_id == current_user.company_id).all()
