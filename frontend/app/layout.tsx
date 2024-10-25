// app/layout.tsx

import './globals.css'; // グローバルなスタイルをインポート
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { Toaster } from "@/app/components/ui/toaster"
import { Noto_Sans_JP } from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="bg-gray-100">
      <head>
        <title>冷蔵庫賞味期限チェッカー</title>
      </head>
      <body className={`font-sans min-h-screen flex flex-col ${notoSansJP.className}`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
