from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from database import get_db
from schemas.menu import (
    CategoryCreate,
    CategoryResponse,
    IngredientCreate,
    IngredientResponse,
    MenuItemAvailabilityUpdate,
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
)
from services.auth_service import get_current_company
from services.menu_service import (
    create_category,
    create_ingredient,
    create_menu_item,
    delete_menu_item,
    get_menu_item,
    list_categories,
    list_ingredients,
    list_menu_items,
    update_menu_item,
    update_menu_item_availability,
)

router = APIRouter(prefix="/menu", tags=["menu"])


async def _resolve_public_company_id(db, company_id: str) -> ObjectId:
    if not ObjectId.is_valid(company_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Restaurante não encontrado")
    company = await db.companies.find_one({"_id": ObjectId(company_id)})
    if not company:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Restaurante não encontrado")
    return company["_id"]


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def post_category(
    data: CategoryCreate,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await create_category(db, company_id, data)


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await list_categories(db, company_id, skip, limit)


@router.post("/ingredients", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
async def post_ingredient(
    data: IngredientCreate,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await create_ingredient(db, company_id, data)


@router.get("/ingredients", response_model=list[IngredientResponse])
async def get_ingredients(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await list_ingredients(db, company_id, skip, limit)


@router.post("/items", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def post_item(
    data: MenuItemCreate,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await create_menu_item(db, company_id, data)


@router.get("/items", response_model=list[MenuItemResponse])
async def get_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await list_menu_items(db, company_id, skip, limit)


@router.get("/items/{item_id}", response_model=MenuItemResponse)
async def get_item(
    item_id: str,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await get_menu_item(db, company_id, item_id)


@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def put_item(
    item_id: str,
    data: MenuItemUpdate,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await update_menu_item(db, company_id, item_id, data)


@router.patch("/items/{item_id}/availability", response_model=MenuItemResponse)
async def patch_item_availability(
    item_id: str,
    data: MenuItemAvailabilityUpdate,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    return await update_menu_item_availability(db, company_id, item_id, data)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    db=Depends(get_db),
    company_id: ObjectId = Depends(get_current_company),
):
    await delete_menu_item(db, company_id, item_id)


@router.get("/public/{company_id}/categories", response_model=list[CategoryResponse])
async def get_public_categories(
    company_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
):
    resolved_company_id = await _resolve_public_company_id(db, company_id)
    return await list_categories(db, resolved_company_id, skip, limit)


@router.get("/public/{company_id}/items", response_model=list[MenuItemResponse])
async def get_public_items(
    company_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
):
    resolved_company_id = await _resolve_public_company_id(db, company_id)
    return await list_menu_items(db, resolved_company_id, skip, limit)
