'use client';

import Link from 'next/link';
import { useState } from 'react';

const f = (x: number) => x ** 4 - 2 * x ** 2;
const d1 = (x: number) => 4 * x ** 3 - 4 * x;
const d2 = (x: number) => 12 * x ** 2 - 4;

export default function Calculus3CurvatureVisual() {
  const [x, setX] = useState(0);
  const point = { x: 220 + x * 70, y: 155 - f(x) * 28 };
  const concavity = d2(x) > 0 ? '下に凸（f′′(x)>0）' : d2(x) < 0 ? '上に凸（f′′(x)<0）' : '変曲点の候補（f′′(x)=0）';
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/learn" className="text-blue-600 hover:underline">← 学習室ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">凹凸と変曲点ビジュアル装置</h1><p className="text-gray-500">f(x)=x⁴−2x² の点を動かし、f′(x)の傾きとf′′(x)の符号から凹凸を観察します。</p><section className="retro-box bg-white p-5 space-y-4"><svg viewBox="0 0 440 220" className="w-full max-w-xl mx-auto border bg-slate-50" role="img" aria-label="四次関数のグラフと移動点"><line x1="20" y1="155" x2="420" y2="155" stroke="#94a3b8"/><line x1="220" y1="15" x2="220" y2="205" stroke="#94a3b8"/>{Array.from({ length: 81 }, (_, i) => { const t = -2.8 + i * 0.07; const y = 155 - f(t) * 28; return <circle key={i} cx={220 + t * 70} cy={y} r="1.5" fill="#2563eb"/>; })}<line x1={point.x - 70} y1={point.y - d1(x) * 28} x2={point.x + 70} y2={point.y + d1(x) * 28} stroke="#ef4444" strokeWidth="2"/><circle cx={point.x} cy={point.y} r="5" fill="#dc2626"/><text x="12" y="20" fill="#334155">y=x⁴−2x²</text></svg><label className="block text-center font-bold">x = {x.toFixed(2)}<input aria-label="xの位置" type="range" min="-1.8" max="1.8" step="0.01" value={x} onChange={e => setX(Number(e.target.value))} className="w-full mt-2" /></label><div className="grid sm:grid-cols-3 gap-2 text-center"><div className="border p-3 bg-blue-50"><div className="text-gray-500">f(x)</div><strong>{f(x).toFixed(3)}</strong></div><div className="border p-3 bg-red-50"><div className="text-gray-500">f′(x)（接線の傾き）</div><strong>{d1(x).toFixed(3)}</strong></div><div className="border p-3 bg-amber-50"><div className="text-gray-500">f′′(x)</div><strong>{d2(x).toFixed(3)}</strong></div></div><div className="text-center font-bold text-lg text-emerald-700">{concavity}</div><p className="text-center text-slate-600">f′′(x)=0 となる x=±1/√3 付近で、グラフの凹凸が切り替わります。</p></section></main>;
}
