import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ServiceWorkerCleanser from "../components/utils/ServiceWorkerCleanser";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://passpica.vercel.app"),
  title: "passpica | 大学受験の学習室ポータル",
  description: "大学受験生のための自習用ポータル。数学・化学などの学習シミュレータと予定管理ツールを設置しています。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "passpica",
    title: "passpica | 大学受験の学習室ポータル",
    description: "大学受験生のための自習用ポータル。数学・化学などの学習シミュレータと予定管理ツールを設置しています。",
    url: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "hbZL7FmZqb47bVAGvY4pKbsoDUPdX0J4oc3jABbfmto",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen bg-white text-slate-800 antialiased">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
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
