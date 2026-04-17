import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.response import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.chat import ChatSession, Message
from app.models.document import Document, DocumentStatus
from app.models.user import User
from app.schemas.chat import ChatQueryRequest, ChatSessionOut
from app.services.rag_service import stream_rag_response

router = APIRouter(prefix="/chat", tags=["chat"])


def _get_or_create_session(
    db: Session, user_id, document_id, session_id=None, question: str = ""
) -> ChatSession:
    if session_id:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
            .first()
        )
        if session:
            return session

    session = ChatSession(
        user_id=user_id,
        document_id=document_id,
        title=question[:60] + "..." if len(question) > 60 else question,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.post("/query")
async def query_document(
    payload: ChatQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    doc = (
        db.query(Document)
        .filter(Document.id == payload.document_id, Document.user_id == current_user.id)
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status != DocumentStatus.READY:
        raise HTTPException(
            status_code=404,
            detail=f"Document is not ready yet. Current status: {doc.status}",
        )

    session = _get_or_create_session(
        db=db,
        user_id=current_user.id,
        document_id=payload.document_id,
        session_id=payload.session_id,
        question=payload.question,
    )

    user_msg = Message(session_id=session.id, role="user", content=payload.question)
    db.add(user_msg)
    db.commit()

    token_stream, sources = stream_rag_response(
        question=payload.question,
        document_id=str(payload.document_id),
        user_id=str(current_user.id),
    )

    def event_stream():
        full_answer = []

        # send session first so frontend know the session
        yield f"data: {json.dumps({'type': 'session_id', 'session_id': str(session.id)})}\n\n"

        # stream token
        for token in token_stream:
            full_answer.append(token)
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        answer_text = "".join(full_answer)
        assistant_msg = Message(
            session_id=session.id,
            role="assistant",
            content=answer_text,
            sources=sources,
        )
        db.add(assistant_msg)
        db.commit()

        # Send sources as final event so frontend can render citation panel
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

        # Done signal
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # important for nginx proxies
        },
    )


@router.get("/sessions", response_model=list[ChatSessionOut])
def list_sessions(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.document_id == document_id,
            ChatSession.user_id == current_user.id,
        )
        .order_by(ChatSession.created_at.desc())
        .all()
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
