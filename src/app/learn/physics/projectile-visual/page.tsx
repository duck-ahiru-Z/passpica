'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const W = 640;
const H = 330;
const g = 9.8;
const initialSpeed = 14;
const initialHeight = 12;
const flightTime = Math.sqrt((2 * initialHeight) / g);

export default function ProjectileVisualPage() {
  const [time, setTime] = useState(0.7);
  const x = initialSpeed * time;
  const y = initialHeight - 0.5 * g * time * time;
  // y軸を上向きに取っているため、落下中の鉛直速度は負（下向き）。
  const vy = -g * time;
  const maxX = initialSpeed * flightTime;
  const sx = (value: number) => 55 + (value / (maxX + 4)) * (W - 90);
  const sy = (value: number) => H - 42 - (value / (initialHeight + 3)) * (H - 75);
  const path = useMemo(() => Array.from({ length: 61 }, (_, index) => {
    const t = flightTime * index / 60;
    const px = initialSpeed * t;
    const py = Math.max(0, initialHeight - 0.5 * g * t * t);
    return `${index === 0 ? 'M' : 'L'} ${sx(px).toFixed(1)} ${sy(py).toFixed(1)}`;
  }).join(' '), []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">物理 / 力学</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">水平投射と放物運動ビジュアル装置</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">初速度を水平方向に14 m/s、高さを12 mとした物体を、時間スライダーで追跡します。水平方向は等速、鉛直方向は自由落下として重ねて観察します。</p>
        <div className="border border-slate-300 bg-slate-50 p-2 overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="水平投射の放物線軌道"><line x1={sx(0)} y1={sy(0)} x2={sx(maxX + 3)} y2={sy(0)} stroke="#64748b" /><line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(initialHeight + 2)} stroke="#64748b" /><path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" /><line x1={sx(x)} y1={sy(y)} x2={sx(x)} y2={sy(0)} stroke="#16a34a" strokeDasharray="4 4" /><line x1={sx(x)} y1={sy(y)} x2={sx(x + 1.8)} y2={sy(y)} stroke="#dc2626" strokeWidth="2" markerEnd="url(#arrow)" /><circle cx={sx(x)} cy={sy(y)} r="6" fill="#f97316" /><text x={sx(1)} y={sy(initialHeight + 1)} fill="#475569" fontSize="12">高さ y</text><text x={sx(maxX - 1)} y={sy(0) - 8} fill="#475569" fontSize="12">水平距離 x</text><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#dc2626" /></marker></defs></svg></div>
        <label className="block space-y-2"><span className="font-bold">時刻 t = {time.toFixed(2)} s</span><input aria-label="時刻" type="range" min="0" max={flightTime.toFixed(2)} step="0.05" value={time} onChange={event => setTime(Number(event.target.value))} className="w-full accent-blue-600" /></label>
        <div className="grid sm:grid-cols-4 gap-2"><div className="border p-2 bg-blue-50"><div className="text-slate-500">水平位置 x</div><b>{x.toFixed(2)} m</b></div><div className="border p-2 bg-orange-50"><div className="text-slate-500">高さ y</div><b>{Math.max(0, y).toFixed(2)} m</b></div><div className="border p-2 bg-red-50"><div className="text-slate-500">鉛直速度 v_y</div><b>{vy.toFixed(2)} m/s</b><small className="block text-slate-500">下向きを負</small></div><div className="border p-2 bg-green-50"><div className="text-slate-500">着地時刻</div><b>{flightTime.toFixed(2)} s</b></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>水平速度は一定ですが、鉛直速度 v_y は時間に比例して負の向きへ増えます。速さの大きさは gt です。</li><li>軌道は x を消去すると y = 12 − (9.8 / (2×14²))x² の放物線になります。</li><li>水平運動と鉛直運動を分解すると、到達時間と水平距離を別々に求められます。</li></ul></section>
    </main>
  );
}
