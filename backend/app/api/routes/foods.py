from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.food import Food, FoodCreate, FoodUpdate, RecipeRequest, RecipeResponse
from app.api import dependencies as deps
from app.utils.supabase_client import supabase
from datetime import date
import json
from app.utils.gemini_client import get_recipes_from_gemini

router = APIRouter()

@router.get("/", response_model=List[Food])
async def read_foods(current_user: str = Depends(deps.get_current_user)):
    print("Entering read_foods function")  # 関数の開始をログ
    try:
        print(f"Current user: {current_user}")  # 現在のユーザー情報をログ
        user_payload = json.loads(current_user)
        user_id = user_payload.get('sub')
        print(f"User ID: {user_id}")
        response = supabase.table("foods").select("*").eq("user_id", user_id).execute()
        print(f"Supabase response: {response}")
        return response.data
    except Exception as e:
        print(f"Error in read_foods: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Food)
async def create_food(food: FoodCreate, current_user: str = Depends(deps.get_current_user)):
    try:
        user_payload = json.loads(current_user)
        user_id = user_payload.get('sub')
        print(f"Received food data: {food}")  # デバッグ用ログ
        food_data = food.dict()
        food_data["user_id"] = user_id
        food_data["expiration_date"] = food_data["expiration_date"].isoformat()  # dateオブジェクトを文字列に変換
        # image_urlがNoneでない場合のみ保存
        if food_data["image_url"]:
            food_data["image_url"] = food_data["image_url"]
        response = supabase.table("foods").insert(food_data).execute()
        return response.data[0]
    except Exception as e:
        print(f"Error creating food: {str(e)}")  # エラーログ
        raise HTTPException(status_code=422, detail=f"データの処理中にエラーが発生しました: {str(e)}")

@router.get("/{food_id}", response_model=Food)
async def read_food(food_id: str, current_user: str = Depends(deps.get_current_user)):
    user_payload = json.loads(current_user)
    user_id = user_payload.get('sub')
    response = supabase.table("foods").select("*").eq("id", food_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Food not found")
    return response.data[0]

@router.put("/{food_id}", response_model=Food)
async def update_food(food_id: str, food: FoodUpdate, current_user: str = Depends(deps.get_current_user)):
    try:
        user_payload = json.loads(current_user)
        user_id = user_payload.get('sub')
        
        # food_dataをdict形式で取得し、expiration_dateを文字列に変換
        food_data = food.dict()
        food_data["expiration_date"] = food_data["expiration_date"].isoformat()
        
        response = supabase.table("foods").update(food_data).eq("id", food_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Food not found")
        return response.data[0]
    except Exception as e:
        print(f"Error updating food: {str(e)}")  # エラーログ
        raise HTTPException(status_code=422, detail=f"データの更新中にエラーが発生しました: {str(e)}")

@router.delete("/{food_id}", response_model=Food)
async def delete_food(food_id: str, current_user: str = Depends(deps.get_current_user)):
    user_payload = json.loads(current_user)
    user_id = user_payload.get('sub')
    response = supabase.table("foods").delete().eq("id", food_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Food not found")
    return response.data[0]

@router.post("/recipes", response_model=RecipeResponse)
async def get_recipes(request: RecipeRequest, token: str = Depends(deps.get_current_user)):
    try:
        # リクエストの受信をログ
        print("Received request for /api/foods/recipes")
        print(f"Request data: {request}")
        
        recipes = await get_recipes_from_gemini(request.ingredients)
        
        # レシピの取得をログ
        print(f"Retrieved recipes: {recipes}")
        
        return {"recipes": recipes}
    except Exception as e:
        # エラーの詳細をログ
        print(f"Error in get_recipes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
