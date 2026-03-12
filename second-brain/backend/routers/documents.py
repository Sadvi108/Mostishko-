from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Document

router = APIRouter()

@router.get("/documents")
def get_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    docs = db.query(Document).offset(skip).limit(limit).all()
    return docs

@router.get("/documents/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Note: Deleting document should also cascade delete chunks in DB (via models.py cascade)
    # But we also need to delete from Qdrant. This is not implemented here yet.
    # For now, just delete from DB.
    db.delete(doc)
    db.commit()
    return {"status": "success", "id": document_id}
