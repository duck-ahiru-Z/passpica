'use client';

import Link from 'next/link';
import { useState } from 'react';
import { calculateSimpleHarmonicState } from '@/src/lib/simpleHarmonicMotion';

const GRAPH_LEFT = 370;
const GRAPH_RIGHT = 650;
const GRAPH_TOP = 34;
const GRAPH_BOTTOM = 172;

export default function SimpleHarmonicVisualPage() {
  const [mass, setMass] = useState(1);
  const [springConstant, setSpringConstant] = useState(100);
  const [amplitude, setAmplitude] = useState(0.2);
  const [phase, setPhase] = useState(0);
  const state = calculateSimpleHarmonicState({ mass, springConstant, amplitude, phase });
  const blockCenter = 220 + (state.displacement / 0.3) * 92;
  const blockLeft = blockCenter - 28;
  const coil = Array.from({ length: 13 }, (_, index) => {
    const progress = index / 12;
    const x = 76 + (blockLeft - 76) * progress;
    const y = index === 0 || index === 12 ? 102 : 102 + (index % 2 === 0 ? -14 : 14);
    return `${x},${y}`;
  }).join(' ');
  const graphPoints = Array.from({ length: 61 }, (_, index) => {
    const x = GRAPH_LEFT + (GRAPH_RIGHT - GRAPH_LEFT) * index / 60;
    const y = (GRAPH_TOP + GRAPH_BOTTOM) / 2 - Math.cos(2 * Math.PI * index / 60) * (GRAPH_BOTTOM - GRAPH_TOP) * 0.42;
    return `${x.toFixed(3)},${y.toFixed(3)}`;
  }).join(' ');
  const graphX = GRAPH_LEFT + phase * (GRAPH_RIGHT - GRAPH_LEFT);
  const graphY = (GRAPH_TOP + GRAPH_BOTTOM) / 2 - Math.cos(2 * Math.PI * phase) * (GRAPH_BOTTOM - GRAPH_TOP) * 0.42;
  const energyPercent = state.totalEnergy === 0 ? 0 : state.potentialEnergy / state.totalEnergy * 100;

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 text-sm text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-[11px] text-slate-500">物理 / 力学・単振動</p><h1 className="text-xl font-bold text-slate-900 md:text-2xl">ばね振り子の単振動ビジュアル</h1></div>
        <div className="flex flex-wrap gap-2"><Link href="/learn/physics/motion-calculation-drill" className="retro-btn-classic">周期・振動数の計算演習へ →</Link><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      </div>

      <section className="retro-box space-y-4 bg-white p-4">
        <p className="leading-relaxed text-slate-600">軽いばねにつないだ物体が、摩擦なく自然長の位置を中心に単振動するモデルです。位相を動かすと、変位・速度・加速度と、位置エネルギー／運動エネルギーの入れ替わりを同時に確認できます。</p>
        <svg viewBox="0 0 680 230" className="block h-auto w-full border border-slate-300 bg-slate-50" role="img" aria-label={`ばね振り子。位相 ${(phase * 100).toFixed(0)} パーセント、変位 ${state.displacement.toFixed(3)} m、速度 ${state.velocity.toFixed(3)} m毎秒、加速度 ${state.acceleration.toFixed(3)} m毎秒毎秒`}>
          <line x1="60" y1="54" x2="60" y2="150" stroke="#475569" strokeWidth="8" />
          <line x1="80" y1="136" x2="350" y2="136" stroke="#64748b" strokeWidth="2" />
          <line x1="220" y1="50" x2="220" y2="154" stroke="#94a3b8" strokeDasharray="5 5" />
          <polyline points={coil} fill="none" stroke="#2563eb" strokeWidth="3" />
          <rect x={blockLeft} y="80" width="56" height="46" rx="5" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="3" />
          <text x={blockCenter} y="108" textAnchor="middle" fill="#1e3a8a" fontSize="13" fontWeight="bold">m</text>
          <text x="220" y="174" textAnchor="middle" fill="#475569" fontSize="12">自然長 x=0</text>
          <text x="82" y="38" fill="#334155" fontSize="13">壁</text>
          <text x="380" y="22" fill="#334155" fontSize="13" fontWeight="bold">変位 x(t)=A cos(ωt)</text>
          <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#94a3b8" />
          <text x={GRAPH_LEFT - 8} y={GRAPH_TOP + 4} textAnchor="end" fill="#475569" fontSize="11">+A</text>
          <line x1={GRAPH_LEFT} y1={(GRAPH_TOP + GRAPH_BOTTOM) / 2} x2={GRAPH_RIGHT} y2={(GRAPH_TOP + GRAPH_BOTTOM) / 2} stroke="#94a3b8" />
          <text x={GRAPH_LEFT - 8} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2 + 4} textAnchor="end" fill="#475569" fontSize="11">0</text>
          <polyline points={graphPoints} fill="none" stroke="#7c3aed" strokeWidth="3" />
          <line x1={graphX} y1={GRAPH_TOP} x2={graphX} y2={GRAPH_BOTTOM} stroke="#f97316" strokeDasharray="4 3" />
          <circle cx={graphX} cy={graphY} r="6" fill="#f97316" stroke="white" strokeWidth="2" />
          <text x={GRAPH_LEFT - 8} y={GRAPH_BOTTOM + 4} textAnchor="end" fill="#475569" fontSize="11">−A</text>
          <text x={GRAPH_LEFT} y="198" fill="#475569" fontSize="12">0</text><text x={GRAPH_RIGHT} y="198" textAnchor="end" fill="#475569" fontSize="12">1周期 T</text>
          <text x="380" y="218" fill="#475569" fontSize="12">時間が進むと、位置と速度の位相がずれて変化します。</text>
        </svg>

        <label className="block space-y-1"><span className="font-bold">位相 {Math.round(phase * 100)}%（時間 t={(state.period * phase).toFixed(3)} s）</span><input aria-label="振動の位相" type="range" min="0" max="1" step="0.01" value={phase} onChange={event => setPhase(Number(event.target.value))} className="w-full accent-violet-600" /><span className="block text-xs text-slate-500">スライダーを動かして一周期の変化を追います。端の100%は0%と同じ位置・状態です。</span></label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1"><span className="font-bold">質量 m = {mass.toFixed(1)} kg</span><input aria-label="振動する物体の質量" type="range" min="0.5" max="2" step="0.5" value={mass} onChange={event => setMass(Number(event.target.value))} className="w-full accent-blue-600" /></label>
          <label className="space-y-1"><span className="font-bold">ばね定数 k = {springConstant} N/m</span><input aria-label="ばね定数" type="range" min="50" max="200" step="50" value={springConstant} onChange={event => setSpringConstant(Number(event.target.value))} className="w-full accent-emerald-600" /></label>
          <label className="space-y-1"><span className="font-bold">振幅 A = {amplitude.toFixed(1)} m</span><input aria-label="振幅" type="range" min="0.1" max="0.3" step="0.1" value={amplitude} onChange={event => setAmplitude(Number(event.target.value))} className="w-full accent-orange-600" /></label>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="border bg-violet-50 p-3"><span className="text-slate-600">周期 T=2π√(m/k)</span><p className="text-lg font-bold">{state.period.toFixed(3)} s</p><span>振動数 f={state.frequency.toFixed(3)} Hz</span></div>
          <div className="border bg-blue-50 p-3"><span className="text-slate-600">位置・運動</span><p>x = {state.displacement.toFixed(3)} m</p><p>v = {state.velocity.toFixed(3)} m/s</p><p>a = {state.acceleration.toFixed(3)} m/s²</p></div>
          <div className="border bg-amber-50 p-3"><span className="text-slate-600">力学的エネルギー</span><p>位置 {state.potentialEnergy.toFixed(3)} J</p><p>運動 {state.kineticEnergy.toFixed(3)} J</p><b>合計 {state.totalEnergy.toFixed(3)} J</b></div>
        </div>
        <div className="h-4 overflow-hidden border bg-white" role="img" aria-label={`全エネルギーのうち弾性エネルギー${energyPercent.toFixed(0)}パーセント、運動エネルギー${(100 - energyPercent).toFixed(0)}パーセント`}><div className="flex h-full"><div className="h-full bg-amber-400" style={{ width: `${energyPercent}%` }} /><div className="h-full bg-green-500" style={{ width: `${100 - energyPercent}%` }} /></div></div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600" aria-label="エネルギー棒グラフの凡例">
          <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-amber-400" />弾性エネルギー</span>
          <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-green-500" />運動エネルギー</span>
        </div>
      </section>
      <section className="retro-box space-y-2 bg-slate-50 p-4"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc space-y-1 pl-5 text-slate-700"><li>角振動数は ω=√(k/m)、周期は T=2π/ω、振動数は f=1/T です。質量とばね定数で周期が決まり、振幅には依存しません。</li><li>端では速度が0で弾性エネルギー最大、自然長を通るときは速さが最大で運動エネルギー最大になります。</li><li>復元加速度は a=−ω²x。変位と反対向きに働き、位置エネルギーと運動エネルギーの和は一定です。</li></ul></section>
    </main>
  );
}
