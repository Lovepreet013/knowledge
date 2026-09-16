"""Ephemeral single-file chat attachments (MVP).

Nothing here touches disk or the database: the uploaded file is validated
and extracted in RAM per question, merged into the RAG prompt, then
discarded with the request. Only the filename survives (inside the
assistant message's `sources` array).
"""

import io
import os

from rest_framework.exceptions import ValidationError

try:
    # Optional at import time on purpose: image uploads need Pillow, but a
    # missing Pillow must never break module import (and therefore Django
    # startup / URL loading). process_upload() raises a clear 400 instead.
    from PIL import Image
except ImportError:  # pragma: no cover - depends on the environment
    Image = None  # type: ignore

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB, matches the documented limit
MAX_IMAGE_SIDE = 1568  # bounds Gemini vision cost per request

_PDF_MAGIC = b"%PDF"
_PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
_JPEG_MAGIC = b"\xff\xd8\xff"


def _base_name(name: str | None) -> str:
    return os.path.basename(name or "") or "upload"


def _sniff_kind(upload) -> str:
    """Magic-byte content sniff. Returns 'pdf' | 'txt' | 'image'.

    Trusts bytes, not the filename extension or client MIME type.
    """
    try:
        head = upload.read(16)
        upload.seek(0)
    except Exception:
        raise ValidationError("Could not read the uploaded file.")
    if head.startswith(_PDF_MAGIC):
        return "pdf"
    if head.startswith(_PNG_MAGIC) or head.startswith(_JPEG_MAGIC):
        return "image"
    try:
        upload.read(8192).decode("utf-8")
        upload.seek(0)
    except (UnicodeDecodeError, OSError, ValueError):
        raise ValidationError(
            f"Unsupported file type: {_base_name(getattr(upload, 'name', None))}. "
            "Upload a PDF, TXT, PNG or JPG file (max 10MB)."
        )
    except Exception:
        raise ValidationError("Could not read the uploaded file.")
    return "txt"


def process_upload(upload) -> tuple[str, str, bytes | None, str | None]:
    """Validate + extract an ephemeral upload.

    Returns (filename, text, image_bytes, mime) where exactly one of `text`
    / `image_bytes` is populated. Raises ValidationError with a
    user-facing message on any failure. Never logs file content.
    """
    name = _base_name(getattr(upload, "name", None))
    size = getattr(upload, "size", 0) or 0
    if size == 0:
        raise ValidationError(
            f"Could not read any content from {name}. The file looks empty."
        )
    if size > MAX_UPLOAD_BYTES:
        raise ValidationError(
            f"{name} is too large. Files must be 10MB or smaller."
        )

    kind = _sniff_kind(upload)

    if kind in ("pdf", "txt"):
        from apps.documents.parsers import extract_text

        try:
            text = extract_text(upload, kind)
        except Exception:
            raise ValidationError(
                f"Could not read {name}. The file may be corrupt."
            )
        if not text or not text.strip():
            raise ValidationError(f"Could not read any text from {name}.")
        return name, text, None, None

    # image: verify, downscale in RAM, re-encode as JPEG
    if Image is None:
        raise ValidationError(
            "Image uploads are not supported on this server right now. "
            "PDF and TXT files still work."
        )
    try:
        upload.seek(0)
        with Image.open(upload) as probe:
            probe.verify()
        upload.seek(0)
        with Image.open(upload) as img:
            img = img.convert("RGB")
            img.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE))
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=85)
            return name, "", buf.getvalue(), "image/jpeg"
    except ValidationError:
        raise
    except Exception:
        raise ValidationError(
            f"Could not read {name}. The image may be corrupt."
        )
