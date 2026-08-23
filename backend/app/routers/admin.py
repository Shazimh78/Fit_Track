from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, require_admin
from app.db.mongodb import chat_collection, exercises_collection, users_collection
from app.models.admin import (
    ActiveStatusRequest,
    AdminUserOut,
    ExerciseCreateRequest,
    ExerciseUpdateRequest,
    InsightsResponse,
    RoleUpdateRequest,
)
from app.models.chat import ChatMessage
from app.models.exercise import ExerciseOut
from app.services.gemini_service import generate_exercise_description
from app.services.insights_service import build_insights
from app.services.youtube_service import find_tutorial_video_id

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _parse_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid id format.")


# ---- Users ----

@router.get("/users", response_model=list[AdminUserOut])
async def list_users():
    docs = await users_collection.find({}).sort("created_at", -1).to_list(length=500)
    return [
        AdminUserOut(
            id=str(d["_id"]),
            name=d["name"],
            email=d["email"],
            gender=d["gender"],
            role=d["role"],
            is_verified=d["is_verified"],
            is_active=d.get("is_active", True),
            created_at=d["created_at"].isoformat(),
        )
        for d in docs
    ]


@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, payload: RoleUpdateRequest):
    oid = _parse_object_id(user_id)
    result = await users_collection.update_one({"_id": oid}, {"$set": {"role": payload.role}})
    if result.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")
    return {"message": f"Role updated to {payload.role}."}


@router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, payload: ActiveStatusRequest):
    oid = _parse_object_id(user_id)
    result = await users_collection.update_one({"_id": oid}, {"$set": {"is_active": payload.is_active}})
    if result.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")
    state = "activated" if payload.is_active else "deactivated"
    return {"message": f"User {state}."}


# ---- Exercises ----

@router.post("/exercises", response_model=ExerciseOut, status_code=status.HTTP_201_CREATED)
async def create_exercise(payload: ExerciseCreateRequest):
    existing = await exercises_collection.find_one({"name": payload.name})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An exercise with this name already exists.")

    doc = payload.model_dump()
    doc.update({"youtube_video_id": None, "ai_description": None, "view_count": 0})
    result = await exercises_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return ExerciseOut(**doc)


@router.patch("/exercises/{exercise_id}", response_model=ExerciseOut)
async def update_exercise(exercise_id: str, payload: ExerciseUpdateRequest):
    oid = _parse_object_id(exercise_id)
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No fields to update.")

    result = await exercises_collection.find_one_and_update(
        {"_id": oid}, {"$set": updates}, return_document=True,
    )
    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exercise not found.")

    result["id"] = str(result.pop("_id"))
    return ExerciseOut(**result)


@router.delete("/exercises/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(exercise_id: str):
    oid = _parse_object_id(exercise_id)
    result = await exercises_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exercise not found.")


@router.post("/exercises/{exercise_id}/regenerate", response_model=ExerciseOut)
async def regenerate_exercise_content(exercise_id: str):
    """Force-refresh the AI description and video, bypassing the cache —
    useful if Gemini/YouTube returned something wrong the first time."""
    oid = _parse_object_id(exercise_id)
    doc = await exercises_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Exercise not found.")

    ai_description = await generate_exercise_description(doc["name"], doc["muscle_group"], doc["equipment"])
    video_id = await find_tutorial_video_id(doc["name"])

    updates = {"ai_description": ai_description}
    if video_id:
        updates["youtube_video_id"] = video_id

    await exercises_collection.update_one({"_id": oid}, {"$set": updates})
    doc.update(updates)
    doc["id"] = str(doc.pop("_id"))
    return ExerciseOut(**doc)


# ---- Chat logs ----

@router.get("/chat-logs/{user_id}", response_model=list[ChatMessage])
async def view_user_chat_log(user_id: str):
    doc = await chat_collection.find_one({"user_id": user_id})
    if not doc:
        return []
    return doc["messages"]


# ---- Insights ----

@router.get("/insights", response_model=InsightsResponse)
async def insights():
    data = await build_insights()
    return InsightsResponse(**data)
