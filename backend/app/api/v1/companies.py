"""Company routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import UserEx
from app.models.company import CompanyEx
from app.schemas.company import (
    CompanyCreate, 
    CompanyUpdate, 
    CompanyResponse, 
    FinancialCreate, 
    FinancialBase,
    ProjectCreate,
    ProjectBase
)
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
    if not current_user.company_id:
        raise HTTPException(status_code=404, detail="No company associated with user")
    
    db_company = db.query(CompanyEx).filter(CompanyEx.id == current_user.company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    return calculate_company_score(db_company)


@router.put("/me", response_model=CompanyResponse)
def update_my_company(
    company_update: CompanyUpdate, 
    current_user: UserEx = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Update current user's company information."""
    db_company = db.query(CompanyEx).filter(CompanyEx.id == current_user.company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_company, key, value)
    
    db.commit()
    db.refresh(db_company)
    return calculate_company_score(db_company)


@router.post("/me/financials", response_model=FinancialBase)
def add_financial(
    financial: FinancialCreate, 
    current_user: UserEx = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Add financial data to current user's company."""
    from app.models.company import FinancialEx
    
    db_financial = FinancialEx(**financial.dict(), company_id=current_user.company_id)
    db.add(db_financial)
    db.commit()
    db.refresh(db_financial)
    return db_financial


@router.post("/me/projects", response_model=ProjectBase)
def add_project(
    project: ProjectCreate, 
    current_user: UserEx = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Add project history to current user's company."""
    from app.models.company import ProjectHistoryEx
    
    db_project = ProjectHistoryEx(**project.dict(), company_id=current_user.company_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/{company_id}", response_model=CompanyResponse)
def read_company(company_id: str, db: Session = Depends(get_db)):
    """Get company by ID."""
    db_company = db.query(CompanyEx).filter(CompanyEx.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return calculate_company_score(db_company)
