# app/utils/supabase_client.py

from supabase import create_client, Client
import os

# 開発環境用のload_dotenvを削除

supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_service_key: str = os.environ.get("SUPABASE_SERVICE_KEY")

print("環境変数の値:")
print("SUPABASE_URL:", supabase_url)
print("Supabase Service Key (first 10 chars):", supabase_service_key[:10] + "...")

if not supabase_url or not supabase_service_key:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment variables")

supabase: Client = create_client(supabase_url, supabase_service_key)
