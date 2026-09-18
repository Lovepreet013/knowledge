import numpy as np
from apps.documents.models import DocumentChunk
from apps.documents.chunking import chunk_text
from apps.documents.embeddings import get_embeddings_batch
from google.genai import types
from apps.documents.embeddings import get_client
from pgvector.django import CosineDistance

# Mandatory marker distinguishing user-attached files from company
# documents in prompts and SOURCES_USED (filenames may collide).
ATTACHMENT_SUFFIX = " (attached)"

# Attachments at/under this size go into the prompt whole; longer ones
# are chunked + ranked by per-request embeddings (discarded afterwards —
# only the original file + extracted text are persisted on the Message).
ATTACHMENT_MAX_CHARS = 20000

# Bounds for follow-up reuse: prior attachments in the same conversation are
# re-injected so the thumbnail "remains in the question", but capped so the
# prompt and vision call stay bounded.
MAX_HISTORY_TEXT_ATTACHMENTS = 5
MAX_HISTORY_IMAGES = 3


def embed_question(question: str) -> list[float]:
    """Embeds a single question the same way document chunks were embedded."""
    embeddings = get_embeddings_batch([question])
    return embeddings[0] if embeddings else []


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Computes the cosine similarity between two vectors."""
    a = np.array(a)  # type: ignore
    b = np.array(b)  # type: ignore
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def retrieve_relevant_chunks(question: str, company_id: int, top_k: int = 12) -> list[DocumentChunk]:
    question_embedding = embed_question(question)

    chunks = (
        DocumentChunk.objects
        .filter(company_id=company_id)
        .exclude(embedding__isnull=True)
        .select_related("document")
        .order_by(CosineDistance("embedding", question_embedding))[:top_k]
    )

    return list(chunks)


def build_prompt_multi(
    question: str,
    chunks: list[DocumentChunk],
    attachments: list[tuple[str, str]] | None = None,
    current_names: set[str] | None = None,
) -> str:
    """Prompt with zero or more persisted/current attachments.

    Each attachment is (filename, ranked_text); image attachments carry an
    empty text and get an inspect-directly note (their bytes go as vision
    parts in generate_answer, in the same order as listed here).
    Order is chronological: history first, the current question's file last.
    `current_names` marks which filenames belong to THIS question so the
    model can tell "this image" (current) apart from previous ones.
    """
    company_context = "\n\n".join(
        f"[Source: {chunk.document.file.name}]\n{chunk.content}"
        for chunk in chunks
    )

    sections = []
    has_current = bool(current_names)
    for name, text in attachments or []:
        if not name:
            continue
        is_current = bool(current_names and name in current_names)
        if has_current:
            header = (
                "Currently attached file (for THIS question):"
                if is_current
                else "Previously attached file (earlier in this conversation — use only if the question explicitly refers to previous/earlier/all/compare):"
            )
        else:
            header = "Attached file:"
        if (text or "").strip():
            sections.append(f"{header}\n[Source: {name}{ATTACHMENT_SUFFIX}]\n{text}")
        else:
            sections.append(
                f"{header}\n[Source: {name}{ATTACHMENT_SUFFIX}]\n"
                "(An image is attached — inspect it directly to answer.)"
            )
    if company_context:
        sections.append(f"Company context:\n{company_context}")
    context = "\n\n".join(sections)

    return (
        f"You are a knowledge assistant answering questions using only the company context below.\n"
        f"\n"
        f"Rules:\n"
        f"- Answer only using the provided context.\n"
        f"- The CURRENTLY attached file (if any) is the PRIMARY source for THIS question: when the\n"
        f"  question says 'the image/file', 'this image/file' or 'explain the image' and a current file\n"
        f"  exists, answer about the CURRENT file only. Do not describe previous files unless asked.\n"
        f"  Use PREVIOUS files only when the question explicitly mentions previous/earlier/all/compare/both,\n"
        f"  or when there is no current file (pure follow-up). Fall back to company context otherwise.\n"
        f"  Vision image parts are in the same order as the attached files listed below.\n"
        f"- If the answer isn't supported by the context, say so clearly instead of guessing.\n"
        f"- Do not invent facts, numbers, or policies not present in the context.\n"
        f'- After your answer, on a new line, write exactly: "SOURCES_USED:" followed by a\n'
        f"  comma-separated list of ONLY the [Source: ...] filenames you actually drew on to\n"
        f'  answer. Cite an attached file WITH its "(attached)" marker\n'
        f'  (e.g. "report.pdf (attached)"), exactly as shown in its [Source: ...] line.\n'
        f"  If you used none (e.g. you said the context didn't have the answer),\n"
        f'  write "SOURCES_USED: none".\n'
        f"- Format your answer using simple Markdown: use **bold** for key terms, bullet\n"
        f"  points for lists, and short paragraphs. Avoid headers (#) — this will be shown\n"
        f"  in a compact chat window, not a document.\n"
        f"- The context may contain excerpts from multiple different documents. If the question\n"
        f"  spans several documents, use all of them together to give a complete answer, and\n"
        f"  cite each document you drew from.\n"
        f"- If you can answer part of the question but not all of it, answer the part you can\n"
        f"  and clearly state which part isn't covered by the context.\n"
        f"\n"
        f"Context:\n"
        f"{context}\n"
        f"\n"
        f"Question: {question}"
    )


def build_prompt(question: str, chunks: list[DocumentChunk], attachment_name: str | None = None, attachment_text: str = "") -> str:
    """Legacy single-attachment wrapper around build_prompt_multi."""
    attachments = [(attachment_name, attachment_text)] if attachment_name else []
    current = {attachment_name} if attachment_name else None
    return build_prompt_multi(question, chunks, attachments=attachments, current_names=current)


def build_attachment_context(filename: str, text: str, question: str) -> str:
    """Rank an attachment's text for a question (stored text, ranked per ask).

    Small extractions go in whole; longer ones are chunked and ranked by
    per-request embeddings that are discarded afterwards. The original file
    + full extracted text stay persisted on the Message for reuse.
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

def generate_answer(
    question: str,
    chunks: list[DocumentChunk],
    attachment: tuple[str | None, str] | None = None,
    image_data: tuple[bytes, str] | None = None,
    attachments: list[tuple[str, str]] | None = None,
    images: list[tuple[bytes, str]] | None = None,
    current_names: set[str] | None = None,
) -> tuple[str, list[str]]:
    """Generate an answer with current + history attachments.

    Legacy `attachment` / `image_data` (single) are merged with the new
    `attachments` / `images` lists so old callers keep working. New callers
    pass the full chronological lists (history first, current last) plus
    `current_names` marking THIS question's filenames.
    """
    combined_attachments: list[tuple[str, str]] = []
    legacy_name, legacy_text = attachment or (None, "")
    if legacy_name:
        combined_attachments.append((legacy_name, legacy_text or ""))
    for name, text in attachments or []:
        if name and (name, text) not in combined_attachments:
            # avoid doubling the current file when callers pass it both ways
            if not (legacy_name and name == legacy_name and text == (legacy_text or "")):
                combined_attachments.append((name, text))

    combined_images: list[tuple[bytes, str]] = []
    if image_data:
        combined_images.append(image_data)
    for data, mime in images or []:
        if data and (data, mime) not in combined_images:
            combined_images.append((data, mime))

    if current_names is None and legacy_name:
        current_names = {legacy_name}

    has_attachment_text = any((t or "").strip() for _, t in combined_attachments)
    if not chunks and not has_attachment_text and not combined_images:
        return "I couldn't find this information in the available company documents.", []

    prompt = build_prompt_multi(question, chunks, attachments=combined_attachments, current_names=current_names)
    client = get_client()

    image_parts = [
        types.Part.from_bytes(data=data, mime_type=mime)
        for data, mime in combined_images
    ]
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