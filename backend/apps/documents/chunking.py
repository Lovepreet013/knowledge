def chunk_text(text: str, chunk_size: int = 600, overlap: int = 50) -> list[str]:
    """
    Splits text into overlapping word-based chunks.
    chunk_size and overlap are measured in words, not tokens — a simple
    approximation that's good enough for the MVP.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        start += (
            chunk_size - overlap
        )  # move forward, but overlap with the previous chunk

    return chunks
