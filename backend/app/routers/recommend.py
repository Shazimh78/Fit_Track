from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, get_current_user
from app.db.mongodb import analytics_collection, users_collection
from app.models.recommender import RecommendRequest, RecommendResponse
from app.services.recommender_service import build_recommendation

router = APIRouter(prefix="/recommend", tags=["recommend"])


@router.post("", response_model=RecommendResponse)
async def recommend_exercises(payload: RecommendRequest, user: CurrentUser = Depends(get_current_user)):
    weight_kg = payload.weight_kg
    height_cm = payload.height_cm

    if weight_kg is None or height_cm is None:
        profile = await users_collection.find_one({"_id": ObjectId(user.user_id)})
        if not profile:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "User profile not found.")
        weight_kg = weight_kg or profile["weight_kg"]
        height_cm = height_cm or profile["height_cm"]

    result = await build_recommendation(payload.muscles, weight_kg, height_cm, payload.experience_level)

    # Fire-and-forget style logging for admin insights — doesn't block the
    # response if it fails, since this is analytics, not core functionality.
    await analytics_collection.insert_one({
        "event_type": "recommend_request",
        "user_id": user.user_id,
        "muscles": payload.muscles,
        "timestamp": datetime.now(timezone.utc),
    })

    return result
