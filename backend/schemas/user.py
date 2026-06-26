import re
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise ValueError("A senha deve ter no mínimo 8 caracteres")
    if not re.search(r"[A-Z]", password):
        raise ValueError("A senha deve ter ao menos 1 letra maiúscula")
    if not re.search(r"\d", password):
        raise ValueError("A senha deve ter ao menos 1 número")
    return password


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return validate_password_strength(value)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AccountResponse(BaseModel):
    id: str
    username: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    account_type: Literal["CLIENTE", "RESTAURANTE"]
    user: AccountResponse
