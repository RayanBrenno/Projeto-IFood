from pydantic import BaseModel


class RestaurantResponse(BaseModel):
    id: str
    business_name: str
    category: str
