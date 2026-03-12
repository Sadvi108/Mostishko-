Mostishko- Your Personal Second Brain, Running Locally

Chat with your notes. Find connections. Generate insights. All offline.

Mostishko is a self-hosted, AI-powered knowledge base that ingests your PDFs, articles, and notes and lets you have a conversation with everything you've ever saved — with zero data leaving your machine.
✨ Features

Chat with your knowledge — Ask questions across all your documents. Get cited, streamed answers with source excerpts
Universal ingestion — Drop PDFs, paste URLs, write plain text. It all gets chunked, embedded, and indexed
Semantic search — Hybrid retrieval (vector + keyword) finds what you mean, not just what you typed
Knowledge graph — D3.js force-directed graph showing how your documents and concepts connect
Synthesis mode — Generate structured reports and summaries from scattered notes on any topic
100% local with Ollama — No OpenAI key required. Runs entirely on your machine using nomic-embed-text for embeddings and any Ollama model for chat

🏗️ Architecture
LayerTechnologyFrontendNext.js 14 (App Router), Tailwind CSS, shadcn/uiBackendFastAPI (Python 3.11), SQLAlchemyVector DBQdrant (self-hosted)Relational DBSQLite + FTS5 for hybrid searchLLM / EmbeddingsOllama (local) — nomic-embed-text + llama3Background JobsRedis + ARQGraph VizD3.js force-directedDeploymentDocker Compose — one command setup
🚀 Quick Start
bashgit clone https://github.com/Sadvi108/Mostishko
cd mostishko
cp .env.example .env
docker compose up --build
# Open http://localhost:3000
