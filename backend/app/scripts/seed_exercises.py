"""
Run once to populate the exercises collection:
    python -m app.scripts.seed_exercises
Safe to re-run — uses upsert on the unique 'name' index, so it won't
create duplicates if you run it twice.
"""
import asyncio

from app.db.mongodb import exercises_collection, init_indexes
from app.scripts.exercise_seed_data import EXERCISES


async def seed():
    await init_indexes()

    inserted = 0
    updated = 0
    for exercise in EXERCISES:
        result = await exercises_collection.update_one(
            {"name": exercise["name"]},
            {"$setOnInsert": {
                "youtube_video_id": None,
                "ai_description": None,
            }, "$set": exercise},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1
        elif result.modified_count:
            updated += 1

    total = await exercises_collection.count_documents({})
    print(f"Seed complete: {inserted} inserted, {updated} updated, {total} total in collection.")


if __name__ == "__main__":
    asyncio.run(seed())
