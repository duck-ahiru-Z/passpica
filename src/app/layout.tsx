import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ServiceWorkerCleanser from "../components/utils/ServiceWorkerCleanser";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "passpica | 大学受験の学習室ポータル",
  description: "大学受験生のための自習用ポータル。数学・化学などの学習シミュレータと予定管理ツールを設置しています。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable}`}>
      <body className="flex flex-col min-h-screen bg-white text-slate-800 antialiased">
        <ServiceWorkerCleanser />
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}