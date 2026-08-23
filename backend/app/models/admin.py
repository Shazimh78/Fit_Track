from typing import Optional

from pydantic import BaseModel, Field

from app.models.exercise import Difficulty, Equipment, MuscleGroup


class AdminUserOut(BaseModel):
    id: str
    name: str
    email: str
    gender: str
    role: str
    is_verified: bool
    is_active: bool
    created_at: str


class RoleUpdateRequest(BaseModel):
    role: str = Field(pattern="^(user|admin)$")


class ActiveStatusRequest(BaseModel):
    is_active: bool


class ExerciseCreateRequest(BaseModel):
    name: str
    muscle_group: MuscleGroup
    equipment: Equipment
    difficulty: Difficulty
    default_sets_reps: str
    posture_tips: list[str] = Field(default_factory=list)


class ExerciseUpdateRequest(BaseModel):
    name: Optional[str] = None
    muscle_group: Optional[MuscleGroup] = None
    equipment: Optional[Equipment] = None
    difficulty: Optional[Difficulty] = None
    default_sets_reps: Optional[str] = None
    posture_tips: Optional[list[str]] = None


class TopExercise(BaseModel):
    name: str
    muscle_group: str
    view_count: int


class MusclePopularity(BaseModel):
    muscle: str
    request_count: int


class InsightsResponse(BaseModel):
    total_users: int
    verified_users: int
    active_users: int
    new_users_last_7_days: int
    total_exercises: int
    most_viewed_exercises: list[TopExercise]
    most_requested_muscles: list[MusclePopularity]
    total_chat_messages: int
    chat_messages_last_7_days: int
    note: str = (
        "This covers app-specific usage only. For visitor traffic — unique "
        "visitors, geography, device breakdown, referral sources — connect "
        "Google Analytics on the frontend; it's free and does that better "
        "than a hand-rolled visit counter would."
    )
