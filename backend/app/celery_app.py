from celery import Celery
from app.config import settings
import app.models

celery_app = Celery(
    "docmind",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.ingest_task"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
)
