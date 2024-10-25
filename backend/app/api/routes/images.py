from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from google.cloud import vision
from app.api import dependencies as deps
from app.services.ocr_service import process_image
from typing import Dict

router = APIRouter()

@router.post("/ocr")
async def ocr_image(
    image: UploadFile = File(...),
    current_user: str = Depends(deps.get_current_user)
) -> Dict[str, str]:
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="アップロードされたファイルは画像ではありません")

    try:
        ocr_result = await process_image(image)
        return ocr_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR処理中にエラーが発生しました: {str(e)}")