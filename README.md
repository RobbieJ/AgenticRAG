# Agentic RAG — Interactive Demo

A presentation-ready web app that demonstrates **RAG** and **Agentic RAG** concepts
with animated flow diagrams driven by **real, executing code**. Built to let a
presenter walk an audience through the three flow diagrams in real time: the diagram
lights up step-by-step in lockstep with the live execution panel beside it.

Three demos:

1. **What is Agentic AI?** — the `PLAN → ACT → OBSERVE → REFLECT` loop and the
   capabilities behind it (planning, tool use, memory, reflection, autonomy).
2. **Classic RAG vs Agentic RAG** — a side-by-side walkthrough of why a single-shot
   pipeline fails where a reasoning loop succeeds.
3. **Agentic RAG: the reasoning loop** — *interactive and live*. Type a question and
   watch the agent **plan → retrieve → evaluate → (refine ↺) → generate → verify →
   answer**, against a real in-process vector search, with the answer streamed token
   by token.

---

## Why it's robust for live demos

- **No external infrastructure.** Retrieval is a real in-process TF-IDF vector
  search (NumPy) — no Docker, no Weaviate, nothing to fall over mid-talk.
- **Works offline.** With no credentials the backend runs in **DEMO mode** and
  returns deterministic, grounded answers so the whole UI still works on a plane.
- **Bring your own LLM.** The agentic-loop demo runs live against any of three
  providers — **Anthropic Claude**, **OpenAI**, or a **local vLLM** model — chosen
  with a single `LLM_PROVIDER` setting.

## LLM providers

Pick one via `LLM_PROVIDER` in `backend/.env`. Each provider implements the same
`plan / evaluate / generate` interface (`backend/services/llm/`), so the agentic
loop is identical regardless of backend.

| `LLM_PROVIDER` | Needs | Notes |
|----------------|-------|-------|
| `anthropic` | `ANTHROPIC_API_KEY` | Claude — `claude-haiku-4-5` (plan/evaluate) + `claude-sonnet-4-6` (answer) |
| `openai` | `OPENAI_API_KEY` | OpenAI or any OpenAI-compatible hosted API (`OPENAI_BASE_URL`) |
| `vllm` | a running vLLM server + `VLLM_MODEL` | Local model via vLLM's OpenAI-compatible API |

Leave the selected provider's credentials blank to stay in DEMO mode.

**Running a local model with vLLM:**

```bash
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct --port 8001
```

Then in `backend/.env`:

```bash
LLM_PROVIDER=vllm
VLLM_BASE_URL=http://localhost:8001/v1
VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

(OpenAI and vLLM share one code path — vLLM just points the OpenAI SDK at a local
`base_url`.)

---

## Architecture

```
Browser (Next.js, React, SVG diagrams)
   │  EventSource GET /demo/stream?demoType=...&query=...   (Server-Sent Events)
   ▼
FastAPI backend
   ├─ DemoOrchestrator        emits diagram-synced steps
   ├─ InMemoryRetriever       real TF-IDF + cosine vector search (NumPy)
   └─ LLMService              plan / evaluate / generate (streamed)
          │  one interface, pluggable backend (LLM_PROVIDER)
          ▼
   Anthropic Claude  ·  OpenAI  ·  local vLLM   (optional — DEMO mode if absent)
```

Each streamed step carries `highlight` node IDs that exactly match the IDs in the
React diagram components, which is what keeps the picture and the code in sync.

---

## Quick start

> **One command:** `./scripts/dev.sh` boots both servers (creates the venv and
> installs deps on first run). Full local + eval guide in **[RUNNING.md](RUNNING.md)**.

### 1. Backend (run from the repo root)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt

# optional: go live — pick a provider and add its credentials
cp backend/.env.example backend/.env   # then set LLM_PROVIDER + that provider's keys

uvicorn backend.main:app --reload --port 8000
```

Backend is at `http://localhost:8000` (`/health`, `/docs`, `/demo/stream`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

> If the backend runs somewhere other than `http://localhost:8000`, set
> `NEXT_PUBLIC_BACKEND_URL` (see `frontend/.env.local.example`).

---

## Tests

```bash
source .venv/bin/activate
pytest                 # backend: retrieval relevance + full loop in DEMO mode

cd frontend
npm run typecheck      # frontend types
npm run build          # production build
```

---

## Project layout

```
backend/
  main.py                     FastAPI app (run as backend.main:app)
  config.py                   settings + DEMO-mode detection
  models/
    schemas.py                request + streamed-event models
    demo_data.py              the demo knowledge base + example queries
  services/
    retrieval.py              real in-process TF-IDF vector search
    demo_orchestrator.py      drives all three demos, emits diagram-synced events
    llm/                      pluggable LLM backends behind one interface
      base.py                 LLMService protocol + shared prompts/parsing
      anthropic_provider.py   Claude
      openai_provider.py      OpenAI + vLLM (OpenAI-compatible)
      demo_provider.py        deterministic offline fallback
  routers/
    demo.py                   GET /demo/stream (SSE), /demo/examples
    health.py                 GET /health
  tests/                      retrieval + orchestrator tests

frontend/
  app/                        Next.js app router (home + /demo/[type])
  components/
    DemoLayout.tsx            orchestrates a demo: input, stream, diagram + flow
    DiagramViewer.tsx         dispatches to the right diagram
    diagrams/                 animated SVG diagrams (node IDs match backend)
    ExecutionFlow.tsx         live step list
    DemoStep.tsx              one step (code, docs, score, streamed answer)
    BackendStatus.tsx         online / DEMO-vs-LIVE banner
  hooks/useDemo.ts            Zustand store (merges streamed answer deltas)
  lib/api-client.ts           EventSource SSE client + health/examples

public/diagrams/              the original Excalidraw source diagrams (design reference)
```

---

## Swapping in a production vector store

`backend/services/retrieval.py` exposes a single `retrieve(query, top_k)` method.
To move from the in-process index to a managed vector database (Weaviate, Pinecone,
pgvector, …), implement that one method against your store and keep the rest of the
pipeline unchanged.
