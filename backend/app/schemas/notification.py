from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class NotificationSettings(BaseModel):
    user_id: UUID
    enabled: bool = True
    timing: str = 'on_expiry_date'
    voice_enabled: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            UUID: lambda v: str(v)
        }

class NotificationUpdate(BaseModel):
    enabled: bool | None = None
    timing: str | None = None
    voice_enabled: bool | None = None
