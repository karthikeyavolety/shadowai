"""
Database connection layer.

In production, set MONGO_URI to a real MongoDB Atlas connection string and
this connects with the real async Motor driver.

If MONGO_URI is not set (e.g. running locally without Atlas, or ENV=demo),
this transparently falls back to an in-memory Mongo-compatible engine
(mongomock_motor) so the whole app runs with zero external dependencies.
Every repository in /repositories talks to `get_db()` the same way either
way — nothing else in the codebase needs to know which engine is active.
"""

from app.core.config import settings

_client = None
_db = None


def _build_client():
    global _client
    if settings.MONGO_URI:
        from motor.motor_asyncio import AsyncIOMotorClient

        return AsyncIOMotorClient(settings.MONGO_URI)
    else:
        from mongomock_motor import AsyncMongoMockClient

        return AsyncMongoMockClient()


async def connect_to_mongo():
    global _client, _db
    _client = _build_client()
    _db = _client[settings.MONGO_DB_NAME]
    await create_indexes()


async def close_mongo_connection():
    global _client
    if _client:
        _client.close()


def get_db():
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _db


async def create_indexes():
    db = get_db()
    await db.users.create_index("email", unique=True)
    await db.scans.create_index([("user_id", 1), ("created_at", -1)])
    await db.reports.create_index([("user_id", 1), ("created_at", -1)])
    await db.history.create_index([("user_id", 1), ("recorded_at", -1)])
    await db.logs.create_index([("user_id", 1), ("created_at", -1)])
