from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import *  # noqa: F401, F403 — registers all models with Base
from app.database import Base
from app.routers import components, builds, suggestions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PC Builder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(components.router)
app.include_router(builds.router)
app.include_router(suggestions.router)


@app.get("/")
def root():
    return {"message": "PC Builder API", "docs": "/docs"}
