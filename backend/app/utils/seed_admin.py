import bcrypt
from app.core.config import settings
from app.core.database import get_database

async def seed_admin():
    db = get_database()
    email = settings.ADMIN_EMAIL.lower()

    existing = await db.users.find_one({"email": email})
    if existing:
        return

    hashed = bcrypt.hashpw(
        settings.ADMIN_PASSWORD.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    await db.users.insert_one({
        "name": settings.ADMIN_NAME,
        "email": email,
        "password": hashed,
        "globalRole": "admin"
    })