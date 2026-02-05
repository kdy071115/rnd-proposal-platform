"""Document schemas."""
from typing import Optional
from pydantic import BaseModel


class DocumentBase(BaseModel):
    title: str
    content: str
    company_id: str


class DocumentCreate(BaseModel):
    """Schema for creating a document (company_id comes from current user)."""
    title: str
    content: str


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: int
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class GenerateRequest(BaseModel):
    company_id: str
    section: Optional[str] = "all"


class GenerateResponse(BaseModel):
    content: str
