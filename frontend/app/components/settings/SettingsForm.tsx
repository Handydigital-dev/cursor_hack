"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  // next/routerからnext/navigationに変更
import { supabase } from '../../lib/supabaseClient';
import { NotificationSettings } from './NotificationSettings';
import { getUserProfile } from '../../lib/api';
import Image from 'next/image';

interface User {
  id: string; // または number、適切な型を使用してください
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  email: string;
}

export function SettingsForm() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profile = await getUserProfile(user.id);
          // これは、ユーザー情報とプロフィール情報を統合する操作です。
          // userオブジェクトとprofileオブジェクトのプロパティを1つの新しいオブジェクトにマージし、
          // それをsetUser関数を使用してステートにセットしています。
          // スプレッド演算子（...）を使用することで、両方のオブジェクトのプロパティを新しいオブジェクトにコピーしています。
          console.log('ユーザー情報:', user);
          console.log('プロフィール情報:', profile);
          setUser({ ...user, ...profile });
        }
      } catch (err) {
        console.error('プロフィール読み込みエラー:', err);
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      } finally {
        setLoading(false);
      }
    }
    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error}</div>;
  }

  if (!user) {
    return <div>ユーザー情報が見つかりません。</div>;
  }

  return (
    <div>
      {user && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">ユーザー情報</h2>
            <p>ユーザー名: {user.user_metadata?.full_name || 'N/A'}</p>
            <p>メールアドレス: {user.email}</p>
            <Image
              src={user.user_metadata?.avatar_url || ''}
              alt="User Avatar"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <NotificationSettings userId={user.id} />
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            ログアウト
          </button>
        </>
      )}
    </div>
  );
}
