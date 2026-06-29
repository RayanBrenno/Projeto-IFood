from fastapi import APIRouter, Depends, Query

from database import get_db
from schemas.restaurant import RestaurantResponse

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


def _serialize_restaurant(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "business_name": doc["business_name"],
        "category": doc["category"],
    }


@router.get("/", response_model=list[RestaurantResponse])
async def get_restaurants(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db=Depends(get_db),
):
    cursor = db.companies.find({}).sort("business_name", 1).skip(skip).limit(limit)
    return [_serialize_restaurant(doc) async for doc in cursor]
