from bson import ObjectId

from app.db.mongodb import get_db
from app.models.scan import ScanInDB


def _doc_to_out(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_scan(scan: ScanInDB) -> dict:
    db = get_db()
    result = await db.scans.insert_one(scan.model_dump())
    doc = await db.scans.find_one({"_id": result.inserted_id})
    return _doc_to_out(doc)


async def update_scan(scan_id: str, updates: dict) -> dict | None:
    db = get_db()
    await db.scans.update_one({"_id": ObjectId(scan_id)}, {"$set": updates})
    doc = await db.scans.find_one({"_id": ObjectId(scan_id)})
    return _doc_to_out(doc) if doc else None


async def get_scan(scan_id: str, user_id: str) -> dict | None:
    db = get_db()
    doc = await db.scans.find_one({"_id": ObjectId(scan_id), "user_id": user_id})
    return _doc_to_out(doc) if doc else None


async def list_scans_for_user(user_id: str, scan_type: str | None = None, limit: int = 20) -> list[dict]:
    db = get_db()
    query = {"user_id": user_id}
    if scan_type:
        query["scan_type"] = scan_type
    cursor = db.scans.find(query).sort("created_at", -1).limit(limit)
    return [_doc_to_out(doc) async for doc in cursor]


async def latest_scores_for_user(user_id: str) -> dict | None:
    db = get_db()
    doc = await db.scans.find_one({"user_id": user_id, "status": "completed"}, sort=[("created_at", -1)])
    return _doc_to_out(doc) if doc else None


async def count_all_scans() -> int:
    db = get_db()
    return await db.scans.count_documents({})
