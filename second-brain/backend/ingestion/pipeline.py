import os
import tiktoken
import uuid
import json
from sqlalchemy.orm import Session
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from ..models import Document, Chunk, Entity
from .parsers import parse_pdf, parse_docx, parse_text, parse_url
from ..services import get_embeddings_batch, anthropic_client, qdrant_client, chat_completion

# Initialize clients
# openai_client and anthropic_client and qdrant_client are managed in services.py

COLLECTION_NAME = "knowledge_chunks"
VECTOR_SIZE = 1536

def ensure_collection_exists():
    collections = qdrant_client.get_collections()
    exists = any(c.name == COLLECTION_NAME for c in collections.collections)
    if not exists:
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(
                size=VECTOR_SIZE,
                distance=qmodels.Distance.COSINE
            )
        )

# Ensure collection exists on startup (or when module loads, though better on startup event)
try:
    ensure_collection_exists()
except Exception as e:
    print(f"Warning: Could not connect to Qdrant: {e}")

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> list[str]:
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []
    
    start = 0
    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunks.append(enc.decode(chunk_tokens))
        start += (chunk_size - overlap)
    
    return chunks

async def get_embeddings(texts: list[str]) -> list[list[float]]:
    return await get_embeddings_batch(texts)

async def extract_entities(text: str) -> list[dict]:
    # Truncate text if too long for extraction context (e.g. 100k chars)
    # Claude 3 Sonnet has 200k context, but let's be safe and economical
    truncated_text = text[:50000]
    
    prompt = f"""Extract named entities (people, concepts, technologies, organizations) from the following text.
Return ONLY a valid JSON object with this structure: 
{{
  "entities": [
    {{"name": "Entity Name", "type": "Entity Type", "mentions": 1}}
  ]
}}
Do not include any other text.

Text:
{truncated_text}"""

    try:
        content = await chat_completion(
            messages=[{"role": "user", "content": prompt}],
            system_prompt="You are an expert entity extractor."
        )
        
        # Find JSON in response (in case of chatter)
        start = content.find('{')
        end = content.rfind('}') + 1
        if start != -1 and end != -1:
            json_str = content[start:end]
            data = json.loads(json_str)
            return data.get("entities", [])
        return []
    except Exception as e:
        print(f"Entity extraction failed: {e}")
        return []

async def ingest_document(
    db: Session, 
    file_content: bytes = None, 
    filename: str = None, 
    file_type: str = None, 
    url: str = None
):
    # 1. Parse content
    text_content = ""
    source_type = file_type if file_type else "url"
    source_identifier = filename if filename else url
    
    if url:
        text_content = parse_url(url)
        source_type = "url"
        source_identifier = url
    elif file_type == "pdf":
        text_content = parse_pdf(file_content)
    elif file_type == "docx":
        text_content = parse_docx(file_content)
    elif file_type == "text":
        text_content = parse_text(file_content)
    else:
        raise ValueError("Unsupported file type")
        
    if not text_content:
        raise ValueError("No text content extracted")

    # 2. Create Document record
    doc = Document(
        title=source_identifier,
        content=text_content,
        source_type=source_type,
        source_url=url if url else None
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # 3. Chunk content
    chunks_text = chunk_text(text_content)
    
    if not chunks_text:
        return {"status": "success", "message": "Document empty, no chunks created", "document_id": doc.id}

    # 4. Embed chunks
    # Process in batches if too many chunks (optional optimization)
    embeddings = await get_embeddings(chunks_text)
    
    # 5. Store chunks in DB and Qdrant
    points = []
    db_chunks = []
    
    for i, (chunk_text_str, embedding) in enumerate(zip(chunks_text, embeddings)):
        chunk_id = str(uuid.uuid4())
        
        # DB Chunk
        db_chunk = Chunk(
            document_id=doc.id,
            content=chunk_text_str,
            chunk_index=i,
            embedding_id=chunk_id
        )
        db_chunks.append(db_chunk)
        
        # Qdrant Point
        points.append(qmodels.PointStruct(
            id=chunk_id,
            vector=embedding,
            payload={
                "chunk_id": chunk_id,
                "document_id": doc.id,
                "document_title": doc.title,
                "source_type": doc.source_type,
                "chunk_index": i,
                "content": chunk_text_str[:200] # Store preview
            }
        ))
    
    db.add_all(db_chunks)
    db.commit()
    
    # Upload to Qdrant
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    
    # 6. Extract and store entities
    entities = await extract_entities(text_content)
    db_entities = []
    for ent in entities:
        # Check if entity already exists for this document (simple dedup)
        # For now just add all extracted ones
        db_entity = Entity(
            name=ent["name"],
            type=ent["type"],
            document_id=doc.id
        )
        db_entities.append(db_entity)
    
    if db_entities:
        db.add_all(db_entities)
        db.commit()
    
    return {"status": "success", "document_id": doc.id, "chunks_count": len(chunks_text), "entities_count": len(db_entities)}
