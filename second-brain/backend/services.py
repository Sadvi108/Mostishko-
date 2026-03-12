
import json
import os
import aiohttp
import random
import asyncio
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from qdrant_client import QdrantClient

# Initialize clients
openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    openai_key = "dummy-key-for-local-mode"
openai_client = AsyncOpenAI(api_key=openai_key)

anthropic_key = os.getenv("ANTHROPIC_API_KEY")
if not anthropic_key:
    anthropic_key = "dummy-key-for-local-mode"
anthropic_client = AsyncAnthropic(api_key=anthropic_key)

qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
if qdrant_url == ":memory:":
    qdrant_client = QdrantClient(location=":memory:")
elif qdrant_url.startswith("path:"):
    qdrant_client = QdrantClient(path=qdrant_url.replace("path:", ""))
else:
    qdrant_client = QdrantClient(url=qdrant_url)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

async def get_embedding(text: str) -> list[float]:
    provider = os.getenv("EMBEDDING_PROVIDER", "openai")
    
    if provider == "ollama":
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{OLLAMA_BASE_URL}/api/embeddings",
                    json={
                        "model": "nomic-embed-text",
                        "prompt": text
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["embedding"]
                    else:
                        print(f"Ollama embedding error: {await response.text()}")
                        # Fallback to dummy
                        print("Falling back to dummy embedding (Ollama error)")
                        return [random.uniform(-1, 1) for _ in range(768)]
            except Exception as e:
                print(f"Ollama connection failed: {e}")
                print("Falling back to dummy embedding (Ollama unavailable)")
                # Fallback to dummy
                return [random.uniform(-1, 1) for _ in range(768)]
    else:
        # Default to OpenAI
        try:
            response = await openai_client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"OpenAI embedding failed: {e}")
            return [random.uniform(-1, 1) for _ in range(1536)]

async def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    provider = os.getenv("EMBEDDING_PROVIDER", "openai")
    
    if provider == "ollama":
        embeddings = []
        for text in texts:
            emb = await get_embedding(text)
            embeddings.append(emb)
        return embeddings
    else:
        try:
            response = await openai_client.embeddings.create(
                input=texts,
                model="text-embedding-3-small"
            )
            return [data.embedding for data in response.data]
        except Exception:
             # Fallback loop using single get_embedding (which has fallback)
            embeddings = []
            for text in texts:
                emb = await get_embedding(text)
                embeddings.append(emb)
            return embeddings

async def chat_stream(messages: list[dict], system_prompt: str):
    provider = os.getenv("LLM_PROVIDER", "anthropic")
    model = os.getenv("LLM_MODEL", "llama3")
    
    if provider == "ollama":
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{OLLAMA_BASE_URL}/api/chat",
                    json={
                        "model": model,
                        "messages": full_messages,
                        "stream": True
                    }
                ) as response:
                    if response.status != 200:
                         error_text = await response.text()
                         raise Exception(f"Status {response.status}: {error_text}")
                         
                    async for line in response.content:
                        if line:
                            try:
                                line_text = line.decode('utf-8')
                                data = json.loads(line_text)
                                if "message" in data and "content" in data["message"]:
                                    yield data["message"]["content"]
                                if data.get("done", False):
                                    break
                            except json.JSONDecodeError:
                                pass
        except Exception as e:
            print(f"Ollama chat failed: {e}")
            yield f"Error: Unable to connect to Ollama. Details: {str(e)}\n\n"
            yield "Please check if 'ollama serve' is running and if you have pulled the model 'llama3'."
            
    else:
        # Default to Anthropic
        try:
            stream = await anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1024,
                system=system_prompt,
                messages=messages,
                stream=True
            )
            
            async for event in stream:
                if event.type == "content_block_delta":
                    yield event.delta.text
        except Exception as e:
            print(f"Anthropic chat failed: {e}")
            yield "I am unable to connect to the AI provider. Please check your API keys."

async def chat_completion(messages: list[dict], system_prompt: str) -> str:
    full_response = ""
    async for chunk in chat_stream(messages, system_prompt):
        full_response += chunk
    return full_response
