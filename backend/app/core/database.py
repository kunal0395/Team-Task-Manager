from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient | None = None
database = None

async def connect_to_mongo():
    global client, database
    client = AsyncIOMotorClient(settings.MONGO_URI)
    database = client[settings.DB_NAME]
    await database.users.create_index("email", unique=True)
    await database.project_members.create_index(
        [("projectId", 1), ("userId", 1)],
        unique=True
    )

def get_database():
    if database is None:
        raise RuntimeError("MongoDB is not initialized")
    return database

async def close_mongo_client():
    global client
    if client:
        client.close()