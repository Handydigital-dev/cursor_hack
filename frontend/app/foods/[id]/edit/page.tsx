"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

const foodCategories = [
  "野菜", "卵", "果物", "乳製品", "肉類", "魚介類",
  "穀物", "調味料", "飲料", "冷凍食品", "その他"
];

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

export default function EditFoodPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 既存の食品データを取得
    apiClient.get<Food>(`/api/foods/${params.id}`)
      .then((response) => {
        const food = response.data;
        setName(food.name);
        setExpirationDate(format(new Date(food.expiration_date), 'yyyy-MM-dd'));
        setCategory(food.category || '');
        setImageUrl(food.image_url);
        setLoading(false);
      })
      .catch((error) => {
        console.error('データ取得エラー:', error);
        setError('食品データの取得中にエラーが発生しました。');
        setLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const foodData = {
        name,
        expiration_date: format(new Date(expirationDate), 'yyyy-MM-dd'),
        category: category || null,
        image_url: imageUrl,
      };

      const response = await apiClient.put(`/api/foods/${params.id}`, foodData);

      if (response.status === 200) {
        router.push(`/foods/${params.id}`);
      } else {
        throw new Error('予期しないレスポンスステータス');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('食品更新エラー:', error.message);
        setError(`食品の更新中にエラーが発生しました: ${error.message}`);
      } else {
        console.error('予期せぬエラー:', error);
        setError('予期せぬエラーが発生しました');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('本当にこの食品を削除しますか？')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/foods/${params.id}`);
      if (response.status === 200) {
        router.push('/foods');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      setError('食品の削除中にエラーが発生しました。');
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">食品情報の編集</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
          <Label htmlFor="name" className="text-black">食品名</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-black [&:not(:placeholder-shown)]:text-black"
          />
        </div>
        <div>
          <Label htmlFor="expirationDate" className="text-black">賞味期限</Label>
          <Input
            id="expirationDate"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            required
            className="text-black [&:not(:placeholder-shown)]:text-black"
          />
        </div>
        <div>
          <Label htmlFor="category" className="text-black">カテゴリ</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full text-black">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {foodCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {imageUrl && (
          <div className="mb-4">
            <Label className="text-black">現在の画像</Label>
            <Image
              src={imageUrl}
              alt={name}
              width={256}
              height={256}
              className="max-w-xs mt-2"
            />
          </div>
        )}
        <div className="flex justify-between pt-4">
          <div className="space-x-2">
            <Link href={`/foods/${params.id}`}>
              <Button type="button" variant="outline" className="text-black">
                戻る
              </Button>
            </Link>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              削除
            </Button>
          </div>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            更新
          </Button>
        </div>
      </form>
    </div>
  );
}
