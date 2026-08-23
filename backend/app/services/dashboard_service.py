"""
Dashboard calculations. Two honest limitations worth flagging:

1. "Calories burnt" here means estimated daily maintenance (BMR x activity
   multiplier via Mifflin-St Jeor) — NOT a measured burn from a tracked
   workout or activity session. There's no wearable/sensor data feeding
   this app, so this is the standard, defensible estimate a fitness app
   can offer without hardware, not a claim of exact measurement.
2. Progress-to-target assumes 'starting_weight_kg' (captured once at
   signup) and the current 'weight_kg' (updated via a future profile
   endpoint) move toward 'target_weight_kg'. Until a weight-update
   endpoint exists, current == starting and progress will show 0%.
"""

from app.services.recommender_service import bmi_category, calculate_bmi

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
}


def build_profile_updates(current: dict, payload: dict) -> dict:
    """
    Figures out what actually changes when a user updates their profile.
    Kept as a pure function (no DB access) so the tricky part — when to
    reset the progress baseline — can be unit tested directly.

    Rule: a routine weight check-in (same target) should keep tracking
    toward the existing goal. Setting a NEW target is a new goal, so the
    progress baseline resets to wherever the person is right now.
    """
    updates = {k: v for k, v in payload.items() if v is not None}
    if not updates:
        return updates

    new_target = updates.get("target_weight_kg")
    if new_target is not None and new_target != current.get("target_weight_kg"):
        updates["starting_weight_kg"] = updates.get("weight_kg", current["weight_kg"])

    return updates


def calculate_bmr(gender: str, weight_kg: float, height_cm: float, age: int) -> int:
    """Mifflin-St Jeor equation — the most widely validated BMR formula."""
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    if gender == "male":
        return round(base + 5)
    if gender == "female":
        return round(base - 161)
    # 'other': average of the male/female offset rather than picking one
    return round(base - 78)


def calculate_progress_percent(starting: float, current: float, target: float) -> float:
    desired_change = target - starting
    if desired_change == 0:
        return 100.0
    actual_change = current - starting
    percent = (actual_change / desired_change) * 100
    return round(max(0.0, min(100.0, percent)), 1)


def build_dashboard_summary(user: dict) -> dict:
    bmi = calculate_bmi(user["weight_kg"], user["height_cm"])
    bmr = calculate_bmr(user["gender"], user["weight_kg"], user["height_cm"], user["age"])
    multiplier = ACTIVITY_MULTIPLIERS.get(user.get("activity_level", "moderate"), 1.55)
    tdee = round(bmr * multiplier)

    starting = user.get("starting_weight_kg", user["weight_kg"])
    progress = calculate_progress_percent(starting, user["weight_kg"], user["target_weight_kg"])

    return {
        "name": user["name"],
        "gender": user["gender"],
        "age": user["age"],
        "height_cm": user["height_cm"],
        "current_weight_kg": user["weight_kg"],
        "target_weight_kg": user["target_weight_kg"],
        "weight_to_go_kg": round(abs(user["weight_kg"] - user["target_weight_kg"]), 1),
        "bmi": bmi,
        "bmi_category": bmi_category(bmi),
        "bmr_calories": bmr,
        "estimated_daily_calories": tdee,
        "progress_percent": progress,
    }
