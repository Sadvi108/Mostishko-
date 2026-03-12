# Mostishko — Your Personal Second Brain, Running Locally

**Chat with your notes. Find connections. Generate insights. All offline.**

Mostishko is a self-hosted, AI-powered knowledge base that ingests your PDFs, articles, and notes and lets you have a conversation with everything you've ever saved — with zero data leaving your machine.

## ✨ Features

- **Chat with your knowledge** — Ask questions across all your documents. Get cited, streamed answers with source excerpts.
- **Universal ingestion** — Drop PDFs, paste URLs, write plain text. It all gets chunked, embedded, and indexed.
- **Semantic search** — Hybrid retrieval (vector + keyword) finds what you mean, not just what you typed.
- **Knowledge graph** — D3.js force-directed graph showing how your documents and concepts connect.
- **Synthesis mode** — Generate structured reports and summaries from scattered notes on any topic.
- **100% local with Ollama** — No OpenAI key required. Runs entirely on your machine using `nomic-embed-text` for embeddings and any Ollama model for chat.

## 🏗️ Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy |
| **Vector DB** | Qdrant (self-hosted) |
| **Relational DB** | SQLite + FTS5 for hybrid search |
| **LLM / Embeddings** | Ollama (local) — `nomic-embed-text` + `llama3` |
| **Background Jobs** | Redis + ARQ |
| **Graph Viz** | D3.js force-directed |
| **Deployment** | Docker Compose — one command setup |

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) (if running with Docker Compose)
- [Ollama](https://ollama.com/) (for local LLM support)

### Quick Start (Local)

1.  **Install Ollama** and pull the required models:
    ```bash
    ollama pull llama3
    ollama pull nomic-embed-text
    ```

2.  **Start the Backend**:
    ```bash
    cd second-brain/backend
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

3.  **Start the Frontend**:
    ```bash
    cd second-brain/frontend
    npm install
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) and start chatting with your brain!
