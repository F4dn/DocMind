import os
import uuid
from pathlib import Path
from typing import List

from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.embeddings.factory import get_embedding_model
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader

from app.config import settings
from app.core.vectorstore import get_or_create_collection

UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

embedding_model = get_embedding_model()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""],
)


# save uploaded file to disk, return stored filename and file path
def save_upload_file(file_bytes: str, original_name: str) -> tuple[str, str]:
    ext = Path(original_name).suffix.lower()
    stored_name = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / stored_name
    file_path.write_bytes(file_bytes)
    return stored_name, str(file_path)


# load file into langchain documents based on extension
def load_document(file_path: str, original_name: str) -> List:
    ext = Path(original_name).suffix.lower()
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext in [".docx", ".doc"]:
        loader = Docx2txtLoader(file_path)
    elif ext in [".txt", ".md"]:
        loader = TextLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
    return loader.load()


def ingest_document(
    file_path: str, original_name: str, document_id: str, user_id: str
) -> int:
    raw_docs = load_document(file_path, original_name)
    chunks = text_splitter.split_documents(raw_docs)

    if not chunks:
        raise ValueError("No content extracted from the document")

    texts = [chunk.page_content for chunk in chunks]
    metadata = []

    for i, chunk in enumerate(chunks):
        meta = {
            "document_id": document_id,
            "user_id": user_id,
            "chunk_index": i,
            "source": original_name,
            "page": chunk.metadata.get("page", 0),
        }

        metadata.append(meta)

    chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]

    collection = get_or_create_collection(user_id)
    batchsize = 50

    for start in range(0, len(texts), batchsize):
        batch_texts = texts[start : start + batchsize]
        batch_meta = metadata[start : start + batchsize]
        batch_ids = chunk_ids[start : start + batchsize]
        batch_embeddings = embedding_model.embed_document(batch_texts)

        collection.add(
            ids=batch_ids,
            documents=batch_texts,
            embeddings=batch_embeddings,
            metadatas=batch_meta,
        )

    return len(chunks)
