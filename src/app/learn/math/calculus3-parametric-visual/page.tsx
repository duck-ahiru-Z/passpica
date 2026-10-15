'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const W = 640;
const H = 320;
const sx = (x: number) => 190 + x * 100;
const sy = (y: number) => 160 - y * 100;

export default function Calculus3ParametricVisualPage() {
  const [t, setT] = useState(Math.PI / 4);
  const x = 2 * Math.cos(t);
  const y = Math.sin(t);
  const dxdt = -2 * Math.sin(t);
  const dydt = Math.cos(t);
  const slope = Math.abs(dxdt) < 0.001 ? null : dydt / dxdt;
  const ellipsePath = useMemo(() => Array.from({ length: 121 }, (_, index) => {
    const angle = Math.PI * 2 * index / 120;
    return `${index === 0 ? 'M' : 'L'} ${sx(2 * Math.cos(angle)).toFixed(1)} ${sy(Math.sin(angle)).toFixed(1)}`;
  }).join(' '), []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">数学III / 媒介変数表示</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">媒介変数表示された曲線ビジュアル装置</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">媒介変数 t を動かすと、点が楕円 x = 2 cos t, y = sin t の上を移動します。dx/dt・dy/dt と dy/dx の関係を観察します。</p>
        <div className="border border-slate-300 bg-slate-50 p-2 overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="媒介変数表示の楕円"><line x1="40" y1={sy(0)} x2="590" y2={sy(0)} stroke="#64748b" /><line x1={sx(0)} y1="25" x2={sx(0)} y2="295" stroke="#64748b" /><path d={ellipsePath} fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" /><circle cx={sx(x)} cy={sy(y)} r="6" fill="#f97316" />{slope === null ? <line x1={sx(x)} y1={sy(y - 0.8)} x2={sx(x)} y2={sy(y + 0.8)} stroke="#dc2626" strokeWidth="2" /> : <line x1={sx(x)} y1={sy(y)} x2={sx(x + 0.7)} y2={sy(y + slope * 0.7)} stroke="#dc2626" strokeWidth="2" />}<text x="430" y="42" fill="#2563eb" fontSize="12">x=2cos t, y=sin t</text></svg></div>
        <label className="block space-y-2"><span className="font-bold">t = {(t / Math.PI).toFixed(2)}π</span><input aria-label="媒介変数t" type="range" min="0" max={(Math.PI * 2).toFixed(2)} step="0.05" value={t} onChange={event => setT(Number(event.target.value))} className="w-full accent-blue-600" /></label>
        <div className="grid sm:grid-cols-4 gap-2"><div className="border p-2 bg-blue-50"><div className="text-slate-500">x</div><b>{x.toFixed(3)}</b></div><div className="border p-2 bg-green-50"><div className="text-slate-500">y</div><b>{y.toFixed(3)}</b></div><div className="border p-2 bg-red-50"><div className="text-slate-500">dx/dt</div><b>{dxdt.toFixed(3)}</b></div><div className="border p-2 bg-amber-50"><div className="text-slate-500">dy/dx</div><b>{slope === null ? '垂直接線' : slope.toFixed(3)}</b></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>点の位置は t で決まり、t が増えると楕円上を移動します。</li><li>接線の傾きは dy/dx = (dy/dt)/(dx/dt) で求めます。</li><li>dx/dt = 0 のときは分母が0になり、接線が垂直になる場合があります。</li></ul></section>
    </main>
  );
}
