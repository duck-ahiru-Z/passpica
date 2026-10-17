'use client';

import Link from 'next/link';
import { useState } from 'react';

const W = 640;
const H = 330;
const f = (x: number) => x * x;

export default function Calculus3IntegralVisualPage() {
  const [upper, setUpper] = useState(2);
  const [rectangleCount, setRectangleCount] = useState(8);
  const area = upper ** 3 / 3;
  const xMin = -Math.min(0.5, upper * 0.2);
  const xMax = upper + 0.2;
  const yMax = xMax ** 2 * 1.15;
  const sx = (value: number) => 65 + ((value - xMin) / (xMax - xMin)) * (W - 100);
  const sy = (value: number) => H - 42 - (value / yMax) * (H - 78);
  const curvePath = Array.from({ length: 81 }, (_, index) => {
    const value = xMin + ((xMax - xMin) * index) / 80;
    return `${index === 0 ? 'M' : 'L'} ${sx(value).toFixed(1)} ${sy(f(value)).toFixed(1)}`;
  }).join(' ');
  const fillPath = `M ${sx(0)} ${sy(0)} ${Array.from({ length: 41 }, (_, index) => { const value = upper * index / 40; return `L ${sx(value).toFixed(1)} ${sy(f(value)).toFixed(1)}`; }).join(' ')} L ${sx(upper).toFixed(1)} ${sy(0).toFixed(1)} Z`;
  const rectangleSlices = Array.from({ length: rectangleCount }, (_, index) => {
    const left = upper * index / rectangleCount;
    const right = upper * (index + 1) / rectangleCount;
    return { left, right, width: upper / rectangleCount };
  });
  const rectangleArea = rectangleSlices.reduce((sum, slice) => sum + f(slice.right) * slice.width, 0);
  const rectangles = rectangleSlices.map(({ left, right }, index) => <rect key={index} x={sx(left)} y={sy(f(right))} width={sx(right) - sx(left)} height={sy(0) - sy(f(right))} fill="rgba(37,99,235,0.18)" stroke="#93c5fd" />);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">数学III / 積分法</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">定積分と面積ビジュアル装置</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">y = x² と x軸で囲まれる部分を表示します。上端 b を動かすと、積分区間 [0,b] と面積がどう変わるかを観察できます。</p>
        <div className="border border-slate-300 bg-slate-50 p-2"><svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label={`y=x²の区間0から${upper.toFixed(2)}の面積。正確な値${area.toFixed(4)}、右端長方形近似${rectangleArea.toFixed(4)}、分割数${rectangleCount}`}><line x1={sx(xMin)} y1={sy(0)} x2={sx(xMax)} y2={sy(0)} stroke="#64748b" /><line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(yMax)} stroke="#64748b" /><path d={fillPath} fill="#bfdbfe" /><g>{rectangles}</g><path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" /><line x1={sx(upper)} y1={sy(0)} x2={sx(upper)} y2={sy(f(upper))} stroke="#dc2626" strokeDasharray="4 4" /><text x={sx(upper * 0.05)} y={sy(Math.max(upper ** 2 * 0.75, yMax * 0.25))} fill="#2563eb" fontSize="12">y = x²</text><text x={sx(upper) + 6} y={sy(0) - 8} fill="#b91c1c" fontSize="12">b</text><text x={sx(xMax) - 10} y={sy(0) + 18} fill="#475569" fontSize="12">x</text></svg><p className="px-2 pt-1 text-[10px] text-slate-600">青い長方形は右端の高さを使った近似です。x²は増加するため、正確な面積より大きくなります。</p></div>
        <label className="block space-y-2"><span className="font-bold">積分区間 [0, {upper.toFixed(2)}]</span><input aria-label="積分区間の上端" type="range" min="0.2" max="2.5" step="0.05" value={upper} onChange={event => setUpper(Number(event.target.value))} className="w-full accent-blue-600" /></label>
        <label className="block space-y-2"><span className="font-bold">長方形の分割数 n = {rectangleCount}</span><input aria-label="長方形の分割数" type="range" min="4" max="32" step="4" value={rectangleCount} onChange={event => setRectangleCount(Number(event.target.value))} className="w-full accent-blue-600" /></label>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2"><div className="border p-3 bg-blue-50"><div className="text-slate-500">正確な面積</div><b className="text-lg">{area.toFixed(4)}</b></div><div className="border p-3 bg-indigo-50"><div className="text-slate-500">右端和の近似（n={rectangleCount}）</div><b className="text-lg">{rectangleArea.toFixed(4)}</b></div><div className="border p-3 bg-slate-50"><div className="text-slate-500">立式</div><b>∫₀^{upper.toFixed(2)} x² dx</b></div><div className="border p-3 bg-green-50"><div className="text-slate-500">近似−正確</div><b>{(rectangleArea - area).toFixed(4)}</b></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>右端の高さで作る長方形和は、この増加関数では面積を大きめに見積もります。</li><li>分割数 n を増やすと長方形の幅が細くなり、近似値は正確な面積に近づきます。</li><li>区間の端 b を変えると、正確な面積は b³/3 に従って変化します。グラフの上下関係を確認してから「上−下」を積分するのが基本です。</li></ul></section>
    </main>
  );
}
