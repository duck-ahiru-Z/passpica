"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function TrigonometryVisualizerPage() {
  const [angle, setAngle] = useState<number>(45);

  // ラジアン計算
  const rad = (angle * Math.PI) / 180;
  
  // 単位円上の座標 (中心100, 100, 半径70px)
  const radius = 70;
  const cx = 100;
  const cy = 100;
  const px = cx + radius * Math.cos(rad);
  const py = cy - radius * Math.sin(rad); // SVGのy軸は下向きなのでマイナス

  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const tanVal = cosVal !== 0 ? Math.tan(rad) : Infinity;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 数学I・三角比
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          三角比（単位円）ビジュアル図解
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          角度θのスライダーを動かすことで、単位円上の点Pと、sin・cos・tan の値がどのように連動して変化するかを確認できます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：SVG単位円ビジュアライザ (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[400px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700">
            単位円上の回転（半径 r = 1）
          </div>

          {/* SVG描画 */}
          <div className="flex items-center justify-center flex-grow">
            <svg width="220" height="220" viewBox="0 0 200 200" className="overflow-visible font-mono">
              {/* x軸・y軸の境界線 */}
              <line x1="10" y1="100" x2="190" y2="100" stroke="#94a3b8" strokeWidth="1" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="#94a3b8" strokeWidth="1" />
              
              {/* 単位円 */}
              <circle cx="100" cy="100" r={radius} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,3" />
              
              {/* cos(横) */}
              <line x1="100" y1="100" x2={px} y2="100" stroke="#dc2626" strokeWidth="2.5" />
              
              {/* sin(縦) */}
              <line x1={px} y1="100" x2={px} y2={py} stroke="#2563eb" strokeWidth="2.5" />
              
              {/* 斜辺 */}
              <line x1="100" y1="100" x2={px} y2={py} stroke="#0f172a" strokeWidth="2" />
              
              {/* 点P */}
              <circle cx={px} cy={py} r="5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
              
              {/* 角度弧θ */}
              <path 
                d={`M 118 100 A 18 18 0 0 0 ${100 + 18 * Math.cos(rad)} ${100 - 18 * Math.sin(rad)}`}
                fill="none"
                stroke="#d97706"
                strokeWidth="1.5"
              />

              {/* 軸のテキスト */}
              <text x="185" y="112" fill="#64748b" fontSize="11" fontWeight="bold">x</text>
              <text x="106" y="20" fill="#64748b" fontSize="11" fontWeight="bold">y</text>
              <text x="112" y="93" fill="#d97706" fontSize="11" fontWeight="bold">θ</text>
              <text x={px + 6} y={py - 6} fill="#0f172a" fontSize="10" fontWeight="bold">P (cos θ, sin θ)</text>
            </svg>
          </div>

          {/* スライダー操作 */}
          <div className="w-full mt-6 max-w-md border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span>角度スライダー：</span>
              <span className="bg-gray-100 border border-gray-400 px-3 py-1 font-mono text-slate-800 font-bold">
                θ = {angle}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
            />
          </div>

        </div>

        {/* 右側：計算結果と要点まとめ (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 数値モニター */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ リアルタイム計算値
            </h3>

            {/* sin */}
            <div className="border border-gray-200 p-2.5 bg-gray-50">
              <div className="flex justify-between items-center font-bold">
                <span className="text-blue-700">sin θ (高さ y)</span>
                <span className="font-mono">{sinVal.toFixed(4)}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 mt-2 overflow-hidden border border-gray-300">
                <div 
                  className="bg-blue-600 h-full transition-all duration-70"
                  style={{ width: `${Math.abs(sinVal) * 100}%`, marginLeft: sinVal < 0 ? 'auto' : '0' }}
                ></div>
              </div>
            </div>

            {/* cos */}
            <div className="border border-gray-200 p-2.5 bg-gray-50">
              <div className="flex justify-between items-center font-bold">
                <span className="text-red-700">cos θ (底辺 x)</span>
                <span className="font-mono">{cosVal.toFixed(4)}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 mt-2 overflow-hidden border border-gray-300">
                <div 
                  className="bg-red-600 h-full transition-all duration-70"
                  style={{ width: `${Math.abs(cosVal) * 100}%`, marginLeft: cosVal < 0 ? 'auto' : '0' }}
                ></div>
              </div>
            </div>

            {/* tan */}
            <div className="border border-gray-200 p-2.5 bg-gray-50">
              <div className="flex justify-between items-center font-bold">
                <span className="text-amber-700">tan θ (傾き y/x)</span>
                <span className="font-mono">
                  {Math.abs(tanVal) > 99 ? '未定義' : tanVal.toFixed(4)}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 mt-2 overflow-hidden border border-gray-300">
                <div 
                  className="bg-amber-500 h-full transition-all duration-70"
                  style={{ width: `${Math.min(Math.abs(tanVal) * 25, 100)}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* 解説メモ */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 三角比の要点
            </h3>
            <p>
              半径が1の円（単位円）の上を動く点Pの座標(x, y)は、定義からそのまま <strong>(cos θ, sin θ)</strong> に対応します。
            </p>
            <p>
              角度θが90°を超えると、x座標（cos）が負になり、180°を超えるとy座標（sin）も負になります。tanは直線の「傾き」を示すため、90°のときと270°のときは定義されません。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
