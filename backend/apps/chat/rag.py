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
        f"[Source: {chunk.document.file.name}]\n{chunk.content}"
        for chunk in chunks
    )

    return f"""You are a knowledge assistant answering questions using only the company context below.

    Rules:
    - Answer only using the provided context.
    - If the answer isn't supported by the context, say so clearly instead of guessing.
    - Do not invent facts, numbers, or policies not present in the context.
    - After your answer, on a new line, write exactly: "SOURCES_USED:" followed by a
    comma-separated list of ONLY the [Source: ...] filenames you actually drew on to
    answer. If you used none (e.g. you said the context didn't have the answer),
    write "SOURCES_USED: none".

    Context:
    {context}

    Question: {question}
    """

def generate_answer(question: str, chunks: list[DocumentChunk]) -> tuple[str, list[str]]:
    if not chunks:
        return "I couldn't find this information in the available company documents.", []

    prompt = build_prompt(question, chunks)
    client = get_client()

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    raw_text = response.text

    if "SOURCES_USED:" in raw_text:
        answer_text, sources_line = raw_text.split("SOURCES_USED:", 1)
        used_filenames = [
            name.strip() for name in sources_line.split(",")
            if name.strip() and name.strip().lower() != "none"
        ]
    else:
        # model didn't follow the format — fall back to showing nothing rather than guessing
        answer_text = raw_text
        used_filenames = []

    return answer_text.strip(), used_filenames