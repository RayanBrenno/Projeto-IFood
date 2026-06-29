import re

from bson import ObjectId
from fastapi import HTTPException, status
from pymongo import ReturnDocument

from schemas.menu import (
    CategoryCreate,
    IngredientCreate,
    MenuItemAvailabilityUpdate,
    MenuItemCreate,
    MenuItemUpdate,
)


def _escape_name(name: str) -> str:
    return re.escape(name.strip())


def _serialize_category(doc: dict) -> dict:
    return {"id": str(doc["_id"]), "name": doc["name"]}


def _serialize_ingredient(doc: dict) -> dict:
    return {"id": str(doc["_id"]), "name": doc["name"]}


def _serialize_menu_item(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "description": doc["description"],
        "category_id": doc["category_id"],
        "available": doc["available"],
        "kind": doc["kind"],
        "price": doc.get("price"),
        "sizes": doc.get("sizes"),
        "removable_ingredient_ids": doc.get("removable_ingredient_ids"),
    }


async def create_category(db, company_id: ObjectId, data: CategoryCreate) -> dict:
    name = data.name.strip()
    existing = await db.categories.find_one(
        {"company_id": company_id, "name": {"$regex": f"^{_escape_name(name)}$", "$options": "i"}}
    )
    if existing:
        return _serialize_category(existing)

    doc = {"company_id": company_id, "name": name}
    result = await db.categories.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_category(doc)


async def list_categories(db, company_id: ObjectId, skip: int, limit: int) -> list[dict]:
    cursor = db.categories.find({"company_id": company_id}).sort("name", 1).skip(skip).limit(limit)
    return [_serialize_category(doc) async for doc in cursor]


async def create_ingredient(db, company_id: ObjectId, data: IngredientCreate) -> dict:
    name = data.name.strip()
    existing = await db.ingredients.find_one(
        {"company_id": company_id, "name": {"$regex": f"^{_escape_name(name)}$", "$options": "i"}}
    )
    if existing:
        return _serialize_ingredient(existing)

    doc = {"company_id": company_id, "name": name}
    result = await db.ingredients.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_ingredient(doc)


async def list_ingredients(db, company_id: ObjectId, skip: int, limit: int) -> list[dict]:
    cursor = db.ingredients.find({"company_id": company_id}).sort("name", 1).skip(skip).limit(limit)
    return [_serialize_ingredient(doc) async for doc in cursor]


async def _validate_category_ownership(db, company_id: ObjectId, category_id: str) -> None:
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria não encontrada")
    category = await db.categories.find_one({"_id": ObjectId(category_id), "company_id": company_id})
    if not category:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria não encontrada")


async def _validate_ingredient_ownership(db, company_id: ObjectId, ingredient_ids: list[str]) -> None:
    if not ingredient_ids:
        return
    invalid_ids = [i for i in ingredient_ids if not ObjectId.is_valid(i)]
    if invalid_ids:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ingrediente inválido")

    object_ids = [ObjectId(i) for i in ingredient_ids]
    count = await db.ingredients.count_documents({"_id": {"$in": object_ids}, "company_id": company_id})
    if count != len(set(ingredient_ids)):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Algum ingrediente não existe ou não pertence a este parceiro")


def _build_item_doc(company_id: ObjectId, data: MenuItemCreate) -> dict:
    sizes = None
    if data.sizes:
        sizes = [
            {"id": str(ObjectId()), "label": size.label, "price": size.price}
            for size in data.sizes
        ]

    return {
        "company_id": company_id,
        "name": data.name,
        "description": data.description,
        "category_id": data.category_id,
        "kind": data.kind,
        "price": data.price,
        "sizes": sizes,
        "removable_ingredient_ids": data.removable_ingredient_ids,
    }


async def create_menu_item(db, company_id: ObjectId, data: MenuItemCreate) -> dict:
    await _validate_category_ownership(db, company_id, data.category_id)
    await _validate_ingredient_ownership(db, company_id, data.removable_ingredient_ids or [])

    doc = _build_item_doc(company_id, data)
    doc["available"] = True
    result = await db.menu_items.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_menu_item(doc)


async def list_menu_items(db, company_id: ObjectId, skip: int, limit: int) -> list[dict]:
    cursor = db.menu_items.find({"company_id": company_id}).sort("_id", -1).skip(skip).limit(limit)
    return [_serialize_menu_item(doc) async for doc in cursor]


async def get_menu_item(db, company_id: ObjectId, item_id: str) -> dict:
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")
    doc = await db.menu_items.find_one({"_id": ObjectId(item_id), "company_id": company_id})
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")
    return _serialize_menu_item(doc)


async def update_menu_item(db, company_id: ObjectId, item_id: str, data: MenuItemUpdate) -> dict:
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")

    existing = await db.menu_items.find_one({"_id": ObjectId(item_id), "company_id": company_id})
    if not existing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")

    await _validate_category_ownership(db, company_id, data.category_id)
    await _validate_ingredient_ownership(db, company_id, data.removable_ingredient_ids or [])

    doc = _build_item_doc(company_id, data)
    doc["available"] = data.available if data.available is not None else existing["available"]

    await db.menu_items.update_one({"_id": existing["_id"]}, {"$set": doc})
    doc["_id"] = existing["_id"]
    return _serialize_menu_item(doc)


async def update_menu_item_availability(
    db, company_id: ObjectId, item_id: str, data: MenuItemAvailabilityUpdate
) -> dict:
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")

    result = await db.menu_items.find_one_and_update(
        {"_id": ObjectId(item_id), "company_id": company_id},
        {"$set": {"available": data.available}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")
    return _serialize_menu_item(result)


async def delete_menu_item(db, company_id: ObjectId, item_id: str) -> None:
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")

    result = await db.menu_items.delete_one({"_id": ObjectId(item_id), "company_id": company_id})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de cardápio não encontrado")
