from datetime import datetime, timedelta, timezone

from app.db.mongodb import analytics_collection, chat_collection, exercises_collection, users_collection


async def build_insights() -> dict:
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

    total_users = await users_collection.count_documents({})
    verified_users = await users_collection.count_documents({"is_verified": True})
    active_users = await users_collection.count_documents({"is_active": True})
    new_users_last_7_days = await users_collection.count_documents({"created_at": {"$gte": seven_days_ago}})

    total_exercises = await exercises_collection.count_documents({})

    top_viewed_cursor = exercises_collection.find(
        {"view_count": {"$gt": 0}}
    ).sort("view_count", -1).limit(5)
    top_viewed_docs = await top_viewed_cursor.to_list(length=5)
    most_viewed_exercises = [
        {"name": d["name"], "muscle_group": d["muscle_group"], "view_count": d.get("view_count", 0)}
        for d in top_viewed_docs
    ]

    muscle_pipeline = [
        {"$match": {"event_type": "recommend_request"}},
        {"$unwind": "$muscles"},
        {"$group": {"_id": "$muscles", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    muscle_agg = await analytics_collection.aggregate(muscle_pipeline).to_list(length=10)
    most_requested_muscles = [{"muscle": r["_id"], "request_count": r["count"]} for r in muscle_agg]

    total_chat_messages = await analytics_collection.count_documents({"event_type": "chat_message"})
    chat_messages_last_7_days = await analytics_collection.count_documents({
        "event_type": "chat_message",
        "timestamp": {"$gte": seven_days_ago},
    })

    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "active_users": active_users,
        "new_users_last_7_days": new_users_last_7_days,
        "total_exercises": total_exercises,
        "most_viewed_exercises": most_viewed_exercises,
        "most_requested_muscles": most_requested_muscles,
        "total_chat_messages": total_chat_messages,
        "chat_messages_last_7_days": chat_messages_last_7_days,
    }
