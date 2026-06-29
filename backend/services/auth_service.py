import os
import re
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from schemas.company import CompanyRegisterCreate
from schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", 24))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(account_id: str, account_type: str) -> str:
    payload = {
        "sub": account_id,
        "account_type": account_type,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido")


def get_current_company(current_user: dict = Depends(get_current_user)) -> ObjectId:
    if current_user["account_type"] != "RESTAURANTE":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito a parceiros")
    return ObjectId(current_user["sub"])


def to_account_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "username": doc["username"],
        "email": doc["email"],
    }


async def email_taken(db, email: str) -> bool:
    if await db.companies.find_one({"email": email}):
        return True
    if await db.users.find_one({"email": email}):
        return True
    return False


async def find_account(db, email: str) -> tuple[dict, str]:
    company = await db.companies.find_one({"email": email})
    if company:
        return company, "RESTAURANTE"

    user = await db.users.find_one({"email": email})
    if user:
        return user, "CLIENTE"

    return None, None


async def register_user(db, data: UserCreate) -> dict:
    if await email_taken(db, data.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já cadastrado")
    if await db.users.find_one({"username": data.username}):
        raise HTTPException(status.HTTP_409_CONFLICT, "Nome de usuário já está em uso")

    user_doc = {
        "username": data.username,
        "email": data.email,
        "password": hash_password(data.password),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


async def register_company_user(db, data: CompanyRegisterCreate) -> dict:
    if await email_taken(db, data.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já cadastrado")

    slug = re.sub(r"[^a-z0-9]", "", data.business_name.lower())[:20] or "parceiro"
    username = f"{slug}_{secrets.token_hex(3)}"

    company_doc = {
        "username": username,
        "email": data.email,
        "password": hash_password(data.password),
        "business_name": data.business_name,
        "document_type": data.document_type,
        "document_number": data.document_number,
        "category": data.category,
        "responsible_name": data.responsible_name,
        "phone": data.phone,
    }
    result = await db.companies.insert_one(company_doc)
    company_doc["_id"] = result.inserted_id
    return company_doc


async def authenticate_user(db, email: str, password: str) -> tuple[dict, str]:
    account, account_type = await find_account(db, email)
    if not account or not verify_password(password, account["password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas")
    return account, account_type
