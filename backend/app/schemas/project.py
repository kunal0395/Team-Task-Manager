from pydantic import BaseModel, EmailStr, Field
from typing import Literal

class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = ""

class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = None

class AddMemberRequest(BaseModel):
    email: EmailStr
    role: Literal["admin", "member"] = "member"