#!/bin/bash
set -e

echo "🚀 Запуск PC Builder..."

# Check Docker
if ! command -v docker &>/dev/null; then
  echo "❌ Docker не найден. Установите Docker Desktop."
  exit 1
fi

# Start services
docker compose up -d db
echo "⏳ Ожидание PostgreSQL..."
sleep 5

docker compose up -d backend frontend

echo "⏳ Ожидание бэкенда..."
sleep 5

# Seed
echo "🌱 Заполняем базу данных..."
docker compose exec backend python seed.py

echo ""
echo "✅ Готово!"
echo "🌐 Откройте браузер: http://localhost:3000"
echo "📚 API Docs:        http://localhost:8000/docs"
