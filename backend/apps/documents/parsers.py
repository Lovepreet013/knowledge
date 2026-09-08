from pypdf import PdfReader


def extract_text(file, file_type: str) -> str:
    if file_type == "pdf":
        return _extract_pdf(file)
    elif file_type == "txt":
        return _extract_txt(file)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _extract_pdf(file) -> str:
    reader = PdfReader(file)
    text_parts = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(text_parts)


def _extract_txt(file) -> str:
    return file.read().decode("utf-8", errors="ignore")
