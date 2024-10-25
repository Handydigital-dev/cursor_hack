# app/api/routes/testdata.py

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.dependencies import get_current_user  # 既に作成済みのユーザー認証関数を使用
from app.utils.supabase_client import supabase

router = APIRouter()

@router.post("/api/testdata")
def create_test_data(user_id: str = Depends(get_current_user)):
    try:
        print("create_test_data called")
        # カラム名を 'expiry_date' から 'expiration_date' に修正
        test_data = [
            { "user_id": user_id, "name": "りんご", "expiration_date": "2024-09-25","category":"果物"},
            { "user_id": user_id, "name": "バター", "expiration_date": "2024-10-01","category":"乳製品"},
            { "user_id": user_id, "name": "チーズ", "expiration_date": "2024-09-20","category":"乳製品"},
            { "user_id": user_id, "name": "キムチ", "expiration_date": "2024-09-20","category":"食品"},
            { "user_id": user_id, "name": "たまねぎ", "expiration_date": "2024-09-20","category":"野菜"},
            { "user_id": user_id, "name": "ヨーグルト", "expiration_date": "2024-09-20","category":"食品"},
            { "user_id": user_id, "name": "チョコレート", "expiration_date": "2024-09-20","category":"菓子"},
        ]
        # 'expiration_date' を使用してデータを挿入
        response = supabase.from_("foods").insert(test_data).execute()
        if response.get("error"):
            print(f"Error inserting data: {response['error']}")  # デバッグ用ログ
            return {"error": response["error"]}
        print("Test data inserted successfully")  # デバッグ用ログ
        return {"message": "テストデータが追加されました"}
    except Exception as e:
        print(f"Error: {e}")  # 例外が発生した場合のログ出力
        return {"error": str(e)}
