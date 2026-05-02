# DocMind — AI Document Intelligence

> Upload any document. Ask anything. Get cited answers, streamed in real time.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-docmind.vercel.app-A855F7?style=flat-square)](https://doc-mind-kappa.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-10B981?style=flat-square)](LICENSE)

---

## What is DocMind?

DocMind is a full-stack **Retrieval-Augmented Generation (RAG)** application. Upload a PDF, DOCX, or TXT file — DocMind chunks, embeds, and stores it in a vector database, then lets you ask questions in natural language. Every answer is grounded in your source material with inline citations and streamed token-by-token in real time.

Built as a portfolio project demonstrating production-grade AI engineering across the full stack: async document processing, semantic vector search, LLM streaming, multi-tenant isolation, and a modern glassmorphic UI.

---

## RAG Pipeline

### Ingestion (async, non-blocking)

```
Upload PDF / DOCX / TXT
        │
        ▼
FastAPI saves file → DB record created (status: pending)
        │
        ▼  Celery task dispatched via Redis
Celery Worker picks up task
        ├── pdfplumber parses file (preserves spacing)
        ├── RecursiveCharacterTextSplitter → 512-token chunks, 50 overlap
        ├── Embedding model → dense vectors per chunk
        ├── ChromaDB stores vectors + metadata (doc_id, user_id, page, chunk_index)
        └── PostgreSQL updated: status=ready, chunk_count=N

Frontend polls GET /documents/{id}/status every 3s
```

### Query (real-time streaming)

```
User asks: "What attention mechanism does the Transformer use?"
        │
        ▼
Multi-query expansion → LLM generates 3 rephrasings of the question
        │
        ▼
ChromaDB semantic search
  - Filtered by user_id + document_id at DB level (not after retrieval)
  - Top-20 chunks per query variant → deduplicated
        │
        ▼
CrossEncoder reranker (ms-marco-MiniLM-L-6-v2)
  - Re-scores all candidates with full attention over query+chunk
  - Selects top-5 most relevant chunks
        │
        ▼
Cited prompt → LLM generates answer with [chunk_N] inline citations
        │
        ▼
Server-Sent Events stream tokens to browser one by one
PostgreSQL stores message + sources for session history
```

---

## Tech Stack

| Layer           | Technology                                                      |
| --------------- | --------------------------------------------------------------- |
| **Frontend**    | Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion |
| **Backend**     | FastAPI, SQLAlchemy, Alembic, PostgreSQL                        |
| **AI / RAG**    | LangChain, Pluggable LLM (Gemini / OpenAI / HuggingFace)        |
| **Embeddings**  | Pluggable (Gemini text-embedding-004 / OpenAI / HuggingFace)    |
| **Retrieval**   | ChromaDB, Multi-query expansion, CrossEncoder reranking         |
| **Async tasks** | Celery + Redis                                                  |
| **Auth**        | JWT (access + refresh tokens, bcrypt)                           |
| **PDF parsing** | pdfplumber (preserves character spacing)                        |
| **Evaluation**  | RAGAS (faithfulness, answer relevancy, context recall)          |
| **Packaging**   | Docker, uv                                                      |

---

## Project Structure

```
docmind/
├── backend/
│   ├── Dockerfile                  # Production multi-stage build
│   ├── Dockerfile.dev              # Local dev with hot reload
│   ├── start.sh                    # Runs migrations + celery + uvicorn
│   ├── pyproject.toml              # Dependencies managed with uv
│   └── app/
│       ├── main.py                 # FastAPI app, CORS, router registration
│       ├── config.py               # Pydantic settings from .env
│       ├── celery_app.py           # Celery + Redis broker config
│       ├── core/
│       │   ├── database.py         # SQLAlchemy engine + session factory
│       │   ├── vectorstore.py      # ChromaDB client (local + cloud)
│       │   ├── dependencies.py     # FastAPI deps: get_current_user, get_db
│       │   ├── embeddings/         # Pluggable: Gemini, OpenAI, HuggingFace
│       │   └── llm/                # Pluggable: Gemini, OpenAI, HuggingFace
│       ├── models/                 # SQLAlchemy: User, Document, ChatSession, Message
│       ├── schemas/                # Pydantic request/response models
│       ├── routers/
│       │   ├── auth.py             # register, login, refresh, me
│       │   ├── documents.py        # upload, list, status, delete
│       │   └── chat.py             # query (SSE), sessions, history
│       ├── services/
│       │   ├── auth_service.py     # JWT create/verify, bcrypt, user CRUD
│       │   ├── ingest_service.py   # parse → chunk → embed → store
│       │   └── rag_service.py      # multi-query → rerank → stream
│       └── tasks/
│           └── ingest_task.py      # Celery task wrapping ingest_service
│
├── frontend/
│   ├── app/
│   │   ├── (marketing)/            # Landing page, public routes
│   │   │   └── page.tsx            # Hero, features, how it works, pricing, CTA
│   │   ├── (auth)/                 # Animated split-screen auth
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (app)/                  # Protected app shell
│   │       ├── layout.tsx          # Sidebar + topbar + auth guard
│   │       ├── dashboard/page.tsx  # Upload zone + document grid + stats
│   │       ├── chat/[docId]/       # Three-column chat workspace
│   │       ├── library/page.tsx    # All documents with search + filters
│   │       └── settings/page.tsx   # Account tabs
│   ├── components/
│   │   ├── marketing/              # Hero, FeatureGrid, HowItWorks, Pricing, CTA
│   │   ├── auth/                   # AuthShell (split-screen), AuthInput
│   │   ├── app/
│   │   │   ├── Sidebar.tsx         # Collapsible nav with active route indicator
│   │   │   ├── Topbar.tsx          # Search bar, notifications, user avatar
│   │   │   ├── UploadZone.tsx      # Drag-drop with progress bar
│   │   │   ├── DocumentCard.tsx    # Animated status badge, polling
│   │   │   ├── ChatWindow.tsx      # Message list + SSE streaming display
│   │   │   ├── StreamingMessage.tsx# Token-by-token typing + cursor
│   │   │   ├── CitationPanel.tsx   # Right-side source chunks (xl screens)
│   │   │   ├── CitationCard.tsx    # Individual chunk with score bar
│   │   │   ├── SourcesDrawer.tsx   # Slide-in drawer for smaller screens
│   │   │   ├── ChatInput.tsx       # Auto-resize textarea, send button
│   │   │   └── SessionList.tsx     # Previous conversations sidebar
│   │   └── shared/                 # GlassCard, GlowButton, GradientBlob, Logo
│   └── lib/
│       ├── api.ts                  # Axios client + all typed API calls
│       ├── useStream.ts            # SSE streaming hook with retry logic
│       ├── useAuth.ts              # Auth guard hook
│       └── utils.ts                # cn(), formatDate(), formatFileSize()
│
├── eval/
│   ├── golden_dataset.json         # 15 Q&A pairs from Attention Is All You Need
│   ├── run_eval.py                 # RAGAS evaluation pipeline
│   └── results/
│       └── latest.json             # Most recent evaluation output
│
├── docker-compose.yml              # Local dev: FastAPI + Celery + PG + Redis + ChromaDB
└── render.yaml                     # Render infrastructure as code
```

---

## API Reference

### Auth

```bash
POST /auth/register   {"email": "...", "password": "..."}
POST /auth/login      {"email": "...", "password": "..."}  → access_token + refresh_token
POST /auth/refresh    {"refresh_token": "..."}
GET  /auth/me         → current user info

# All protected endpoints require:
Authorization: Bearer <access_token>
```

### Documents

```bash
POST   /documents/upload              # multipart/form-data, file field
GET    /documents/                    # list all user documents
GET    /documents/{id}/status         # pending | processing | ready | failed
DELETE /documents/{id}                # removes DB record + vectors + file
```

### Chat

```bash
POST /chat/query
{
  "document_id": "uuid",
  "question": "What is multi-head attention?",
  "session_id": null    # null = new session, uuid = continue existing
}

# SSE events received in order:
# data: {"type": "session_id", "session_id": "uuid"}
# data: {"type": "token",      "content": "Multi"}
# data: {"type": "token",      "content": "-head"}
# data: {"type": "sources",    "sources": [...]}
# data: {"type": "done"}

GET /chat/sessions?document_id=uuid   # list sessions for a document
GET /chat/sessions/{session_id}       # session + full message history
```

---

## Running Locally

**Prerequisites:** Docker + Docker Compose + API key for your chosen LLM provider

```bash
# 1. Clone
git clone https://github.com/F4dn/DocMind.git
cd DocMind

# 2. Create .env in project root
cat > .env << EOF
GEMINI_API_KEY=your-gemini-key
# or
HUGGINGFACE_API_KEY=your-hf-key

EMBEDDING_PROVIDER=gemini   # gemini | openai | huggingface
LLM_PROVIDER=gemini         # gemini | openai | huggingface
EOF

# 3. Start all services
docker compose up --build

# 4. Run migrations (first time only)
docker compose exec backend alembic upgrade head
```

| Service       | URL                        |
| ------------- | -------------------------- |
| Frontend      | http://localhost:3000      |
| API + Swagger | http://localhost:8000/docs |
| ChromaDB      | http://localhost:8001      |

### Adding Python packages

```bash
cd backend
uv add package-name          # production dependency
uv add --dev package-name    # dev only (eval, linting)

# Rebuild containers after adding
docker compose up --build backend celery_worker
```

---

## Evaluation (RAGAS)

Evaluated on 15 questions from the _Attention Is All You Need_ paper (Vaswani et al., 2017).
RAGAS judge: Gemini 1.5 Flash. App answer generation: HuggingFace.

| Metric               | What it measures                                            | Score |
| -------------------- | ----------------------------------------------------------- | ----- |
| **Faithfulness**     | Answers stay grounded in retrieved chunks, no hallucination | —     |
| **Answer Relevancy** | Answers actually address the question asked                 | —     |
| **Context Recall**   | Retrieved chunks contain the information needed             | —     |
| **Overall**          | Average across all three metrics                            | —     |

_Run the evaluation yourself to populate these scores:_

```bash
# Add eval volume to docker-compose.yml backend service first:
# - ./eval:/app/eval

docker compose exec backend python eval/run_eval.py \
  --email    your@email.com \
  --password yourpassword \
  --doc-id   YOUR_DOC_UUID \
  --delay    12
```

Results are saved to `eval/results/latest.json`.

---

## Key Engineering Decisions

**Document-level ChromaDB filtering at query time, not after retrieval.**
If you retrieve top-20 globally then filter by document, all 20 results might belong to other documents — leaving zero relevant chunks. Pushing `document_id` into the ChromaDB `where` clause ensures retrieval is always scoped to the correct document regardless of collection size.

**Two-stage retrieval: bi-encoder + cross-encoder.**
Embedding-based search is fast but approximate — it compares query and chunk independently. The CrossEncoder reads query and chunk together with full attention, giving much more precise relevance scores. Using both stages gives the speed of vector search with the quality of cross-attention reranking.

**Lazy provider imports.**
LLM and embedding providers (Gemini, OpenAI, HuggingFace) are only imported inside `if` blocks when actually used. An unconfigured provider's heavyweight dependencies (like `sentence_transformers`) never get imported, preventing startup crashes in production when only one provider is configured.

**Non-blocking ingestion via Celery.**
Document processing (parse → chunk → embed → store) takes 5–30 seconds. Running this synchronously blocks the API worker for every other user during that time. Celery offloads it to a background worker — the upload endpoint returns in milliseconds and the frontend polls for status updates.

**SSE over WebSockets for streaming.**
Server-Sent Events are unidirectional (server → client), which is all LLM streaming needs. They require no upgrade handshake, work through standard HTTP proxies, and browsers reconnect automatically on failure. WebSockets would add bidirectional complexity for no benefit here.

**Multi-tenant vector isolation.**
Each user gets their own ChromaDB collection (`user_{uuid}`). Even if two users upload the same document, their vectors live in completely separate namespaces. Queries are always scoped to the requesting user's collection — no cross-tenant data leakage is possible.

---

## Local vs Production

|            | Local                                       | Production                               |
| ---------- | ------------------------------------------- | ---------------------------------------- |
| Dockerfile | `Dockerfile.dev` — single stage, hot reload | `Dockerfile` — multi-stage, slim runtime |
| Celery     | Separate container                          | Same container via `start.sh`            |
| ChromaDB   | Local Docker container                      | Chroma Cloud (free, persistent)          |
| Redis      | Local Docker container                      | Upstash (serverless, free tier)          |
| Migrations | Manual `alembic upgrade head`               | Auto-runs in `start.sh` on deploy        |
| uvicorn    | `--reload` flag                             | No reload, production config             |

---

## License

MIT — free to use, modify, and deploy.

---

_Built by [Fardeen Qamar](https://github.com/F4dn) · MSc Computational Modeling and Simulation · TU Dresden_
