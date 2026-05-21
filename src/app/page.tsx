import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="font-sans">
      
      {/* ヒーローセクション（上品な余白と柔らかい影） */}
      <section className="pt-24 pb-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
          志望校合格への<br className="md:hidden" />最短ルート。
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          共通テスト、二次試験、そして総合型選抜まで。<br className="hidden md:block" />
          <strong className="text-brand-600 font-bold">passpica</strong> は、現代の受験生に必要な<br className="hidden md:block" />知識とツールを無料で提供します。
        </p>
        
        {/* キラーコンテンツへの導線（柔らかいデザイン） */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:border-brand-200 transition-colors">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
          <div className="text-left">
            <span className="bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
              NEW! 完成しました
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-brand-600 transition-colors">情報I 共通テスト シミュレーター</h2>
            <p className="text-sm text-slate-500 leading-relaxed">令和7年度からの新DNCL（Python風表記）に完全対応。ブラウザ上でコードを書いてステップ実行できます。</p>
          </div>
          <Link href="/tools/pseudo-lang" className="shrink-0 bg-slate-900 hover:bg-brand-500 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            今すぐ使ってみる
          </Link>
        </div>
      </section>

      {/* メインカテゴリのカード群 */}
      <section className="py-16 px-4 max-w-6xl mx-auto border-t border-slate-100">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">あなたに必要な対策は？</h2>
          <div className="w-12 h-1 bg-brand-400 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* 共通テスト */}
          <Link href="/common-test" className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col">
            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-600 transition-colors">共通テスト対策</h3>
            <p className="text-slate-500 text-sm leading-relaxed flex-grow">
              各科目の傾向と対策、目標点数別の勉強法、過去問の活用法など、マーク式試験を攻略するための戦略。
            </p>
          </Link>

          {/* 二次試験 */}
          <Link href="/secondary-exam" className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col">
            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-600 transition-colors">二次試験対策</h3>
            <p className="text-slate-500 text-sm leading-relaxed flex-grow">
              難関国公立・私立大学に向けた記述力の養成。科目別の深い理解と、本番で1点でも多くもぎ取るための解答テクニック。
            </p>
          </Link>

          {/* 総合型選抜 */}
          <Link href="/comprehensive" className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col">
            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-600 transition-colors">総合型選抜（AO）</h3>
            <p className="text-slate-500 text-sm leading-relaxed flex-grow">
              志望理由書の書き方、面接・小論文対策、ポートフォリオの作り方など、あなたの熱意を大学に伝えるためのノウハウ。
            </p>
          </Link>

        </div>
      </section>

    </div>
  );
}