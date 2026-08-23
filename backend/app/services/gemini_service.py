import json

import httpx

from app.core.config import settings

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent?key={key}"
)

PROMPT_TEMPLATE = """You are a certified strength coach writing content for a fitness app.
For the exercise "{name}" (muscle group: {muscle_group}, equipment: {equipment}),
return ONLY a JSON object with exactly these keys, no other text:

{{
  "description": "2-3 sentences on what the exercise is and which muscles it targets",
  "common_mistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "posture_cues": ["cue 1", "cue 2", "cue 3"]
}}

Keep each list item under 15 words. Do not include medical advice or injury claims,
just standard form coaching."""


async def generate_exercise_description(name: str, muscle_group: str, equipment: str) -> dict:
    prompt = PROMPT_TEMPLATE.format(name=name, muscle_group=muscle_group, equipment=equipment)

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.4,
        },
    }

    url = GEMINI_URL.format(model=settings.gemini_model, key=settings.gemini_api_key)

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

    try:
        parsed = json.loads(raw_text)
    except (json.JSONDecodeError, KeyError):
        # Fall back gracefully rather than breaking the endpoint if Gemini
        # returns something unexpected — the frontend still gets *something*.
        parsed = {
            "description": f"{name} is a {muscle_group} exercise using {equipment}.",
            "common_mistakes": [],
            "posture_cues": [],
        }

    return parsed


CHAT_SYSTEM_INSTRUCTION = """You are the in-app assistant for Fit-Track, a fitness and diet planning app.
Answer questions about diet planning, nutrition basics, workout scheduling, and general
fitness questions, using the user's profile below to personalize advice.

User profile: {gender}, {age} years old, {height_cm}cm, {weight_kg}kg,
target weight {target_weight_kg}kg, activity level: {activity_level}.

Rules:
- Give general nutrition and fitness guidance, not a prescribed medical diet plan.
- Do not diagnose medical conditions or claim to replace a doctor or registered dietitian.
- If the user describes symptoms, an injury, or a medical condition, suggest they consult
  a doctor or registered dietitian rather than trying to answer it yourself.
- Keep responses conversational and concise — a few short paragraphs, not an essay.
"""


def build_chat_payload(profile: dict, history: list[dict], message: str) -> dict:
    """
    Pure function, no network call — kept separate from send_chat_message so
    the prompt-construction logic (context injection, history trimming) can
    be unit tested without hitting the live Gemini API.
    """
    system_text = CHAT_SYSTEM_INSTRUCTION.format(
        gender=profile.get("gender", "unspecified"),
        age=profile.get("age", "unknown"),
        height_cm=profile.get("height_cm", "unknown"),
        weight_kg=profile.get("weight_kg", "unknown"),
        target_weight_kg=profile.get("target_weight_kg", "unknown"),
        activity_level=profile.get("activity_level", "moderate"),
    )

    # Gemini expects alternating user/model turns — map our stored
    # 'assistant' role to Gemini's 'model' role.
    contents = []
    for msg in history:
        gemini_role = "model" if msg["role"] == "assistant" else "user"
        contents.append({"role": gemini_role, "parts": [{"text": msg["text"]}]})

    contents.append({"role": "user", "parts": [{"text": message}]})

    return {
        "system_instruction": {"parts": [{"text": system_text}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.6},
    }


async def send_chat_message(profile: dict, history: list[dict], message: str) -> str:
    payload = build_chat_payload(profile, history, message)
    url = GEMINI_URL.format(model=settings.gemini_model, key=settings.gemini_api_key)

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        return "Sorry, I couldn't generate a response just now — try asking again."
