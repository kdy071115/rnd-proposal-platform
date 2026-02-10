"""Document routes."""
from typing import List
import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import UserEx
from app.models.document import DocumentEx
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse

router = APIRouter()


@router.post("/", response_model=DocumentResponse)
@router.post("", response_model=DocumentResponse, include_in_schema=False)
def create_document(
    doc: DocumentCreate,
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new document."""
    now = datetime.datetime.now().isoformat()
    db_doc = DocumentEx(
        title=doc.title, 
        content=doc.content, 
        company_id=current_user.company_id,
        created_at=now
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


@router.get("/", response_model=List[DocumentResponse])
@router.get("", response_model=List[DocumentResponse], include_in_schema=False)
def get_documents(current_user: UserEx = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all documents for current user's company."""
    return db.query(DocumentEx).filter(DocumentEx.company_id == current_user.company_id).all()


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific document."""
    doc = db.query(DocumentEx).filter(
        DocumentEx.id == doc_id,
        DocumentEx.company_id == current_user.company_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: int,
    doc_update: DocumentUpdate,
    current_user: UserEx = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a document."""
    db_doc = db.query(DocumentEx).filter(
        DocumentEx.id == doc_id,
        DocumentEx.company_id == current_user.company_id
    ).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc_update.title:
        db_doc.title = doc_update.title
    if doc_update.content:
        db_doc.content = doc_update.content
    
    db.commit()
    db.refresh(db_doc)
    return db_doc
