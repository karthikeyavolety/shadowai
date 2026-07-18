from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.responses import success
from app.repositories import scan_repo

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def dashboard_summary(user: dict = Depends(get_current_user)):
    latest = await scan_repo.latest_scores_for_user(user["id"])
    recent_scans = await scan_repo.list_scans_for_user(user["id"], limit=5)

    scores = latest["scores"] if latest else {
        "overall": 0, "privacy": 0, "identity_theft": 0,
        "social_engineering": 0, "credential_exposure": 0,
    }

    checklist = [
        {"item": "Run your first Resume Analyzer scan", "done": any(s["scan_type"] == "resume" for s in recent_scans)},
        {"item": "Run a GitHub Scanner scan", "done": any(s["scan_type"] == "github" for s in recent_scans)},
        {"item": "Review your AI recommendations", "done": False},
        {"item": "Generate a Safe Resume version", "done": False},
    ]

    return success(
        {
            "scores": scores,
            "recent_scans": recent_scans,
            "total_scans": len(recent_scans),
            "checklist": checklist,
        },
        "Dashboard summary",
    )
