'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MotionVisual() {
  const [t, setT] = useState(0);
  const v0 = 2; const a = 3; const x = v0 * t + 0.5 * a * t * t; const v = v0 + a * t;
  const px = 35 + (x / 32) * 330;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/learn" className="text-blue-600 hover:underline">← 学習室ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">等加速度運動ビジュアル装置</h1><p className="text-gray-500">初速度 v₀=2 m/s、加速度 a=3 m/s² の物体を動かし、位置・速度・加速度の関係を観察します。</p><section className="retro-box bg-white p-5 space-y-4"><svg viewBox="0 0 400 130" className="w-full max-w-xl mx-auto border bg-slate-50" role="img" aria-label={`時刻${t.toFixed(2)}秒、位置${x.toFixed(2)}メートルの物体。位置目盛り0から32メートル`}><line x1="25" y1="75" x2="375" y2="75" stroke="#64748b" strokeWidth="2"/>{Array.from({length: 9}, (_, i) => { const tickX = 35 + i * 41.25; return <g key={i}><line x1={tickX} y1="70" x2={tickX} y2="80" stroke="#94a3b8"/><text x={tickX} y="96" textAnchor="middle" fill="#64748b" fontSize="9">{i * 4}</text></g>; })}<circle cx={px} cy="75" r="10" fill="#2563eb"/><text x="25" y="25" fill="#334155">x(t)=v₀t+½at²</text><text x={Math.min(px-10, 350)} y="50" fill="#1d4ed8">物体</text></svg><label className="block text-center font-bold">t = {t.toFixed(2)} s<input aria-label="時刻" type="range" min="0" max="4" step="0.01" value={t} onChange={e => setT(Number(e.target.value))} className="w-full mt-2" /></label><div className="grid sm:grid-cols-3 gap-2 text-center"><div className="border p-3 bg-blue-50"><div className="text-gray-500">位置 x(t)</div><strong>{x.toFixed(2)} m</strong></div><div className="border p-3 bg-emerald-50"><div className="text-gray-500">速度 v(t)</div><strong>{v.toFixed(2)} m/s</strong></div><div className="border p-3 bg-amber-50"><div className="text-gray-500">加速度 a</div><strong>{a.toFixed(2)} m/s²</strong></div></div><p className="text-center text-slate-600">速度は位置の時間微分、加速度は速度の時間微分です。目盛りは位置 x をメートルで表しています。</p></section></main>;
}
