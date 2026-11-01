'use client';

import Link from 'next/link';
import { useState } from 'react';
import { calculateCircularMotion } from '@/src/lib/circularMotion';

const CENTER_X = 320;
const CENTER_Y = 180;
const ORBIT_RADIUS = 105;
const VECTOR_LENGTH = 64;
const format = (value: number, digits = 2) => Number(value.toFixed(digits)).toString();

export default function CircularMotionVisualPage() {
  const [mass, setMass] = useState(1);
  const [radius, setRadius] = useState(1.5);
  const [speed, setSpeed] = useState(2);
  const [angleDegrees, setAngleDegrees] = useState(45);
  const state = calculateCircularMotion(mass, radius, speed, angleDegrees);
  const angle = angleDegrees * Math.PI / 180;
  const pointX = CENTER_X + ORBIT_RADIUS * Math.cos(angle);
  const pointY = CENTER_Y - ORBIT_RADIUS * Math.sin(angle);
  const velocityX = -Math.sin(angle);
  const velocityY = -Math.cos(angle);
  const inwardX = -Math.cos(angle);
  const inwardY = Math.sin(angle);
  const forceStartX = pointX + velocityX * 15;
  const forceStartY = pointY + velocityY * 15;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">物理 / 力学</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">等速円運動と向心力のビジュアル</h1></div><div className="flex flex-wrap gap-2"><Link href="/learn/physics/motion-calculation-drill" className="retro-btn-classic">円運動の計算演習へ →</Link><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div></div>
      <section className="retro-box bg-white p-4 space-y-5">
        <p className="text-slate-600 leading-relaxed">円運動では速度の向きが変わるため、速さが一定でも加速度が生じます。速度は円の接線方向、向心加速度と向心力は円の中心方向です。半径・速さ・質量を変えて、図と式を対応させます。</p>
        <div className="border border-slate-300 bg-slate-50 p-2">
          <svg viewBox="0 0 640 360" className="block w-full h-auto" role="img" aria-label={`半径${format(radius)} m、速さ${format(speed)} m/s、質量${format(mass)} kg の等速円運動。位置角${angleDegrees}度。速度は接線向き、向心加速度${format(state.centripetalAcceleration)} m/s²と向心力${format(state.centripetalForce)} Nは円の中心向き。`}>
            <defs>
              <marker id="circular-v-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#0284c7" /></marker>
              <marker id="circular-a-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#7c3aed" /></marker>
              <marker id="circular-f-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#ea580c" /></marker>
            </defs>
            <line x1="70" y1={CENTER_Y} x2="570" y2={CENTER_Y} stroke="#cbd5e1" />
            <line x1={CENTER_X} y1="25" x2={CENTER_X} y2="330" stroke="#cbd5e1" />
            <circle cx={CENTER_X} cy={CENTER_Y} r={ORBIT_RADIUS} fill="#eff6ff" stroke="#2563eb" strokeWidth="3" />
            <line x1={CENTER_X} y1={CENTER_Y} x2={pointX} y2={pointY} stroke="#64748b" strokeDasharray="5 4" />
            <text x={(CENTER_X + pointX) / 2 + 6} y={(CENTER_Y + pointY) / 2 - 4} fill="#475569" fontSize="15">r</text>
            <line x1={pointX} y1={pointY} x2={pointX + velocityX * VECTOR_LENGTH} y2={pointY + velocityY * VECTOR_LENGTH} stroke="#0284c7" strokeWidth="4" markerEnd="url(#circular-v-arrow)" />
            <line x1={pointX} y1={pointY} x2={pointX + inwardX * VECTOR_LENGTH} y2={pointY + inwardY * VECTOR_LENGTH} stroke="#7c3aed" strokeWidth="4" markerEnd="url(#circular-a-arrow)" />
            <line x1={forceStartX} y1={forceStartY} x2={forceStartX + inwardX * (VECTOR_LENGTH - 7)} y2={forceStartY + inwardY * (VECTOR_LENGTH - 7)} stroke="#ea580c" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#circular-f-arrow)" />
            <circle cx={CENTER_X} cy={CENTER_Y} r="6" fill="#334155" />
            <circle cx={pointX} cy={pointY} r="10" fill="#f97316" stroke="white" strokeWidth="3" />
            <text x="450" y="42" fill="#475569" fontSize="13">円の中心</text>
          </svg>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600"><span className="text-sky-700">v：速度（接線方向）</span><span className="text-violet-700">a：向心加速度（中心方向）</span><span className="text-orange-700">F：向心力（中心方向）</span></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1"><span className="font-bold">質量 m = {format(mass)} kg</span><input aria-label="円運動する物体の質量" type="range" min="0.5" max="5" step="0.5" value={mass} onChange={event => setMass(Number(event.target.value))} className="w-full accent-orange-600" /></label>
          <label className="block space-y-1"><span className="font-bold">半径 r = {format(radius)} m</span><input aria-label="円運動の半径" type="range" min="0.5" max="3" step="0.1" value={radius} onChange={event => setRadius(Number(event.target.value))} className="w-full accent-blue-600" /></label>
          <label className="block space-y-1"><span className="font-bold">速さ v = {format(speed)} m/s</span><input aria-label="円運動の速さ" type="range" min="0.5" max="8" step="0.1" value={speed} onChange={event => setSpeed(Number(event.target.value))} className="w-full accent-sky-600" /></label>
          <label className="block space-y-1"><span className="font-bold">位置角 θ = {angleDegrees}°</span><input aria-label="円周上の位置角" type="range" min="0" max="360" step="1" value={angleDegrees} onChange={event => setAngleDegrees(Number(event.target.value))} className="w-full accent-violet-600" /></label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border bg-sky-50 p-3"><span className="block text-xs text-slate-500">角速度 ω=v/r</span><strong>{format(state.angularSpeed, 3)} rad/s</strong></div>
          <div className="border bg-blue-50 p-3"><span className="block text-xs text-slate-500">周期 T=2πr/v</span><strong>{format(state.period, 3)} s</strong></div>
          <div className="border bg-violet-50 p-3"><span className="block text-xs text-slate-500">向心加速度 a=v²/r=rω²</span><strong>{format(state.centripetalAcceleration, 3)} m/s²</strong></div>
          <div className="border bg-orange-50 p-3 sm:col-span-2 lg:col-span-1"><span className="block text-xs text-slate-500">向心合力 F=ma</span><strong>{format(state.centripetalForce, 3)} N</strong></div>
          <div className="border bg-slate-50 p-3 sm:col-span-2"><span className="block text-xs text-slate-500">位置 (x, y) · 速度 (vₓ, vᵧ)</span><strong>({format(state.position.x)}, {format(state.position.y)}) m · ({format(state.velocity.x)}, {format(state.velocity.y)}) m/s</strong></div>
        </div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>速さが一定でも、速度ベクトルの向きが変わるため加速度があります。</li><li>向心加速度は a=v²/r=rω²。速さを2倍にすると4倍、半径を2倍にすると半分になります。</li><li>向心力は特別な種類の力ではなく、円の中心向きに働く合力です。F=ma=mv²/r で求めます。</li></ul><Link href="/learn/physics/motion-calculation-drill" className="retro-btn-classic inline-flex">円運動の個別・ランダム演習へ →</Link></section>
    </main>
  );
}
