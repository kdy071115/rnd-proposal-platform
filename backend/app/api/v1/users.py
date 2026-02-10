"""User API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import UserEx
from pydantic import BaseModel

router = APIRouter()


class UserResponse(BaseModel):
    email: str
    full_name: str
    company_id: str

    class Config:
        from_attributes = True


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: UserEx = Depends(get_current_user)):
    """Get current user information."""
    return current_user
