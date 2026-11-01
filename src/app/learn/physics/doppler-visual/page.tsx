'use client';

import Link from 'next/link';
import { useState } from 'react';
import { calculateDopplerFrequency } from '@/src/lib/physicsDoppler';

type Motion = 'toward' | 'away' | 'still';
const SOURCE_X = 260;
const OBSERVER_X = 620;
const SCALE = 28;

export default function DopplerVisualPage() {
  const [frequency, setFrequency] = useState(500);
  const [soundSpeed, setSoundSpeed] = useState(340);
  const [sourceSpeed, setSourceSpeed] = useState(20);
  const [observerSpeed, setObserverSpeed] = useState(20);
  const [sourceMotion, setSourceMotion] = useState<Motion>('toward');
  const [observerMotion, setObserverMotion] = useState<Motion>('toward');
  const sourceApproaching = sourceMotion === 'toward';
  const observerApproaching = observerMotion === 'toward';
  const sourceSignedSpeed = sourceMotion === 'still' ? 0 : sourceSpeed * (sourceApproaching ? 1 : -1);
  const observed = calculateDopplerFrequency({
    emittedFrequency: frequency, soundSpeed, sourceSpeed: sourceMotion === 'still' ? 0 : sourceSpeed,
    observerSpeed: observerMotion === 'still' ? 0 : observerSpeed, sourceApproaching, observerApproaching,
  });
  const observerSideSpacing = (soundSpeed - sourceSignedSpeed) / frequency;
  const oppositeSideSpacing = (soundSpeed + sourceSignedSpeed) / frequency;
  const wavefronts = Array.from({ length: 8 }, (_, index) => index + 1);

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 text-sm text-slate-800">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[11px] text-slate-500">物理 / 波動</p><h1 className="text-xl font-bold text-slate-900 md:text-2xl">ドップラー効果・音源と観測者</h1></div><div className="flex flex-wrap gap-2"><Link href="/learn/physics/doppler-drill" className="retro-btn-classic">ドップラー効果の計算演習へ →</Link><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div></div>
    <section className="retro-box space-y-4 bg-white p-4">
      <p className="leading-relaxed text-slate-600">音源が動くと、進行方向の波面は詰まり、後方は広がります。観測者が動く場合は、波面との相対速度が変わります。動く向きを選び、波面の間隔と聞こえる振動数を比べましょう。</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1"><span className="font-bold">音源の向き</span><select aria-label="音源の動く向き" value={sourceMotion} onChange={event => setSourceMotion(event.target.value as Motion)} className="block w-full border bg-white p-2"><option value="toward">観測者へ近づく</option><option value="away">観測者から遠ざかる</option><option value="still">静止</option></select></label>
        <label className="space-y-1"><span className="font-bold">観測者の向き</span><select aria-label="観測者の動く向き" value={observerMotion} onChange={event => setObserverMotion(event.target.value as Motion)} className="block w-full border bg-white p-2"><option value="toward">音源へ近づく</option><option value="away">音源から遠ざかる</option><option value="still">静止</option></select></label>
      </div>
      <svg viewBox="0 0 720 190" className="block h-auto w-full border border-slate-300 bg-slate-50" role="img" aria-label={`音源 ${sourceMotion === 'still' ? '静止' : sourceMotion === 'toward' ? '右の観測者へ移動' : '左へ移動'}、観測者 ${observerMotion === 'still' ? '静止' : observerMotion === 'toward' ? '音源へ移動' : '音源から離れる'}。観測者側の波面間隔 ${observerSideSpacing.toFixed(2)} m、反対側 ${oppositeSideSpacing.toFixed(2)} m。観測振動数 ${observed.toFixed(2)} Hz。`}>
        <line x1="55" y1="116" x2="680" y2="116" stroke="#94a3b8" strokeWidth="2"/>
        {wavefronts.map(index => { const right = SOURCE_X + (soundSpeed - sourceSignedSpeed) * index / frequency * SCALE; const left = SOURCE_X - (soundSpeed + sourceSignedSpeed) * index / frequency * SCALE; return <g key={index}><line x1={right} y1="70" x2={right} y2="158" stroke="#2563eb" strokeWidth="2"/><line x1={left} y1="70" x2={left} y2="158" stroke="#93c5fd" strokeWidth="2"/></g>; })}
        <circle cx={SOURCE_X} cy="116" r="15" fill="#f97316"/><text x={SOURCE_X} y="178" textAnchor="middle" fill="#9a3412" fontSize="13">音源</text>
        <circle cx={OBSERVER_X} cy="116" r="13" fill="#7c3aed"/><text x={OBSERVER_X} y="178" textAnchor="middle" fill="#5b21b6" fontSize="13">観測者</text>
        {sourceMotion !== 'still' && <text x={SOURCE_X} y="48" textAnchor="middle" fill="#9a3412" fontSize="13">{sourceApproaching ? '→' : '←'} 音源の移動</text>}
        {observerMotion !== 'still' && <text x={OBSERVER_X} y="48" textAnchor="middle" fill="#5b21b6" fontSize="13">{observerApproaching ? '←' : '→'} 観測者の移動</text>}
        <text x="60" y="24" fill="#475569" fontSize="12">波面が広いほど波長が長く、狭いほど短い（模式図）</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1"><span className="font-bold">音源の振動数 f = {frequency} Hz</span><input aria-label="音源の振動数" type="range" min="400" max="1000" step="100" value={frequency} onChange={event => setFrequency(Number(event.target.value))} className="w-full accent-orange-600"/></label>
        <label className="space-y-1"><span className="font-bold">音速 v = {soundSpeed} m/s</span><input aria-label="音速" type="range" min="330" max="350" step="10" value={soundSpeed} onChange={event => setSoundSpeed(Number(event.target.value))} className="w-full accent-blue-600"/></label>
        {sourceMotion !== 'still' && <label className="space-y-1"><span className="font-bold">音源の速さ vₛ = {sourceSpeed} m/s</span><input aria-label="音源の速さ" type="range" min="10" max="40" step="10" value={sourceSpeed} onChange={event => setSourceSpeed(Number(event.target.value))} className="w-full accent-orange-600"/></label>}
        {observerMotion !== 'still' && <label className="space-y-1"><span className="font-bold">観測者の速さ vₒ = {observerSpeed} m/s</span><input aria-label="観測者の速さ" type="range" min="10" max="40" step="10" value={observerSpeed} onChange={event => setObserverSpeed(Number(event.target.value))} className="w-full accent-violet-600"/></label>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3"><div className="border bg-blue-50 p-3"><span>観測者側の波長</span><p className="text-lg font-bold">{observerSideSpacing.toFixed(2)} m</p></div><div className="border bg-slate-50 p-3"><span>反対側の波長</span><p className="text-lg font-bold">{oppositeSideSpacing.toFixed(2)} m</p></div><div className="border bg-violet-50 p-3"><span>観測振動数 f′</span><p className="text-lg font-bold">{observed.toFixed(2)} Hz</p></div></div>
      <p className="rounded border bg-amber-50 p-3 text-center font-bold">f′ = f × (v {observerMotion === 'still' ? '' : observerApproaching ? '+ vₒ' : '− vₒ'}) / (v {sourceMotion === 'still' ? '' : sourceApproaching ? '− vₛ' : '+ vₛ'})</p>
    </section>
    <section className="retro-box space-y-2 bg-slate-50 p-4"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc space-y-1 pl-5"><li>近づく音源は前方の波長を縮め、音源だけが動く場合は分母 v−vₛ を使います。</li><li>観測者が音源へ近づくと、単位時間に受け取る波面が増え、分子 v+vₒ を使います。</li><li>遠ざかる動きでは対応する符号が反転します。音速 v は媒質に対する値で、音源と観測者の速さは媒質に対する値です。</li></ul></section>
  </main>;
}
