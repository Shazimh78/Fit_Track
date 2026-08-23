"""
Promotes a verified user to admin. Run this once to bootstrap your first
admin account — after that, use PATCH /admin/users/{id}/role instead.

Usage:
    python -m app.scripts.promote_admin your@email.com
"""
import asyncio
import sys

from app.db.mongodb import users_collection


async def promote(email: str):
    result = await users_collection.update_one(
        {"email": email}, {"$set": {"role": "admin"}}
    )
    if result.matched_count == 0:
        print(f"No user found with email: {email}")
        return
    print(f"{email} is now an admin.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m app.scripts.promote_admin your@email.com")
        sys.exit(1)
    asyncio.run(promote(sys.argv[1]))
