import { FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-6 sm:mb-0 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">冷蔵庫賞味期限チェッカー</h2>
            <p className="text-gray-400 text-sm sm:text-base">食品ロスを減らし、安全な食生活をサポートします。</p>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex space-x-4 mb-4">
              <a href="#" className="hover:text-indigo-400 transition duration-300">
                <FaGithub size={20} />
              </a>
              <a href="#" className="hover:text-indigo-400 transition duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-indigo-400 transition duration-300">
                <FaInstagram size={20} />
              </a>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition duration-300 mr-4">プライバシーポリシー</Link>
              <Link href="/terms" className="hover:text-white transition duration-300">利用規約</Link>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} 冷蔵庫賞味期限チェッカー. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
