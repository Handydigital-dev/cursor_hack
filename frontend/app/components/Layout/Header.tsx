// app/components/Layout/Header.tsx

"use client";

import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { FaUser, FaCog, FaSignOutAlt, FaHome, FaList, FaBars } from 'react-icons/fa';
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useState } from 'react';
import { LoginModal } from '../auth/LoginModal';

// user の型を明示的に定義します
interface User {
  // ユーザーの属性を適切に定義
  id: string;
  email?: string;
  // 他の必要な属性
}

interface NavItemsProps {
  user: User | null; // null も許容する場合
  signOut: () => void;
  isMobile?: boolean;
  onLoginClick: () => void;  // 追加
}

export default function Header() {
  const { user, signOut, signInWithGoogle } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-indigo-600 flex items-center hover:text-indigo-700 transition-colors duration-300">
            <span className="mr-2">🍎</span>
            <span className="hidden sm:inline">冷蔵庫賞味期限チェッカー</span>
            <span className="sm:hidden">賞味期限チェッカー</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <NavItems user={user} signOut={signOut} onLoginClick={() => setShowLoginModal(true)} />
          </div>
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <FaBars />
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <NavItems 
              user={user} 
              signOut={signOut} 
              isMobile={true} 
              onLoginClick={() => setShowLoginModal(true)}
            />
          </div>
        )}
      </nav>
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={signInWithGoogle}
      />
    </header>
  );
}

function NavItems({ user, signOut, isMobile = false, onLoginClick }: NavItemsProps) {
  const buttonClass = isMobile ? "w-full justify-start" : "";

  return (
    <>
      <Link href="/">
        <Button variant="ghost" className={`flex items-center ${buttonClass}`}>
          <FaHome className="mr-2" />
          ホーム
        </Button>
      </Link>
      {user && (
        <Link href="/foods">
          <Button variant="ghost" className={`flex items-center ${buttonClass}`}>
            <FaList className="mr-2" />
            食品一覧
          </Button>
        </Link>
      )}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={`flex items-center ${buttonClass}`}>
              <FaUser className="mr-2" />
              {user.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center w-full">
                <FaCog className="mr-2" />
                設定
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <span className="flex items-center text-red-500 w-full">
                <FaSignOutAlt className="mr-2" />
                ログアウト
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          onClick={onLoginClick}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white ${buttonClass}`}
        >
          ログイン
        </Button>
      )}
    </>
  );
}
