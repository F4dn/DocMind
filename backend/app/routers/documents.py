import os
from uuid import UUID
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.vectorstore import delete_document_vectors
from app.models.document import Document, DocumentStatus
from app.models.user import User
from app.schemas.document import DocumentOut, DocumentStatusOut
from app.services.ingest_service import save_upload_file
from app.tasks.ingest_task import process_document


router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".doc"}
MAX_FILE_SIZE_MB = 20


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # path eval
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            details=f"File type '{ext}' not supported. Use PDF, DOCX, or TXT.",
        )

    # read and val size
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            details=f"File size {size_mb:.2f} MB exceeds the {MAX_FILE_SIZE_MB} MB limit.",
        )

    # save to disk
    stored_name, _ = save_upload_file(file_bytes, file.filename)

    # create db record
    doc = Document(
        user_id=current_user.id,
        filename=stored_name,
        original_name=file.filename,
        file_size=len(file_bytes),
        status=DocumentStatus.PENDING,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Dispatch background task - Celery
    process_document.delay(str(doc.id), str(current_user.id))
    return doc


@router.get("/", response_model=list[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )


@router.get("/{document_id}/status", response_model=DocumentStatusOut)
def get_document_status(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, details="Document not found"
        )

    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, details="Document not found"
        )

    delete_document_vectors(str(current_user.id), str(document_id))

    file_path = f"/app/uploads/{doc.filename}"
    if os.path.exists(file_path):
        os.remove(file_path)
    db.delete(doc)
    db.commit()
