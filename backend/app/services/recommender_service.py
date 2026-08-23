"""
Exercise recommender — a hybrid of a deterministic rules layer and a
content-based scorer, not a black-box model. See the architecture doc,
section 4, for why: exercise prescription is safety-relevant, so the part
that decides intensity has to be transparent and adjustable, not learned.
"""

from app.db.mongodb import exercises_collection

DIFFICULTY_RANK = {"beginner": 0, "intermediate": 1, "advanced": 2}

# Cap total exercises across all requested muscles so a 4-muscle request
# doesn't return an unrealistic 16-exercise workout.
MAX_TOTAL_EXERCISES = 8
MAX_PER_MUSCLE = 4
MIN_PER_MUSCLE = 3


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


def bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "underweight"
    if bmi < 25:
        return "normal"
    if bmi < 30:
        return "overweight"
    return "obese"


def intensity_tier(bmi: float) -> str:
    """
    Deliberately conservative: both underweight and obese categories start
    at 'beginner' intensity — the goal here is safe default programming,
    not maximum training stimulus. A returning/experienced user should be
    able to override this in the UI once that preference exists.
    """
    category = bmi_category(bmi)
    if category in ("underweight", "obese"):
        return "beginner"
    return "intermediate"


def _score(exercise: dict, tier: str) -> int:
    """Lower distance from the target difficulty tier scores higher."""
    tier_rank = DIFFICULTY_RANK[tier]
    ex_rank = DIFFICULTY_RANK[exercise["difficulty"]]
    return -abs(ex_rank - tier_rank)


async def recommend_for_muscle(muscle: str, tier: str) -> list[dict]:
    cursor = exercises_collection.find({"muscle_group": muscle})
    candidates = await cursor.to_list(length=100)

    if not candidates:
        return []

    for c in candidates:
        c["id"] = str(c.pop("_id"))

    candidates.sort(key=lambda ex: _score(ex, tier), reverse=True)

    count = min(max(len(candidates), MIN_PER_MUSCLE), MAX_PER_MUSCLE)
    return candidates[:count]


async def build_recommendation(
    muscles: list[str], weight_kg: float, height_cm: float, experience_level: str | None = None
) -> dict:
    bmi = calculate_bmi(weight_kg, height_cm)
    category = bmi_category(bmi)
    tier = experience_level or intensity_tier(bmi)

    per_muscle_cap = max(MIN_PER_MUSCLE, MAX_TOTAL_EXERCISES // len(muscles))

    recommendations = []
    for muscle in muscles:
        exercises = await recommend_for_muscle(muscle, tier)
        recommendations.append({
            "muscle": muscle,
            "exercises": exercises[:per_muscle_cap],
        })

    return {
        "bmi": bmi,
        "bmi_category": category,
        "intensity_tier": tier,
        "recommendations": recommendations,
    }
