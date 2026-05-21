import Link from 'next/link';

export default function Header() {
  return (
    // サイトの上部に固定され、影（shadow）がつくデザインです
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 左側：ロゴ（サイト名） */}
        <Link href="/" className="font-bold text-xl tracking-tight text-blue-600 hover:opacity-80 transition-opacity">
          しろねこプロジェクト
        </Link>

        {/* 右側：メニュー */}
        <nav className="flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/articles" className="hover:text-blue-600 transition-colors">
            記事一覧
          </Link>
          {/* まだ作っていない機能は、少し薄くして「準備中」感を出しておきます */}
          <span className="opacity-40 cursor-not-allowed" title="準備中">
            情報Iツール
          </span>
          <span className="opacity-40 cursor-not-allowed" title="準備中">
            添削システム
          </span>
        </nav>

      </div>
    </header>
  );
}