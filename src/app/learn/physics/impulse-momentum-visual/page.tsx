'use client';

import Link from 'next/link';
import { useState } from 'react';
import { calculateImpulseMomentum } from '@/src/lib/impulseMomentum';

const centerX = 280;
const maxArrowLength = 170;

function format(value: number) {
  return Number(value.toFixed(2)).toString();
}

function vectorLength(value: number, scale: number) {
  return value === 0 ? 0 : Math.max(3, Math.abs(value) / scale * maxArrowLength);
}

function Vector({ value, y, label, unit, scale, color }: { value: number; y: number; label: string; unit: string; scale: number; color: string }) {
  const length = vectorLength(value, scale);
  const endX = centerX + Math.sign(value) * length;

  return (
    <g>
      {value !== 0 && <line x1={centerX} y1={y} x2={endX} y2={y} stroke={color} strokeWidth="5" markerEnd={`url(#arrow-${color.slice(1)})`} />}
      {value === 0 && <circle cx={centerX} cy={y} r="4" fill={color} />}
      <text x="20" y={y + 5} fill="#334155" fontSize="14">{label}</text>
      <text x="540" y={y + 5} textAnchor="end" fill={color} fontSize="14" fontWeight="bold">{format(value)} {unit}</text>
    </g>
  );
}

export default function ImpulseMomentumVisualPage() {
  const [mass, setMass] = useState(2);
  const [initialVelocity, setInitialVelocity] = useState(2);
  const [force, setForce] = useState(4);
  const [duration, setDuration] = useState(1);
  const state = calculateImpulseMomentum(mass, initialVelocity, force, duration);
  const scale = Math.max(Math.abs(state.initialMomentum), Math.abs(state.finalMomentum), Math.abs(state.impulse), 1);
  const forceScale = 20;
  const durationScale = 2;
  const forceZeroY = 62;
  const forceEndY = forceZeroY - (force / forceScale) * 35;
  const graphEndX = 72 + (duration / durationScale) * 390;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500">物理 / 力学</div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">力積と運動量変化のビジュアル</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/learn/physics/motion-calculation-drill" className="retro-btn-classic">力学の計算演習へ →</Link>
          <Link href="/learn" className="retro-btn-classic">学習一覧へ</Link>
        </div>
      </div>

      <section className="retro-box bg-white p-4 space-y-5">
        <p className="text-slate-600 leading-relaxed">
          右向きを正とし、物体に一定の力を加える時間を変えて運動量の変化を確認します。この図では力は時間中ずっと一定で、力積は力と時間の積 J=FΔt です。力が時間で変化する場合は、力と時間のグラフの符号付き面積が力積になります。運動量の変化は力積に等しくなります。
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block space-y-2">
            <span className="font-bold">質量 m = {format(mass)} kg</span>
            <input aria-label="物体の質量" type="range" min="0.5" max="5" step="0.5" value={mass} onChange={event => setMass(Number(event.target.value))} className="w-full accent-violet-600" />
            <span className="block text-[10px] text-slate-500">0.5 kg〜5 kg</span>
          </label>
          <label className="block space-y-2">
            <span className="font-bold">初速度 u = {format(initialVelocity)} m/s</span>
            <input aria-label="物体の初速度" type="range" min="-10" max="10" step="1" value={initialVelocity} onChange={event => setInitialVelocity(Number(event.target.value))} className="w-full accent-blue-600" />
            <span className="block text-[10px] text-slate-500">右向きが正、左向きが負</span>
          </label>
          <label className="block space-y-2">
            <span className="font-bold">一定の力 F = {format(force)} N</span>
            <input aria-label="加える一定の力" type="range" min="-20" max="20" step="2" value={force} onChange={event => setForce(Number(event.target.value))} className="w-full accent-orange-600" />
            <span className="block text-[10px] text-slate-500">右向きが正、左向きが負</span>
          </label>
          <label className="block space-y-2">
            <span className="font-bold">力を加える時間 Δt = {format(duration)} s</span>
            <input aria-label="力を加える時間" type="range" min="0" max="2" step="0.1" value={duration} onChange={event => setDuration(Number(event.target.value))} className="w-full accent-emerald-600" />
            <span className="block text-[10px] text-slate-500">0 s〜2 s</span>
          </label>
        </div>

        <div className="border border-slate-300 bg-slate-50 p-2 overflow-x-auto">
          <svg viewBox="0 0 560 190" className="block w-full min-w-[500px] h-auto" role="img" aria-label={`右向きを正とする運動量図。初めの運動量は${format(state.initialMomentum)} kg·m/s、力積は${format(state.impulse)} N·s、後の運動量は${format(state.finalMomentum)} kg·m/s。`}>
            <defs>
              <marker id="arrow-2563eb" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="#2563eb" /></marker>
              <marker id="arrow-f97316" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="#f97316" /></marker>
              <marker id="arrow-059669" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="#059669" /></marker>
            </defs>
            <line x1="105" y1="20" x2="455" y2="20" stroke="#94a3b8" strokeWidth="2" />
            <path d="M455 15 L465 20 L455 25" fill="none" stroke="#94a3b8" strokeWidth="2" />
            <text x="470" y="25" fill="#475569" fontSize="12">右向き（正）</text>
            <line x1={centerX} y1="35" x2={centerX} y2="170" stroke="#cbd5e1" strokeDasharray="4 4" />
            <Vector value={state.initialMomentum} y={58} label="初め pᵢ" unit="kg·m/s" scale={scale} color="#2563eb" />
            <Vector value={state.impulse} y={103} label="力積 J" unit="N·s" scale={scale} color="#f97316" />
            <Vector value={state.finalMomentum} y={148} label="後 p𝒇" unit="kg·m/s" scale={scale} color="#059669" />
          </svg>
        </div>

        <div className="border border-slate-300 bg-white p-3">
          <h2 className="font-bold mb-2">力と時間のグラフ（面積が力積）</h2>
          <svg viewBox="0 0 500 112" className="block w-full h-auto" role="img" aria-label={`一定の力${format(force)} Nを${format(duration)}秒加えるグラフ。力と時間の符号付き面積は${format(state.impulse)} N·s。`}>
            <line x1="72" y1={forceZeroY} x2="470" y2={forceZeroY} stroke="#475569" strokeWidth="2" />
            <line x1="72" y1="15" x2="72" y2="96" stroke="#475569" strokeWidth="2" />
            {duration > 0 && force !== 0 && <rect x="72" y={Math.min(forceZeroY, forceEndY)} width={Math.max(0, graphEndX - 72)} height={Math.abs(forceZeroY - forceEndY)} fill="#fb923c" fillOpacity="0.35" stroke="#f97316" />}
            <line x1="72" y1={forceEndY} x2={graphEndX} y2={forceEndY} stroke="#f97316" strokeWidth="3" />
            <text x="12" y={forceZeroY + 4} fill="#475569" fontSize="12">0</text>
            <text x="74" y="108" fill="#475569" fontSize="12">0</text>
            <text x={graphEndX} y="108" textAnchor="middle" fill="#475569" fontSize="12">{format(duration)} s</text>
            <text x="470" y="62" textAnchor="end" fill="#475569" fontSize="12">t (s)</text>
            <text x="78" y={forceEndY - 5} fill="#c2410c" fontSize="12">F={format(force)} N</text>
          </svg>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-center">
          <div className="border p-3 bg-blue-50"><div className="text-slate-500">初めの運動量 pᵢ</div><b className="text-base">{format(state.initialMomentum)} kg·m/s</b></div>
          <div className="border p-3 bg-orange-50"><div className="text-slate-500">力積 J=FΔt</div><b className="text-base">{format(state.impulse)} N·s</b></div>
          <div className="border p-3 bg-emerald-50"><div className="text-slate-500">運動量の変化 Δp</div><b className="text-base">{format(state.finalMomentum - state.initialMomentum)} kg·m/s</b></div>
          <div className="border p-3 bg-violet-50"><div className="text-slate-500">後の速度 v</div><b className="text-base">{format(state.finalVelocity)} m/s</b></div>
        </div>

        <div className="rounded border border-sky-200 bg-sky-50 p-3 space-y-1">
          <p><strong>運動量の変化と力積：</strong> Δp = p𝒇 − pᵢ = {format(state.finalMomentum)} − ({format(state.initialMomentum)}) = {format(state.finalMomentum - state.initialMomentum)} kg·m/s</p>
          <p><strong>力積：</strong> J = FΔt = {format(force)} × {format(duration)} = {format(state.impulse)} N·s</p>
          <p><strong>関係：</strong> J = Δp。N·s と kg·m/s は同じ次元の単位です。</p>
          <p className="text-xs text-slate-600">初速度と力が逆向きなら、速さはいったん小さくなります。力積の大きさが初めの運動量を上回ると運動量の符号が反転し、物体は反対向きに動きます。力積と運動量の符号は、右向きを正とした向きで決まります。</p>
        </div>
      </section>
    </main>
  );
}
