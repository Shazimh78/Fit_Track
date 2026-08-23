from typing import Literal, Optional

from pydantic import BaseModel, Field

MuscleGroup = Literal["chest", "back", "legs", "shoulders", "arms", "core", "full_body"]
Equipment = Literal["bodyweight", "dumbbell", "barbell", "machine", "band"]
Difficulty = Literal["beginner", "intermediate", "advanced"]


class AiDescription(BaseModel):
    description: str
    common_mistakes: list[str] = Field(default_factory=list)
    posture_cues: list[str] = Field(default_factory=list)


class ExerciseOut(BaseModel):
    id: str
    name: str
    muscle_group: MuscleGroup
    equipment: Equipment
    difficulty: Difficulty
    default_sets_reps: str
    youtube_video_id: Optional[str] = None
    ai_description: Optional[AiDescription] = None
    posture_tips: list[str] = Field(default_factory=list)
    view_count: int = 0


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: MuscleGroup
    equipment: Equipment
    difficulty: Difficulty
    default_sets_reps: str
    posture_tips: list[str] = Field(default_factory=list)
