'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { sineRatioForNonzeroRadians } from '@/src/lib/calculus3LimitVisual';

const WIDTH = 620;
const HEIGHT = 300;

export default function Calculus3LimitVisualPage() {
  const [x, setX] = useState(0.8);
  const sx = (value: number) => 60 + ((value + 3.2) / 6.4) * (WIDTH - 90);
  const sy = (value: number) => HEIGHT - 34 - ((value + 0.2) / 1.4) * (HEIGHT - 60);

  const curvePath = useMemo(() => {
    const points = Array.from({ length: 161 }, (_, index) => -3.2 + index * 0.04).filter(value => Math.abs(value) > 1e-9);
    const left = points.filter(value => value < 0);
    const right = points.filter(value => value > 0);
    const pathFor = (side: number[]) => side.map((value, index) => `${index === 0 ? 'M' : 'L'} ${sx(value).toFixed(1)} ${sy(sineRatioForNonzeroRadians(value)).toFixed(1)}`).join(' ');
    return `${pathFor(left)} ${pathFor(right)}`;
  }, []);

  const current = sineRatioForNonzeroRadians(x);
  const mirrored = sineRatioForNonzeroRadians(-x);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500">数学III / 極限</div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">極限の直感：sin x / x</h1>
        </div>
        <Link href="/learn" className="retro-btn-classic">学習一覧へ</Link>
      </div>

      <section className="retro-box bg-white p-4 space-y-4">
        <div>
          <h2 className="font-bold text-base">xを0へ近づけると、値はどこへ近づく？</h2>
          <p className="text-slate-600 mt-1 leading-relaxed">xはラジアンで測ります。スライダーを動かして、左右から近づく点と y = 1 の関係を観察します。x = 0 では式を直接割れませんが、極限値は読み取れます。</p>
        </div>
        <div className="border border-slate-300 bg-slate-50 p-2">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full h-auto" role="img" aria-label="sin x を x で割った関数のグラフ。x=0では関数は定義されず、極限値1に白抜きの点があります。">
            <line x1={sx(-3.2)} y1={sy(0)} x2={sx(3.2)} y2={sy(0)} stroke="#64748b" strokeWidth="1" />
            <line x1={sx(0)} y1={sy(-0.2)} x2={sx(0)} y2={sy(1.2)} stroke="#64748b" strokeWidth="1" />
            <line x1={sx(-3.2)} y1={sy(1)} x2={sx(3.2)} y2={sy(1)} stroke="#dc2626" strokeDasharray="5 4" strokeWidth="1.5" />
            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
            <line x1={sx(-x)} y1={sy(0)} x2={sx(-x)} y2={sy(mirrored)} stroke="#16a34a" strokeDasharray="3 3" />
            <line x1={sx(x)} y1={sy(0)} x2={sx(x)} y2={sy(current)} stroke="#16a34a" strokeDasharray="3 3" />
            <circle cx={sx(-x)} cy={sy(mirrored)} r="5" fill="#16a34a" />
            <circle cx={sx(x)} cy={sy(current)} r="5" fill="#16a34a" />
            <circle cx={sx(0)} cy={sy(1)} r="5" fill="#f8fafc" stroke="#2563eb" strokeWidth="2" aria-hidden="true" />
            <text x={sx(2.55)} y={sy(1) - 7} fill="#b91c1c" fontSize="12">y = 1</text>
            <text x={sx(2.55)} y={sy(0) - 7} fill="#475569" fontSize="12">x</text>
            <text x={sx(0) + 6} y={sy(1.2) + 12} fill="#475569" fontSize="12">y</text>
          </svg>
        </div>

        <label className="block space-y-2">
          <span className="font-bold">x（ラジアン）= ±{x.toFixed(2)} に近づける</span>
          <input aria-label="x（ラジアン）の大きさ" type="range" min="0.05" max="2.8" step="0.05" value={x} onChange={(event) => setX(Number(event.target.value))} className="w-full accent-blue-600" />
        </label>

        <div className="grid sm:grid-cols-3 gap-2">
          <div className="border border-slate-300 p-3 bg-blue-50"><div className="text-slate-500">右から</div><div className="font-bold text-lg">{current.toFixed(5)}</div></div>
          <div className="border border-slate-300 p-3 bg-green-50"><div className="text-slate-500">左から</div><div className="font-bold text-lg">{mirrored.toFixed(5)}</div></div>
          <div className="border border-slate-300 p-3 bg-red-50"><div className="text-slate-500">極限値</div><div className="font-bold text-lg">1</div></div>
        </div>
      </section>

      <section className="retro-box bg-slate-50 p-4 space-y-2">
        <h2 className="font-bold">読み取りポイント</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>xの絶対値を小さくすると、左右の点が y = 1 に近づきます。</li>
          <li>このページは、式の値と「近づく先」を区別する直感を補助します。</li>
          <li>発展問題では、はさみうちの原理や連続性を使って極限値を説明します。</li>
        </ul>
      </section>
    </main>
  );
}
