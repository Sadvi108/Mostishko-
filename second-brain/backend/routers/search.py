from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models import Document, Chunk

router = APIRouter()

@router.get("/search")
async def search_endpoint(q: str, db: Session = Depends(get_db)):
    if not q:
        return {"results": []}
    
    # 1. Search in Documents (Title)
    docs = db.query(Document).filter(Document.title.ilike(f"%{q}%")).limit(10).all()
    
    results = []
    seen_doc_ids = set()
    
    for doc in docs:
        results.append({
            "id": doc.id,
            "title": doc.title,
            "content": doc.content[:200] + "...", # Preview
            "score": 1.0, # Exact match on title is high relevance
            "source_type": doc.source_type
        })
        seen_doc_ids.add(doc.id)
        
    # 2. Search in Chunks (Content)
    chunks = db.query(Chunk).filter(Chunk.content.ilike(f"%{q}%")).limit(20).all()
    
    for chunk in chunks:
        if chunk.document_id in seen_doc_ids:
            continue
            
        doc = db.query(Document).filter(Document.id == chunk.document_id).first()
        if doc:
            results.append({
                "id": doc.id,
                "title": doc.title,
                "content": chunk.content[:200] + "...", # Chunk preview
                "score": 0.8, # Content match
                "source_type": doc.source_type
            })
            seen_doc_ids.add(doc.id)
            
    return {"results": results[:20]}
