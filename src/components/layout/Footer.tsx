import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto border-t-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* ロゴ＆概要 */}
        <div className="col-span-1 md:col-span-1">
<Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="passpica" 
              width={32} 
              height={32} 
              className="object-contain"
            />
            {/* 文字も残す場合 */}
            <span className="font-extrabold text-2xl text-white tracking-tight">
              passpica
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            受験生のための最強対策まとめ＆ツールサイト。共通テストから総合型選抜まで、あなたの合格をサポートします。
          </p>
        </div>

        {/* リンク集1: 対策カテゴリ */}
        <div>
          <h3 className="font-bold text-white mb-4">受験対策</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/common-test" className="hover:text-blue-400 transition-colors">共通テスト対策</Link></li>
            <li><Link href="/secondary-exam" className="hover:text-blue-400 transition-colors">二次試験対策</Link></li>
            <li><Link href="/comprehensive" className="hover:text-blue-400 transition-colors">総合型選抜ガイド</Link></li>
            <li><Link href="/articles" className="hover:text-blue-400 transition-colors">新着記事一覧</Link></li>
          </ul>
        </div>

        {/* リンク集2: 学習ツール */}
        <div>
          <h3 className="font-bold text-white mb-4">学習ツール</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tools/pseudo-lang" className="hover:text-blue-400 transition-colors text-blue-400 font-semibold">情報I 疑似言語シミュレーター</Link></li>
            <li className="text-gray-500 cursor-not-allowed">自動添削システム (準備中)</li>
            <li className="text-gray-500 cursor-not-allowed">学習タイマー (準備中)</li>
          </ul>
        </div>

        {/* リンク集3: サポート */}
        <div>
          <h3 className="font-bold text-white mb-4">サポート</h3>
          <ul className="space-y-2 text-sm">
            <li className="text-gray-500">運営について</li>
            <li className="text-gray-500">利用規約</li>
            <li className="text-gray-500">プライバシーポリシー</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} passpica. All rights reserved.
      </div>
    </footer>
  );
}