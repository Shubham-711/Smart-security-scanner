import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import engine, Base
from .api import routes

load_dotenv()

# Auto-create tables on startup (works for both SQLite dev + PostgreSQL prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Security Scanner")

# CORS — allow the Vercel frontend URL in prod, all origins in dev
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
origins = [FRONTEND_URL] if FRONTEND_URL != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)

@app.get("/")
def health_check():
    return {"status": "running"}