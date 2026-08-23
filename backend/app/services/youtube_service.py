import httpx

from app.core.config import settings

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


async def find_tutorial_video_id(exercise_name: str) -> str | None:
    """
    Returns a single video id for the best-matching tutorial, or None if the
    search fails or finds nothing. Caller is responsible for caching the
    result so this only runs once per exercise, not on every page view —
    YouTube's free quota is 10,000 units/day and a search costs 100 units.
    """
    params = {
        "part": "snippet",
        "q": f"{exercise_name} exercise proper form tutorial",
        "type": "video",
        "maxResults": 1,
        "videoEmbeddable": "true",
        "key": settings.youtube_api_key,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(YOUTUBE_SEARCH_URL, params=params)
            resp.raise_for_status()
        except httpx.HTTPError:
            return None

    items = resp.json().get("items", [])
    if not items:
        return None

    return items[0]["id"]["videoId"]
