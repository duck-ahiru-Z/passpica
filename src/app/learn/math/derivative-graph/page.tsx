"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';

const W = 640;
const H = 360;
const X_MIN = -3.5;
const X_MAX = 3.5;
const Y_MIN = -8;
const Y_MAX = 8;

function sx(x: number) { return ((x - X_MIN) / (X_MAX - X_MIN)) * W; }
function sy(y: number) { return H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * H; }
function curve(fn: (x: number) => number) {
  return Array.from({ length: 141 }, (_, i) => {
    const x = X_MIN + (X_MAX - X_MIN) * i / 140;
    return `${i === 0 ? 'M' : 'L'} ${sx(x).toFixed(1)} ${sy(fn(x)).toFixed(1)}`;
  }).join(' ');
}

export default function DerivativeGraphPage() {
  const [x, setX] = useState(1.2);
  const f = (t: number) => t * t * t - 3 * t;
  const df = (t: number) => 3 * t * t - 3;
  const tangent = useMemo(() => {
    const y = f(x);
    const m = df(x);
    return { y, m, path: `M ${sx(X_MIN)} ${sy(y + m * (X_MIN - x))} L ${sx(X_MAX)} ${sy(y + m * (X_MAX - x))}` };
  }, [x]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-4 text-slate-800">
      <div className="text-xs text-gray-500"><Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 数学III・導関数とグラフ</div>
      <section className="border border-gray-300 bg-white p-4 space-y-2">
        <h1 className="text-xl font-bold">導関数とグラフ：接線の傾きビジュアル</h1>
        <p className="text-sm text-gray-600">点を動かして、関数の値 f(x)、導関数 f&apos;(x)、接線の傾きが同時にどう変わるか確認します。</p>
      </section>
      <section className="border border-gray-300 bg-slate-50 p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label htmlFor="point-x" className="font-bold">点の x 座標</label>
          <input id="point-x" type="range" min={X_MIN} max={X_MAX} step="0.1" value={x} onChange={e => setX(Number(e.target.value))} className="w-64" />
          <output className="font-mono bg-white border px-2 py-1">x = {x.toFixed(1)}</output>
        </div>
        <div className="overflow-x-auto bg-white border border-slate-300">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="関数と導関数のグラフ" className="w-full min-w-[600px] h-auto">
            <rect width={W} height={H} fill="#fff" />
            {[-3,-2,-1,0,1,2,3].map(v => <line key={`x${v}`} x1={sx(v)} y1={0} x2={sx(v)} y2={H} stroke="#e2e8f0" />)}
            {[-6,-3,0,3,6].map(v => <line key={`y${v}`} x1={0} y1={sy(v)} x2={W} y2={sy(v)} stroke="#e2e8f0" />)}
            <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="#64748b" />
            <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="#64748b" />
            <path d={curve(f)} fill="none" stroke="#2563eb" strokeWidth="3" />
            <path d={tangent.path} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="7 5" />
            <circle cx={sx(x)} cy={sy(tangent.y)} r="6" fill="#dc2626" stroke="#fff" strokeWidth="2" />
            <text x="12" y="22" fill="#2563eb" fontSize="14">f(x) = x³ − 3x</text>
            <text x="12" y="42" fill="#f97316" fontSize="14">接線（傾き f&apos;(x)）</text>
          </svg>
        </div>
        <div className="grid sm:grid-cols-3 gap-2 text-sm">
          <div className="bg-white border p-2">点：({x.toFixed(1)}, {tangent.y.toFixed(2)})</div>
          <div className="bg-white border p-2">f&apos;(x) = 3x² − 3 = <strong>{tangent.m.toFixed(2)}</strong></div>
          <div className="bg-white border p-2">傾きの意味：{tangent.m > 0.01 ? '右上がり' : tangent.m < -0.01 ? '右下がり' : '水平'}</div>
        </div>
      </section>
      <section className="border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed space-y-1">
        <h2 className="font-bold">見るポイント</h2>
        <p>導関数 f&apos;(x) は、その点での接線の傾きです。f&apos;(x) &gt; 0 なら増加、f&apos;(x) &lt; 0 なら減少し、f&apos;(x) = 0 の場所では接線が水平になります。</p>
        <p className="text-xs text-slate-600">この教材は「式を計算する」前に、微分係数とグラフの対応を視覚的に確認するためのものです。</p>
      </section>
    </main>
  );
}
