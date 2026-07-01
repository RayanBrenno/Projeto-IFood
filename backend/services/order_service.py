from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from schemas.order import OrderStatus

VALID_TRANSITIONS: dict[str, set[str]] = {
    OrderStatus.CRIADO: {OrderStatus.CONFIRMADO, OrderStatus.CANCELADO},
    OrderStatus.CONFIRMADO: {OrderStatus.EM_PREPARO, OrderStatus.CANCELADO},
    OrderStatus.EM_PREPARO: {OrderStatus.SAIU_PARA_ENTREGA, OrderStatus.CANCELADO},
    OrderStatus.SAIU_PARA_ENTREGA: {OrderStatus.ENTREGUE},
    OrderStatus.ENTREGUE: set(),
    OrderStatus.CANCELADO: set(),
}


def _serialize_order(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "customer_name": doc["customer_name"],
        "status": doc["status"],
        "items": doc["items"],
        "total": doc["total"],
        "notes": doc.get("notes"),
        "created_at": doc["created_at"],
    }


def _serialize_customer_order(doc: dict) -> dict:
    return {
        **_serialize_order(doc),
        "company_name": doc.get("company_name", ""),
    }


async def create_order(db, user_payload: dict, data) -> dict:
    if not ObjectId.is_valid(data.company_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Restaurante não encontrado")
    company = await db.companies.find_one({"_id": ObjectId(data.company_id)})
    if not company:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Restaurante não encontrado")

    order_items = []
    total = 0.0
    for item_input in data.items:
        if not ObjectId.is_valid(item_input.menu_item_id):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "ID de item inválido")
        menu_item = await db.menu_items.find_one({
            "_id": ObjectId(item_input.menu_item_id),
            "company_id": ObjectId(data.company_id),
        })
        if not menu_item:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Item não encontrado ou não pertence a este restaurante",
            )
        if not menu_item.get("available", True):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"'{menu_item['name']}' está esgotado",
            )

        size_label: str | None = None
        if menu_item["kind"] == "COM_TAMANHOS":
            if not item_input.size_id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"'{menu_item['name']}' requer a escolha de tamanho",
                )
            sizes = menu_item.get("sizes", [])
            size = next((s for s in sizes if s["id"] == item_input.size_id), None)
            if not size:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"Tamanho inválido para '{menu_item['name']}'",
                )
            unit_price: float = size["price"]
            size_label = size["label"]
        else:
            unit_price = menu_item["price"]

        total += unit_price * item_input.quantity
        order_items.append({
            "menu_item_id": str(menu_item["_id"]),
            "name": menu_item["name"],
            "quantity": item_input.quantity,
            "unit_price": unit_price,
            "size_label": size_label,
        })

    customer_id = ObjectId(user_payload["sub"])
    user = await db.users.find_one({"_id": customer_id})
    customer_name = user["username"] if user else "Cliente"

    order_doc = {
        "company_id": ObjectId(data.company_id),
        "company_name": company["business_name"],
        "customer_id": customer_id,
        "customer_name": customer_name,
        "status": OrderStatus.CRIADO.value,
        "items": order_items,
        "total": round(total, 2),
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.orders.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id
    return _serialize_order(order_doc)


async def get_company_orders(db, company_id: ObjectId) -> list[dict]:
    cursor = db.orders.find({"company_id": company_id}).sort("created_at", -1).limit(100)
    return [_serialize_order(doc) async for doc in cursor]


async def get_customer_orders(db, customer_id: ObjectId) -> list[dict]:
    cursor = db.orders.find({"customer_id": customer_id}).sort("created_at", -1).limit(50)
    return [_serialize_customer_order(doc) async for doc in cursor]


async def get_customer_order(db, order_id: str, customer_id: ObjectId) -> dict:
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido não encontrado")
    doc = await db.orders.find_one({"_id": ObjectId(order_id), "customer_id": customer_id})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido não encontrado")
    return _serialize_customer_order(doc)


async def update_order_status(db, order_id: str, new_status: OrderStatus, company_id: ObjectId) -> dict:
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido não encontrado")
    doc = await db.orders.find_one({"_id": ObjectId(order_id), "company_id": company_id})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido não encontrado")

    current = OrderStatus(doc["status"])
    if new_status not in VALID_TRANSITIONS[current]:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Transição inválida: {current.value} → {new_status.value}",
        )

    await db.orders.update_one({"_id": doc["_id"]}, {"$set": {"status": new_status.value}})
    doc["status"] = new_status.value
    return _serialize_order(doc)
