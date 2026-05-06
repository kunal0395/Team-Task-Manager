from datetime import datetime, timedelta, timezone
from bson import ObjectId
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.database import get_database
from app.core.serializers import serialize_user

bearer_scheme = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authorized")

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

    db = get_database()
    user = await db.users.find_one({"_id": object_id(user_id)})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return serialize_user(user)

async def require_admin(current_user=Depends(get_current_user)):
    if current_user["globalRole"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only route")
    return current_user