from app.schemas.notification import NotificationSettings, NotificationUpdate
from app.utils.supabase_client import supabase
from datetime import datetime
import uuid
import json

class NotificationService:
    def get_settings(self, user_id: str) -> NotificationSettings:
        print(f"Getting settings for user_id: {user_id}")
        result = supabase.table("notification_settings").select("*").eq("user_id", user_id).execute()
        if result.data:
            data = result.data[0]
            data["user_id"] = uuid.UUID(data["user_id"])
            return NotificationSettings(**data)
        return NotificationSettings(
            user_id=uuid.UUID(user_id),
            enabled=True,
            timing="on_expiry_date",
            voice_enabled=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )

    def update_settings(self, user_id: str, update: NotificationUpdate) -> NotificationSettings:
        print(f"Updating settings for user_id: {user_id}")
        print(f"Update data: {update.dict()}")
        
        # 既存の設定を取得
        current_settings = self.get_settings(user_id)
        
        # 更新するフィールドのみを含む辞書を作成
        update_dict = update.dict(exclude_unset=True)
        print(f"Update dict: {update_dict}")
        
        # 現在の設定をベースに更新
        values = {
            "user_id": user_id,
            "enabled": update_dict.get("enabled", current_settings.enabled),
            "timing": update_dict.get("timing", current_settings.timing),
            "voice_enabled": update_dict.get("voice_enabled", current_settings.voice_enabled),
            "updated_at": datetime.now().isoformat(),
            "created_at": current_settings.created_at.isoformat()
        }
        
        print(f"Final values to be sent to Supabase: {values}")
        
        try:
            result = supabase.table("notification_settings").upsert(values).execute()
            print(f"Supabase response: {result.data}")
            
            if not result.data:
                raise ValueError("設定の更新に失敗しました")
            
            response_data = result.data[0]
            response_data["user_id"] = uuid.UUID(response_data["user_id"])
            
            return NotificationSettings(**response_data)
            
        except Exception as e:
            print(f"Error updating settings: {str(e)}")
            raise

    def send_notification(self, user_id: str, food_id: str) -> bool:
        # ここに通知送信のロジックを実装します
        # 例：プッシュ通知の送信、メール送信など
        return True
