'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { dopplerLabels, dopplerPatterns, generateDopplerProblem, isDopplerAnswerCorrect, type DopplerMode, type DopplerProblem } from '@/src/lib/physicsDoppler';

export default function DopplerDrillPage() {
  const [mode, setMode] = useState<DopplerMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<DopplerProblem>(() => generateDopplerProblem('mix'));
  const [method, setMethod] = useState<DopplerMode | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (nextMode: DopplerMode = mode) => {
    setProblem(generateDopplerProblem(nextMode));
    setMethod(nextMode === 'mix' ? '' : nextMode);
    setAnswer('');
    setChecked(false);
  };
  if (!problem) return <main className="mx-auto max-w-3xl px-4 py-8">問題を準備しています…</main>;
  const correct = method === problem.pattern && isDopplerAnswerCorrect(answer, problem.answer);

  return <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm text-slate-800">
    <div className="flex flex-wrap gap-4"><Link href="/drill" className="text-blue-700 hover:underline">← 無限演習ポータル</Link><Link href="/learn/physics/doppler-visual" className="text-blue-700 hover:underline">ドップラー効果ビジュアル →</Link></div>
    <header><p className="text-[11px] text-slate-500">物理 / 波動</p><h1 className="border-b border-slate-300 pb-2 text-xl font-bold md:text-2xl">物理 ドップラー効果・計算ドリル</h1><p className="mt-2 text-slate-600">音源と観測者のどちらが動くか、近づくか遠ざかるかを整理して式を選びます。答えは小数第2位まで。</p></header>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="doppler-mode" className="font-bold">演習モード</label><select id="doppler-mode" aria-label="ドップラー効果の演習パターン" value={mode} onChange={event => { const selected = event.target.value as DopplerMode; setMode(selected); next(selected); }} className="border bg-white p-2"><option value="mix">実戦練習：ドップラー効果 全パターンランダム</option>{dopplerPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{dopplerLabels[pattern]}</option>)}</select></div>
      <div className="border border-slate-300 bg-white p-6 text-center text-base font-bold leading-relaxed md:text-lg">{problem.question}</div>
      {mode === 'mix' ? <fieldset className="space-y-2"><legend className="w-full text-center font-bold">条件に合う式のパターンを選んでください。</legend><div className="grid gap-2 sm:grid-cols-2">{dopplerPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex cursor-pointer items-center gap-2 ${method === pattern ? 'border-blue-400 bg-blue-100 font-bold' : ''}`}><input type="radio" name="doppler-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600"/>{dopplerLabels[pattern]}</label>)}</div></fieldset> : <p role="status" className="text-center font-bold text-blue-800">基礎練習：{dopplerLabels[mode]}に固定して繰り返します。</p>}
      <div className="text-center"><label htmlFor="doppler-answer" className="sr-only">観測される振動数</label><input id="doppler-answer" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="観測振動数（小数第2位まで）" className="retro-input w-72 max-w-full text-center"/><span className="ml-2 font-bold">Hz</span></div>
      <div className="flex justify-center gap-3"><button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic border-blue-400 bg-blue-100 font-bold disabled:cursor-not-allowed disabled:opacity-50">解答する</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div role="status" aria-live="polite" className={`border p-3 text-center font-bold ${correct ? 'border-emerald-400 bg-emerald-100 text-emerald-800' : 'border-red-400 bg-red-100 text-red-800'}`}>{correct ? '正解！' : `動くものの種類は「${dopplerLabels[problem.pattern]}」、正解は ${problem.answer.toFixed(2)} Hz です。`}<p className="mt-2 font-normal text-slate-700">{problem.explanation}</p></div>}
    </section>
  </main>;
}
