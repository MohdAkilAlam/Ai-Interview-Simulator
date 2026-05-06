import motor.motor_asyncio
from config import MONGODB_URI, DATABASE_NAME

client = None
db = None


async def connect_db():
    global client, db
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.interviews.create_index("user_id")
    print(f"Connected to MongoDB: {DATABASE_NAME}")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db
