import type { Metadata } from "next";
import "./globals.css";
// 今作った部品を読み込む
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// サイト全体のタイトルや説明（SEO対策やSNSシェア時に使われます）
export const metadata: Metadata = {
  title: "しろねこプロジェクト",
  description: "みんなで作る、受験生のための最強対策まとめ＆ツールサイト",
};

export default function RootLayout({
  children, // ← この children に、各ページ（記事一覧など）の中身が入ってきます
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* min-h-screen で「最低でも画面の高さいっぱい」にし、flex-col で縦並びにします */}
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header />
        
        {/* メインコンテンツ部分。flex-grow で「余ったスペースをすべて埋める」ようにします */}
        <main className="flex-grow py-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}