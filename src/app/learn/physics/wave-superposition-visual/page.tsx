'use client';

import Link from 'next/link';
import { useState } from 'react';
import { calculateResultantAmplitude } from '@/src/lib/physicsWaveSuperposition';

const LEFT = 48;
const RIGHT = 672;
const MID = 130;
const SCALE = 38;

export default function WaveSuperpositionVisualPage() {
  const [phase, setPhase] = useState(90);
  const [amplitude, setAmplitude] = useState(1.5);
  const points = (wave: 0 | 1 | 2) => Array.from({ length: 161 }, (_, index) => {
    const x = LEFT + (RIGHT - LEFT) * index / 160;
    const angle = 4 * Math.PI * index / 160;
    const y1 = amplitude * Math.sin(angle);
    const y2 = amplitude * Math.sin(angle - phase * Math.PI / 180);
    const y = wave === 0 ? y1 : wave === 1 ? y2 : y1 + y2;
    return `${x.toFixed(2)},${(MID - y * SCALE).toFixed(2)}`;
  }).join(' ');
  const result = calculateResultantAmplitude(amplitude, phase);
  const presets = [0, 90, 180, 270, 360];

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 text-sm text-slate-800">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[11px] text-slate-500">物理 / 波動</p><h1 className="text-xl font-bold text-slate-900 md:text-2xl">波の重ね合わせ・干渉ビジュアル</h1></div><div className="flex flex-wrap gap-2"><Link href="/learn/physics/wave-calculation-drill" className="retro-btn-classic">波動の計算演習へ →</Link><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div></div>
    <section className="retro-box space-y-4 bg-white p-4"><p className="leading-relaxed text-slate-600">同じ振幅・波長で同じ向きに進む2つの波を重ねます。位相差を変えて、合成波の振幅が強め合いから打ち消し合いへ変わる様子を見ます。</p>
      <svg viewBox="0 0 720 230" className="block h-auto w-full border border-slate-300 bg-slate-50" role="img" aria-label={`位相差${phase}度。波1と波2を重ねた合成波の振幅は${result.toFixed(2)} cm`}>
        <line x1={LEFT} y1={MID} x2={RIGHT} y2={MID} stroke="#94a3b8"/><line x1={LEFT} y1="24" x2={LEFT} y2="210" stroke="#94a3b8"/>
        <text x={LEFT} y="18" fill="#475569" fontSize="12">変位</text><text x={RIGHT} y="222" textAnchor="end" fill="#475569" fontSize="12">位置（横軸は2波長分）</text>
        <polyline points={points(0)} fill="none" stroke="#2563eb" strokeWidth="2.5"/><polyline points={points(1)} fill="none" stroke="#f97316" strokeWidth="2.5"/><polyline points={points(2)} fill="none" stroke="#7c3aed" strokeWidth="3.5"/>
        <text x="58" y="222" fill="#2563eb" fontSize="12">波1</text><text x="102" y="222" fill="#ea580c" fontSize="12">波2</text><text x="146" y="222" fill="#6d28d9" fontSize="12">合成波</text>
      </svg>
      <label className="block space-y-1"><span className="font-bold">位相差 Δφ = {phase}°</span><input aria-label="波の位相差" type="range" min="0" max="360" step="1" value={phase} onChange={event => setPhase(Number(event.target.value))} className="w-full accent-violet-600"/></label>
      <div className="flex flex-wrap gap-2" aria-label="位相差の例">{presets.map(value => <button type="button" key={value} onClick={() => setPhase(value)} className={`retro-btn-classic ${phase === value ? 'border-violet-500 bg-violet-100 font-bold' : ''}`}>{value}°</button>)}</div>
      <label className="block space-y-1"><span className="font-bold">各波の振幅 a = {amplitude.toFixed(1)} cm</span><input aria-label="各波の振幅" type="range" min="0.5" max="2.5" step="0.5" value={amplitude} onChange={event => setAmplitude(Number(event.target.value))} className="w-full accent-blue-600"/></label>
      <div className="grid gap-3 sm:grid-cols-3"><div className="border bg-blue-50 p-3"><span>波1・波2の振幅</span><p className="text-lg font-bold">{amplitude.toFixed(1)} cmずつ</p></div><div className="border bg-violet-50 p-3"><span>合成振幅 A=2a|cos(Δφ/2)|</span><p className="text-lg font-bold">{result.toFixed(2)} cm</p></div><div className="border bg-amber-50 p-3"><span>波の状態</span><p className="text-lg font-bold">{phase % 360 === 0 ? '強め合い' : phase === 180 ? '打ち消し合い' : '部分的に重ね合わせ'}</p></div></div>
    </section>
    <section className="retro-box space-y-2 bg-slate-50 p-4"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc space-y-1 pl-5"><li>位相差0°（360°）では山と山が重なり、合成振幅は2aになります。</li><li>位相差180°では山と谷が重なり、同じ振幅の波は打ち消し合います。</li><li>位相差90°や270°では、合成振幅は√2aです。経路差から位相差は Δφ=360°×経路差/波長 で求めます。</li></ul></section>
  </main>;
}
