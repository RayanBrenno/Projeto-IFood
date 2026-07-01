from bson import ObjectId
from fastapi import APIRouter, Depends, status

from database import get_db
from schemas.order import CustomerOrderResponse, OrderCreate, OrderResponse, OrderStatusUpdate
from services.auth_service import get_current_company, get_current_user
from services.order_service import (
    create_order,
    get_company_orders,
    get_customer_order,
    get_customer_orders,
    update_order_status,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def post_order(
    data: OrderCreate,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await create_order(db, current_user, data)


@router.get("/me", response_model=list[CustomerOrderResponse])
async def get_my_orders(
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await get_customer_orders(db, ObjectId(current_user["sub"]))


@router.get("/me/{order_id}", response_model=CustomerOrderResponse)
async def get_my_order(
    order_id: str,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await get_customer_order(db, order_id, ObjectId(current_user["sub"]))


@router.get("/restaurant", response_model=list[OrderResponse])
async def get_restaurant_orders(
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await get_company_orders(db, company_id)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def patch_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await update_order_status(db, order_id, data.status, company_id)
