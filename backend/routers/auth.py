from bson import ObjectId
from fastapi import APIRouter, Depends, status

from database import get_db
from schemas.user import CompanyRegisterCreate, TokenResponse, UserCreate, UserLogin, UserResponse
from services.auth_service import (
    authenticate_user,
    create_access_token,
    get_current_user,
    register_company_user,
    register_user,
    to_user_response,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db=Depends(get_db)):
    user = await register_user(db, data)
    token = create_access_token(str(user["_id"]), user["role"])
    return {"access_token": token, "user": to_user_response(user)}


@router.post("/register/company", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_company(data: CompanyRegisterCreate, db=Depends(get_db)):
    user = await register_company_user(db, data)
    token = create_access_token(str(user["_id"]), user["role"])
    return {"access_token": token, "user": to_user_response(user)}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db=Depends(get_db)):
    user = await authenticate_user(db, data.identifier, data.password)
    token = create_access_token(str(user["_id"]), user["role"])
    return {"access_token": token, "user": to_user_response(user)}


@router.get("/me", response_model=UserResponse)
async def me(db=Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    return to_user_response(user)
