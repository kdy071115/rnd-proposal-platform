"""User schemas."""
from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    company_name: str


class Token(BaseModel):
    access_token: str
    token_type: str
