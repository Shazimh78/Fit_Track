from typing import Literal, Optional

from pydantic import BaseModel, Field


class DashboardSummary(BaseModel):
    name: str
    gender: str
    age: int
    height_cm: float
    current_weight_kg: float
    target_weight_kg: float
    weight_to_go_kg: float
    bmi: float
    bmi_category: str
    bmr_calories: int
    estimated_daily_calories: int
    progress_percent: float


class ProfileUpdateRequest(BaseModel):
    age: Optional[int] = Field(default=None, gt=0, lt=120)
    height_cm: Optional[float] = Field(default=None, gt=0, lt=300)
    weight_kg: Optional[float] = Field(default=None, gt=0, lt=400)
    target_weight_kg: Optional[float] = Field(default=None, gt=0, lt=400)
    activity_level: Optional[Literal["sedentary", "light", "moderate", "active"]] = None
