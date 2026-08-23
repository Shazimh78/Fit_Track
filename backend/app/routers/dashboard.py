from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, get_current_user
from app.db.mongodb import users_collection
from app.models.dashboard import DashboardSummary, ProfileUpdateRequest
from app.services.dashboard_service import build_dashboard_summary, build_profile_updates

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary(user: CurrentUser = Depends(get_current_user)):
    profile = await users_collection.find_one({"_id": ObjectId(user.user_id)})
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User profile not found.")

    return build_dashboard_summary(profile)


@router.patch("/profile", response_model=DashboardSummary)
async def update_profile(payload: ProfileUpdateRequest, user: CurrentUser = Depends(get_current_user)):
    oid = ObjectId(user.user_id)
    current = await users_collection.find_one({"_id": oid})
    if not current:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User profile not found.")

    updates = build_profile_updates(current, payload.model_dump())
    if not updates:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No fields to update.")

    await users_collection.update_one({"_id": oid}, {"$set": updates})
    updated = await users_collection.find_one({"_id": oid})
    return build_dashboard_summary(updated)
