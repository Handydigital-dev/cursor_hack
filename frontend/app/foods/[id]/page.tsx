"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { Button } from "../../components/ui/button";
import Link from 'next/link';
import Image from 'next/image';

interface Food {
  id: string;
  user_id: string;
  name: string;
  expiration_date: string;
  category: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function FoodDetailPage({ params }: { params: { id: string } }) {
  const [food, setFood] = useState<Food | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('Fetching food with ID:', params.id);
    apiClient.get<Food>(`/api/foods/${params.id}`)
      .then((response) => {
        console.log('API response:', response.data);
        setFood(response.data);
      })
      .catch((error) => {
        console.error('API Error:', error);
        if (error.response) {
          console.error('Error response:', error.response);
          setError(`食品データの取得中にエラーが発生しました。エラーコード: ${error.response.status}`);
        } else if (error.request) {
          setError('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
        } else {
          setError('予期せぬエラーが発生しました。');
        }
      });
  }, [params.id]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!food) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">食品の詳細 (ID: {params.id})</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">名前:</label>
          <p className="text-gray-900">{food.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">賞味期限:</label>
          <p className="text-gray-900">{food.expiration_date}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">カテゴリ:</label>
          <p className="text-gray-900">{food.category || '未設定'}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">画像:</label>
          {food.image_url ? (
            <Image
              src={food.image_url}
              alt={food.name}
              width={256}
              height={256}
              className="max-w-xs"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500">画像なし</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <Link href="/foods">
          <Button variant="outline" className="text-black">戻る</Button>
        </Link>
        <Button onClick={() => router.push(`/foods/${food.id}/edit`)}>編集</Button>
      </div>
    </div>
  );
}
