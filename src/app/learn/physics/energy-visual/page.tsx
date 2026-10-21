'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  calculateFallingEnergy,
  fallingObjectInitialHeight,
  fallingObjectMass,
  mechanicalEnergyGravity,
} from '@/src/lib/mechanicalEnergy';

const SVG_HEIGHT = 300;
const TRACK_TOP = 42;
const TRACK_BOTTOM = 232;

export default function MechanicalEnergyVisualPage() {
  const [height, setHeight] = useState(fallingObjectInitialHeight);
  const state = calculateFallingEnergy(height);
  const objectY = TRACK_BOTTOM - (state.height / fallingObjectInitialHeight) * (TRACK_BOTTOM - TRACK_TOP);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500">物理 / 力学</div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">力学的エネルギーの変換ビジュアル</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/learn/physics/motion-calculation-drill" className="retro-btn-classic">力学の計算演習へ →</Link>
          <Link href="/learn" className="retro-btn-classic">学習一覧へ</Link>
        </div>
      </div>

      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">
          質量 {fallingObjectMass} kg の物体を高さ {fallingObjectInitialHeight} m から静かに落とします。空気抵抗を無視すると、落下中に位置エネルギーが運動エネルギーへ移り、力学的エネルギーの合計は一定です。
        </p>

        <div className="border border-slate-300 bg-slate-50 p-2">
          <svg viewBox={`0 0 560 ${SVG_HEIGHT}`} className="block w-full h-auto" role="img" aria-label={`高さ${state.height.toFixed(1)}メートルを落下中。位置エネルギー${state.potential.toFixed(1)}ジュール、運動エネルギー${state.kinetic.toFixed(1)}ジュール、合計${state.total.toFixed(1)}ジュール`}>
            <rect x="90" y={TRACK_TOP - 12} width="110" height={TRACK_BOTTOM - TRACK_TOP + 30} rx="10" fill="#e2e8f0" />
            <line x1="145" y1={TRACK_TOP} x2="145" y2={TRACK_BOTTOM} stroke="#64748b" strokeWidth="3" />
            <line x1="115" y1={TRACK_TOP} x2="175" y2={TRACK_TOP} stroke="#64748b" strokeWidth="2" />
            <line x1="115" y1={(TRACK_TOP + TRACK_BOTTOM) / 2} x2="175" y2={(TRACK_TOP + TRACK_BOTTOM) / 2} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="100" y1={TRACK_BOTTOM} x2="190" y2={TRACK_BOTTOM} stroke="#334155" strokeWidth="4" />
            <text x="208" y={TRACK_TOP + 4} fill="#475569" fontSize="13">h₀ = {fallingObjectInitialHeight} m</text>
            <text x="208" y={(TRACK_TOP + TRACK_BOTTOM) / 2 + 4} fill="#64748b" fontSize="13">中間の高さ</text>
            <text x="208" y={TRACK_BOTTOM + 4} fill="#475569" fontSize="13">地面 h = 0</text>
            {state.dropDistance > 0 && <line x1="145" y1={TRACK_TOP + 8} x2="145" y2={objectY - 9} stroke="#2563eb" strokeWidth="2" strokeDasharray="4 4" />}
            <circle cx="145" cy={objectY} r="12" fill="#f97316" stroke="#9a3412" strokeWidth="2" />
            <text x="145" y={Math.max(18, objectY - 20)} fill="#9a3412" fontSize="13" textAnchor="middle">物体</text>
            <text x="360" y="82" fill="#1d4ed8" fontSize="15" fontWeight="bold">位置エネルギー Eₚ = mgh</text>
            <text x="360" y="112" fill="#15803d" fontSize="15" fontWeight="bold">運動エネルギー Eₖ</text>
            <text x="360" y="160" fill="#334155" fontSize="14">落下距離：{state.dropDistance.toFixed(1)} m</text>
            <text x="360" y="190" fill="#334155" fontSize="14">重力加速度：{mechanicalEnergyGravity} m/s²</text>
          </svg>
        </div>

        <label className="block space-y-2">
          <span className="font-bold">物体の高さ h = {state.height.toFixed(1)} m</span>
          <input aria-label="物体の高さ" type="range" min="0" max={fallingObjectInitialHeight} step="0.5" value={state.height} onChange={event => setHeight(Number(event.target.value))} className="w-full accent-blue-600" />
          <span className="block text-[10px] text-slate-500">スライダーを下げて、位置エネルギーが運動エネルギーへ移る様子を確認します。</span>
        </label>

        <div className="grid sm:grid-cols-3 gap-2">
          <div className="border p-3 bg-blue-50"><div className="text-slate-500">位置エネルギー Eₚ</div><b className="text-base">{state.potential.toFixed(1)} J</b><div className="h-3 mt-2 bg-white border"><div className="h-full bg-blue-500" style={{ width: `${state.potentialFraction * 100}%` }} /></div></div>
          <div className="border p-3 bg-green-50"><div className="text-slate-500">運動エネルギー Eₖ</div><b className="text-base">{state.kinetic.toFixed(1)} J</b><div className="h-3 mt-2 bg-white border"><div className="h-full bg-green-500" style={{ width: `${state.kineticFraction * 100}%` }} /></div></div>
          <div className="border p-3 bg-amber-50"><div className="text-slate-500">力学的エネルギー Eₚ+Eₖ</div><b className="text-base">{state.total.toFixed(1)} J</b><div className="text-[10px] mt-2">高さにかかわらず一定</div></div>
        </div>
      </section>

      <section className="retro-box bg-slate-50 p-4 space-y-2">
        <h2 className="font-bold">読み取りポイント</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>位置エネルギーは Eₚ=mgh、静止から落とした物体の運動エネルギーは落下距離 s を使って Eₖ=mgs と表せます。</li>
          <li>したがって Eₚ+Eₖ=mg(h+s)=mgh₀={state.total.toFixed(1)} J となり、落下中も合計は変わりません。</li>
          <li>最高点・最下点などの状態を比べると、力学的エネルギー保存則を使う問題で何を未知数にするか判断しやすくなります。</li>
        </ul>
      </section>
    </main>
  );
}
