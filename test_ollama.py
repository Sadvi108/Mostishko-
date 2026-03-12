
import asyncio
import aiohttp
import json
import os

OLLAMA_BASE_URL = "http://localhost:11434"
MODEL = "llama3.2"

async def test_ollama():
    print(f"Testing connection to {OLLAMA_BASE_URL} with model {MODEL}...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": "Hello"}],
                    "stream": False
                }
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print("Success!")
                    print("Response:", data.get("message", {}).get("content"))
                else:
                    print(f"Failed with status {response.status}")
                    print(await response.text())
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_ollama())
