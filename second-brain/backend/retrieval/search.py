
import os
from sqlalchemy.orm import Session
from sqlalchemy import or_
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from ..models import Chunk, Document
from ..services import get_embedding, qdrant_client

# Initialize clients
# qdrant_client and openai_client managed in services.py

COLLECTION_NAME = "knowledge_chunks"
VECTOR_SIZE = 1536

async def get_embedding_wrapper(text: str) -> list[float]:
    return await get_embedding(text)

def search_vector(query_vector: list[float], limit: int = 20) -> list[dict]:
    try:
        results = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=limit,
            with_payload=True
        )
        return [
            {
                "chunk_id": hit.payload["chunk_id"],
                "document_id": hit.payload["document_id"],
                "content": hit.payload["content"],
                "score": hit.score,
                "type": "vector"
            }
            for hit in results
        ]
    except Exception as e:
        print(f"Vector search failed: {e}")
        return []

def search_keyword(query_text: str, db: Session, limit: int = 20) -> list[dict]:
    # Simple keyword search using ILIKE as a fallback for FTS5
    # Split query into terms and find chunks containing ANY of the terms
    terms = query_text.split()
    if not terms:
        return []
    
    # Construct a query that matches chunks containing the query text
    # Ideally FTS5 would be used here. For now, we use ILIKE on the content.
    # We prioritize exact phrase match, then individual terms.
    
    # Simple implementation: ILIKE %query%
    results = db.query(Chunk).filter(Chunk.content.ilike(f"%{query_text}%")).limit(limit).all()
    
    return [
        {
            "chunk_id": chunk.embedding_id,
            "document_id": chunk.document_id,
            "content": chunk.content[:200], # Preview
            "score": 1.0, # Dummy score for keyword match
            "type": "keyword"
        }
        for chunk in results
    ]

def reciprocal_rank_fusion(vector_results: list[dict], keyword_results: list[dict], k: int = 60) -> list[dict]:
    scores = {}
    
    # Combine results
    for rank, result in enumerate(vector_results):
        doc_id = result["chunk_id"]
        if doc_id not in scores:
            scores[doc_id] = {"score": 0, "item": result}
        scores[doc_id]["score"] += 1 / (k + rank + 1)
        
    for rank, result in enumerate(keyword_results):
        doc_id = result["chunk_id"]
        if doc_id not in scores:
            scores[doc_id] = {"score": 0, "item": result}
        scores[doc_id]["score"] += 1 / (k + rank + 1)
    
    # Sort by score descending
    sorted_results = sorted(scores.values(), key=lambda x: x["score"], reverse=True)
    return [item["item"] for item in sorted_results]

async def hybrid_search(query: str, db: Session, limit: int = 10) -> list[dict]:
    # 1. Generate embedding for query
    query_vector = await get_embedding_wrapper(query)
    
    # 2. Parallel search (in theory, but synchronous DB call blocks)
    vector_results = search_vector(query_vector, limit=20)
    keyword_results = search_keyword(query, db, limit=20)
    
    # 3. RRF Fusion
    merged_results = reciprocal_rank_fusion(vector_results, keyword_results)
    
    # 4. Enrich with document metadata if needed (already in payload)
    # Just return top K
    return merged_results[:limit]
