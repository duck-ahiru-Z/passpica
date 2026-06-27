import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-300 bg-gray-50 py-4 select-none">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-sm">
        
        {/* シンプルなテキストロゴ */}
        <Link href="/" className="font-bold text-lg text-slate-900 no-underline hover:text-red-600">
          passpica
        </Link>

        {/* 古い個人サイト風ブラケットリンクナビゲーション */}
        <nav className="flex flex-wrap gap-2 text-xs text-gray-600 font-medium">
          <Link href="/" className="no-underline">
            [トップ]
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/learn" className="no-underline">
            [学習室ポータル]
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/drill" className="no-underline">
            [無限演習]
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/tools/schedule" className="no-underline">
            [時間割予定表]
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/tools/calendar" className="no-underline">
            [受験カレンダー]
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/learn/information/pseudo-lang" className="no-underline">
            [情報I 擬似言語]
          </Link>
        </nav>

      </div>
    </header>
  );
}