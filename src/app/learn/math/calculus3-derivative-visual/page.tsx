'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const W = 640;
const H = 330;
const f = (x: number) => x * x * x - 3 * x;
const derivative = (x: number) => 3 * x * x - 3;

export default function Calculus3DerivativeVisualPage() {
  const [x, setX] = useState(0.5);
  const y = f(x);
  const slope = derivative(x);
  const isStationaryPoint = Math.abs(slope) < 0.005;
  const isNearCriticalPoint = Math.abs(Math.abs(x) - 1) < 0.08;
  const sx = (value: number) => 60 + ((value + 2.7) / 5.4) * (W - 95);
  const sy = (value: number) => H - 38 - ((value + 5) / 10) * (H - 70);
  const curvePath = useMemo(() => Array.from({ length: 109 }, (_, index) => {
    const value = -2.7 + index * 0.05;
    return `${index === 0 ? 'M' : 'L'} ${sx(value).toFixed(1)} ${sy(f(value)).toFixed(1)}`;
  }).join(' '), []);
  const tangentPath = `M ${sx(x - 1.05).toFixed(1)} ${sy(y - slope * 1.05).toFixed(1)} L ${sx(x + 1.05).toFixed(1)} ${sy(y + slope * 1.05).toFixed(1)}`;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">数学III / 微分法</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">導関数と接線・増減ビジュアル装置</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">関数 y = x³ − 3x 上の点を動かすと、接線の傾き f&apos;(x) が変化します。傾きの符号とグラフの増減、極値の位置を結び付けて観察します。</p>
        <div className="border border-slate-300 bg-slate-50 p-2 overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="三次関数と接線のグラフ"><line x1={sx(-2.7)} y1={sy(0)} x2={sx(2.7)} y2={sy(0)} stroke="#64748b" /><line x1={sx(0)} y1={sy(-5)} x2={sx(0)} y2={sy(5)} stroke="#64748b" /><path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" /><path d={tangentPath} fill="none" stroke="#dc2626" strokeWidth="2" /><circle cx={sx(x)} cy={sy(y)} r="6" fill="#f97316" /><text x={sx(-2.55)} y={sy(4.5)} fill="#2563eb" fontSize="12">y = x³ − 3x</text><text x={sx(x) + 8} y={sy(y) - 8} fill="#b91c1c" fontSize="12">接線</text></svg></div>
        <label className="block space-y-2"><span className="font-bold">点の位置 x = {x.toFixed(2)}</span><input aria-label="点のx座標" type="range" min="-2.2" max="2.2" step="0.05" value={x} onChange={event => setX(Number(event.target.value))} className="w-full accent-blue-600" /></label>
        <div className="grid sm:grid-cols-4 gap-2"><div className="border p-2 bg-blue-50"><div className="text-slate-500">点の y</div><b>{y.toFixed(3)}</b></div><div className="border p-2 bg-red-50"><div className="text-slate-500">接線の傾き f&apos;(x)</div><b>{slope.toFixed(3)}</b></div><div className="border p-2 bg-green-50"><div className="text-slate-500">増減</div><b>{isStationaryPoint ? '停留' : slope > 0 ? '増加' : '減少'}</b></div><div className="border p-2 bg-amber-50"><div className="text-slate-500">極値候補</div><b>{isNearCriticalPoint ? (x < 0 ? 'x = −1 の極大候補付近' : 'x = 1 の極小候補付近') : isStationaryPoint ? '停留点' : 'なし'}</b></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>f&apos;(x) &gt; 0 なら増加、f&apos;(x) &lt; 0 なら減少します。</li><li>f&apos;(x) = 0 となる x = −1, 1 が極値候補です。</li><li>接線はその点での瞬間的な変化率を、グラフ上の直線として表します。</li></ul></section>
    </main>
  );
}
