from bson import ObjectId
from fastapi import APIRouter, Depends, status

from database import get_db
from schemas.company import CompanyRegisterCreate
from schemas.user import AccountResponse, TokenResponse, UserCreate, UserLogin
from services.auth_service import (
    authenticate_user,
    create_access_token,
    get_current_user,
    register_company_user,
    register_user,
    to_account_response,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db=Depends(get_db)):
    user = await register_user(db, data)
    token = create_access_token(str(user["_id"]), "CLIENTE")
    return {"access_token": token, "account_type": "CLIENTE", "user": to_account_response(user)}


@router.post("/register/company", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_company(data: CompanyRegisterCreate, db=Depends(get_db)):
    company = await register_company_user(db, data)
    token = create_access_token(str(company["_id"]), "RESTAURANTE")
    return {"access_token": token, "account_type": "RESTAURANTE", "user": to_account_response(company)}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db=Depends(get_db)):
    account, account_type = await authenticate_user(db, data.email, data.password)
    token = create_access_token(str(account["_id"]), account_type)
    return {"access_token": token, "account_type": account_type, "user": to_account_response(account)}


@router.get("/me", response_model=AccountResponse)
async def me(db=Depends(get_db), current_user: dict = Depends(get_current_user)):
    collection = db.companies if current_user["account_type"] == "RESTAURANTE" else db.users
    account = await collection.find_one({"_id": ObjectId(current_user["sub"])})
    return to_account_response(account)
