from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=100)