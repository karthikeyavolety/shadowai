from fastapi import APIRouter, Depends, File, UploadFile

from app.core.deps import get_current_user
from app.core.responses import success
from app.services import resume_service

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/scan")
async def scan_resume(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    result = await resume_service.analyze_resume(user["id"], file)
    return success(result, "Resume analyzed")


@router.get("/scan/{scan_id}")
async def get_resume_scan(scan_id: str, user: dict = Depends(get_current_user)):
    result = await resume_service.get_resume_scan(scan_id, user["id"])
    return success(result, "Scan retrieved")
