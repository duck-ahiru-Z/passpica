import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-300 bg-gray-50 py-8 mt-12 text-center text-xs text-gray-500 font-mono">
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        
        {/* フッターリンク */}
        <div className="flex justify-center gap-4 text-gray-600">
          <Link href="/" className="no-underline hover:underline">[ホーム]</Link>
          <span>|</span>
          <Link href="/learn" className="no-underline hover:underline">[学習室]</Link>
          <span>|</span>
          <Link href="/tools/schedule" className="no-underline hover:underline">[時間割予定表]</Link>
          <span>|</span>
          <Link href="/tools/calendar" className="no-underline hover:underline">[受験カレンダー]</Link>
        </div>

        {/* 懐かしい著作権・管理者表記 */}
        <div className="space-y-1">
          <p>当サイトはリンクフリーです。事前連絡等は不要です。</p>
          <p className="font-semibold text-gray-700 mt-2">
            Copyright (C) 2026 passpica. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}