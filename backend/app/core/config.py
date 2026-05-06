from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    MONGO_URI = os.getenv("MONGO_URI")
    DB_NAME = os.getenv("DB_NAME", "team_task_manager")
    JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

    CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")
    CLIENT_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CLIENT_ORIGINS", CLIENT_URL).split(",")
        if origin.strip()
    ]

    ADMIN_NAME = os.getenv("ADMIN_NAME", "Kunal")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")

settings = Settings()