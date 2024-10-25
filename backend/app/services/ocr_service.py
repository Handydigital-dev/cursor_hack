import os
import json
from dotenv import load_dotenv
import tempfile
from google.cloud import vision
import io
from typing import Dict
from datetime import datetime
import re
import google.generativeai as genai
from PIL import Image
from app.utils.supabase_client import supabase
import uuid

# .envファイルから環境変数を読み込む
load_dotenv()

def setup_google_credentials():
    google_credentials_json = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS_JSON')
    if google_credentials_json:
        try:
            credentials_dict = json.loads(google_credentials_json, strict=False)
            
            # 一時ファイルを作成
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
                json.dump(credentials_dict, temp_file, indent=2)
                temp_credentials_path = temp_file.name

            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = temp_credentials_path
            print(f"GOOGLE_APPLICATION_CREDENTIALS_JSONを使用して認証設定しました。パス: {temp_credentials_path}")
            
            return temp_credentials_path  # 一時ファイルのパスを返す
        except json.JSONDecodeError as e:
            print(f"GOOGLE_APPLICATION_CREDENTIALS_JSONの解析に失敗しました: {e}")
            print(f"JSON内容: {google_credentials_json[:1000]}...") # 最初の1000文字を表示
        except Exception as e:
            print(f"認証情報の設定中にエラーが発生しました: {e}")

    # 下記はローカル環境開発用にいれている処理
    credentials_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if credentials_path:
        if os.path.exists(credentials_path):
            print(f"GOOGLE_APPLICATION_CREDENTIALSを使用して認証設定しました: {credentials_path}")
        else:
            print(f"警告: クレデンシャルファイルが見つかりません: {credentials_path}")
    else:
        print("警告: Google Cloud認証情報が設定されていません。")
        raise ValueError("Google Cloud認証情報が設定されていません")

    return None

# 認証情報のセットアップを実行
temp_credentials_path = setup_google_credentials()

# Gemini APIの設定
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

async def process_image(image_file) -> Dict[str, str]:
    temp_credentials_path = None
    try:
        # 認証情報のセットアップを実行
        temp_credentials_path = setup_google_credentials()

        # 画像ファイルの内容を一度だけ読み取る
        content = await image_file.read()
        
        # Google Cloud Vision APIを使用したOCR処理
        client = vision.ImageAnnotatorClient()
        print("クライアント作成成功")

        image = vision.Image(content=content)
        print("Vision Image作成成功")

        response = client.text_detection(image=image)
        print("テキスト検出成功")

        texts = response.text_annotations

        if not texts:
            return {"text": "", "expiration_date": "", "name": "", "category": "", "image_url": ""}

        full_text = texts[0].description
        print(f"full_text: {full_text}")

        # Gemini APIを使用した画像解析
        model = genai.GenerativeModel('gemini-1.5-pro')
        img = Image.open(io.BytesIO(content))
        
        prompt = f"""この画像に写っている商品とカテゴリと賞味期限の情報を抜き出してください。
            賞味期限の表示は必ずYYYY-MM-DDの形式で出力してください。
            カテゴリはこの中から選択してください。野菜,果物,乳製品,肉類,魚介類,穀物,調味料,飲料,冷凍食品,卵,その他

            画像から抽出されたテキスト:
            {full_text}

            上記の情報を参考にしてください。商品名などは補完してください。
            例：ヨーグル→ヨーグルト

            出力は下記の情報のみ出力してください。
            商品名:
            賞味期限:YYYY-MM-DD
            カテゴリ:
            """
        gemini_response = model.generate_content([prompt, img])
        gemini_result = gemini_response.text

        # Gemini APIの結果から情報を抽出
        name = extract_info(gemini_result, r'商品名:\s*(.+)')
        expiration_date = extract_info(gemini_result, r'賞味期限:\s*(\d{4}-\d{2}-\d{2})')
        category = extract_info(gemini_result, r'カテゴリ:\s*(.+)')

        print(f"商品名: {name}")
        print(f"賞味期限: {expiration_date}")
        print(f"カテゴリ: {category}")

        # 画像をSupabaseストレージにアップロード
        file_name = f"{uuid.uuid4()}.jpg"
        bucket_name = "food-images"
        
        # 画像をJPEGとして保存
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()

        supabase.storage.from_(bucket_name).upload(file_name, img_byte_arr, file_options={"content-type": "image/jpeg"})

        # 画像のURLを取得
        image_url = supabase.storage.from_(bucket_name).get_public_url(file_name)

        return {
            "text": full_text,
            "gemini_result": gemini_result,
            "name": name,
            "expiration_date": expiration_date,
            "category": category,
            "image_url": image_url  # 画像URLを追加
        }
    except Exception as e:
        print(f"エラー発生: {str(e)}")
        print(f"エラーの詳細: {type(e).__name__}, {e.args}")
        raise
    finally:
        # 一時ファイルを削除
        if temp_credentials_path and os.path.exists(temp_credentials_path):
            try:
                os.remove(temp_credentials_path)
                print(f"一時認証ファイルを削除しました: {temp_credentials_path}")
            except Exception as e:
                print(f"一時認証ファイルの削除中にエラーが発生しました: {e}")

def extract_info(text: str, pattern: str) -> str:
    match = re.search(pattern, text)
    return match.group(1) if match else ""