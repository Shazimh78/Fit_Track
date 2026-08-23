from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.models.exercise import MuscleGroup


class RecommendRequest(BaseModel):
    muscles: list[MuscleGroup] = Field(min_length=1, max_length=4)
    # Optional overrides — if omitted, pulled from the user's stored profile.
    # Lets someone check "what if I weighed X" without editing their profile.
    weight_kg: Optional[float] = Field(default=None, gt=0, lt=400)
    height_cm: Optional[float] = Field(default=None, gt=0, lt=300)
    # Self-reported training experience, if the person wants to set it
    # directly rather than have it inferred from BMI. This is intentionally
    # NOT derived from gender — average population strength differences
    # exist, but individual variation swamps them; a trained woman and an
    # untrained man are not well served by the same demographic assumption.
    # Letting the person state their own level is the more accurate signal.
    experience_level: Optional[Literal["beginner", "intermediate", "advanced"]] = None


class RecommendedExercise(BaseModel):
    id: str
    name: str
    muscle_group: MuscleGroup
    equipment: str
    difficulty: str
    default_sets_reps: str
    youtube_video_id: Optional[str] = None


class MuscleRecommendation(BaseModel):
    muscle: MuscleGroup
    exercises: list[RecommendedExercise]


class RecommendResponse(BaseModel):
    bmi: float
    bmi_category: str
    intensity_tier: str
    recommendations: list[MuscleRecommendation]
