'use client';

import Link from 'next/link';
import { useState } from 'react';
import { calculateMolarConcentration } from '@/src/lib/concentrationVisual';

export default function ConcentrationVisual() {
  const [volume, setVolume] = useState(0.5);
  const moles = 0.2;
  const concentration = calculateMolarConcentration(moles, volume);
  const fill = Math.min(180, volume * 140);
  const particles = [[22, 0.18], [45, 0.32], [68, 0.22], [32, 0.48], [58, 0.56], [20, 0.68], [72, 0.74], [45, 0.84]] as const;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/learn" className="text-blue-600 hover:underline">← 学習室ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">モル濃度・希釈ビジュアル装置</h1><p className="text-gray-500">溶質の物質量を一定にして体積を変え、モル濃度 c=n/V がどう変化するかを観察します。</p><section className="retro-box bg-white p-5 space-y-4"><div className="flex justify-center items-end h-52"><div className="relative w-32 h-48 border-4 border-slate-500 border-t-0 rounded-b-2xl overflow-hidden bg-slate-50" role="img" aria-label={`溶液の体積${volume.toFixed(2)}リットル。溶質粒子8個の物質量は一定`}><div className="absolute bottom-0 w-full bg-blue-200" style={{ height: `${fill}px` }} />{particles.map(([left, height], index) => <span key={index} aria-hidden="true" className="absolute h-2 w-2 rounded-full bg-amber-600" style={{ left: `${left}%`, bottom: `${fill * height}px` }} />)}</div></div><div className="text-center text-slate-600">青い液体：溶媒　●：溶質（粒子数一定）</div><label className="block text-center font-bold">体積 V = {volume.toFixed(2)} L<input aria-label="溶液の体積" type="range" min="0.2" max="1.2" step="0.01" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full mt-2" /></label><div className="grid sm:grid-cols-3 gap-2 text-center"><div className="border p-3 bg-amber-50"><div className="text-gray-500">物質量 n（一定）</div><strong>{moles.toFixed(2)} mol</strong></div><div className="border p-3 bg-blue-50"><div className="text-gray-500">体積 V</div><strong>{volume.toFixed(2)} L</strong></div><div className="border p-3 bg-emerald-50"><div className="text-gray-500">モル濃度 c=n/V</div><strong>{concentration.toFixed(3)} mol/L</strong></div></div><p className="text-center text-slate-600">水を加えて体積を増やすと、溶質粒子の数（物質量）は変わらないまま、粒子が広い体積に分散してモル濃度だけが下がります。</p></section></main>;
}
