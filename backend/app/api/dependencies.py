# app/api/dependencies.py

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
import json

jwt_secret = os.getenv("JWT_SECRET")
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    print(f"Received Token: {token}")  # デバッグ用
    print(f"JWT Secret: {jwt_secret[:5]}...")  # 最初の5文字のみ表示
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"], options={"verify_aud": False, "verify_signature": True})
        print(f"Decoded Payload: {payload}")  # デバッグ用
        user_id = payload.get('sub')
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return json.dumps(payload)  # ペイロード全体を文字列として返す
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidSignatureError:
        print("Invalid signature detected")
        raise HTTPException(status_code=401, detail="Invalid token signature")
    except jwt.InvalidTokenError as e:
        print(f"JWT Error: {e}")  # デバッグ用
        raise HTTPException(status_code=401, detail="Invalid token")
