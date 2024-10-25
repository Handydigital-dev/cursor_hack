# app/api/routes/test.py

from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/api/test")
def test_endpoint(user_id: str = Depends(get_current_user)):
    return {"message": "This is a protected route", "user_id": user_id}
