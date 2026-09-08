import os
from google import genai
from google.genai import types

_client = None


def get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    return _client


def get_embeddings_batch(texts: list[str], batch_size: int = 50) -> list[list[float]]:
    """
    Embeds a list of text chunks in batches, to minimize API calls.
    Returns a list of embedding vectors in the same order as the input texts.
    """
    if not texts:
        return []

    client = get_client()
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = client.models.embed_content(
            model="gemini-embedding-001",
            contents=batch,
            config=types.EmbedContentConfig(output_dimensionality=768),
        )
        all_embeddings.extend([e.values for e in response.embeddings])  # type: ignore

    return all_embeddings
