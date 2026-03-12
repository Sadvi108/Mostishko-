
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import Conversation, Message
from ..chat.rag import build_rag_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: int = None
    mode: str = "hybrid" # hybrid, vector, keyword

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    
    # 1. Get or Create Conversation
    if not request.conversation_id:
        conversation = Conversation(title=request.message[:50])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conversation_id = conversation.id
    else:
        conversation_id = request.conversation_id
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
    # 2. Save User Message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()
    
    # 3. Stream Response
    return StreamingResponse(
        build_rag_response(
            message=request.message,
            conversation_id=conversation_id,
            mode=request.mode,
            db=db
        ),
        media_type="text/event-stream"
    )
