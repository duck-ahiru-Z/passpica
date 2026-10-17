'use client';

import Link from 'next/link';
import { useState } from 'react';

const W = 440;
const H = 240;
const X_MIN = -1.8;
const X_MAX = 1.8;
const Y_MIN = -1.5;
const Y_MAX = 11.5;
const PLOT = { left: 42, right: 418, top: 18, bottom: 198 };
const f = (x: number) => x ** 4 - 2 * x ** 2;
const d1 = (x: number) => 4 * x ** 3 - 4 * x;
const d2 = (x: number) => 12 * x ** 2 - 4;
const inflectionX = 1 / Math.sqrt(3);

export default function Calculus3CurvatureVisual() {
  const [x, setX] = useState(0);
  const sx = (value: number) => PLOT.left + ((value - X_MIN) / (X_MAX - X_MIN)) * (PLOT.right - PLOT.left);
  const sy = (value: number) => PLOT.top + ((Y_MAX - value) / (Y_MAX - Y_MIN)) * (PLOT.bottom - PLOT.top);
  const point = { x: sx(x), y: sy(f(x)) };
  const curvePath = Array.from({ length: 145 }, (_, index) => {
    const value = X_MIN + ((X_MAX - X_MIN) * index) / 144;
    return `${index === 0 ? 'M' : 'L'} ${sx(value).toFixed(1)} ${sy(f(value)).toFixed(1)}`;
  }).join(' ');
  const tangentStartX = Math.max(X_MIN, x - 0.45);
  const tangentEndX = Math.min(X_MAX, x + 0.45);
  const tangentPath = `M ${sx(tangentStartX).toFixed(1)} ${sy(f(x) + d1(x) * (tangentStartX - x)).toFixed(1)} L ${sx(tangentEndX).toFixed(1)} ${sy(f(x) + d1(x) * (tangentEndX - x)).toFixed(1)}`;
  const concavity = d2(x) > 0 ? '下に凸（f′′(x) > 0）' : d2(x) < 0 ? '上に凸（f′′(x) < 0）' : '変曲点（f′′(x) = 0）';
  const nearInflection = Math.min(Math.abs(x - inflectionX), Math.abs(x + inflectionX)) < 0.05;
  const extrema = [{ x: -1, y: -1, label: '極小' }, { x: 0, y: 0, label: '極大' }, { x: 1, y: -1, label: '極小' }];
  const inflections = [-inflectionX, inflectionX];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">数学III / 微分法</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">凹凸・極値・変曲点ビジュアル装置</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">f(x)=x⁴−2x² のグラフ上を点が動きます。接線の傾き f′(x) と二階導関数 f′′(x) の符号を、極大・極小や凹凸の切り替わりと結び付けて観察できます。</p>
        <div className="border border-slate-300 bg-slate-50 p-2 overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[440px]" role="img" aria-label={`f(x)=x⁴−2x²。x=${x.toFixed(2)}でf=${f(x).toFixed(3)}、傾き=${d1(x).toFixed(3)}、二階導関数=${d2(x).toFixed(3)}。${concavity}`}>
            <line x1={PLOT.left} y1={sy(0)} x2={PLOT.right} y2={sy(0)} stroke="#94a3b8" />
            <line x1={sx(0)} y1={PLOT.top} x2={sx(0)} y2={PLOT.bottom} stroke="#94a3b8" />
            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
            {extrema.map((critical, index) => <g key={`extreme-${index}`}><circle cx={sx(critical.x)} cy={sy(critical.y)} r="4" fill="#059669" /><text x={sx(critical.x)} y={sy(critical.y) + (critical.label === '極大' ? -9 : 16)} fill="#047857" fontSize="10" textAnchor="middle">{critical.label}</text></g>)}
            {inflections.map(value => <g key={value}><circle cx={sx(value)} cy={sy(f(value))} r="4" fill="#d97706" /><text x={sx(value)} y={sy(f(value)) - 9} fill="#b45309" fontSize="9" textAnchor="middle">変曲点</text></g>)}
            <path d={tangentPath} fill="none" stroke="#ef4444" strokeWidth="2" />
            <circle cx={point.x} cy={point.y} r="5" fill="#dc2626" />
            <text x={PLOT.left + 5} y={PLOT.top + 12} fill="#334155" fontSize="11">y=x⁴−2x²</text>
            <text x={PLOT.right - 4} y={sy(0) - 5} fill="#64748b" fontSize="10" textAnchor="end">x</text>
          </svg>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-2 pt-2 text-[10px] text-slate-600"><span><i className="inline-block w-3 border-t-2 border-blue-600 align-middle" /> 関数</span><span><i className="inline-block w-3 border-t-2 border-red-500 align-middle" /> 接線</span><span className="text-emerald-700">● 極値</span><span className="text-amber-700">● 変曲点</span></div>
        </div>
        <label className="block text-center font-bold">移動点 x = {x.toFixed(2)}<input aria-label="xの位置" type="range" min={X_MIN} max={X_MAX} step="0.01" value={x} onChange={event => setX(Number(event.target.value))} className="w-full mt-2 accent-blue-600" /></label>
        <div className="grid sm:grid-cols-3 gap-2 text-center"><div className="border p-3 bg-blue-50"><div className="text-gray-500">f(x)</div><strong>{f(x).toFixed(3)}</strong></div><div className="border p-3 bg-red-50"><div className="text-gray-500">接線の傾き f′(x)</div><strong>{d1(x).toFixed(3)}</strong></div><div className="border p-3 bg-amber-50"><div className="text-gray-500">f′′(x)</div><strong>{d2(x).toFixed(3)}</strong></div></div>
        <div className="text-center font-bold text-lg text-emerald-700">{concavity}</div>
        <p className="text-center text-slate-600">変曲点は x=±1/√3≈±{inflectionX.toFixed(3)} です。{nearInflection ? '今の点は変曲点の近くで、f′′の符号が切り替わります。' : '点をこの位置の前後へ動かし、f′′の符号とグラフの曲がり方を比べてください。'}</p>
      </section>
    </main>
  );
}
