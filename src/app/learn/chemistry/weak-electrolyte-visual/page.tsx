'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { calculateWeakAcidPh, calculateWeakBasePh, solveWeakElectrolyteIonConcentration } from '@/src/lib/chemistryWeakElectrolyte';

const WIDTH = 620;
const HEIGHT = 260;
const MIN_CONCENTRATION = 0.01;
const MAX_CONCENTRATION = 0.5;
const MAX_IONIZATION_FRACTION = 0.35;
const MODEL_UNITS = 40;

export default function WeakElectrolyteVisualPage() {
  const [kind, setKind] = useState<'acid' | 'base'>('acid');
  const [concentration, setConcentration] = useState(0.1);
  const [pK, setPK] = useState(4.74);
  const equilibriumConstant = 10 ** -pK;
  const ionConcentration = solveWeakElectrolyteIonConcentration(concentration, equilibriumConstant);
  const ionizationFraction = ionConcentration / concentration;
  const pH = kind === 'acid'
    ? calculateWeakAcidPh(concentration, equilibriumConstant)
    : calculateWeakBasePh(concentration, equilibriumConstant);
  const particleCount = Math.round(ionizationFraction * MODEL_UNITS);
  const x = (value: number) => 52 + ((value - MIN_CONCENTRATION) / (MAX_CONCENTRATION - MIN_CONCENTRATION)) * (WIDTH - 78);
  const y = (value: number) => HEIGHT - 34 - (value / MAX_IONIZATION_FRACTION) * (HEIGHT - 62);
  const curvePath = useMemo(() => Array.from({ length: 100 }, (_, index) => {
    const c = MIN_CONCENTRATION + index * (MAX_CONCENTRATION - MIN_CONCENTRATION) / 99;
    const fraction = solveWeakElectrolyteIonConcentration(c, equilibriumConstant) / c;
    return `${index === 0 ? 'M' : 'L'} ${x(c).toFixed(1)} ${y(fraction).toFixed(1)}`;
  }).join(' '), [equilibriumConstant]);
  const particleDescription = kind === 'acid'
    ? `電離前 HA ${MODEL_UNITS - particleCount}個、電離後 H⁺とA⁻のイオン対 ${particleCount}組`
    : `電離前 B ${MODEL_UNITS - particleCount}個、電離後 BH⁺とOH⁻のイオン対 ${particleCount}組`;
  const neutralLabel = kind === 'acid' ? 'HA' : 'B';
  const cationLabel = kind === 'acid' ? 'H⁺' : 'BH⁺';
  const anionLabel = kind === 'acid' ? 'A⁻' : 'OH⁻';

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500">化学 / 酸と塩基</div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">弱酸・弱塩基の電離平衡</h1>
        </div>
        <Link href="/learn" className="retro-btn-classic">学習一覧へ</Link>
      </div>

      <section className="retro-box bg-white p-4 space-y-4">
        <div>
          <h2 className="font-bold text-base">溶けた量のすべてが電離するわけではない</h2>
          <p className="text-slate-600 mt-1 leading-relaxed">濃度 C と電離定数 K を動かし、平衡で電離する割合と pH の変化を観察します。弱酸では Ka、弱塩基では Kb を使います（25℃）。</p>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="電解質の種類">
          <button type="button" aria-pressed={kind === 'acid'} onClick={() => setKind('acid')} className={`retro-btn-classic ${kind === 'acid' ? 'bg-blue-100 border-blue-500 font-bold' : ''}`}>弱酸 HA</button>
          <button type="button" aria-pressed={kind === 'base'} onClick={() => setKind('base')} className={`retro-btn-classic ${kind === 'base' ? 'bg-blue-100 border-blue-500 font-bold' : ''}`}>弱塩基 B</button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="font-bold">初濃度 C = {concentration.toFixed(2)} mol/L</span>
            <input aria-label="弱電解質の初濃度 C" type="range" min={MIN_CONCENTRATION} max={MAX_CONCENTRATION} step="0.01" value={concentration} onChange={event => setConcentration(Number(event.target.value))} className="w-full accent-blue-600" />
          </label>
          <label className="block space-y-2">
            <span className="font-bold">p{kind === 'acid' ? 'Ka' : 'Kb'} = {pK.toFixed(2)}（K = {equilibriumConstant.toExponential(2)}）</span>
            <input aria-label={`弱${kind === 'acid' ? '酸' : '塩基'}のpK`} type="range" min="3" max="7" step="0.01" value={pK} onChange={event => setPK(Number(event.target.value))} className="w-full accent-purple-600" />
          </label>
        </div>

        <div className="bg-slate-50 border p-3 text-center text-lg font-semibold" aria-live="polite">
          {kind === 'acid' ? 'HA ⇄ H⁺ + A⁻　Ka = [H⁺][A⁻]/[HA]' : 'B + H₂O ⇄ BH⁺ + OH⁻　Kb = [BH⁺][OH⁻]/[B]'}
        </div>

        <div className="border border-slate-300 bg-white p-3 space-y-2">
          <h3 className="font-bold">電離の割合（初濃度に対する割合）</h3>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full h-auto" role="img" aria-label={`横軸が初濃度、縦軸が電離度のグラフ。現在の濃度${concentration.toFixed(2)} mol/L、電離度${(ionizationFraction * 100).toFixed(2)}パーセント。電離定数は一定です。`}>
            <line x1="52" y1={HEIGHT - 34} x2={WIDTH - 26} y2={HEIGHT - 34} stroke="#64748b" />
            <line x1="52" y1="24" x2="52" y2={HEIGHT - 34} stroke="#64748b" />
            {[0, 0.1, 0.2, 0.3].map(value => <g key={`fraction-${value}`}><line x1="52" y1={y(value)} x2={WIDTH - 26} y2={y(value)} stroke="#cbd5e1" strokeDasharray="3 4" /><text x="46" y={y(value) + 4} textAnchor="end" fill="#475569" fontSize="11">{(value * 100).toFixed(0)}%</text></g>)}
            {[0.01, 0.1, 0.25, 0.5].map(value => <g key={`concentration-${value}`}><line x1={x(value)} y1={HEIGHT - 34} x2={x(value)} y2={HEIGHT - 30} stroke="#64748b" /><text x={x(value)} y={HEIGHT - 12} textAnchor="middle" fill="#475569" fontSize="11">{value.toFixed(2)}</text></g>)}
            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
            <line x1={x(concentration)} y1={HEIGHT - 34} x2={x(concentration)} y2={y(ionizationFraction)} stroke="#16a34a" strokeDasharray="3 3" />
            <circle cx={x(concentration)} cy={y(ionizationFraction)} r="5" fill="#16a34a" />
            <text x={WIDTH - 26} y="18" textAnchor="end" fill="#475569" fontSize="12">C (mol/L)</text>
            <text x="54" y="18" fill="#475569" fontSize="11">電離度</text>
          </svg>
        </div>

        <div className="border border-slate-300 bg-white p-3 space-y-2">
          <h3 className="font-bold">平衡時の粒子モデル（40式量）</h3>
          <svg viewBox="0 0 620 190" className="block w-full h-auto" role="img" aria-label={`${particleDescription}。丸印一つが溶質1式量を表し、イオン対は二つの粒子として表示しています。`}>
            {Array.from({ length: MODEL_UNITS }, (_, index) => {
              const column = index % 8;
              const row = Math.floor(index / 8);
              const centerX = 42 + column * 76;
              const centerY = 24 + row * 34;
              const ionized = index < particleCount;
              return ionized ? <g key={index}>
                <circle cx={centerX - 13} cy={centerY} r="12" fill="#fce7f3" stroke="#db2777" />
                <text x={centerX - 13} y={centerY + 3} textAnchor="middle" fontSize="8" fill="#9d174d">{cationLabel}</text>
                <circle cx={centerX + 14} cy={centerY} r="12" fill="#dbeafe" stroke="#2563eb" />
                <text x={centerX + 14} y={centerY + 3} textAnchor="middle" fontSize="8" fill="#1e40af">{anionLabel}</text>
              </g> : <g key={index}>
                <circle cx={centerX} cy={centerY} r="13" fill="#e2e8f0" stroke="#64748b" />
                <text x={centerX} y={centerY + 3} textAnchor="middle" fontSize="8" fill="#334155">{neutralLabel}</text>
              </g>;
            })}
          </svg>
          <p className="text-xs text-slate-500">電離数は模型で見えるよう40式量に換算して丸めています。正確な割合は上の数値を確認してください。</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-2">
          <div className="border p-3 bg-blue-50"><div className="text-slate-500">電離度</div><div className="font-bold text-lg">{(ionizationFraction * 100).toFixed(2)}%</div></div>
          <div className="border p-3 bg-rose-50"><div className="text-slate-500">pH（25℃）</div><div className="font-bold text-lg">{pH.toFixed(3)}</div></div>
          <div className="border p-3 bg-green-50"><div className="text-slate-500">平衡時のイオン濃度</div><div className="font-bold text-lg">{ionConcentration.toExponential(3)} mol/L</div></div>
        </div>
        <p className="text-sm text-slate-700">平衡濃度を x とすると K=x²/(C−x)。二次方程式を解いて電離量を求め、酸は pH=−log₁₀[H⁺]、塩基は pOH=−log₁₀[OH⁻] から pH=14−pOH と計算します。</p>
      </section>

      <section className="retro-box bg-slate-50 p-4 space-y-2">
        <h2 className="font-bold">関連教材</h2>
        <Link href="/learn/chemistry/mole-calculation-drill" className="retro-btn-classic inline-flex mr-2">弱酸・弱塩基のpHを問題で練習する →</Link>
        <Link href="/learn/chemistry/acid-base" className="retro-btn-classic inline-flex">pHスケールと指示薬の色を見る →</Link>
      </section>
    </main>
  );
}
