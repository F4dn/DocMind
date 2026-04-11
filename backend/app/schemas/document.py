from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.document import DocumentStatus


class DocumentOut(BaseModel):
    id: UUID
    filename: str
    original_name: str
    file_size: int
    status: DocumentStatus
    chunk_count: int
    error_message: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class DocumentStatusOut(BaseModel):
    id: UUID
    status: DocumentStatus
    chunk_count: int
    error_message: str | None

    model_config = {
        "from_attributes": True,
    }
