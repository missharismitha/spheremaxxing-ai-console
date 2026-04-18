"""FastAPI entrypoint: chatbot and future API routes."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    reply: str


app = FastAPI(title="SphereMaxxing API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    # Placeholder until LLM / business logic is wired in.
    return ChatResponse(
        reply=f"[backend stub] Received: {body.message!r}. Implement chat logic in backend/app/main.py."
    )
