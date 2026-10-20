'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  calculateProjectileState,
  projectileGravity,
  projectileInitialHeight,
  projectileInitialSpeed,
} from '@/src/lib/projectileMotion';

const W = 640;
const H = 330;

export default function ProjectileVisualPage() {
  const [angleDeg, setAngleDeg] = useState(0);
  const [timeFraction, setTimeFraction] = useState(1);
  const state = calculateProjectileState(angleDeg, timeFraction);
  const { vx0, vy0, flightTime, maxHeight, range: maxX, time, x, displayedY, vy } = state;
  const verticalVelocityArrowLength = Math.min(48, Math.max(18, Math.abs(vy) * 2.5));
  const mapX = (value: number) => 55 + (value / (maxX + 4)) * (W - 90);
  // y軸を上向きに取る。鉛直速度の符号に合わせて図の矢印も反転する。
  const sx = mapX;
  const sy = (value: number) => H - 42 - (value / (maxHeight + 3)) * (H - 75);
  const path = useMemo(() => Array.from({ length: 61 }, (_, index) => {
    const t = flightTime * index / 60;
    const px = vx0 * t;
    const py = Math.max(0, projectileInitialHeight + vy0 * t - 0.5 * projectileGravity * t * t);
    return `${index === 0 ? 'M' : 'L'} ${55 + (px / (maxX + 4)) * (W - 90)} ${H - 42 - (py / (maxHeight + 3)) * (H - 75)}`;
  }).join(' '), [flightTime, vx0, vy0, maxX, maxHeight]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">物理 / 力学</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">水平投射と放物運動ビジュアル装置</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">初速度{projectileInitialSpeed} m/s・高さ{projectileInitialHeight} mの物体を追跡します。射出角0°なら水平投射、角度を上げると斜方投射になり、運動を水平・鉛直に分解して観察できます。</p>
        <label className="block space-y-2 font-bold">射出角 θ = {angleDeg}°<input aria-label="射出角（度）" type="range" min="0" max="75" step="5" value={angleDeg} onChange={event => setAngleDeg(Number(event.target.value))} className="w-full accent-blue-600" /><span className="block text-[10px] text-slate-500 font-normal">水平成分 vₓ₀ = {vx0.toFixed(2)} m/s、鉛直成分 vᵧ₀ = {vy0.toFixed(2)} m/s</span></label>
        <div className="border border-slate-300 bg-slate-50 p-2"><svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto max-w-[640px] mx-auto" role="img" aria-label={`射出角${angleDeg}度の放物運動。時刻${time.toFixed(2)}秒、水平位置${x.toFixed(2)}メートル、高さ${displayedY.toFixed(2)}メートル、鉛直速度${vy.toFixed(2)}メートル毎秒${Math.abs(vy) < 0.01 ? '、この瞬間の鉛直速度は0で重力加速度は下向き' : ''}`}><defs><clipPath id="plot-area"><rect x="0" y="0" width={W} height={sy(0)} /></clipPath><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#dc2626" /></marker><marker id="vertical-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#7c3aed" /></marker></defs><g clipPath="url(#plot-area)"><path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" /><line x1={sx(x)} y1={sy(displayedY)} x2={sx(x)} y2={sy(0)} stroke="#16a34a" strokeDasharray="4 4" /><line x1={sx(x)} y1={sy(displayedY)} x2={sx(x + 1.8)} y2={sy(displayedY)} stroke="#dc2626" strokeWidth="2" markerEnd="url(#arrow)" />{Math.abs(vy) >= 0.01 ? <line x1={sx(x)} y1={sy(displayedY)} x2={sx(x)} y2={sy(displayedY) - Math.sign(vy) * verticalVelocityArrowLength} stroke="#7c3aed" strokeWidth="2" markerEnd="url(#vertical-arrow)" /> : <line x1={sx(x)} y1={sy(displayedY)} x2={sx(x)} y2={sy(displayedY) + 30} stroke="#7c3aed" strokeWidth="2" markerEnd="url(#vertical-arrow)" />}</g><line x1={sx(0)} y1={sy(0)} x2={sx(maxX + 3)} y2={sy(0)} stroke="#64748b" /><line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(maxHeight + 2)} stroke="#64748b" /><circle cx={sx(x)} cy={sy(displayedY)} r="6" fill="#f97316" /><text x={sx(1)} y={sy(maxHeight + 1)} fill="#475569" fontSize="20">高さ y</text><text x={sx(maxX - 1)} y={sy(0) - 8} fill="#475569" fontSize="20">水平距離 x</text></svg><div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-600"><span className="text-red-600">→ 水平速度 vₓ = {vx0.toFixed(2)} m/s</span><span className="text-violet-700">{Math.abs(vy) < 0.01 ? '—' : vy > 0 ? '↑' : '↓'} 鉛直速度 vᵧ = {vy.toFixed(2)} m/s（上向きを正）</span>{Math.abs(vy) < 0.01 && <span className="text-violet-700">↓ 重力加速度 g = {projectileGravity} m/s²</span>}</div></div>
        <label className="block space-y-2"><span className="font-bold">時刻 t = {time.toFixed(2)} s</span><input aria-label="飛行時間の割合" type="range" min="0" max="100" step="1" value={timeFraction * 100} onChange={event => setTimeFraction(Number(event.target.value) / 100)} className="w-full accent-blue-600" /></label>
        <div className="grid sm:grid-cols-4 gap-2"><div className="border p-2 bg-blue-50"><div className="text-slate-500">水平位置 x</div><b>{x.toFixed(2)} m</b></div><div className="border p-2 bg-orange-50"><div className="text-slate-500">高さ y</div><b>{displayedY.toFixed(2)} m</b></div><div className="border p-2 bg-red-50"><div className="text-slate-500">鉛直速度 vᵧ</div><b>{vy.toFixed(2)} m/s</b><small className="block text-slate-500">上向きを正</small></div><div className="border p-2 bg-green-50"><div className="text-slate-500">着地時刻</div><b>{flightTime.toFixed(2)} s</b></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>水平速度 vₓ は一定、鉛直速度 vᵧ は vᵧ₀−gt で変化します。上向きを正にとり、地面への到達時刻は t=({vy0.toFixed(2)}+√({vy0.toFixed(2)}²+2×{projectileGravity}×{projectileInitialHeight}))/{projectileGravity}={flightTime.toFixed(2)} s です。</li><li>軌道は x を消去して y = {projectileInitialHeight} + x tan{angleDeg}° − ({projectileGravity}x²)/(2×{projectileInitialSpeed}² cos²{angleDeg}°) と表せます。角度0°では水平投射の式になります。</li><li>水平到達距離は x=vₓ₀t={maxX.toFixed(2)} m です。着地後の運動はモデルに含めず、図では地面の高さで止めています。</li></ul></section>
    </main>
  );
}
