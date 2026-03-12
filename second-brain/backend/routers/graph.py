
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Document, Entity

router = APIRouter()

@router.get("/api/graph")
async def get_knowledge_graph(db: Session = Depends(get_db)):
    # 1. Fetch all documents (Nodes)
    documents = db.query(Document).all()
    
    nodes = []
    for doc in documents:
        # Calculate size based on word count (approx)
        word_count = len(doc.content.split())
        nodes.append({
            "id": doc.id,
            "label": doc.title,
            "type": doc.source_type,
            "val": max(word_count / 100, 5) # Normalize size, min size 5
        })
        
    # 2. Fetch shared entities (Edges)
    # We want to find pairs of documents that share the same entity name
    
    # Get all entities
    entities = db.query(Entity).all()
    
    # Group entities by name
    entity_map = {}
    for ent in entities:
        if ent.name not in entity_map:
            entity_map[ent.name] = []
        entity_map[ent.name].append(ent)
        
    edges = []
    processed_pairs = set()
    
    for name, ents in entity_map.items():
        if len(ents) < 2:
            continue
            
        # Create edges between all pairs of documents sharing this entity
        # This is a clique expansion
        doc_ids = sorted(list(set(e.document_id for e in ents)))
        
        for i in range(len(doc_ids)):
            for j in range(i + 1, len(doc_ids)):
                source = doc_ids[i]
                target = doc_ids[j]
                
                pair_key = (source, target)
                
                # Check if edge already exists, if so increment weight
                # But here we are iterating by entity, so we might encounter the same pair multiple times
                # We need to aggregate weights
                found = False
                for edge in edges:
                    if edge["source"] == source and edge["target"] == target:
                        edge["weight"] += 1
                        edge["shared_entities"].append(name)
                        found = True
                        break
                
                if not found:
                    edges.append({
                        "source": source,
                        "target": target,
                        "weight": 1,
                        "shared_entities": [name]
                    })
                    
    return {"nodes": nodes, "links": edges}
