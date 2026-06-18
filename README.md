# PC Builder

A fullstack web application for browsing PC components and assembling custom builds. Browse parts, compare specs, create saved builds, and get pre-configured recommendations.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

## Features

- Browse PC components (CPUs, GPUs, RAM, storage, etc.) and peripherals
- Create and save custom PC builds
- View pre-configured builds
- Component detail pages with full specs
- REST API with auto-generated Swagger docs at `/docs`

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Query (server state)
- React Router v6

**Backend**
- Python + FastAPI
- PostgreSQL + SQLAlchemy ORM
- Alembic (database migrations)
- Pydantic v2

**Infrastructure**
- Docker + Docker Compose (dev and prod configs)

## Getting Started

### With Docker (recommended)

```bash
git clone https://github.com/TimTkh-sketch/pc-builder.git
cd pc-builder
cp .env.example .env
docker-compose up --build
```

App runs at `http://localhost:5173`, API at `http://localhost:8000/docs`.

### Local development

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
pc-builder/
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Routes: /, /components, /builds, /prebuilds, /periphery
│   │   ├── pages/           # Page components
│   │   └── components/      # Shared UI components
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── routers/
│   │   │   ├── components.py
│   │   │   ├── builds.py
│   │   │   └── suggestions.py
│   │   └── models/          # SQLAlchemy models
│   └── requirements.txt
├── docker-compose.yml       # Development
└── docker-compose.prod.yml  # Production
```
