"""
Agnes — standalone FastAPI entry (same routes as combined `app.main`).
For day-to-day dev, `npm run dev:api` uses `app.main`, which includes these routes on :8000.
"""

from __future__ import annotations

import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .routes import agnes_startup, router

_env_dir = Path(__file__).resolve().parent
load_dotenv(_env_dir / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
log = logging.getLogger("agnes")

app = FastAPI(title="Agnes BOM API")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    log.info(">>> %s %s", request.method, request.url.path)
    response = await call_next(request)
    log.info("<<< %s %s  →  %d", request.method, request.url.path, response.status_code)
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    agnes_startup()


app.include_router(router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
