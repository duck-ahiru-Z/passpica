import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Noto Sans JP の設定
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp", // CSS変数として登録
});

export const metadata: Metadata = {
  title: "passpica | 志望校合格への最短ルート",
  description: "受験生のための最強対策まとめ＆ツールサイト。共通テストから総合型選抜までサポート。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // htmlタグにフォントの変数を適用
    <html lang="ja" className={`${notoSansJP.variable}`}>
      {/* 背景をほんのり温かいグレーにし、文字色を真っ黒ではなくスレート（濃いグレー）にして目の負担を軽減 */}
      <body className="flex flex-col min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-brand-200">
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}