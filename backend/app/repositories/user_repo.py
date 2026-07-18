from datetime import datetime, timezone

from bson import ObjectId

from app.db.mongodb import get_db
from app.models.user import UserInDB


def _doc_to_out(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_user(user: UserInDB) -> dict:
    db = get_db()
    result = await db.users.insert_one(user.model_dump())
    doc = await db.users.find_one({"_id": result.inserted_id})
    return _doc_to_out(doc)


async def get_user_by_email(email: str) -> dict | None:
    db = get_db()
    doc = await db.users.find_one({"email": email})
    return _doc_to_out(doc) if doc else None


async def get_user_by_id(user_id: str) -> dict | None:
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    doc = await db.users.find_one({"_id": oid})
    return _doc_to_out(doc) if doc else None


async def update_last_login(user_id: str) -> None:
    db = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_login": datetime.now(timezone.utc)}},
    )


async def update_profile(user_id: str, updates: dict) -> dict | None:
    db = get_db()
    updates["updated_at"] = datetime.now(timezone.utc)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    return await get_user_by_id(user_id)


async def set_reset_token(email: str, token: str, expires: datetime) -> None:
    db = get_db()
    await db.users.update_one(
        {"email": email},
        {"$set": {"reset_token": token, "reset_token_expires": expires}},
    )


async def get_user_by_reset_token(token: str) -> dict | None:
    db = get_db()
    doc = await db.users.find_one({"reset_token": token})
    return _doc_to_out(doc) if doc else None


async def set_new_password(user_id: str, password_hash: str) -> None:
    db = get_db()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {"password_hash": password_hash, "updated_at": datetime.now(timezone.utc)},
            "$unset": {"reset_token": "", "reset_token_expires": ""},
        },
    )


async def list_users(skip: int = 0, limit: int = 50, search: str | None = None) -> list[dict]:
    db = get_db()
    query = {}
    if search:
        query = {"$or": [{"name": {"$regex": search, "$options": "i"}}, {"email": {"$regex": search, "$options": "i"}}]}
    cursor = db.users.find(query).skip(skip).limit(limit).sort("created_at", -1)
    return [_doc_to_out(doc) async for doc in cursor]


async def set_suspended(user_id: str, suspended: bool) -> dict | None:
    db = get_db()
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_suspended": suspended}})
    return await get_user_by_id(user_id)


async def delete_user(user_id: str) -> bool:
    db = get_db()
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0


async def count_users() -> int:
    db = get_db()
    return await db.users.count_documents({})
