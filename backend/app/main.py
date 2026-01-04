import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import engine, Base
from .api import routes

# Create Tables in Supabase
#Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Security Scanner")

# Allow Frontend to talk to Backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes we just wrote
app.include_router(routes.router)

@app.get("/")
def health_check():
    return {"status": "running"}