"""Single-file chat attachments with persistent thumbnails.

The uploaded file is validated in RAM, then persisted on the user Message
(`attachment` + optional `attachment_thumbnail` under MEDIA_ROOT) so the
chat bubble keeps a little thumbnail / file pill on reload and follow-up
questions in the same conversation can reuse it. Only metadata + URLs are
exposed via the API; extraction text is stored for RAG reuse.
"""

import io
import os

from django.core.files.base import ContentFile
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
THUMB_MAX_SIDE = 512  # little thumbnail kept for chat display + fast reloads

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


def process_upload(upload) -> tuple[str, str, str, bytes | None, str | None]:
    """Validate + extract an upload for persistent storage.

    Returns (filename, kind, text, image_bytes, mime) where `kind` is
    'pdf' | 'txt' | 'image' and exactly one of `text` / `image_bytes` is
    populated. Raises ValidationError with a user-facing message on any
    failure. Never logs file content.

    The caller persists the original `upload` bytes on the Message plus a
    small thumbnail for images; the returned `image_bytes` (1568px JPEG)
    is used for the current question's Gemini vision call.
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
        return name, kind, text, None, None

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
            return name, kind, "", buf.getvalue(), "image/jpeg"
    except ValidationError:
        raise
    except Exception:
        raise ValidationError(
            f"Could not read {name}. The image may be corrupt."
        )


def build_thumbnail_bytes(image_bytes: bytes) -> bytes:
    """Make the little chat thumbnail (512px JPEG) from 1568px image bytes."""
    if Image is None:
        raise ValidationError(
            "Image uploads are not supported on this server right now."
        )
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img = img.convert("RGB")
            img.thumbnail((THUMB_MAX_SIDE, THUMB_MAX_SIDE))
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=75)
            return buf.getvalue()
    except Exception:
        raise ValidationError("Could not read the image. It may be corrupt.")


def build_thumbnail_file(filename: str, image_bytes: bytes) -> ContentFile:
    """Wrap thumbnail bytes in a ContentFile with a stable thumb name."""
    thumb_bytes = build_thumbnail_bytes(image_bytes)
    stem, _ext = os.path.splitext(_base_name(filename))
    return ContentFile(thumb_bytes, name=f"{stem}_thumb.jpg")


def load_stored_image_for_gemini(stored_file) -> tuple[bytes, str] | None:
    """Load a persisted attachment image for follow-up Gemini vision calls.

    Re-opens the stored original, normalizes to 1568px JPEG (same as
    process_upload). Returns None when the file is missing/corrupt so the
    follow-up can still answer from text context instead of 500ing.
    """
    if Image is None:
        return None
    try:
        stored_file.open("rb")
        try:
            with Image.open(stored_file) as probe:
                probe.verify()
        finally:
            try:
                stored_file.seek(0)
            except Exception:
                stored_file.open("rb")
        with Image.open(stored_file) as img:
            img = img.convert("RGB")
            img.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE))
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=85)
            return buf.getvalue(), "image/jpeg"
    except Exception:
        return None
    finally:
        try:
            stored_file.close()
        except Exception:
            pass
