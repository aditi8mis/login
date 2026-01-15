from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import JWTError, jwt
from pymongo import MongoClient
from bson import ObjectId
from typing import Optional
from dotenv import load_dotenv
from datetime import datetime, timedelta
import hashlib
import base64
import smtplib
from email.mime.text import MIMEText  # FIXED: MIMEText (uppercase)
import os
import secrets

load_dotenv()

app = FastAPI()

# CORS - FIXED order
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIXED: MongoDB connection AFTER app creation
client = MongoClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/"))
db = client.emoheal
users_collection = db.users
verification_codes = db.verification_codes

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = "HS256"

security = HTTPBearer()  # FIXED: MOVED BEFORE get_current_user

class UserCreate(BaseModel):
    name: str
    dob: str
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class VerifyCode(BaseModel):
    email: str
    code: str

def get_password_hash(password):
    return base64.b64encode(hashlib.sha256(password.encode()).digest()).decode()

def verify_password(plain_password, hashed_password):
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def send_verification_email(email: str, code: str):
    sender_email = "aditiim08@gmail.com"  # CHANGE THIS
    sender_password = "pyok hdap ajlz ffzf"  # CHANGE THIS
    msg = MIMEText(f"Your EmoHeal verification code: {code}\nValid for 15 minutes.")
    msg['Subject'] = 'EmoHeal Email Verification'
    msg['From'] = sender_email
    msg['To'] = email
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return True
    except:
        return False

@app.get("/test-db")
async def test_db():
    try:
        db.command('ping')
        return {"status": "Connected!", "db": "emoheal"}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/register")
async def register(user: UserCreate = Body(...)):
    if users_collection.find_one({"email": user.email, "is_verified": True}):
        raise HTTPException(400, "Email already registered")
    
    code = secrets.token_hex(3).upper()
    hashed_pw = get_password_hash(user.password)
    
    users_collection.update_one(
        {"email": user.email},
        {"$set": {
            "name": user.name, "dob": user.dob, "username": user.username,
            "email": user.email, "hashed_password": hashed_pw,
            "is_verified": False, "created_at": datetime.utcnow()
        }},
        upsert=True
    )
    
    verification_codes.delete_many({"email": user.email})
    verification_codes.insert_one({
        "email": user.email, "code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=15)
    })
    
    email_sent = send_verification_email(user.email, code)
    return {"msg": "Verification code sent" if email_sent else "User saved", "email": user.email}

@app.post("/verify-email")
async def verify_email(verify: VerifyCode = Body(...)):
    code_doc = verification_codes.find_one({
        "email": verify.email, "code": verify.code,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    if not code_doc:
        raise HTTPException(400, "Invalid or expired code")
    
    users_collection.update_one({"email": verify.email}, {"$set": {"is_verified": True}})
    verification_codes.delete_one({"email": verify.email})
    return {"msg": "Email verified! You can now login"}

@app.post("/login")
async def login(user_login: UserLogin = Body(...)):
    user = users_collection.find_one({"username": user_login.username, "is_verified": True})
    if not user or not verify_password(user_login.password, user["hashed_password"]):
        raise HTTPException(401, "Invalid credentials or unverified email")
    access_token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user is None: raise HTTPException(401, "Invalid token")
        return user
    except (JWTError, ValueError):
        raise HTTPException(401, "Invalid token")

@app.get("/verify")
async def verify_user(current_user: dict = Depends(get_current_user)):
    return {"msg": "Verified", "username": current_user["username"]}
