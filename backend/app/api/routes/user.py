from fastapi import APIRouter, Depends, HTTPException
from app.api.dependencies import get_current_user
from app.schemas.user import UserProfile
import json

router = APIRouter()

@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str, current_user: str = Depends(get_current_user)):
    print(f"Received user_id: {user_id}")  # デバッグ用
    print(f"Current user: {current_user}")  # デバッグ用
    try:
        user_data = json.loads(current_user)
        print(f"Parsed user_data: {user_data}")  # デバッグ用
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")  # デバッグ用
        raise HTTPException(status_code=500, detail=f"無効なユーザーデータ: {str(e)}")

    if user_id != user_data.get("sub"):
        raise HTTPException(status_code=403, detail="アクセス権限がありません")
    
    return UserProfile(
        id=user_data.get("sub"),
        email=user_data.get("email"),
        name=user_data.get("user_metadata", {}).get("full_name"),
        avatar_url=user_data.get("user_metadata", {}).get("avatar_url")
    )
