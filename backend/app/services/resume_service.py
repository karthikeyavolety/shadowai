from fastapi import HTTPException, UploadFile, status

from app.analyzers.pdf_extractor import extract_text_from_pdf
from app.analyzers.pii_detector import detect_entities
from app.core.config import settings
from app.models.scan import ExtractedEntities, RiskScores, ScanInDB, ScanStatus, ScanType
from app.repositories import scan_repo
from app.services.scoring_service import compute_resume_scores, generate_recommendations


async def analyze_resume(user_id: str, file: UploadFile) -> dict:
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF files are supported")

    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    text = extract_text_from_pdf(file_bytes)
    entities = detect_entities(text)
    scores = compute_resume_scores(entities)
    recommendations = generate_recommendations(entities)

    scan = ScanInDB(
        user_id=user_id,
        scan_type=ScanType.resume,
        input_reference=file.filename,
        extracted_entities=ExtractedEntities(**entities),
        raw_findings={"text_length": len(text)},
        scores=RiskScores(**scores),
        recommendations=recommendations,
        status=ScanStatus.completed,
    )
    created = await scan_repo.create_scan(scan)
    return created


async def get_resume_scan(scan_id: str, user_id: str) -> dict:
    scan = await scan_repo.get_scan(scan_id, user_id)
    if not scan:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scan not found")
    return scan
