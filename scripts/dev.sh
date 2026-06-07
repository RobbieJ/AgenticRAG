#!/usr/bin/env bash
#
# Boot the backend (FastAPI) and frontend (Next.js) together for local dev.
#
#   ./scripts/dev.sh
#   BACKEND_PORT=8080 FRONTEND_PORT=3001 ./scripts/dev.sh
#
# Creates the Python venv and installs deps on first run. Ctrl+C stops both.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# --- backend deps -----------------------------------------------------------
if [ ! -d .venv ]; then
  echo "› Creating Python virtual environment (.venv)…"
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
echo "› Installing backend dependencies…"
pip install -q -r backend/requirements.txt

# --- frontend deps ----------------------------------------------------------
if [ ! -d frontend/node_modules ]; then
  echo "› Installing frontend dependencies (first run)…"
  (cd frontend && npm install)
fi

# --- run both ---------------------------------------------------------------
pids=()
cleanup() {
  echo ""
  echo "› Shutting down…"
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
}
trap cleanup EXIT INT TERM

echo "› Starting backend on :${BACKEND_PORT}…"
uvicorn backend.main:app --reload --port "${BACKEND_PORT}" &
pids+=($!)

echo "› Starting frontend on :${FRONTEND_PORT}…"
(
  cd frontend
  NEXT_PUBLIC_BACKEND_URL="http://localhost:${BACKEND_PORT}" \
    npm run dev -- -p "${FRONTEND_PORT}"
) &
pids+=($!)

cat <<EOF

  ───────────────────────────────────────────────
   Backend : http://localhost:${BACKEND_PORT}   (/health, /docs)
   Frontend: http://localhost:${FRONTEND_PORT}
   Press Ctrl+C to stop both.
  ───────────────────────────────────────────────

EOF

wait
