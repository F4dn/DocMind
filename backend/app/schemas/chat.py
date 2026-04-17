from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional


class ChatQueryRequest(BaseModel):
    document_id: Optional[UUID]
    question: str
    session_id: Optional[UUID] = None  # Pass existing session or None for new


class SourceChunk(BaseModel):
    chunk_index: int
    page: str
    source: str
    content: str
    score: float


class ChatMessageOut(BaseModel):
    id: UUID
    role: str
    content: str
    sources: Optional[List[dict]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionOut(BaseModel):
    id: UUID
    document_id: UUID
    title: Optional[str]
    created_at: datetime
    messages: List[ChatMessageOut] = []

    model_config = {"from_attributes": True}
