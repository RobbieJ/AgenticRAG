# Running & evaluating locally

Everything runs with **no Docker and no vector database** — retrieval is in-process,
and the app works fully offline in DEMO mode (deterministic answers) before you add
any LLM credentials.

## Prerequisites

- **Python 3.11+**
- **Node 18+** (tested on Node 22)

## One-command dev (recommended)

From the repo root:

```bash
./scripts/dev.sh
```

This creates the Python venv if needed, installs backend + frontend deps on first
run, then starts both servers and wires the frontend to the backend:

- Backend  → http://localhost:8000  (`/health`, `/docs`)
- Frontend → http://localhost:3000

`Ctrl+C` stops both. Override ports with `BACKEND_PORT` / `FRONTEND_PORT`:

```bash
BACKEND_PORT=8080 FRONTEND_PORT=3001 ./scripts/dev.sh
```

## Manual setup

### 1. Backend (run from the repo root)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Verify:

```bash
curl -s http://localhost:8000/health
# {"status":"ok",...,"provider":"anthropic","demo_mode":true,...}
```

`demo_mode:true` = running offline with deterministic answers; no key required.

### 2. Frontend (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** and try all three demos. For **Agentic RAG**, click an
example or type a question and watch the diagram highlight in sync with the streaming
steps.

## Evaluate / test

```bash
# repo root, venv active
pytest                       # 16 tests: retrieval relevance, full loop, provider selection
```

The retrieval tests are the real search-quality eval — e.g. a prompt-engineering
query must rank the prompt docs first, and an unrelated query must score near-zero.

Frontend sanity:

```bash
cd frontend && npm run typecheck && npm run build
```

## Go live with a real model (optional)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and pick **one** provider:

| Provider | Set in `.env` |
|----------|---------------|
| **Anthropic** | `LLM_PROVIDER=anthropic` · `ANTHROPIC_API_KEY=sk-ant-...` |
| **OpenAI** | `LLM_PROVIDER=openai` · `OPENAI_API_KEY=sk-...` |
| **vLLM (local)** | `LLM_PROVIDER=vllm` · `VLLM_MODEL=<served model name>` |

For vLLM, start the server first on **port 8001** (the backend uses 8000):

```bash
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct --port 8001
# then in backend/.env:  VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

Restart the backend after editing `.env`. The status banner on each demo page flips
from `DEMO mode` to `LIVE — <model>`, and EVALUATE/answers come from the real model.

> In DEMO mode EVALUATE sits at ~51% and the loop refines to max iterations before
> answering — that's expected without a live model, and it nicely showcases the
> refine loop.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Banner: "Backend offline" | Backend isn't on `:8000`. If you moved it, set `NEXT_PUBLIC_BACKEND_URL` for the frontend and add the frontend origin to `CORS_ORIGINS` in `.env`. |
| `ModuleNotFoundError: backend` | Run uvicorn from the **repo root**, not from `backend/`. |
| Port already in use | `uvicorn ... --port 8080` and set `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`, or just use `./scripts/dev.sh` with `BACKEND_PORT`. |
