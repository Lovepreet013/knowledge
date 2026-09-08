import numpy as np
from apps.documents.models import DocumentChunk
from apps.documents.embeddings import get_embeddings_batch
from google.genai import types
from apps.documents.embeddings import get_client


def embed_question(question: str) -> list[float]:
    """Embeds a single question the same way document chunks were embedded."""
    embeddings = get_embeddings_batch([question])
    return embeddings[0] if embeddings else []


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Computes the cosine similarity between two vectors."""
    a = np.array(a)  # type: ignore
    b = np.array(b)  # type: ignore
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def retrieve_relevant_chunks(
    question: str, company_id: int, top_k: int = 5
) -> list[DocumentChunk]:
    """
    The core tenant-isolation + retrieval step:
    1. Only ever looks at chunks belonging to this company.
    2. Ranks them by similarity to the question.
    3. Returns the top K.
    """
    question_embedding = embed_question(question=question)

    # tenant isolation happens HERE, before any similarity math runs
    chunks = DocumentChunk.objects.filter(company_id=company_id).exclude(
        embedding__isnull=True
    )

    if not chunks:
        return []

    scored = [
        (chunk, cosine_similarity(question_embedding, chunk.embedding))  # type: ignore
        for chunk in chunks
    ]

    scored.sort(key=lambda pair: pair[1], reverse=True)

    return [chunk for chunk, score in scored[:top_k]]


def build_prompt(question: str, chunks: list[DocumentChunk]) -> str:
    context = "\n\n".join(
        f"[Source : {chunk.document.file.name}]\n{chunk.content}" for chunk in chunks
    )

    return f"""You are a knowledge assistant answering questions using only the company context below.

        Rules:
        - Answer only using the provided context.
        - If the answer isn't supported by the context, say so clearly instead of guessing.
        - Do not invent facts, numbers, or policies not present in the context.

        Context:
        {context}

        Question: {question}
        """


def generate_answer(question: str, chunks: list[DocumentChunk]) -> str:
    if not chunks:
        return "I couldn't find this information in the available company documents."

    prompt = build_prompt(question, chunks)
    client = get_client()

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[prompt],
    )

    return response.text  # type: ignore
