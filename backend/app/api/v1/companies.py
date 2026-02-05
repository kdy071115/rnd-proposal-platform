"""Company routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import UserEx
from app.models.company import CompanyEx
from app.schemas.company import CompanyCreate, CompanyResponse
from app.services.company_service import calculate_company_score

router = APIRouter()


@router.post("/", response_model=CompanyResponse)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """Create a new company."""
    db_company = CompanyEx(**company.dict())
    try:
        db.add(db_company)
        db.commit()
        db.refresh(db_company)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Company might already exist")
    return db_company


@router.get("/me", response_model=CompanyResponse)
def read_my_company(current_user: UserEx = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's company information."""
    print(f"[DEBUG] User email: {current_user.email}, company_id: {current_user.company_id}")
    
    if not current_user.company_id:
        print("[DEBUG] No company_id associated with user")
        raise HTTPException(status_code=404, detail="No company associated with user")
    
    db_company = db.query(CompanyEx).filter(CompanyEx.id == current_user.company_id).first()
    if not db_company:
        print(f"[DEBUG] Company not found in DB for id: {current_user.company_id}")
        raise HTTPException(status_code=404, detail="Company not found")
        
    print(f"[DEBUG] Found company: {db_company.name}")
    return calculate_company_score(db_company)


@router.get("/{company_id}", response_model=CompanyResponse)
def read_company(company_id: str, db: Session = Depends(get_db)):
    """Get company by ID."""
    db_company = db.query(CompanyEx).filter(CompanyEx.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return calculate_company_score(db_company)
