"""Authentication routes."""
from datetime import timedelta
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import UserEx
from app.models.company import CompanyEx
from app.models.team import TeamMemberEx
from app.schemas.user import UserCreate, Token

router = APIRouter()


@router.post("/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and create their company."""
    db_user = db.query(UserEx).filter(UserEx.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 1. Create a new Company
    from datetime import datetime
    new_company_id = str(uuid.uuid4())
    db_company = CompanyEx(
        id=new_company_id,
        name=user.company_name,
        founded_date=datetime.now().strftime("%Y-%m-%d"),
        sector="IT/Software",
        address="Seoul, Korea",
        ceo=user.full_name
    )
    db.add(db_company)
    
    # 2. Create User linked to this company
    hashed_password = get_password_hash(user.password)
    db_user = UserEx(
        email=user.email, 
        hashed_password=hashed_password, 
        full_name=user.full_name, 
        company_id=new_company_id
    )
    db.add(db_user)
    
    # 3. Also add as Team Member (Admin)
    db_member = TeamMemberEx(
        name=user.full_name,
        email=user.email,
        role="Admin",
        status="Active",
        company_id=new_company_id
    )
    db.add(db_member)

    db.commit()
    db.refresh(db_user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token."""
    user = db.query(UserEx).filter(UserEx.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
