"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signInWithGoogle: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter(); // useRouter フックを使用

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession(); // getSessionメソッドを使用
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setUser(data?.session?.user ?? null); // ユーザー情報を取得
      }
      setLoading(false);
    };

    fetchSession();

    // onAuthStateChangeで認証状態を監視
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.subscription.unsubscribe(); // 正しいリスナー解除の方法
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error('Error signing in:', error.message);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
      }
      // ログアウト後、即座にユーザー状態をnullに設定
      setUser(null);
      // ホームページへリダイレクト
      router.push('/');
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
