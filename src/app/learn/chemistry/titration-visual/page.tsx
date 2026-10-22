'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getIndicatorDisplay } from '@/src/lib/chemistryIndicator';
import {
  getTitrationCurvePoints,
  getTitrationVisualState,
  titrationVisualAcidConcentration,
  titrationVisualAcidVolumeMl,
  titrationVisualBaseConcentration,
  titrationVisualMaxBaseVolumeMl,
} from '@/src/lib/chemistryTitrationVisual';

const chart = { left: 48, right: 420, top: 18, bottom: 202 };
const xForVolume = (volume: number) => chart.left + volume / titrationVisualMaxBaseVolumeMl * (chart.right - chart.left);
const yForPh = (ph: number) => chart.bottom - ph / 14 * (chart.bottom - chart.top);

export default function TitrationVisualPage() {
  const [baseVolumeMl, setBaseVolumeMl] = useState(0);
  const state = getTitrationVisualState(baseVolumeMl);
  const indicatorDisplay = getIndicatorDisplay('pp', state.ph);
  const curvePath = getTitrationCurvePoints(120)
    .map(({ volumeMl, ph }, index) => `${index === 0 ? 'M' : 'L'}${xForVolume(volumeMl)},${yForPh(ph)}`)
    .join(' ');
  const markerX = xForVolume(state.baseVolumeMl);
  const markerY = yForPh(state.ph);
  const liquidColor = indicatorDisplay.backgroundColor;
  const phaseLabel = state.phase === 'equivalence' ? '中和点' : state.phase === 'acidic' ? '酸性（酸が過剰）' : '塩基性（塩基が過剰）';

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 text-sm text-slate-800">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-[11px] text-slate-500">化学 / 酸と塩基</p><h1 className="text-xl font-bold text-slate-900 md:text-2xl">中和滴定とpH変化ビジュアル</h1></div>
      <div className="flex flex-wrap gap-2"><Link href="/learn/chemistry/titration-drill" className="retro-btn-classic">中和滴定の計算演習へ →</Link><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
    </div>

    <section className="retro-box space-y-4 bg-white p-4">
      <p className="leading-relaxed text-slate-600">濃度 {titrationVisualAcidConcentration} mol/L・体積 {titrationVisualAcidVolumeMl} mL の塩酸に、{titrationVisualBaseConcentration} mol/L の水酸化ナトリウム水溶液を加えます。滴下量を動かし、中和点とpHの急変を確認しましょう。</p>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.6fr)]">
        <div className="space-y-2">
          <svg viewBox="0 0 450 245" className="block h-auto w-full border border-slate-300 bg-slate-50" role="img" aria-label={`塩酸${titrationVisualAcidVolumeMl}ミリリットルに水酸化ナトリウムを${state.baseVolumeMl.toFixed(1)}ミリリットル加えた状態。pH ${state.ph.toFixed(2)}、${phaseLabel}。pH曲線の中和点は${state.equivalenceVolumeMl.toFixed(1)}ミリリットルです。`}>
            {[0, 2, 4, 6, 8, 10, 12, 14].map(ph => <g key={ph}><line x1={chart.left} y1={yForPh(ph)} x2={chart.right} y2={yForPh(ph)} stroke={ph === 7 ? '#64748b' : '#e2e8f0'} strokeDasharray={ph === 7 ? '4 3' : undefined} /><text x="34" y={yForPh(ph) + 4} textAnchor="end" fill="#475569" fontSize="11">{ph}</text></g>)}
            <line x1={chart.left} y1={chart.bottom} x2={chart.right} y2={chart.bottom} stroke="#475569" /><line x1={chart.left} y1={chart.top} x2={chart.left} y2={chart.bottom} stroke="#475569" />
            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="3" />
            <line x1={xForVolume(state.equivalenceVolumeMl)} y1={chart.top} x2={xForVolume(state.equivalenceVolumeMl)} y2={chart.bottom} stroke="#dc2626" strokeDasharray="4 3" />
            <circle cx={markerX} cy={markerY} r="6" fill="#dc2626" stroke="white" strokeWidth="2" />
            {[0, 10, 20, 25, 30, 40, 50].map(volume => <text key={volume} x={xForVolume(volume)} y="222" textAnchor="middle" fill="#475569" fontSize="10">{volume}</text>)}
            <text x="230" y="239" textAnchor="middle" fill="#334155" fontSize="11">加えたNaOH水溶液（mL）</text><text x="10" y="16" fill="#334155" fontSize="11">pH</text>
            <text x={xForVolume(state.equivalenceVolumeMl) + 4} y="31" fill="#b91c1c" fontSize="10">中和点</text>
          </svg>
          <p className="text-xs text-slate-500">青線：pH曲線　赤点線：中和点（酸と塩基の物質量が等しい体積）</p>
        </div>

        <div className="space-y-3">
          <svg viewBox="0 0 180 220" className="mx-auto block h-auto w-full max-w-[220px]" role="img" aria-label={`ビーカーの液体は${indicatorDisplay.colorName}。pHに応じたフェノールフタレインの色の濃さを模式的に示しています。`}>
            <path d="M35 28 H145 M48 30 V182 Q48 198 64 198 H116 Q132 198 132 182 V30" fill="none" stroke="#475569" strokeWidth="5" />
            <path d="M51 105 H129 V181 Q129 195 115 195 H65 Q51 195 51 181 Z" fill={liquidColor} stroke="none" />
            <line x1="56" y1="111" x2="124" y2="111" stroke="#64748b" strokeWidth="2" />
            <path d="M86 12 H94 V70" fill="none" stroke="#64748b" strokeWidth="5" />
            <path d="M90 67 L84 57 H96 Z" fill="#2563eb" />
            <text x="90" y="215" textAnchor="middle" fontSize="11" fill="#334155">フェノールフタレイン（模式図）</text>
          </svg>
          <div className="border bg-slate-50 p-3 text-center"><p className="text-xs text-slate-500">現在の状態</p><p className="text-lg font-bold">{phaseLabel}</p><p className="text-2xl font-bold text-blue-800">pH {state.ph.toFixed(2)}</p><p className="text-xs">指示薬の色：{indicatorDisplay.colorName}（pHに応じて濃さが変化）</p></div>
        </div>
      </div>

      <label className="block space-y-2"><span className="font-bold">加えたNaOH水溶液：{state.baseVolumeMl.toFixed(2)} mL</span><input aria-label="加えた水酸化ナトリウム水溶液の体積" type="range" min="0" max={titrationVisualMaxBaseVolumeMl} step="0.01" value={state.baseVolumeMl} onChange={event => setBaseVolumeMl(Number(event.target.value))} className="w-full accent-blue-600" /><span className="flex justify-between text-xs text-slate-500"><span>0 mL</span><span>中和点 {state.equivalenceVolumeMl.toFixed(2)} mL</span><span>{titrationVisualMaxBaseVolumeMl} mL</span></span><span className="block text-[10px] text-slate-500">中和点付近はpHが急変するため、細かく動かすと指示薬の変色域を観察できます。</span></label>

      <div className="grid gap-2 sm:grid-cols-3"><div className="border bg-red-50 p-3"><span className="text-slate-600">塩酸の物質量</span><p className="text-lg font-bold">{(state.acidMoles * 1000).toFixed(2)} mmol</p></div><div className="border bg-blue-50 p-3"><span className="text-slate-600">加えたNaOHの物質量</span><p className="text-lg font-bold">{(state.baseMoles * 1000).toFixed(2)} mmol</p></div><div className="border bg-emerald-50 p-3"><span className="text-slate-600">中和に必要な体積</span><p className="text-lg font-bold">{state.equivalenceVolumeMl.toFixed(1)} mL</p></div></div>

      <div className="space-y-1 rounded border border-slate-200 bg-slate-50 p-3 text-slate-700"><p className="font-bold">計算のつながり</p><p>中和点では n(HCl)=n(NaOH)。よって c(NaOH)V(NaOH)=c(HCl)V(HCl)、中和点の体積は {titrationVisualBaseConcentration}×V={titrationVisualAcidConcentration}×{titrationVisualAcidVolumeMl} より {state.equivalenceVolumeMl.toFixed(1)} mL です。</p><p className="text-xs">フェノールフタレインはpH約8.3から変色するため、強酸・強塩基の中和点（pH 7）を少し過ぎると色が現れます。色の図は変色域を示す模式図です。</p></div>
    </section>
  </main>;
}
