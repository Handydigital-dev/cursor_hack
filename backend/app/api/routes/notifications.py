from fastapi import APIRouter, Depends, HTTPException
from app.api.dependencies import get_current_user
from app.schemas.notification import NotificationSettings, NotificationUpdate
from app.services.notification_service import NotificationService
import json

router = APIRouter()

@router.get("/", response_model=NotificationSettings)
def get_notification_settings(current_user: str = Depends(get_current_user)):
    try:
        user_data = json.loads(current_user)
        user_id = user_data.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="ユーザーIDが見つかりません")
        
        notification_service = NotificationService()
        settings = notification_service.get_settings(user_id)
        return settings
    except Exception as e:
        print(f"Error in get_notification_settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"通知設定の取得中にエラーが発生しました: {str(e)}")

@router.put("/", response_model=NotificationSettings)
def update_notification_settings(
    update: NotificationUpdate,
    current_user: str = Depends(get_current_user)
):
    try:
        user_data = json.loads(current_user)
        user_id = user_data.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="ユーザーIDが見つかりません")
        
        notification_service = NotificationService()
        try:
            updated_settings = notification_service.update_settings(user_id, update)
            return updated_settings
        except Exception as e:
            print(f"Error updating settings: {str(e)}")
            raise HTTPException(status_code=500, detail=f"設定の更新中にエラーが発生しました: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="無効なユーザーデータ")

@router.post("/send")
def send_notification(
    food_id: str,
    current_user: str = Depends(get_current_user)
):
    try:
        user_data = json.loads(current_user)
        user_id = user_data.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="ユーザーIDが見つかりません")
        
        notification_service = NotificationService()
        result = notification_service.send_notification(user_id, food_id)
        return {"message": "通知が送信されました", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"通知の送信中にエラーが発生しました: {str(e)}")
