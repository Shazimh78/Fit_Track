from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, get_current_user
from app.db.mongodb import analytics_collection, chat_collection, users_collection
from app.models.chat import ChatRequest, ChatResponse
from app.services.gemini_service import send_chat_message

router = APIRouter(prefix="/chat", tags=["chat"])

# How many past messages to send back to Gemini as context. Keeps token
# usage (and therefore latency/cost) bounded as a conversation grows long.
HISTORY_WINDOW = 10
# How many total messages to keep stored per user before trimming oldest.
MAX_STORED_MESSAGES = 100


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, user: CurrentUser = Depends(get_current_user)):
    profile = await users_collection.find_one({"_id": ObjectId(user.user_id)})
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User profile not found.")

    chat_doc = await chat_collection.find_one({"user_id": user.user_id})
    existing_messages = chat_doc["messages"] if chat_doc else []
    recent_history = existing_messages[-HISTORY_WINDOW:]

    reply_text = await send_chat_message(profile, recent_history, payload.message)

    now = datetime.now(timezone.utc)
    new_messages = [
        {"role": "user", "text": payload.message, "timestamp": now},
        {"role": "assistant", "text": reply_text, "timestamp": now},
    ]

    await chat_collection.update_one(
        {"user_id": user.user_id},
        {"$push": {"messages": {"$each": new_messages, "$slice": -MAX_STORED_MESSAGES}}},
        upsert=True,
    )

    await analytics_collection.insert_one({
        "event_type": "chat_message",
        "user_id": user.user_id,
        "timestamp": now,
    })

    full_history = existing_messages + new_messages
    return ChatResponse(reply=reply_text, history=full_history[-HISTORY_WINDOW:])
