
import os
import json
from typing import AsyncGenerator
from sqlalchemy.orm import Session
from ..models import Conversation, Message, Document
from ..retrieval.search import hybrid_search
from ..services import chat_stream

# anthropic_client moved to services.py

SYSTEM_PROMPT = """You are a personal knowledge assistant. Answer questions using ONLY 
the provided context from the user's notes and documents. Always cite 
sources using [Doc: title] notation. If the answer is not in the 
context, say so clearly. Be concise and direct."""

async def build_rag_response(
    message: str, 
    conversation_id: int, 
    mode: str, 
    db: Session
) -> AsyncGenerator[str, None]:
    
    try:
        # 1. Retrieve Conversation History (last 5 messages)
        history = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.desc()).limit(5).all()
        history = history[::-1] # Reverse to chronological order
        
        # 2. Retrieve Context via Hybrid Search
        try:
            context_chunks = await hybrid_search(message, db, limit=10)
        except Exception as e:
            print(f"Search failed: {e}")
            yield f"data: {json.dumps({'type': 'chunk', 'content': f'Search Error: {str(e)}'})}\n\n"
            context_chunks = []
        
        context_str = ""
        sources = []
        seen_sources = set()
        
        for chunk in context_chunks:
            doc_id = chunk["document_id"]
            # Fetch document title if not in payload (it is in payload for vector, but maybe not keyword)
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                title = doc.title
                content = chunk["content"]
                context_str += f"[Doc: {title}]\n{content}\n\n"
                
                if doc_id not in seen_sources:
                    sources.append({
                        "id": doc.id,
                        "title": doc.title,
                        "source_type": doc.source_type,
                        "url": doc.source_url
                    })
                    seen_sources.add(doc_id)
        
        # 3. Construct Prompt
        messages = []
        
        # Add history
        for msg in history:
            role = "user" if msg.role == "user" else "assistant"
            messages.append({"role": role, "content": msg.content})
        
        # Add current message with context
        user_content = f"Context:\n{context_str}\n\nUser Question: {message}"
        messages.append({"role": "user", "content": user_content})
        
        # 4. Stream Response from Claude
        stream = chat_stream(messages, SYSTEM_PROMPT)
        
        full_response = ""
        
        async for text in stream:
            full_response += text
            yield f"data: {json.dumps({'type': 'chunk', 'content': text})}\n\n"
        
        # 5. Save Assistant Message to DB
        assistant_msg = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=full_response
        )
        db.add(assistant_msg)
        db.commit()
        
        # 6. Send Sources
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
        
        # 7. End Stream
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
    except Exception as e:
        print(f"RAG Error: {e}")
        yield f"data: {json.dumps({'type': 'error', 'content': f'Error: {str(e)}'})}\n\n"
