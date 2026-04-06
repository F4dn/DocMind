# backend/app/tasks/ingest_task.py
from app.celery_app import celery_app


@celery_app.task
def ingest_document(document_id: str, user_id: str):
    # TODO: implement ingestion pipeline
    pass
