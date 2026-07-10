from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

import content_data as content

# ---- DB ------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---- Auth helpers --------------------------------------------------------
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False,
                        samesite="lax", max_age=900, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False,
                        samesite="lax", max_age=604800, path="/")


def public_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "selected_city": user.get("selected_city"),
        "user_type": user.get("user_type"),
        "completed_steps": user.get("completed_steps", []),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---- Brute force ---------------------------------------------------------
MAX_ATTEMPTS = 5
LOCK_MINUTES = 15


async def check_lockout(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("count", 0) >= MAX_ATTEMPTS:
        locked_until = rec.get("locked_until")
        if locked_until and datetime.now(timezone.utc) < datetime.fromisoformat(locked_until):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")


async def record_failed(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    count = (rec.get("count", 0) if rec else 0) + 1
    update = {"count": count}
    if count >= MAX_ATTEMPTS:
        update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCK_MINUTES)).isoformat()
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)


async def clear_attempts(identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})


# ---- App -----------------------------------------------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---- Schemas -------------------------------------------------------------
class RegisterInput(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProfileInput(BaseModel):
    selected_city: Optional[str] = None
    user_type: Optional[str] = None


class ToggleInput(BaseModel):
    step_id: str
    completed: bool


# ---- Auth routes ---------------------------------------------------------
@api_router.post("/auth/register")
async def register(data: RegisterInput, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "role": "user",
        "selected_city": None,
        "user_type": None,
        "completed_steps": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    access = create_access_token(str(res.inserted_id), email)
    refresh = create_refresh_token(str(res.inserted_id))
    set_auth_cookies(response, access, refresh)
    return public_user(doc)


@api_router.post("/auth/login")
async def login(data: LoginInput, request: Request, response: Response):
    email = data.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    await check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        await record_failed(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_attempts(identifier)
    access = create_access_token(str(user["_id"]), email)
    refresh = create_refresh_token(str(user["_id"]))
    set_auth_cookies(response, access, refresh)
    return public_user(user)


@api_router.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=False,
                            samesite="lax", max_age=900, path="/")
        return {"message": "Refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---- Profile & progress --------------------------------------------------
@api_router.put("/profile")
async def update_profile(data: ProfileInput, user: dict = Depends(get_current_user)):
    updates = {}
    if data.selected_city is not None:
        if data.selected_city not in content.CITIES:
            raise HTTPException(status_code=400, detail="Unknown city")
        updates["selected_city"] = data.selected_city
    if data.user_type is not None:
        valid = {t["id"] for t in content.USER_TYPES}
        if data.user_type not in valid:
            raise HTTPException(status_code=400, detail="Unknown user type")
        updates["user_type"] = data.user_type
    if updates:
        await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
    fresh = await db.users.find_one({"_id": user["_id"]})
    return public_user(fresh)


@api_router.post("/progress/toggle")
async def toggle_progress(data: ToggleInput, user: dict = Depends(get_current_user)):
    if data.completed:
        await db.users.update_one({"_id": user["_id"]}, {"$addToSet": {"completed_steps": data.step_id}})
    else:
        await db.users.update_one({"_id": user["_id"]}, {"$pull": {"completed_steps": data.step_id}})
    fresh = await db.users.find_one({"_id": user["_id"]})
    return {"completed_steps": fresh.get("completed_steps", [])}


# ---- Content -------------------------------------------------------------
@api_router.get("/content/meta")
async def content_meta():
    return {"user_types": content.USER_TYPES, "cities": content.city_summaries()}


@api_router.get("/content/cities")
async def get_cities():
    return content.city_summaries()


@api_router.get("/content/city/{slug}")
async def get_city(slug: str):
    city = content.CITIES.get(slug)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return {"slug": city["slug"], "name": city["name"], "state": city["state"],
            "tagline": city["tagline"], "image": city["image"], "intro": city["intro"],
            "city_notes": city["city_notes"]}


@api_router.get("/content/journey")
async def get_journey(city: str, type: str):
    if city not in content.CITIES:
        raise HTTPException(status_code=400, detail="Unknown city")
    valid = {t["id"] for t in content.USER_TYPES}
    if type not in valid:
        raise HTTPException(status_code=400, detail="Unknown user type")
    phases = content.build_journey(city, type)
    total = sum(len(p["steps"]) for p in phases)
    return {"city": city, "user_type": type, "total_steps": total, "phases": phases}


@api_router.get("/content/guide")
async def get_guide():
    """General step-by-step guide — the same process for everyone, no city."""
    phases = content.build_journey(None, None)
    total = sum(len(p["steps"]) for p in phases)
    return {"total_steps": total, "phases": phases}


@api_router.get("/content/city-guide/{slug}")
async def get_city_guide(slug: str):
    """The full process for a specific city (all steps, city-specific merged)."""
    city = content.CITIES.get(slug)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    phases = content.build_journey(slug, None)
    return {
        "slug": city["slug"], "name": city["name"], "state": city["state"],
        "tagline": city["tagline"], "image": city["image"], "intro": city["intro"],
        "phases": phases,
    }


@api_router.get("/content/compare")
async def get_compare():
    return content.compare_data()


@api_router.get("/content/germany-basics")
async def get_germany_basics():
    return {"items": content.GERMANY_BASICS}


@api_router.get("/")
async def root():
    return {"message": "Ankommen API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Admin", "role": "admin", "selected_city": None,
            "user_type": None, "completed_steps": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})


@app.on_event("shutdown")
async def shutdown():
    client.close()
