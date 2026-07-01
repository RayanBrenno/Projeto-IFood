#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "Iniciando backend..."
cd "$ROOT/backend"
.venv/bin/uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Iniciando frontend..."
cd "$ROOT/frontend"
npm run dev -- --port 5173 --strictPort &
FRONTEND_PID=$!

echo ""
echo "Backend  → http://localhost:8000  (PID $BACKEND_PID)"
echo "Frontend → http://localhost:5173  (PID $FRONTEND_PID)"
echo "API docs → http://localhost:8000/docs"
echo ""
echo "Pressione Ctrl+C para encerrar tudo."

trap "echo 'Encerrando...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait $BACKEND_PID $FRONTEND_PID
