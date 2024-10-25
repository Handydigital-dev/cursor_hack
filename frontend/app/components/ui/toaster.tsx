"use client";

import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 3000, type = 'info' }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md text-white ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    }`}>
      {message}
    </div>
  );
};

export const Toaster: React.FC = () => {
  // ここでToastコンポーネントを管理するロジックを実装します
  // 例: グローバルステート管理やコンテキストを使用してトースト通知を制御
  return (
    <div id="toaster">
      {/* ここでToastコンポーネントをレンダリングします */}
    </div>
  );
};