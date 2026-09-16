import numpy as np
from apps.documents.models import DocumentChunk
from apps.documents.chunking import chunk_text
from apps.documents.embeddings import get_embeddings_batch
from google.genai import types
from apps.documents.embeddings import get_client

# Mandatory marker distinguishing user-attached files from company
# documents in prompts and SOURCES_USED (filenames may collide).
ATTACHMENT_SUFFIX = " (attached)"

# Attachments at/under this size go into the prompt whole; longer ones
# are chunked + ranked by ephemeral per-request embeddings (discarded).
ATTACHMENT_MAX_CHARS = 20000


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
    question: str, company_id: int, top_k: int = 12
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


def build_prompt(question: str, chunks: list[DocumentChunk], attachment_name: str | None = None, attachment_text: str = "") -> str:
    company_context = "\n\n".join(
        f"[Source: {chunk.document.file.name}]\n{chunk.content}"
        for chunk in chunks
    )

    sections = []
    if attachment_name:
        if (attachment_text or "").strip():
            sections.append(
                f"Attached file:\n[Source: {attachment_name}{ATTACHMENT_SUFFIX}]\n{attachment_text}"
            )
        else:
            sections.append(
                f"Attached file:\n[Source: {attachment_name}{ATTACHMENT_SUFFIX}]\n"
                "(An image is attached — inspect it directly to answer.)"
            )
    if company_context:
        sections.append(f"Company context:\n{company_context}")
    context = "\n\n".join(sections)

    return f"""You are a knowledge assistant answering questions using only the company context below.

    Rules:
    - Answer only using the provided context.
    - The attached file (if any) is the PRIMARY source: prefer it when the
      question is about it, and fall back to the company context otherwise.
    - If the answer isn't supported by the context, say so clearly instead of guessing.
    - Do not invent facts, numbers, or policies not present in the context.
    - After your answer, on a new line, write exactly: "SOURCES_USED:" followed by a
    comma-separated list of ONLY the [Source: ...] filenames you actually drew on to
    answer. Cite an attached file WITH its "(attached)" marker
    (e.g. "report.pdf (attached)"), exactly as shown in its [Source: ...] line.
    If you used none (e.g. you said the context didn't have the answer),
    write "SOURCES_USED: none".
    - Format your answer using simple Markdown: use **bold** for key terms, bullet
    points for lists, and short paragraphs. Avoid headers (#) — this will be shown
    in a compact chat window, not a document.
    - The context may contain excerpts from multiple different documents. If the question
    spans several documents, use all of them together to give a complete answer, and
    cite each document you drew from.
    - If you can answer part of the question but not all of it, answer the part you can
    and clearly state which part isn't covered by the context.

    Context:
    {context}

    Question: {question}
    """

def build_attachment_context(filename: str, text: str, question: str) -> str:
    """Rank an ephemeral upload's text for a question (MVP: nothing stored).

    Small extractions go in whole; longer ones are chunked and ranked by
    per-request embeddings that are discarded afterwards.
    """
    text = (text or "").strip()
    if not text:
        return ""
    if len(text) <= ATTACHMENT_MAX_CHARS:
        return text
    chunks = chunk_text(text)
    if not chunks:
        return ""
    question_embedding = embed_question(question=question)
    scored = [
        (chunk, cosine_similarity(question_embedding, embedding))
        for chunk, embedding in zip(chunks, get_embeddings_batch(chunks))
    ]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return "\n\n".join(chunk for chunk, _ in scored[:3])

def generate_answer(question: str, chunks: list[DocumentChunk], attachment: tuple[str | None, str] | None = None, image_data: tuple[bytes, str] | None = None) -> tuple[str, list[str]]:
    attachment_name, attachment_text = attachment or (None, "")
    if not chunks and not (attachment_text or "").strip() and not image_data:
        return "I couldn't find this information in the available company documents.", []

    prompt = build_prompt(question, chunks, attachment_name=attachment_name, attachment_text=attachment_text or "")
    client = get_client()

    image_parts = []
    if image_data:
        data, mime = image_data
        image_parts = [types.Part.from_bytes(data=data, mime_type=mime)]
    contents = [prompt, *image_parts] if image_parts else prompt

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=contents,
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