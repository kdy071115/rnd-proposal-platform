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


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user - stores pending registration until email verification."""
    # Check if user already exists
    existing_user = db.query(UserEx).filter(UserEx.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if there's already a pending registration
    from app.models.pending_user import PendingUserEx
    existing_pending = db.query(PendingUserEx).filter(PendingUserEx.email == user.email).first()
    if existing_pending:
        # Delete old pending registration
        db.delete(existing_pending)
        db.commit()
    
    # Create pending registration
    from datetime import datetime, timedelta
    import secrets
    
    hashed_password = get_password_hash(user.password)
    verification_token = secrets.token_urlsafe(32)
    
    pending_user = PendingUserEx(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        company_name=user.company_name,
        verification_token=verification_token,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=24)  # 24시간 유효
    )
    
    db.add(pending_user)
    db.commit()
    db.refresh(pending_user)
    
    # Send verification email
    from app.services.email_service import email_service
    
    base_url = settings.FRONTEND_URL
    verification_link = f"{base_url}/verify-email?token={verification_token}"
    
    email_sent = email_service.send_verification_email(
        to_email=user.email,
        to_name=user.full_name,
        verification_link=verification_link
    )
    
    if not email_sent:
        print(f"Warning: Failed to send verification email to {user.email}")
    
    return {
        "message": "회원가입 요청이 접수되었습니다. 이메일을 확인하여 계정을 활성화해주세요.",
        "email": user.email,
        "expires_in_hours": 24
    }


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
    
    # No need to check email_verified - only verified users exist in DB
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify email address and create actual user account."""
    from app.models.pending_user import PendingUserEx
    from datetime import datetime
    
    # Find pending registration
    pending_user = db.query(PendingUserEx).filter(
        PendingUserEx.verification_token == token
    ).first()
    
    if not pending_user:
        raise HTTPException(
            status_code=404,
            detail="Invalid or expired verification link"
        )
    
    # Check if expired (24 hours)
    if datetime.utcnow() > pending_user.expires_at:
        db.delete(pending_user)
        db.commit()
        raise HTTPException(
            status_code=410,
            detail="Verification link has expired. Please sign up again."
        )
    
    # Check if user already exists (shouldn't happen, but just in case)
    existing_user = db.query(UserEx).filter(UserEx.email == pending_user.email).first()
    if existing_user:
        db.delete(pending_user)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create actual user account now!
    new_company_id = str(uuid.uuid4())
    
    # 1. Create Company
    db_company = CompanyEx(
        id=new_company_id,
        name=pending_user.company_name,
        founded_date=datetime.now().strftime("%Y-%m-%d"),
        sector="IT/Software",
        address="Seoul, Korea",
        ceo=pending_user.full_name
    )
    db.add(db_company)
    
    # 2. Create User (already verified)
    db_user = UserEx(
        email=pending_user.email,
        hashed_password=pending_user.hashed_password,
        full_name=pending_user.full_name,
        company_id=new_company_id,
        email_verified="true",  # Already verified!
        verification_token=None
    )
    db.add(db_user)
    
    # 3. Add as Team Member (Admin)
    db_member = TeamMemberEx(
        name=pending_user.full_name,
        email=pending_user.email,
        role="Admin",
        status="Active",
        company_id=new_company_id
    )
    db.add(db_member)
    
    # 4. Delete pending registration
    db.delete(pending_user)
    
    db.commit()
    
    return {
        "message": "이메일 인증이 완료되었습니다! 계정이 생성되었으며 이제 로그인할 수 있습니다.",
        "email": db_user.email
    }
