#!/bin/bash
# Локальный запуск без Docker

echo "🚀 PC Builder — локальный запуск"

# PostgreSQL
if ! brew services list | grep "postgresql@16" | grep started &>/dev/null; then
  echo "▶ Запускаю PostgreSQL..."
  brew services start postgresql@16
  sleep 3
fi

# Backend
echo "▶ Запускаю Backend (FastAPI)..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 2

# Seed (если таблицы пусты)
TABLE_COUNT=$(/opt/homebrew/opt/postgresql@16/bin/psql postgresql://pc_user:pc_pass@localhost:5432/pc_builder -t -c "SELECT COUNT(*) FROM components;" 2>/dev/null | tr -d ' ')
if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
  echo "🌱 Заполняю базу данных..."
  python3 seed.py
fi

# Frontend
echo "▶ Запускаю Frontend (Vite)..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Приложение запущено!"
echo "🌐 Сайт:     http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Нажмите Ctrl+C для остановки."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Остановлено.'" INT
wait
