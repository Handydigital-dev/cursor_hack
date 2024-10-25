"use client";

import { useAuth } from './context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { apiClient } from './lib/api';
import Link from 'next/link';
import { Button } from "./components/ui/button";
import { FaRegCalendarAlt, FaCamera, FaBell } from 'react-icons/fa';
import { FeatureCard } from './components/ui/FeatureCard';
import { LoginModal } from './components/auth/LoginModal';

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      console.log('user', user);
      apiClient
        .get('/api/test')
        .then((response) => {
          console.log(response.data.message + ":" + response.data.user_id);
        })
        .catch((error) => {
          console.error('API Error:', error);
        });
      const redirectTo = searchParams.get('from') || '/foods';
      router.push(decodeURIComponent(redirectTo));
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-8">
      <main className="text-center w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-indigo-600">冷蔵庫賞味期限チェッカー</h1>
        <FaRegCalendarAlt className="text-4xl sm:text-5xl md:text-6xl text-indigo-500 mb-4 sm:mb-6 mx-auto" />
        <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-gray-700 px-4 sm:px-0">
          食品の賞味期限を簡単に管理し、無駄を減らしましょう。
          新鮮で安全な食生活をサポートします！
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <FeatureCard
            icon={<FaCamera className="text-3xl sm:text-4xl text-indigo-500" />}
            title="簡単登録"
            description="食品のラベルを撮影するだけで、自動的に賞味期限を登録できます。"
          />
          <FeatureCard
            icon={<FaRegCalendarAlt className="text-3xl sm:text-4xl text-indigo-500" />}
            title="期限管理"
            description="登録した食品の賞味期限を一覧で確認。期限が近づくとお知らせします。"
          />
          <FeatureCard
            icon={<FaBell className="text-3xl sm:text-4xl text-indigo-500" />}
            title="通知機能"
            description="賞味期限が近づいた食品を通知。食品ロスを防ぎます。"
          />
        </div>
        {user ? (
          <Link href="/foods">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105">
              食品一覧を見る
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={() => setShowLoginModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105"
          >
            今すぐ始める
          </Button>
        )}

        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={signInWithGoogle}
        />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
