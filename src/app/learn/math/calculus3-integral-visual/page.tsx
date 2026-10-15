'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const W = 640;
const H = 330;
const f = (x: number) => x * x;

export default function Calculus3IntegralVisualPage() {
  const [upper, setUpper] = useState(2);
  const area = upper ** 3 / 3;
  const sx = (value: number) => 65 + ((value + 0.5) / 3.2) * (W - 100);
  const sy = (value: number) => H - 42 - (value / 5) * (H - 78);
  const curvePath = useMemo(() => Array.from({ length: 81 }, (_, index) => {
    const value = -0.5 + index * 0.04;
    return `${index === 0 ? 'M' : 'L'} ${sx(value).toFixed(1)} ${sy(f(value)).toFixed(1)}`;
  }).join(' '), []);
  const fillPath = `M ${sx(0)} ${sy(0)} ${Array.from({ length: 41 }, (_, index) => { const value = upper * index / 40; return `L ${sx(value).toFixed(1)} ${sy(f(value)).toFixed(1)}`; }).join(' ')} L ${sx(upper).toFixed(1)} ${sy(0).toFixed(1)} Z`;
  const rectangles = Array.from({ length: 8 }, (_, index) => { const left = upper * index / 8; const right = upper * (index + 1) / 8; return <rect key={index} x={sx(left)} y={sy(f(right))} width={sx(right) - sx(left)} height={sy(0) - sy(f(right))} fill="rgba(37,99,235,0.18)" stroke="#93c5fd" />; });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">数学III / 積分法</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">定積分と面積ビジュアル装置</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">y = x² と x軸で囲まれる部分を表示します。上端 b を動かすと、積分区間 [0,b] と面積がどう変わるかを観察できます。</p>
        <div className="border border-slate-300 bg-slate-50 p-2 overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="二次関数の下の面積グラフ"><line x1={sx(-0.5)} y1={sy(0)} x2={sx(2.7)} y2={sy(0)} stroke="#64748b" /><line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(5)} stroke="#64748b" /><path d={fillPath} fill="#bfdbfe" /><g>{rectangles}</g><path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" /><line x1={sx(upper)} y1={sy(0)} x2={sx(upper)} y2={sy(f(upper))} stroke="#dc2626" strokeDasharray="4 4" /><text x={sx(0.1)} y={sy(4.5)} fill="#2563eb" fontSize="12">y = x²</text><text x={sx(upper) + 6} y={sy(0) - 8} fill="#b91c1c" fontSize="12">b</text></svg></div>
        <label className="block space-y-2"><span className="font-bold">積分区間 [0, {upper.toFixed(2)}]</span><input aria-label="積分区間の上端" type="range" min="0.2" max="2.5" step="0.05" value={upper} onChange={event => setUpper(Number(event.target.value))} className="w-full accent-blue-600" /></label>
        <div className="grid sm:grid-cols-3 gap-2"><div className="border p-3 bg-blue-50"><div className="text-slate-500">面積</div><b className="text-lg">{area.toFixed(4)}</b></div><div className="border p-3 bg-slate-50"><div className="text-slate-500">立式</div><b>∫₀^{upper.toFixed(2)} x² dx</b></div><div className="border p-3 bg-green-50"><div className="text-slate-500">計算結果</div><b>b³ / 3 = {area.toFixed(4)}</b></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>細長い長方形を足し合わせる極限が、定積分の面積です。</li><li>区間の端 b を変えると、面積は b³/3 に従って変化します。</li><li>グラフの上下関係を確認してから「上−下」を積分するのが基本です。</li></ul></section>
    </main>
  );
}
