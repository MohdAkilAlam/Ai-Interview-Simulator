from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    total_interviews: int = 0
    average_score: float = 0.0


class UserResponse(BaseModel):
    message: str
    user: Optional[UserProfile] = None
    token: Optional[str] = None
