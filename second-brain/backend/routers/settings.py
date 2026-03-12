from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Document, Chunk, Entity, Conversation, Message

router = APIRouter()

@router.delete("/settings/delete-all")
async def delete_all_data(db: Session = Depends(get_db)):
    try:
        # Delete all data
        # Order matters due to foreign keys
        db.query(Entity).delete()
        db.query(Chunk).delete()
        db.query(Message).delete()
        db.query(Conversation).delete()
        db.query(Document).delete()
        
        db.commit()
        
        return {"status": "success", "message": "All data deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
