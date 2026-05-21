import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="font-sans">
      
      {/* ヒーローセクション（一番目立つ上部） */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          志望校合格への<br className="md:hidden" />最短ルート。
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          共通テスト、二次試験、そして総合型選抜まで。
          <strong className="text-blue-600">passpica（パスピカ）</strong>は、現代の受験生に必要なすべての知識とツールを無料で提供します。
        </p>
        
        {/* いま一番のキラーコンテンツへの導線 */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          <div className="text-left">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">NEW! 完成しました</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">情報I 共通テスト シミュレーター</h2>
            <p className="text-sm text-gray-600">令和7年度からの新DNCL（Python風表記）に完全対応。ブラウザ上でコードを書いてステップ実行できます。</p>
          </div>
          <Link href="/tools/pseudo-lang" className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1">
            今すぐ使ってみる
          </Link>
        </div>
      </section>

      {/* メインカテゴリのカード群 */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">あなたに必要な対策は？</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 共通テスト */}
          <Link href="/common-test" className="group block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">共通テスト対策</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              各科目の傾向と対策、目標点数別の勉強法、過去問の活用法など、マーク式試験を攻略するための戦略をまとめました。
            </p>
          </Link>

          {/* 二次試験 */}
          <Link href="/secondary-exam" className="group block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">二次試験対策</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              難関国公立・私立大学に向けた記述力の養成。科目別の深い理解と、本番で1点でも多くもぎ取るための解答テクニック。
            </p>
          </Link>

          {/* 総合型選抜 */}
          <Link href="/comprehensive" className="group block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">総合型選抜（AO）</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              志望理由書の書き方、面接・小論文対策、ポートフォリオの作り方など、あなたの熱意を大学に伝えるためのノウハウ。
            </p>
          </Link>

        </div>
      </section>

    </div>
  );
}