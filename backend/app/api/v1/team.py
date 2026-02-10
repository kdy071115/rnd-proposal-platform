"""Team member routes."""
from typing import List
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import UserEx
from app.models.team import TeamMemberEx
from app.schemas.team import TeamMemberCreate, TeamMemberResponse, InvitationAccept

router = APIRouter()


@router.post("/invite", response_model=TeamMemberResponse)
def invite_member(
    member: TeamMemberCreate,
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite an existing user to join the team."""
    # Check if user exists
    invited_user = db.query(UserEx).filter(UserEx.email == member.email).first()
    if not invited_user:
        raise HTTPException(
            status_code=404, 
            detail="해당 이메일로 가입된 사용자가 없습니다. 먼저 회원가입을 완료해야 합니다."
        )
    
    # Check if user is already in a team
    if invited_user.company_id:
        raise HTTPException(
            status_code=400,
            detail="이미 다른 팀에 소속된 사용자입니다."
        )
    
    # Check if invitation already exists
    existing_invitation = db.query(TeamMemberEx).filter(
        TeamMemberEx.email == member.email,
        TeamMemberEx.company_id == current_user.company_id
    ).first()
    
    if existing_invitation:
        if existing_invitation.status == "Active":
            raise HTTPException(status_code=400, detail="이미 팀 멤버입니다.")
        # Resend invitation if pending
        invitation_token = existing_invitation.invitation_token
        db_member = existing_invitation
    else:
        # Generate unique invitation token
        invitation_token = secrets.token_urlsafe(32)
        
        db_member = TeamMemberEx(
            name=invited_user.full_name,
            email=member.email,
            role=member.role,
            company_id=current_user.company_id,
            status="Pending",
            invitation_token=invitation_token
        )
        db.add(db_member)
        db.commit()
        db.refresh(db_member)
    
    # Send invitation email
    from app.services.email_service import email_service
    from app.models.company import CompanyEx
    
    company = db.query(CompanyEx).filter(CompanyEx.id == current_user.company_id).first()
    company_name = company.name if company else "회사"
    
    # Generate invitation link
    base_url = settings.FRONTEND_URL
    invitation_link = f"{base_url}/accept-invite?token={invitation_token}"
    
    # Send email
    email_sent = email_service.send_team_invitation(
        to_email=member.email,
        to_name=invited_user.full_name,
        inviter_name=current_user.full_name,
        company_name=company_name,
        invitation_link=invitation_link
    )
    
    if not email_sent:
        print(f"Warning: Failed to send invitation email to {member.email}")
    
    return db_member


@router.post("/accept-invite")
def accept_invitation(
    invite: InvitationAccept,
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept team invitation for an existing user."""
    # Find invitation by token
    member = db.query(TeamMemberEx).filter(
        TeamMemberEx.invitation_token == invite.token,
        TeamMemberEx.status == "Pending"
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="유효하지 않거나 이미 처리된 초대입니다.")
    
    # Verify that the logged in user is the one who was invited
    if current_user.email != member.email:
        raise HTTPException(
            status_code=403, 
            detail="초대받은 이메일 계정으로 로그인해야 수락할 수 있습니다."
        )
    
    # Update user's company_id
    current_user.company_id = member.company_id
    
    # Update invitation status
    member.status = "Active"
    member.invitation_token = None  # Clear token after use
    
    db.commit()
    
    return {"message": "초대를 성공적으로 수락했습니다.", "email": member.email}


@router.get("/", response_model=List[TeamMemberResponse])
def get_team_members(current_user: UserEx = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all team members for current user's company."""
    return db.query(TeamMemberEx).filter(TeamMemberEx.company_id == current_user.company_id).all()
