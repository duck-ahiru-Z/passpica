'use client';

import Link from 'next/link';
import { useState } from 'react';
import { allowedStandingWaveHarmonics, standingWaveAntinodes, standingWaveDisplacement, standingWaveFrequency, standingWaveNodes, standingWaveWavelength, type StandingWaveBoundary } from '@/src/lib/physicsStandingWave';

const LEFT = 74;
const RIGHT = 646;
const MIDDLE = 126;
const SCALE = 47;
const boundaries: Record<StandingWaveBoundary, string> = { string: '両端固定の弦', openPipe: '両端開管（変位）', closedPipe: '片端閉管（変位）' };

export default function StandingWaveVisualPage() {
  const [boundary, setBoundary] = useState<StandingWaveBoundary>('string');
  const [harmonic, setHarmonic] = useState(2);
  const [length, setLength] = useState(1);
  const [speed, setSpeed] = useState(300);
  const [timePhase, setTimePhase] = useState(0);
  const allowed = allowedStandingWaveHarmonics(boundary);
  const currentHarmonic = allowed.includes(harmonic) ? harmonic : allowed[0];
  const nodes = standingWaveNodes(boundary, currentHarmonic);
  const antinodes = standingWaveAntinodes(boundary, currentHarmonic);
  const points = Array.from({ length: 161 }, (_, index) => {
    const fraction = index / 160;
    const x = LEFT + (RIGHT - LEFT) * fraction;
    const y = MIDDLE - SCALE * standingWaveDisplacement(fraction * length, length, currentHarmonic, boundary, timePhase);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const wavelength = standingWaveWavelength(length, currentHarmonic, boundary);
  const frequency = standingWaveFrequency(speed, length, currentHarmonic, boundary);
  const equation = boundary === 'closedPipe' ? 'λₙ=4L/n、n=1,3,5,…' : 'λₙ=2L/n、n=1,2,3,…';

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 text-sm text-slate-800">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[11px] text-slate-500">物理 / 波動</p><h1 className="text-xl font-bold text-slate-900 md:text-2xl">定常波・弦と気柱の固有振動</h1></div><div className="flex flex-wrap gap-2"><Link href="/learn/physics/standing-wave-drill" className="retro-btn-classic">定常波の計算演習へ →</Link><Link href="/learn/physics/wave-superposition-visual" className="retro-btn-classic">波の重ね合わせを見る</Link><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div></div>
    <section className="retro-box space-y-4 bg-white p-4"><p className="leading-relaxed text-slate-600">反対向きに進む波が重なってできる定常波を表示します。時間位相を変えても節の位置は動かず、腹だけが振動することを確認できます。弦と開管・閉管で端の条件がどう異なるかを切り替えて比べましょう。</p>
      <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1"><span className="font-bold">振動するもの・端の条件</span><select aria-label="定常波の境界条件" value={boundary} onChange={event => { const nextBoundary = event.target.value as StandingWaveBoundary; setBoundary(nextBoundary); setHarmonic(allowedStandingWaveHarmonics(nextBoundary)[0]); }} className="block w-full border bg-white p-2">{Object.entries(boundaries).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-1"><span className="font-bold">振動モード</span><select aria-label="定常波の振動モード" value={currentHarmonic} onChange={event => setHarmonic(Number(event.target.value))} className="block w-full border bg-white p-2">{allowed.map(value => <option key={value} value={value}>{boundary === 'closedPipe' ? `第${value}次（奇数次）` : `第${value}${boundary === 'string' ? '倍振動' : '次固有振動'}`}</option>)}</select></label></div>
      <svg viewBox="0 0 720 236" className="block h-auto w-full border border-slate-300 bg-slate-50" role="img" aria-label={`${boundaries[boundary]}の第${currentHarmonic}${boundary === 'string' ? '倍振動' : '次振動'}。節${nodes.length}個、腹${antinodes.length}個。波長${wavelength.toFixed(2)}メートル、振動数${frequency.toFixed(2)}ヘルツ。`}>
        <line x1={LEFT} y1={MIDDLE} x2={RIGHT} y2={MIDDLE} stroke="#94a3b8"/><line x1={LEFT} y1="48" x2={LEFT} y2="190" stroke="#64748b" strokeWidth="3"/><line x1={RIGHT} y1="48" x2={RIGHT} y2="190" stroke="#64748b" strokeWidth="3"/>
        {boundary === 'closedPipe' && <rect x={LEFT - 11} y="65" width="11" height="122" fill="#475569"/>}
        <text x={LEFT} y="28" fill="#475569" fontSize="12">{boundary === 'string' ? '固定端' : boundary === 'closedPipe' ? '閉端：節' : '開口：腹'}</text><text x={RIGHT} y="28" textAnchor="end" fill="#475569" fontSize="12">{boundary === 'string' ? '固定端' : '開口：腹'}</text>
        {nodes.map((position, index) => <g key={`node-${index}`}><circle cx={LEFT + (RIGHT - LEFT) * position} cy={MIDDLE} r="5" fill="#0f172a"/><text x={LEFT + (RIGHT - LEFT) * position} y="214" textAnchor="middle" fill="#0f172a" fontSize="11">節</text></g>)}
        {antinodes.map((position, index) => <g key={`antinode-${index}`}><line x1={LEFT + (RIGHT - LEFT) * position} y1="63" x2={LEFT + (RIGHT - LEFT) * position} y2="190" stroke="#f97316" strokeDasharray="4 5" opacity="0.55"/><text x={LEFT + (RIGHT - LEFT) * position} y="54" textAnchor="middle" fill="#c2410c" fontSize="11">腹</text></g>)}
        <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3.5"/><text x={LEFT} y="231" fill="#475569" fontSize="12">x=0</text><text x={RIGHT} y="231" textAnchor="end" fill="#475569" fontSize="12">x=L</text>
      </svg>
      <label className="block space-y-1"><span className="font-bold">時間位相 = {timePhase}°</span><input aria-label="定常波の時間位相" type="range" min="0" max="360" step="15" value={timePhase} onChange={event => setTimePhase(Number(event.target.value))} className="w-full accent-violet-600"/><span className="block text-xs text-slate-500">波形は上下に動きますが、節と腹の位置は変わりません。</span></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1"><span className="font-bold">長さ L = {length.toFixed(2)} m</span><input aria-label="弦または気柱の長さ" type="range" min="0.5" max="1.5" step="0.25" value={length} onChange={event => setLength(Number(event.target.value))} className="w-full accent-blue-600"/></label><label className="space-y-1"><span className="font-bold">波の速さ v = {speed} m/s</span><input aria-label="波の速さ" type="range" min="240" max="360" step="20" value={speed} onChange={event => setSpeed(Number(event.target.value))} className="w-full accent-emerald-600"/></label></div>
      <div className="grid gap-3 sm:grid-cols-4"><div className="border bg-slate-50 p-3"><span>境界条件</span><p className="font-bold">{boundaries[boundary]}</p></div><div className="border bg-blue-50 p-3"><span>定常波の関係</span><p className="font-bold">{equation}</p></div><div className="border bg-violet-50 p-3"><span>波長 λ</span><p className="text-lg font-bold">{wavelength.toFixed(2)} m</p></div><div className="border bg-amber-50 p-3"><span>固有振動数 f=v/λ</span><p className="text-lg font-bold">{frequency.toFixed(2)} Hz</p></div></div>
      <p className="text-xs text-slate-600">節 {nodes.length} 個 ／ 腹 {antinodes.length} 個。{boundary === 'closedPipe' ? '片端閉管では奇数次だけが存在します。' : boundary === 'openPipe' ? '両端開管では両端が変位の腹になります。' : '両端固定弦では両端が節になります。'}</p>
    </section>
    <section className="retro-box space-y-2 bg-slate-50 p-4"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc space-y-1 pl-5"><li>弦の両端は節です。第n倍振動では弦の長さに半波長がn個入り、fₙ=nv/(2L) です。</li><li>両端開管は両端が変位の腹で、すべての整数次が現れます。片端閉管は閉端が節・開端が腹のため、奇数次だけになります。</li><li>定常波の節は時間がたっても動きません。定常波の説明や実験では、弦や管の変位であることを区別して読みます。</li></ul></section>
  </main>;
}
