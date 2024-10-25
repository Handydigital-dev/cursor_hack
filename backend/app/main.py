# app/main.py

import os
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import foods, images, user, notifications, test, testdata
from app.api.routes import test
from app.api.routes import testdata  # testdataのルートをインポート

load_dotenv()

app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://expiry-checker-front.vercel.app", "http://localhost:3000","http://127.0.0.1:3000"],  # 末尾のスラッシュを削除
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
)

# ルーターの追加
app.include_router(test.router)
app.include_router(testdata.router)
app.include_router(foods.router, prefix="/api/foods", tags=["foods"])
app.include_router(images.router, prefix="/api/image", tags=["images"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Received request from origin: {request.headers.get('origin')}")
    response = await call_next(request)
    return response


