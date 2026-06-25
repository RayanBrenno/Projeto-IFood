import re
from enum import Enum
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRole(str, Enum):
    CLIENTE = "CLIENTE"
    RESTAURANTE = "RESTAURANTE"
    ADMIN = "ADMIN"


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
    role: UserRole = UserRole.CLIENTE

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return validate_password_strength(value)


class CompanyRegisterCreate(BaseModel):
    business_name: str = Field(min_length=2, max_length=120)
    document_type: Literal["CNPJ", "CPF"]
    document_number: str
    category: str = Field(min_length=2, max_length=60)
    responsible_name: str = Field(min_length=2, max_length=120)
    phone: str
    email: EmailStr
    password: str

    @field_validator("document_number")
    @classmethod
    def document_number_digits(cls, value: str, info) -> str:
        digits = re.sub(r"\D", "", value)
        expected_length = 14 if info.data.get("document_type") == "CNPJ" else 11
        if len(digits) != expected_length:
            doc_label = info.data.get("document_type", "documento")
            raise ValueError(f"{doc_label} deve ter {expected_length} dígitos")
        return digits

    @field_validator("phone")
    @classmethod
    def phone_digits(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if not (10 <= len(digits) <= 11):
            raise ValueError("Telefone deve ter 10 ou 11 dígitos (com DDD)")
        return digits

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return validate_password_strength(value)


class UserLogin(BaseModel):
    identifier: str  # aceita e-mail ou username
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
