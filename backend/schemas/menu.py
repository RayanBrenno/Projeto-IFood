from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

MenuItemKind = Literal["SIMPLES", "COM_TAMANHOS", "UNITARIO_COM_INGREDIENTES"]


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=60)


class CategoryResponse(BaseModel):
    id: str
    name: str


class IngredientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=60)


class IngredientResponse(BaseModel):
    id: str
    name: str


class MenuItemSizeInput(BaseModel):
    label: str = Field(min_length=1, max_length=40)
    price: float = Field(gt=0)


class MenuItemSizeResponse(BaseModel):
    id: str
    label: str
    price: float


class MenuItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=1, max_length=500)
    category_id: str
    kind: MenuItemKind
    price: Optional[float] = Field(default=None, gt=0)
    sizes: Optional[list[MenuItemSizeInput]] = None
    removable_ingredient_ids: Optional[list[str]] = None

    @model_validator(mode="after")
    def validate_kind_shape(self) -> "MenuItemCreate":
        if self.kind == "COM_TAMANHOS":
            if not self.sizes:
                raise ValueError("COM_TAMANHOS exige ao menos 1 tamanho em 'sizes'")
            if self.price is not None:
                raise ValueError("COM_TAMANHOS não deve ter 'price'")
            if self.removable_ingredient_ids:
                raise ValueError("COM_TAMANHOS não pode ter ingredientes removíveis")
        else:
            if self.price is None:
                raise ValueError(f"{self.kind} exige 'price'")
            if self.sizes:
                raise ValueError(f"{self.kind} não pode ter 'sizes'")
            if self.kind == "SIMPLES" and self.removable_ingredient_ids:
                raise ValueError("SIMPLES não pode ter ingredientes removíveis")
        return self


class MenuItemUpdate(MenuItemCreate):
    available: Optional[bool] = None


class MenuItemAvailabilityUpdate(BaseModel):
    available: bool


class MenuItemResponse(BaseModel):
    id: str
    name: str
    description: str
    category_id: str
    available: bool
    kind: MenuItemKind
    price: Optional[float] = None
    sizes: Optional[list[MenuItemSizeResponse]] = None
    removable_ingredient_ids: Optional[list[str]] = None
