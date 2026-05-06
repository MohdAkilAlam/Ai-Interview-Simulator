from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId
from database import get_db
from models.user import UserCreate, UserLogin, UserProfile, UserResponse
from auth.jwt_handler import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    db = get_db()

    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "created_at": datetime.now(timezone.utc),
        "total_interviews": 0,
        "average_score": 0.0,
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"user_id": user_id, "email": user.email})

    return UserResponse(
        message="Registration successful",
        user=UserProfile(
            id=user_id,
            name=user.name,
            email=user.email,
            created_at=user_doc["created_at"],
        ),
        token=token,
    )


@router.post("/login", response_model=UserResponse)
async def login(user: UserLogin):
    db = get_db()

    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(db_user["_id"])
    token = create_access_token({"user_id": user_id, "email": user.email})

    return UserResponse(
        message="Login successful",
        user=UserProfile(
            id=user_id,
            name=db_user["name"],
            email=db_user["email"],
            created_at=db_user["created_at"],
            total_interviews=db_user.get("total_interviews", 0),
            average_score=db_user.get("average_score", 0.0),
        ),
        token=token,
    )


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    db = get_db()

    db_user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(
        message="Profile retrieved",
        user=UserProfile(
            id=str(db_user["_id"]),
            name=db_user["name"],
            email=db_user["email"],
            created_at=db_user["created_at"],
            total_interviews=db_user.get("total_interviews", 0),
            average_score=db_user.get("average_score", 0.0),
        ),
    )


@router.put("/profile")
async def update_profile(
    update_data: dict,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    update_fields = {}

    if "name" in update_data and update_data["name"].strip():
        update_fields["name"] = update_data["name"].strip()

    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_fields},
    )

    db_user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})

    return UserResponse(
        message="Profile updated",
        user=UserProfile(
            id=str(db_user["_id"]),
            name=db_user["name"],
            email=db_user["email"],
            created_at=db_user["created_at"],
            total_interviews=db_user.get("total_interviews", 0),
            average_score=db_user.get("average_score", 0.0),
        ),
    )


@router.post("/change-password")
async def change_password(
    password_data: dict,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()

    current_password = password_data.get("current_password", "")
    new_password = password_data.get("new_password", "")

    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Both current and new passwords are required")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    db_user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(current_password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"password": hash_password(new_password)}},
    )

    return {"message": "Password changed successfully"}
