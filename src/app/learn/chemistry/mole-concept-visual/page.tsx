'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatParticleCount, getMoleVisualState, moleVisualSubstances, type MoleVisualSubstanceId } from '@/src/lib/moleVisual';

const dotPositions = [
  [14, 18], [38, 13], [63, 20], [83, 15],
  [24, 42], [51, 39], [75, 45], [12, 67],
  [39, 70], [65, 65], [85, 73], [51, 88],
] as const;

export default function MoleConceptVisualPage() {
  const [amountMol, setAmountMol] = useState(1);
  const [substanceId, setSubstanceId] = useState<MoleVisualSubstanceId>('water');
  const substance = moleVisualSubstances.find(item => item.id === substanceId)!;
  const state = getMoleVisualState(amountMol, substanceId);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <Link href="/learn" className="text-blue-600 hover:underline">← 学習室ポータルへ戻る</Link>
      <header className="space-y-2 border-b border-gray-300 pb-3">
        <p className="text-amber-700 font-bold">化学・物質量</p>
        <h1 className="text-xl md:text-2xl font-bold">モルの正体：粒子数・質量・組成・気体体積をつなぐ</h1>
        <p className="text-slate-600">物質量 n を変えると、粒子数・質量・標準状態の気体体積が同じ比率で変わります。元素別の質量割合から、化合物全体の組成も読み取れます。</p>
      </header>

      <section className="retro-box bg-white p-5 md:p-7 space-y-6">
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(18rem,1fr)] gap-6 items-center">
          <div className="space-y-5">
            <label className="block font-bold" htmlFor="mole-visual-substance">物質を選ぶ</label>
            <select id="mole-visual-substance" aria-label="モル質量を比べる物質" value={substanceId} onChange={event => setSubstanceId(event.target.value as MoleVisualSubstanceId)} className="border rounded p-2 w-full bg-white">
              {moleVisualSubstances.map(item => <option key={item.id} value={item.id}>{item.name}（{item.formula}、{item.molarMass} g/mol）</option>)}
            </select>
            <label className="block font-bold" htmlFor="mole-visual-amount">物質量 n = {amountMol.toFixed(2)} mol</label>
            <input id="mole-visual-amount" aria-label="物質量 n（mol）" type="range" min="0.25" max="2" step="0.25" value={amountMol} onChange={event => setAmountMol(Number(event.target.value))} className="w-full accent-amber-600" />
            <div className="flex justify-between text-xs text-slate-500"><span>0.25 mol</span><span>2.00 mol</span></div>
            <p className="rounded border border-amber-200 bg-amber-50 p-3 leading-relaxed">
              1 mol は対象となる粒子を約 6.02×10²³ 個集めた量です。分子なら分子、イオン結晶なら式単位を数え、mol を「粒子のまとまりを数える単位」として使います。
            </p>
          </div>

          <figure className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4 text-center space-y-3" role="img" aria-label={`${amountMol.toFixed(2)} mol の${substance.name}（${substance.entity}）を模式的に表した粒子図。丸は${state.diagramDots}個で、実際の粒子数を縮尺どおりに描いたものではありません。`}>
            <figcaption className="font-bold">粒子のまとまり（模式図）</figcaption>
            <div className="relative mx-auto h-48 w-full max-w-xs rounded-b-3xl border-x-4 border-b-4 border-sky-500 bg-white/80">
              {dotPositions.slice(0, state.diagramDots).map(([left, top], index) => (
                <span key={index} aria-hidden="true" className="absolute h-4 w-4 rounded-full border border-amber-700 bg-amber-400 shadow-sm" style={{ left: `${left}%`, top: `${top}%` }} />
              ))}
            </div>
            <p className="text-xs text-slate-600">丸の数は物質量に合わせた模式表現です。1つの丸が1個の{substance.entity}という意味ではありません。</p>
          </figure>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <article className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-1">
            <h2 className="font-bold text-amber-900">粒子数 N</h2>
            <p className="text-xs text-slate-600">N = n × 6.02×10²³</p>
            <p className="text-lg font-bold tabular-nums">{formatParticleCount(state.particles)} 個</p>
          </article>
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-1">
            <h2 className="font-bold text-emerald-900">質量 m</h2>
            <p className="text-xs text-slate-600">m = n × {substance.molarMass} g/mol</p>
            <p className="text-lg font-bold tabular-nums">{state.massGrams.toFixed(2)} g</p>
          </article>
          <article className="rounded-lg border border-violet-200 bg-violet-50 p-4 space-y-2">
            <h2 className="font-bold text-violet-900">元素別質量割合（{amountMol.toFixed(2)} mol 中）</h2>
            <div className="flex h-4 overflow-hidden rounded border border-violet-200" role="img" aria-label={`${substance.formula} 1 mol の元素別質量割合：${state.elementalComposition.map(element => `${element.symbol} ${element.mass.toFixed(1)} g、${element.massPercent.toFixed(1)}%`).join('、')}`}>
              {state.elementalComposition.map((element, index) => <span key={element.symbol} aria-hidden="true" className={['bg-violet-500', 'bg-fuchsia-400', 'bg-amber-400'][index % 3]} style={{ width: `${element.massPercent}%` }} />)}
            </div>
            <ul className="space-y-1 text-xs text-slate-700">{state.elementalComposition.map(element => <li key={element.symbol} className="flex justify-between gap-2"><span>{element.symbol}：{element.massGrams.toFixed(2)} g</span><b>{element.massPercent.toFixed(1)}%</b></li>)}</ul>
            <p className="text-xs text-slate-600">元素の質量割合 = 元素の質量 ÷ 化合物のモル質量 × 100</p>
          </article>
          <article className="rounded-lg border border-sky-200 bg-sky-50 p-4 space-y-1">
            <h2 className="font-bold text-sky-900">気体と仮定した体積 V</h2>
            <p className="text-xs text-slate-600">V = n × 22.4 L/mol</p>
            <p className="text-lg font-bold tabular-nums">{state.gasVolumeLiters.toFixed(2)} L</p>
          </article>
        </div>

        <p className="text-xs text-slate-600">体積は 0℃・1.013×10⁵ Pa での理想気体のモル体積 22.4 L/mol を用いた参考値です。水や NaCl は、気体と仮定した場合の対応量として表示しています。</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/learn/chemistry/mole-calculation-drill" className="retro-btn-classic inline-flex">質量・組成百分率・気体の計算を練習 →</Link>
          <Link href="/learn/chemistry/concentration-visual" className="retro-btn-classic inline-flex">モル濃度・希釈のビジュアルへ →</Link>
        </div>
      </section>
    </main>
  );
}
