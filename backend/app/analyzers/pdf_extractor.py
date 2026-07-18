import fitz  # PyMuPDF

from fastapi import HTTPException, status


def extract_text_from_pdf(file_bytes: bytes) -> str:
    if not file_bytes.startswith(b"%PDF"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File does not appear to be a valid PDF")
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not parse PDF — file may be corrupted")

    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()

    text = "\n".join(text_parts).strip()
    if not text:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "No extractable text found — this may be a scanned/image-only PDF",
        )
    return text
