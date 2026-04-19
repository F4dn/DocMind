# DocMind 🧠

### AI-Powered Document Intelligence Platform

> Upload documents. Ask questions. Get answers — with cited sources, streamed in real time.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5-ff6b35?style=flat-square)](https://trychroma.com)
[![Celery](https://img.shields.io/badge/Celery-5.3-37814a?style=flat-square&logo=celery)](https://docs.celeryq.dev)
[![Redis](https://img.shields.io/badge/Redis-7-dc382d?style=flat-square&logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?style=flat-square&logo=docker)](https://docker.com)
[![Gemini](https://img.shields.io/badge/Gemini-API-4285F4?style=flat-square&logo=google)](https://aistudio.google.com)

---

## What is DocMind?

DocMind is a full-stack SaaS application that lets users upload PDF/DOCX documents and have AI-powered conversations with them. Each answer is grounded in the actual document content with cited source chunks — no hallucinations, no guesswork.

```
Upload PDF → Background Processing → Chunked & Embedded → Ask Anything → Streamed Answer + Sources
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Next.js 15)                  │
│         Auth  ·  Upload  ·  Chat (SSE Stream)  ·  Citations │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP / SSE
┌────────────────────────────▼────────────────────────────────┐
│                     FastAPI Backend                          │
│   /auth  ·  /documents  ·  /chat  ·  JWT  ·  Rate Limiting  │
└──────┬─────────────────┬──────────────────┬─────────────────┘
       │                 │                  │
┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼───────┐
│  PostgreSQL  │  │    Redis     │  │   ChromaDB    │
│  Users       │  │  Task Queue  │  │  Vector Store │
│  Documents   │  │  Celery      │  │  Embeddings   │
│  Chat Hist.  │  │  Broker      │  │  Per-user     │
└─────────────┘  └──────────────┘  └───────────────┘
                        │
              ┌─────────▼──────────┐
              │   Celery Worker    │
              │  parse → chunk     │
              │  embed → store     │
              └────────────────────┘
```

---

## Tech Stack

| Layer            | Technology             | Purpose                           |
| ---------------- | ---------------------- | --------------------------------- |
| **Frontend**     | Next.js 15, TypeScript | App Router, SSE streaming         |
| **Backend**      | FastAPI, Python 3.11   | REST API, async endpoints         |
| **Database**     | PostgreSQL 16          | Users, documents, chat history    |
| **Vector Store** | ChromaDB               | Semantic search, embeddings       |
| **Task Queue**   | Celery + Redis         | Async document ingestion          |
| **AI**           | Gemini API + LangChain | Embeddings + generation           |
| **Auth**         | JWT + bcrypt           | Secure token-based auth           |
| **Migrations**   | Alembic                | Database schema versioning        |
| **Packaging**    | uv                     | Fast Python dependency management |
| **Infra**        | Docker Compose         | One-command local dev             |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Gemini API Key](https://aistudio.google.com/app/apikey) — free tier available

### 1. Clone & Configure

```bash
git clone https://github.com/yourusername/docmind.git
cd docmind
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Start All Services

```bash
docker compose up --build
```

This spins up 5 containers: **backend**, **celery_worker**, **postgres**, **redis**, **chromadb**.

### 3. Run Database Migrations

```bash
# Init Alembic
docker compose exec backend uv run alembic init migrations

# Generate migration from models
docker compose exec backend uv run alembic revision --autogenerate -m "initial tables"

# Apply migration
docker compose exec backend uv run alembic upgrade head
```

### 4. Verify Everything Works

```bash
# Check tables were created
docker compose exec postgres psql -U docmind -d docmind -c "\dt"

# Check API is healthy
curl http://localhost:8000/health
# → {"status": "ok", "service": "docmind-api"}

# Open interactive API docs
open http://localhost:8000/docs
```

---

## Project Structure

```
docmind/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py             # App init, CORS, router registration
│   │   ├── config.py           # Pydantic settings, loads .env
│   │   ├── celery_app.py       # Celery + Redis broker config
│   │   ├── core/
│   │   │   ├── database.py     # SQLAlchemy engine + session
│   │   │   ├── vectorstore.py  # ChromaDB client, per-user collections
│   │   │   └── dependencies.py # get_current_user, get_db FastAPI deps
│   │   ├── models/
│   │   │   ├── user.py         # User model
│   │   │   ├── document.py     # Document + DocumentStatus enum
│   │   │   └── chat.py         # ChatSession + Message
│   │   ├── schemas/            # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── auth.py         # register, login, refresh
│   │   │   ├── documents.py    # upload, list, delete, status
│   │   │   └── chat.py         # query (SSE), history, sessions
│   │   ├── services/
│   │   │   ├── auth_service.py # JWT create/verify, bcrypt hash
│   │   │   ├── ingest_service.py # parse → chunk → embed → store
│   │   │   └── rag_service.py  # retrieve → rerank → generate
│   │   └── tasks/
│   │       └── ingest_task.py  # Celery task wrapping ingest_service
│   ├── migrations/             # Alembic migration files
│   ├── tests/
│   ├── pyproject.toml          # uv dependencies
│   ├── Dockerfile
│   └── .env
├── frontend/                   # Next.js 15 application
│   ├── app/
│   │   ├── (auth)/             # login, register pages
│   │   └── (dashboard)/        # protected routes
│   │       ├── dashboard/      # document list + upload
│   │       └── chat/[docId]/   # chat interface per document
│   ├── components/
│   │   ├── UploadZone.tsx      # drag-drop file upload
│   │   ├── ChatWindow.tsx      # message list + SSE stream
│   │   ├── CitationPanel.tsx   # source chunks sidebar
│   │   └── DocumentCard.tsx    # doc status badge + actions
│   └── lib/
│       ├── api.ts              # typed fetch wrapper
│       ├── auth.ts             # NextAuth config
│       └── streaming.ts        # SSE client hook
├── eval/                       # RAGAS evaluation
│   ├── golden_dataset.json     # 15 Q+A pairs for benchmarking
│   └── run_eval.py             # faithfulness, context recall, relevancy
├── docker-compose.yml
└── docker-compose.prod.yml
```

---

## API Endpoints

| Method   | Endpoint                 | Description                 |
| -------- | ------------------------ | --------------------------- |
| `GET`    | `/health`                | Service health check        |
| `POST`   | `/auth/register`         | Create new user account     |
| `POST`   | `/auth/login`            | Login, receive JWT          |
| `POST`   | `/documents/upload`      | Upload PDF/DOCX             |
| `GET`    | `/documents`             | List user's documents       |
| `DELETE` | `/documents/{id}`        | Delete document             |
| `GET`    | `/documents/{id}/status` | Check processing status     |
| `POST`   | `/chat/{docId}/query`    | Ask a question (SSE stream) |
| `GET`    | `/chat/{docId}/history`  | Get chat history            |

---

## Document Processing Pipeline

```
User uploads PDF/DOCX
        ↓
FastAPI saves file, creates DB record (status: pending)
        ↓
Celery task dispatched via Redis
        ↓
Worker: parse text (pypdf / python-docx)
        ↓
Worker: chunk into ~500 token segments with overlap
        ↓
Worker: embed chunks (Gemini embeddings)
        ↓
Worker: store in ChromaDB (per-user collection)
        ↓
DB record updated (status: ready, chunk_count: N)
        ↓
User can now chat with document
```

---

## Useful Commands

```bash
# View logs for a specific service
docker compose logs -f backend
docker compose logs -f celery_worker

# Access containers
docker compose exec backend bash
docker compose exec postgres psql -U docmind -d docmind

# Create a new Alembic migration after model changes
docker compose exec backend uv run alembic revision --autogenerate -m "add column X"
docker compose exec backend uv run alembic upgrade head

# Add a new Python package
cd backend && uv add package-name

# Run tests
docker compose exec backend uv run pytest

# Stop everything
docker compose down

# Stop and wipe all data (fresh start)
docker compose down -v
```

---

## Environment Variables

| Variable         | Description                  | Example                                              |
| ---------------- | ---------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://docmind:docmind@postgres:5432/docmind` |
| `REDIS_URL`      | Redis connection string      | `redis://redis:6379/0`                               |
| `CHROMA_HOST`    | ChromaDB host                | `chromadb`                                           |
| `CHROMA_PORT`    | ChromaDB port                | `8001`                                               |
| `SECRET_KEY`     | JWT signing key              | `openssl rand -hex 32`                               |
| `GEMINI_API_KEY` | Google Gemini API key        | `AIza...`                                            |

---

## Evaluation (RAGAS)

DocMind includes a RAGAS evaluation suite to benchmark RAG quality:

```bash
cd eval
python run_eval.py
```

Metrics tracked:

- **Faithfulness** — are answers grounded in the document?
- **Context Recall** — are relevant chunks being retrieved?
- **Answer Relevancy** — does the answer address the question?

Results are saved to `eval/results/` and should be included in the README after running.

---

## Roadmap

- [ ] Alembic migrations + Auth endpoints
- [ ] Document upload + Celery ingestion pipeline
- [ ] RAG service with Gemini
- [ ] SSE streaming chat
- [ ] Next.js frontend
- [ ] RAGAS evaluation
- [ ] Production Docker Compose
- [ ] CI/CD with GitHub Actions

---

## License

MIT
