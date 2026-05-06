from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_database
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.core.serializers import serialize_user
from app.schemas.auth import SignupRequest, LoginRequest

router = APIRouter()

@router.post("/signup")
async def signup(payload: SignupRequest):
    db = get_database()
    email = payload.email.lower()

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(payload.password)
    result = await db.users.insert_one({
        "name": payload.name,
        "email": email,
        "password": hashed,
        "globalRole": "member"
    })

    user = await db.users.find_one({"_id": result.inserted_id})
    token = create_access_token(str(user["_id"]))

    return {
        **serialize_user(user),
        "token": token
    }

@router.post("/login")
async def login(payload: LoginRequest):
    db = get_database()
    email = payload.email.lower()

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user["_id"]))
    return {
        **serialize_user(user),
        "token": token
    }

@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return current_user