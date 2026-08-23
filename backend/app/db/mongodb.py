import certifi
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

client = AsyncIOMotorClient(settings.mongo_uri, tlsCAFile=certifi.where())
db = client[settings.mongo_db_name]

users_collection = db["users"]
otp_collection = db["otp_requests"]
exercises_collection = db["exercises"]
chat_collection = db["chat_history"]
analytics_collection = db["analytics_events"]


async def init_indexes():
    """Call once on startup. Enforces uniqueness and auto-expires OTPs."""
    await users_collection.create_index("email", unique=True)
    await otp_collection.create_index("expires_at", expireAfterSeconds=0)
    await otp_collection.create_index("email")
    await exercises_collection.create_index("muscle_group")
    await exercises_collection.create_index("name", unique=True)
    await chat_collection.create_index("user_id", unique=True)
    await analytics_collection.create_index("timestamp")
    await analytics_collection.create_index("event_type")
