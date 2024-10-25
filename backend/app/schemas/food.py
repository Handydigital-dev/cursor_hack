from pydantic import BaseModel
from datetime import date
from uuid import UUID
from typing import List

class FoodBase(BaseModel):
    name: str
    expiration_date: date
    category: str
    image_url: str | None = None

class FoodCreate(FoodBase):
    pass

class FoodUpdate(FoodBase):
    pass

class Food(FoodBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True  # 'orm_mode'の代わりにこれを使用

# 必要に応じて以下のようにRecipeRequestを定義
class RecipeRequest(BaseModel):
    ingredients: List[str]

class RecipeResponse(BaseModel):
    recipes: List[dict]  # レシピのリストを格納するためのフィールド
