import re

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal

from schemas.user import validate_password_strength


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
