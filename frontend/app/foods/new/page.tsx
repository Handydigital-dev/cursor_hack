"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiClient, analyzeImage } from '@/app/lib/api';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { format } from 'date-fns';
import Image from 'next/image';

const foodCategories = [
  "野菜", "卵", "果物", "乳製品", "肉類", "魚介類",
  "穀物", "調味料", "飲料", "冷凍食品", "その他"
];

export default function NewFoodPage() {
  const [name, setName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('画像サイズは10MB以下にしてください。');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(image);
      console.log(result);
      setImageUrl(result.image_url);
      setName(result.name || '');
      // カテゴリの設定を修正
      if (result.category) {
        const trimmedCategory = result.category.trim(); // 余分な空白を削除
        if (foodCategories.includes(trimmedCategory)) {
          setCategory(trimmedCategory);
        } else {
          setCategory('その他');
        }
      } else {
        setCategory('その他');
      }
      // 賞味期限の設定
      if (result.expirationDate) {
        setExpirationDate(format(new Date(result.expirationDate), 'yyyy-MM-dd'));
      }
    } catch (error) {
      console.error('画像分析エラー:', error);
      setError('画像の分析中にエラーが発生しました。詳細: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('ログインしてください。');
      return;
    }

    try {
      const foodData = {
        name,
        expiration_date: format(new Date(expirationDate), 'yyyy-MM-dd'),
        category,
        image_url: imageUrl || undefined, // imageUrlがnullの場合は除外
      };

      const response = await apiClient.post('/api/foods/', foodData);

      if (response.status === 200 || response.status === 201) {
        router.push('/foods');
      } else {
        throw new Error('予期しないレスポンスステータス');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('食品登録エラー:', error.message);
        setError(`食品の登録中にエラーが発生しました: ${error.message}`);
      } else {
        console.error('予期せぬエラー:', error);
        setError('予期せぬエラーが発生しました');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">新しい食品を登録</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
          <Label htmlFor="image" className="text-black">画像（10MB以下）</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-black"
          />
        </div>
        {imagePreview && (
          <div>
            <Image
              src={imagePreview}
              alt="プレビュー"
              width={256}
              height={256}
              className="max-w-xs mb-2"
            />
            <Button
              type="button"
              onClick={handleAnalyzeImage}
              disabled={isAnalyzing}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              {isAnalyzing ? '分析中...' : '画像を分析'}
            </Button>
          </div>
        )}
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
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          登録
        </Button>
      </form>
    </div>
  );
}
