from pydantic import BaseModel

class UserProfile(BaseModel):
    id: str
    email: str
    name: str | None
    avatar_url: str | None