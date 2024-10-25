"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { RecipeModal } from "@/app/components/Food/RecipeModal";
import { getNotificationSettings } from '../lib/api';

interface Food {
  id: string;
  user_id: string;
  name: string;
  expiration_date: string; // または Date
  category: string | null;
  image_url: string | null;
  created_at: string; // または Date
  updated_at: string; // または Date
}

// 通知設定の型を追加
interface NotificationSettings {
  enabled: boolean;
  timing: 'three_days_before' | 'one_day_before' | 'on_expiry_date';
}

export default function FoodPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [foods, setFoods] = useState<Food[]>([]);
  const [error, setError] = useState<string>('');
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [expiringFoodsCount, setExpiringFoodsCount] = useState<number>(0);
  const [currentNotificationPermission, setCurrentNotificationPermission] = useState<NotificationPermission>('default');
  const notificationShownRef = useRef<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Food;
    direction: 'ascending' | 'descending';
  }>({
    key: 'expiration_date',
    direction: 'ascending'
  });

  // 賞味期限切れの食品をカウントする関数を先に宣言
  const getExpiredFoodsCount = useCallback(() => {
    const today = new Date();
    return foods.filter(food => {
      const expiryDate = new Date(food.expiration_date);
      return expiryDate < today;
    }).length;
  }, [foods]);

  // 通知権限を確認・取得
  useEffect(() => {
    if ('Notification' in window) {
      setCurrentNotificationPermission(Notification.permission);
    }
  }, []);

  // 通知設定と期限切れチェックの処理を更新
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const settings = await getNotificationSettings();
        setNotificationSettings(settings as NotificationSettings);
      } catch (error) {
        console.error('通知設定の取得に失敗:', error);
      }
    };

    if (user) {
      fetchNotificationSettings();
    }
  }, [user]);

  // 食品データの変更時に通知をチェック
  useEffect(() => {
    // 既に通知済みの場合は処理をスキップ
    if (
      notificationShownRef.current || // useRefを使用してチェック
      !notificationSettings?.enabled || 
      foods.length === 0
    ) {
      return;
    }

    const today = new Date();
    const daysThreshold = notificationSettings.timing === 'three_days_before' 
      ? 3 
      : notificationSettings.timing === 'one_day_before'
      ? 1
      : 0;

    const expiringFoods = foods.filter(food => {
      const expiryDate = new Date(food.expiration_date);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= daysThreshold;
    });

    setExpiringFoodsCount(expiringFoods.length);

    // ブラウザ通知の権限が許可されている場合のみ通知を表示
    if (Notification.permission === 'granted' && (expiringFoods.length > 0 || getExpiredFoodsCount() > 0)) {
      const expiredCount = getExpiredFoodsCount();

      // 期限切れ食品がある場合
      if (expiredCount > 0) {
        new Notification('賞味期限切れの食材があります！', {
          body: `賞味期限が切れている食材が${expiredCount}件あります。`,
          icon: '/favicon.ico'
        });
      }
      // 期限が近い食品がある場合
      else if (expiringFoods.length > 0) {
        const notificationText = notificationSettings.timing === 'three_days_before'
          ? `3日以内に賞味期限が切れる食材が${expiringFoods.length}件あります。`
          : notificationSettings.timing === 'one_day_before'
          ? `1日以内に賞味期限が切れる食材が${expiringFoods.length}件あります。`
          : `本日が賞味期限の食材が${expiringFoods.length}件あります。`;

        new Notification('賞味期限が近い食材があります！', {
          body: notificationText,
          icon: '/favicon.ico'
        });
      }

      // 通知済みフラグを設定
      notificationShownRef.current = true; // useRefを使用して状態を保持
    }
  }, [foods, notificationSettings, getExpiredFoodsCount]);

  // コンポーネントのアンマウント時にリセット
  useEffect(() => {
    return () => {
      notificationShownRef.current = false;
    };
  }, []);

  // 通知権限を要求するボタンコンポーネント
  const NotificationPermissionButton = () => {
    if (!('Notification' in window) || Notification.permission === 'denied') {
      return null;
    }

    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      setCurrentNotificationPermission(permission); // 状態を更新
    };

    // currentNotificationPermission を使用して条件分岐
    if (currentNotificationPermission === 'default') {
      return (
        <Button
          onClick={requestPermission}
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white"
        >
          デスクトップ通知を有効にする
        </Button>
      );
    }

    return null;
  };

  useEffect(() => {
    // ログインしていない場合はホームページにリダイレクト
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      apiClient
      .get<Food[]>('/api/foods') // APIから食品データを取得
      .then((response) => {
        setFoods(response.data); // データを状態に保存
      })
        .catch((error) => {
          console.error('API Error:', error);
          setError('食品データの取得中にエラーが発生しました。');
        });
    }
  }, [user, loading, router]);

  const handleDelete = async (id: string) => {
    if (window.confirm('本当にこの食品を削除しますか？')) {
      try {
        await apiClient.delete(`/api/foods/${id}`);
        setFoods(foods.filter(food => food.id !== id));
      } catch (error) {
        console.error('削除エラー:', error);
        setError('食品の削除中にエラーが発生しました。');
      }
    }
  };

  // ソート用の関数を修正
  const requestSort = (key: keyof Food) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // ソートされたデータを取得する関数を修正
  const getSortedFoods = useMemo(() => {
    const sortedFoods = [...foods];
    sortedFoods.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'ascending' 
        ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
        : (aValue > bValue ? -1 : aValue < bValue ? 1 : 0);
    });
    return sortedFoods;
  }, [foods, sortConfig]);

  // ローディング中または未認証の場合は何も表示しない
  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-8">
      <NotificationPermissionButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-indigo-600">食品リスト</h1>
        <div className="flex gap-4">
          <Link href="/foods/new">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              食品登録
            </Button>
          </Link>
          {foods.some(food => {
            const expirationDate = new Date(food.expiration_date);
            const today = new Date();
            const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            return daysUntilExpiration <= 7;
          }) && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => setIsRecipeModalOpen(true)}
            >
              レシピ提案
            </Button>
          )}
        </div>
      </div>
      
      {/* 通知メッセージを更新 */}
      {notificationSettings?.enabled && expiringFoodsCount > 0 && (
        <div className={`mb-4 p-4 border-l-4 ${
          getExpiredFoodsCount() > 0 
            ? 'bg-red-100 border-red-500 text-red-700'
            : 'bg-yellow-100 border-yellow-500 text-yellow-700'
        }`}>
          <p className="font-bold">
            {getExpiredFoodsCount() > 0 
              ? '賞味期限切れの食材があります！'
              : '賞味期限が近い食材があります！'
            }
          </p>
          <p>
            {getExpiredFoodsCount() > 0 && 
              `賞味期限が切れている食材が${getExpiredFoodsCount()}件あります。`
            }
            {notificationSettings.timing === 'three_days_before' && `3日以内に賞味期限が切れる食材が${expiringFoodsCount}件あります。`}
            {notificationSettings.timing === 'one_day_before' && `1日以内に賞味期限が切れる食材が${expiringFoodsCount}件あります。`}
            {notificationSettings.timing === 'on_expiry_date' && `本日が賞味期限の食材が${expiringFoodsCount}件あります。`}
          </p>
        </div>
      )}
      
      {/* 凡例を追加 */}
      <div className="mb-4">
        <span className="mr-4"><span className="text-black-500 font-bold inline-block w-4 h-4 bg-green-300 mr-1"></span>1週間以上</span>
        <span className="mr-4"><span className="text-black-500 font-bold inline-block w-4 h-4 bg-yellow-300 mr-1"></span>1週間以内</span>
        <span><span className="text-black-500 font-bold inline-block w-4 h-4 bg-red-300 mr-1"></span>3日以内</span>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      <main className="flex-grow">
        <Table className="custom-table">
          <TableHeader>
            <TableRow>
              <TableHead>アラーム</TableHead>
              <TableHead>画像</TableHead>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                名前 {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => requestSort('expiration_date')} className="cursor-pointer">
                賞味期限 {sortConfig?.key === 'expiration_date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => requestSort('category')} className="cursor-pointer">
                カテゴリ {sortConfig?.key === 'category' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead>詳細</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedFoods.map((food) => {
              const expirationDate = new Date(food.expiration_date);
              const today = new Date();
              const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              let expirationClass = 'expiration-normal';
              let alarmColor = 'bg-green-300';
              
              if (daysUntilExpiration <= 3) {
                expirationClass = 'expiration-danger';
                alarmColor = 'bg-red-300';
              } else if (daysUntilExpiration <= 7) {
                expirationClass = 'expiration-warning';
                alarmColor = 'bg-yellow-300';
              }

              return (
                <TableRow key={food.id}>
                  <TableCell>
                    <span className={`inline-block w-4 h-4 ${alarmColor}`}></span>
                  </TableCell>
                  <TableCell>
                    {food.image_url ? (
                      <Image
                        src={food.image_url}
                        alt={food.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500">画像なし</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{food.name}</TableCell>
                  <TableCell className={expirationClass}>{food.expiration_date}</TableCell>
                  <TableCell>{food.category}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/foods/${food.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(food.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </main>
      <RecipeModal
        foods={foods}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />
    </div>
  );
}
