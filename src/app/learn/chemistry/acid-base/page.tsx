"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function AcidBasePage() {
  const [indicator, setIndicator] = useState<'pp' | 'litmus' | 'mo'>('pp');
  const [pH, setPH] = useState<number>(7);

  // 指示薬の色計算
  const getLiquidColor = () => {
    if (indicator === 'pp') {
      // フェノールフタレイン: 酸性・中性は無色、塩基性で赤ピンク
      if (pH >= 8.3) {
        const opacity = Math.min((pH - 8.3) / (14 - 8.3) + 0.3, 0.95);
        return `rgba(244, 114, 182, ${opacity})`;
      }
      return 'rgba(255, 255, 255, 0.2)';
    } else if (indicator === 'litmus') {
      // リトマス液: 酸性で赤、中性で紫、塩基性で青
      if (pH < 5.0) {
        return 'rgba(239, 68, 68, 0.7)'; // 赤
      } else if (pH > 8.0) {
        return 'rgba(59, 130, 246, 0.7)'; // 青
      } else {
        return 'rgba(139, 92, 246, 0.6)'; // 紫
      }
    } else {
      // メチルオレンジ: 強酸性で赤、pH 4.4以上で黄色
      if (pH < 3.1) {
        return 'rgba(239, 68, 68, 0.8)'; // 赤
      } else if (pH < 4.4) {
        return 'rgba(249, 115, 22, 0.8)'; // オレンジ
      } else {
        return 'rgba(234, 179, 8, 0.7)'; // 黄色
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・酸と塩基
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          指示薬・pH中和滴定シミュレーター
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          pH値の増減による、フェノールフタレイン等の主要指示薬の色調変化をシミュレートします。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：ビーカー描画 (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[400px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700">
            実験装置：指示薬滴下溶液のpH色変化
          </div>

          {/* pHスケール */}
          <div className="w-full max-w-md bg-white border border-gray-300 p-2 flex items-center justify-between gap-2 text-[10px] font-bold font-mono">
            <span className="text-rose-600">pH 1 (強酸性)</span>
            <div className="flex-grow h-2 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 rounded mx-2"></div>
            <span className="text-blue-600">pH 14 (強塩基性)</span>
          </div>

          {/* フラットなビーカー */}
          <div className="flex items-center justify-center py-6 w-full relative h-[180px]">
            {/* 液体描画 */}
            <div 
              className="w-32 h-24 absolute bottom-1 border border-transparent transition-colors duration-300"
              style={{
                backgroundColor: getLiquidColor(),
                borderRadius: '0 0 4px 4px'
              }}
            ></div>
            
            {/* ビーカーの線画 */}
            <div className="w-36 h-28 border-x-2 border-b-2 border-slate-700 rounded-b relative z-20 flex items-end">
              <div className="absolute left-1 top-4 w-3 h-0.5 bg-slate-400"></div>
              <div className="absolute left-1 top-10 w-1.5 h-0.5 bg-slate-400"></div>
              <div className="absolute left-1 top-16 w-3 h-0.5 bg-slate-400"></div>
              <div className="absolute left-1 top-22 w-1.5 h-0.5 bg-slate-400"></div>
            </div>
          </div>

          {/* スライダー操作 */}
          <div className="w-full max-w-md border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700">
              <span>溶液のpH調整スライダー：</span>
              <span className="bg-gray-100 border border-gray-400 px-3 py-1 font-mono text-slate-800 font-bold">
                pH = {pH} ({pH < 7 ? '酸性' : pH === 7 ? '中性' : '塩基性'})
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={pH}
              onChange={(e) => setPH(parseInt(e.target.value))}
              className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
            />
          </div>

        </div>

        {/* 右側：指示薬セレクトと解説 (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 指示薬選択 */}
          <div className="retro-box space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 指示薬の選択
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIndicator('pp')}
                className={`border border-gray-400 p-2.5 text-left transition-all bg-slate-50 hover:bg-slate-100 flex items-center justify-between ${indicator === 'pp' ? 'bg-amber-100 border-amber-600 font-bold' : ''}`}
              >
                <div>
                  <div className="text-xs">フェノールフタレイン</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">変色域: pH 8.3 〜 10.0</div>
                </div>
                <span className="text-[10px] bg-pink-100 text-pink-700 border border-pink-200 px-1.5 py-0.5 rounded font-bold">PP</span>
              </button>

              <button
                onClick={() => setIndicator('litmus')}
                className={`border border-gray-400 p-2.5 text-left transition-all bg-slate-50 hover:bg-slate-100 flex items-center justify-between ${indicator === 'litmus' ? 'bg-amber-100 border-amber-600 font-bold' : ''}`}
              >
                <div>
                  <div className="text-xs">リトマス液</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">変色域: pH 5.0 〜 8.0</div>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">LIT</span>
              </button>

              <button
                onClick={() => setIndicator('mo')}
                className={`border-2 border-gray-400 p-2.5 text-left transition-all bg-slate-50 hover:bg-slate-100 flex items-center justify-between ${indicator === 'mo' ? 'bg-amber-100 border-amber-600 font-bold' : ''}`}
              >
                <div>
                  <div className="text-xs">メチルオレンジ</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">変色域: pH 3.1 〜 4.4</div>
                </div>
                <span className="text-[10px] bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded font-bold">MO</span>
              </button>
            </div>
          </div>

          {/* 指示薬の暗記黒板 */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed space-y-2.5">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 指示薬の重要ポイント
            </h3>
            
            {indicator === 'pp' && (
              <div className="space-y-1">
                <p className="font-bold text-slate-800">・フェノールフタレイン (PP)</p>
                <p className="text-gray-600">酸性・中性では無色。pH 8.3以上で赤紫色（ピンク）に変色します。中和点が塩基性側に寄る「弱酸 ＋ 強塩基」の滴定で使用します。</p>
              </div>
            )}

            {indicator === 'litmus' && (
              <div className="space-y-1">
                <p className="font-bold text-slate-800">・リトマス液 (LIT)</p>
                <p className="text-gray-600">pH 5.0以下で赤、中性付近で紫、pH 8.0以上で青を示します。変色域が広いため中和滴定の指示薬には用いず、大まかな液性の識別に用います。</p>
              </div>
            )}

            {indicator === 'mo' && (
              <div className="space-y-1">
                <p className="font-bold text-slate-800">・メチルオレンジ (MO)</p>
                <p className="text-gray-600">pH 3.1以下で赤、3.1〜4.4で橙、4.4以上で黄色になります。中和点が酸性側に寄る「強酸 ＋ 弱塩基」（例：塩酸とアンモニア）の滴定で使用します。</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
