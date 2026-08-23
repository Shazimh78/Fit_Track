from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user
from app.db.mongodb import exercises_collection
from app.models.exercise import ExerciseOut
from app.services.gemini_service import generate_exercise_description
from app.services.youtube_service import find_tutorial_video_id

router = APIRouter(prefix="/exercises", tags=["exercises"])


def _to_out(doc: dict) -> ExerciseOut:
    doc["id"] = str(doc.pop("_id"))
    return ExerciseOut(**doc)


@router.get("", response_model=list[ExerciseOut])
async def list_exercises(
    muscle: Optional[str] = Query(None, description="Filter by muscle group, e.g. chest"),
    _=Depends(get_current_user),
):
    query = {"muscle_group": muscle} if muscle else {}
    cursor = exercises_collection.find(query).sort("name", 1)
    docs = await cursor.to_list(length=200)
    return [_to_out(d) for d in docs]


@router.get("/{exercise_id}", response_model=ExerciseOut)
async def get_exercise(exercise_id: str, _=Depends(get_current_user)):
    try:
        oid = ObjectId(exercise_id)
    except InvalidId:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid exercise id.")

    doc = await exercises_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exercise not found.")

    updates = {}

    # Cache-first: only call Gemini if we don't already have a description.
    # Keeps repeat views free and instant instead of re-billing every load.
    if not doc.get("ai_description"):
        try:
            doc["ai_description"] = await generate_exercise_description(
                doc["name"], doc["muscle_group"], doc["equipment"]
            )
            updates["ai_description"] = doc["ai_description"]
        except Exception:
            # Don't let a Gemini outage break the whole page — the rest of
            # the exercise data (name, sets/reps, tips) still renders fine.
            doc["ai_description"] = None

    if not doc.get("youtube_video_id"):
        video_id = await find_tutorial_video_id(doc["name"])
        if video_id:
            doc["youtube_video_id"] = video_id
            updates["youtube_video_id"] = video_id

    if updates:
        await exercises_collection.update_one({"_id": oid}, {"$set": updates})

    await exercises_collection.update_one({"_id": oid}, {"$inc": {"view_count": 1}})

    return _to_out(doc)
