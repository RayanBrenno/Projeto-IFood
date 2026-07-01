from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    CRIADO = "CRIADO"
    CONFIRMADO = "CONFIRMADO"
    EM_PREPARO = "EM_PREPARO"
    SAIU_PARA_ENTREGA = "SAIU_PARA_ENTREGA"
    ENTREGUE = "ENTREGUE"
    CANCELADO = "CANCELADO"


class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int = Field(gt=0)
    size_id: Optional[str] = None


class OrderCreate(BaseModel):
    company_id: str
    items: list[OrderItemCreate] = Field(min_length=1)
    notes: Optional[str] = Field(default=None, max_length=300)


class OrderItemResponse(BaseModel):
    name: str
    quantity: int
    unit_price: float
    size_label: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    customer_name: str
    status: OrderStatus
    items: list[OrderItemResponse]
    total: float
    notes: Optional[str] = None
    created_at: datetime


class CustomerOrderResponse(OrderResponse):
    company_name: str


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
