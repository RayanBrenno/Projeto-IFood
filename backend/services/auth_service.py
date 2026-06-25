import os
import re
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from schemas.user import CompanyRegisterCreate, UserCreate, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", 24))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido")


def require_role(*allowed_roles: UserRole):
    def checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso negado para este papel")
        return current_user

    return checker


def to_user_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
    }


async def register_user(db, data: UserCreate) -> dict:
    existing = await db.users.find_one(
        {"$or": [{"email": data.email}, {"username": data.username}]}
    )
    if existing:
        if existing["email"] == data.email:
            raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já cadastrado")
        raise HTTPException(status.HTTP_409_CONFLICT, "Nome de usuário já está em uso")

    user_doc = {
        "username": data.username,
        "email": data.email,
        "password": hash_password(data.password),
        "role": data.role.value,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


async def register_company_user(db, data: CompanyRegisterCreate) -> dict:
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já cadastrado")

    slug = re.sub(r"[^a-z0-9]", "", data.business_name.lower())[:20] or "parceiro"
    username = f"{slug}_{secrets.token_hex(3)}"

    user_doc = {
        "username": username,
        "email": data.email,
        "password": hash_password(data.password),
        "role": UserRole.RESTAURANTE.value,
        "business_name": data.business_name,
        "document_type": data.document_type,
        "document_number": data.document_number,
        "category": data.category,
        "responsible_name": data.responsible_name,
        "phone": data.phone,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


async def authenticate_user(db, identifier: str, password: str) -> dict:
    user = await db.users.find_one(
        {"$or": [{"email": identifier}, {"username": identifier}]}
    )
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas")
    return user
