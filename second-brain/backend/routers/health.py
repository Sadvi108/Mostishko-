
import os
import aiohttp
from fastapi import APIRouter

router = APIRouter()

@router.get("/api/health/llm")
async def health_check_llm():
    provider = os.getenv("LLM_PROVIDER", "anthropic")
    embedding_provider = os.getenv("EMBEDDING_PROVIDER", "openai")
    
    status = {
        "llm_provider": provider,
        "embedding_provider": embedding_provider,
        "ollama_status": "unknown"
    }
    
    # Check Ollama status if either provider uses it
    if provider == "ollama" or embedding_provider == "ollama":
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{ollama_url}/api/tags") as response:
                    if response.status == 200:
                        status["ollama_status"] = "connected"
                        data = await response.json()
                        status["ollama_models"] = [m["name"] for m in data.get("models", [])]
                    else:
                        status["ollama_status"] = f"error: {response.status}"
        except Exception as e:
            status["ollama_status"] = f"unreachable: {str(e)}"
            
    return status

@router.post("/api/settings")
async def update_settings(settings: dict):
    # In a real app, these should be persisted to a .env file or database
    # For now, we update os.environ for the current session
    
    if "LLM_PROVIDER" in settings:
        os.environ["LLM_PROVIDER"] = settings["LLM_PROVIDER"]
    if "EMBEDDING_PROVIDER" in settings:
        os.environ["EMBEDDING_PROVIDER"] = settings["EMBEDDING_PROVIDER"]
    if "LLM_MODEL" in settings:
        os.environ["LLM_MODEL"] = settings["LLM_MODEL"]
    if "OLLAMA_BASE_URL" in settings:
        os.environ["OLLAMA_BASE_URL"] = settings["OLLAMA_BASE_URL"]
        
    # Also update API keys if provided
    if "OPENAI_API_KEY" in settings and settings["OPENAI_API_KEY"]:
        os.environ["OPENAI_API_KEY"] = settings["OPENAI_API_KEY"]
    if "ANTHROPIC_API_KEY" in settings and settings["ANTHROPIC_API_KEY"]:
        os.environ["ANTHROPIC_API_KEY"] = settings["ANTHROPIC_API_KEY"]
        
    return {"status": "updated", "current_settings": {
        "LLM_PROVIDER": os.environ.get("LLM_PROVIDER"),
        "EMBEDDING_PROVIDER": os.environ.get("EMBEDDING_PROVIDER"),
        "LLM_MODEL": os.environ.get("LLM_MODEL"),
        "OLLAMA_BASE_URL": os.environ.get("OLLAMA_BASE_URL")
    }}
