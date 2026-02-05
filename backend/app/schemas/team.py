"""Team member schemas."""
from pydantic import BaseModel


class TeamMemberBase(BaseModel):
    name: str
    email: str
    role: str


class TeamMemberCreate(TeamMemberBase):
    company_id: str


class TeamMemberResponse(TeamMemberBase):
    id: int
    status: str
    
    class Config:
        from_attributes = True
