from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_tables
from .routers import ingest, documents, chat, search, graph, health, settings
import uvicorn

app = FastAPI(title="Personal Second Brain API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
def on_startup():
    create_tables()

# Include routers
app.include_router(ingest.router, tags=["Ingestion"])
app.include_router(documents.router, tags=["Documents"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(search.router, tags=["Search"])
app.include_router(graph.router, tags=["Graph"])
app.include_router(health.router, tags=["Health"])
app.include_router(settings.router, tags=["Settings"])

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
