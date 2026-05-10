#!/bin/sh
set -e

echo "Waiting for database..."
until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    sys.exit(0)
except:
    sys.exit(1)
"; do
  sleep 2
done
echo "Database is ready."

echo "Creating schema..."
python -c "
from app.database import engine, Base
from app.models import *  # noqa
Base.metadata.create_all(bind=engine)
print('Schema OK')
"

echo "Seeding data (skip if already seeded)..."
python seed.py 2>&1 | tail -5 || true

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
