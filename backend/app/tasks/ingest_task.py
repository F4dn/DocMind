from celery import shared_task
from sqlalchemy.orm import Session

import os

from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.document import Document, DocumentStatus
from app.services.ingest_service import ingest_document


def get_db_session():
    return SessionLocal()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_document(self, document_id: str, user_id: str):
    db = get_db_session()

    doc = None
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return {"error": "Document not found"}
        doc.status = DocumentStatus.PROCESSING
        db.commit()
        chunk_count = ingest_document(
            file_path=f"/app/uploads/{doc.filename}",
            original_name=doc.original_name,
            document_id=document_id,
            user_id=user_id,
        )
        doc.status = DocumentStatus.READY
        doc.chunk_count = chunk_count
        db.commit()
        return {
            "message": f"{document_id} processed successfully",
            "chunk_count": chunk_count,
        }
    except Exception as exc:
        if doc:
            doc.status = DocumentStatus.FAILED
            doc.error_message = str(exc)
            db.commit()
        raise self.retry(exc=exc)
    finally:
        db.close()
