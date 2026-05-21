import Link from 'next/link';
import Image from 'next/image'; 

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
<Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
          <Image 
            src="/logo.png"   // publicフォルダ内の画像ファイル名
            alt="passpica"    // 画像が読み込めない時のテキスト
            width={40}        // 画像の横幅（いい感じに調整してください）
            height={40}       // 画像の高さ
            className="object-contain"
          />
          {/* 文字も残すならこれ↓ 画像だけにしたい場合は消してOKです */}
          <span className="font-extrabold text-2xl tracking-tight text-blue-600">
            passpica
          </span>
        </Link>

        {/* PC用ナビゲーションメニュー */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/common-test" className="hover:text-blue-600 transition-colors">共通テスト対策</Link>
          <Link href="/secondary-exam" className="hover:text-blue-600 transition-colors">二次試験対策</Link>
          <Link href="/comprehensive" className="hover:text-blue-600 transition-colors">総合型選抜</Link>
          <Link href="/articles" className="hover:text-blue-600 transition-colors">記事一覧</Link>
          <Link href="/tools/pseudo-lang" className="text-blue-600 font-bold hover:text-blue-700 transition-colors border-b-2 border-blue-600 pb-1">
            情報I ツール
          </Link>
        </nav>

        {/* スマホ用メニューボタン（※後で開閉処理を入れます） */}
        <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

      </div>
    </header>
  );
}