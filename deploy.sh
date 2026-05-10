#!/bin/bash
# Run this on the TimeWeb VPS after cloning the repo
set -e

# 1. Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env — edit it and set a strong POSTGRES_PASSWORD, then run this script again."
  exit 1
fi

# 2. Build and start
docker compose -f docker-compose.prod.yml pull db 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "Done! The app is available at http://$(hostname -I | awk '{print $1}')"
