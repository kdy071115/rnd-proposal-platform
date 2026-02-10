"""Team member schemas."""
from pydantic import BaseModel


class TeamMemberBase(BaseModel):
    name: str
    email: str
    role: str


class TeamMemberCreate(TeamMemberBase):
    pass


class InvitationAccept(BaseModel):
    token: str


class TeamMemberResponse(TeamMemberBase):
    id: int
    status: str
    invitation_token: str | None = None
    
    class Config:
        from_attributes = True
