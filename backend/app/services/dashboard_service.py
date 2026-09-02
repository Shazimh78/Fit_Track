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


CAL_PER_KG_FAT = 7700  # standard approximation used across fitness apps

# Never suggest below these, regardless of what the math says. These are
# widely-cited minimums; going lower isn't something an app should casually
# recommend without medical supervision.
MIN_CALORIES = {"male": 1500, "female": 1200, "other": 1350}

# Paces offered, in kg/week. Capped at 0.75 — beyond roughly 1kg/week for
# most people, the required deficit gets hard to sustain safely without
# guidance, so the app doesn't offer faster options than this.
PACE_OPTIONS = [
    ("steady", 0.25),
    ("moderate", 0.5),
    ("aggressive", 0.75),
]


def build_calorie_plan(gender: str, maintenance_calories: int, current_weight: float, target_weight: float) -> list[dict]:
    """
    For each pace option, compute a daily calorie target and estimated time
    to reach the goal. Direction (surplus vs deficit) is inferred from
    current vs target weight — the caller doesn't need to specify it.
    Returns an empty list if already at the target weight.
    """
    diff = target_weight - current_weight
    if abs(diff) < 0.1:
        return []

    direction = 1 if diff > 0 else -1  # +1 = gaining, -1 = losing
    floor = MIN_CALORIES.get(gender, MIN_CALORIES["other"])

    plan = []
    for label, pace_kg_per_week in PACE_OPTIONS:
        weekly_change_kcal = pace_kg_per_week * CAL_PER_KG_FAT
        daily_adjustment = round(weekly_change_kcal / 7)

        raw_target = maintenance_calories + (direction * daily_adjustment)
        floor_applied = direction < 0 and raw_target < floor
        daily_calories = max(raw_target, floor) if direction < 0 else raw_target

        weeks_to_goal = round(abs(diff) / pace_kg_per_week, 1)

        plan.append({
            "label": label,
            "pace_kg_per_week": pace_kg_per_week,
            "daily_calories": daily_calories,
            "weekly_change_kcal": round(weekly_change_kcal),
            "estimated_weeks": weeks_to_goal,
            "floor_applied": floor_applied,
        })

    return plan


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

    calorie_plan = build_calorie_plan(
        user["gender"], tdee, user["weight_kg"], user["target_weight_kg"]
    )

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
        "calorie_plan": calorie_plan,
    }
