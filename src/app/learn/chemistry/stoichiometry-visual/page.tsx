'use client';

import Link from 'next/link';
import { useState } from 'react';

const reactions = [
  { id: 'water', label: '水の生成', a: 'H₂', b: 'O₂', product: 'H₂O', coefficientA: 2, coefficientB: 1, coefficientProduct: 2, initialA: 4, initialB: 3, equation: '2 H₂ + O₂ → 2 H₂O' },
  { id: 'ammonia', label: 'アンモニアの合成', a: 'N₂', b: 'H₂', product: 'NH₃', coefficientA: 1, coefficientB: 3, coefficientProduct: 2, initialA: 2, initialB: 4.5, equation: 'N₂ + 3 H₂ → 2 NH₃' },
  { id: 'aluminum-chloride', label: '塩化アルミニウムの生成', a: 'Al', b: 'Cl₂', product: 'AlCl₃', coefficientA: 2, coefficientB: 3, coefficientProduct: 2, initialA: 4, initialB: 3, equation: '2 Al + 3 Cl₂ → 2 AlCl₃' },
] as const;

const formatAmount = (value: number) => Number(value.toFixed(2)).toString();

export default function StoichiometryVisualPage() {
  const [reactionId, setReactionId] = useState<(typeof reactions)[number]['id']>('water');
  const [amountA, setAmountA] = useState(4);
  const [amountB, setAmountB] = useState(3);
  const reaction = reactions.find(item => item.id === reactionId) ?? reactions[0];
  const unitsA = amountA / reaction.coefficientA;
  const unitsB = amountB / reaction.coefficientB;
  const progress = Math.min(unitsA, unitsB);
  const consumedA = reaction.coefficientA * progress;
  const consumedB = reaction.coefficientB * progress;
  const leftoverA = Math.max(0, amountA - consumedA);
  const leftoverB = Math.max(0, amountB - consumedB);
  const productAmount = reaction.coefficientProduct * progress;
  const exactRatio = Math.abs(unitsA - unitsB) < 1e-9 && progress > 0;
  const noReactants = amountA === 0 && amountB === 0;
  const limiting = noReactants
    ? '反応物がありません'
    : exactRatio
      ? '係数比どおりで、両方を使い切ります'
      : unitsA <= unitsB ? `${reaction.a} が制限試薬` : `${reaction.b} が制限試薬`;
  const barDescription = `${reaction.a} は ${formatAmount(amountA)} mol 中 ${formatAmount(consumedA)} mol が反応し、${formatAmount(leftoverA)} mol 残ります。${reaction.b} は ${formatAmount(amountB)} mol 中 ${formatAmount(consumedB)} mol が反応し、${formatAmount(leftoverB)} mol 残ります。${reaction.product} は最大 ${formatAmount(productAmount)} mol 生成します。`;

  const changeReaction = (id: string) => {
    const next = reactions.find(item => item.id === id);
    if (!next) return;
    setReactionId(next.id);
    setAmountA(next.initialA);
    setAmountB(next.initialB);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link href="/learn" className="text-sm font-semibold text-blue-700 underline">← 学習室ポータルへ戻る</Link>
        <header className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">化学・反応量と制限試薬</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">反応物の量から制限試薬を見つける</h1>
          <p className="mt-3 leading-7 text-slate-600">係数で割った反応の進行可能量を比べ、先に使い切る物質と、できる生成物・残る物質を図で確かめます。</p>
        </header>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-label="反応量シミュレーター">
          <label className="block font-bold">反応を選ぶ
            <select aria-label="反応式" value={reactionId} onChange={event => changeReaction(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3">
              {reactions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>

          <div className="rounded-xl bg-slate-50 px-3 py-5 text-center sm:px-6">
            <p className="text-sm font-semibold text-slate-500">つり合った反応式</p>
            <p className="mt-2 text-2xl font-black tracking-wide text-slate-800 sm:text-3xl" aria-live="polite">{reaction.equation}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-xl border border-blue-200 bg-blue-50 p-4 font-bold">{reaction.a} の物質量：{formatAmount(amountA)} mol
              <input aria-label={`${reaction.a} の物質量`} type="range" min="0" max="10" step="0.1" value={amountA} onChange={event => setAmountA(Number(event.target.value))} className="mt-3 block w-full accent-blue-600" />
              <span className="mt-1 flex justify-between text-xs font-normal text-slate-500"><span>0 mol</span><span>10 mol</span></span>
            </label>
            <label className="rounded-xl border border-violet-200 bg-violet-50 p-4 font-bold">{reaction.b} の物質量：{formatAmount(amountB)} mol
              <input aria-label={`${reaction.b} の物質量`} type="range" min="0" max="10" step="0.1" value={amountB} onChange={event => setAmountB(Number(event.target.value))} className="mt-3 block w-full accent-violet-600" />
              <span className="mt-1 flex justify-between text-xs font-normal text-slate-500"><span>0 mol</span><span>10 mol</span></span>
            </label>
          </div>

          <section className="space-y-4 rounded-xl border border-slate-200 p-4" aria-labelledby="amount-chart-title">
            <h2 id="amount-chart-title" className="font-black">反応に使われる量と残る量</h2>
            <div role="img" aria-label={barDescription} className="space-y-4">
              {[{ formula: reaction.a, amount: amountA, consumed: consumedA, color: 'bg-blue-600' }, { formula: reaction.b, amount: amountB, consumed: consumedB, color: 'bg-violet-600' }].map(item => (
                <div key={item.formula} aria-hidden="true">
                  <div className="mb-1 flex justify-between text-sm"><span>{item.formula}</span><span>{formatAmount(item.amount)} mol</span></div>
                  <div className="flex h-5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`${item.color} h-full`} style={{ width: `${item.consumed / 10 * 100}%` }} />
                    <div className="h-full bg-amber-400" style={{ width: `${Math.max(0, item.amount - item.consumed) / 10 * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">反応に使う量 {formatAmount(item.consumed)} mol ・ 残量 {formatAmount(Math.max(0, item.amount - item.consumed))} mol</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600"><span><span className="mr-1 inline-block h-3 w-3 rounded-sm bg-blue-600 align-middle" />反応に使う量</span><span><span className="mr-1 inline-block h-3 w-3 rounded-sm bg-amber-400 align-middle" />反応後に残る量</span></div>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="text-sm text-slate-600">制限試薬</p><p className="mt-1 text-lg font-black text-rose-800" aria-live="polite">{limiting}</p><p className="mt-1 text-xs text-slate-600">{reaction.a}: {formatAmount(unitsA)} mol ÷ 係数{reaction.coefficientA} ／ {reaction.b}: {formatAmount(unitsB)} mol ÷ 係数{reaction.coefficientB}</p></div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm text-slate-600">生成物の最大量</p><p className="mt-1 text-lg font-black text-emerald-800">{reaction.product} {formatAmount(productAmount)} mol</p><p className="mt-1 text-xs text-slate-600">{reaction.coefficientProduct} × 反応進行度 {formatAmount(progress)} mol</p></div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm text-slate-600">反応後の残量</p><p className="mt-1 font-bold">{reaction.a}: {formatAmount(leftoverA)} mol</p><p className="font-bold">{reaction.b}: {formatAmount(leftoverB)} mol</p></div>
          </div>

          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">各物質量を反応式の係数で割り、小さい方が反応を止める制限試薬です。図の棒は物質量に比例し、生成物は完全に反応したときの理論上の最大量です。実験で得られる量は反応条件や収率によって変わります。</p>
          <Link href="/learn/chemistry/mole-calculation-drill" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 focus-visible:outline-4 focus-visible:outline-emerald-400">制限試薬・過剰試薬の計算問題で練習する →</Link>
        </section>
      </div>
    </main>
  );
}
