'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { formatStandingWaveAnswer, generateStandingWaveProblem, isStandingWaveAnswerCorrect, standingWaveLabels, standingWavePatterns, type StandingWaveMode, type StandingWaveProblem } from '@/src/lib/physicsStandingWaveDrill';

export default function StandingWaveDrillPage() {
  const [mode, setMode] = useState<StandingWaveMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<StandingWaveProblem>(() => generateStandingWaveProblem('mix'));
  const [method, setMethod] = useState<StandingWaveMode | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (nextMode: StandingWaveMode = mode) => {
    setProblem(generateStandingWaveProblem(nextMode));
    setMethod(nextMode === 'mix' ? '' : nextMode);
    setAnswer('');
    setChecked(false);
  };
  if (!problem) return <main className="mx-auto max-w-3xl px-4 py-8">問題を準備しています…</main>;
  const correct = method === problem.pattern && isStandingWaveAnswerCorrect(answer, problem.answer);

  return <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm text-slate-800">
    <div className="flex flex-wrap gap-4"><Link href="/drill" className="text-blue-700 hover:underline">← 無限演習ポータル</Link><Link href="/learn/physics/standing-wave-visual" className="text-blue-700 hover:underline">定常波ビジュアル →</Link></div>
    <header><h1 className="border-b border-slate-300 pb-2 text-xl font-bold md:text-2xl">物理 定常波・固有振動ドリル</h1><p className="mt-2 text-slate-600">弦と気柱の境界条件、倍振動・奇数次振動から、使う関係式を判断します。答えは小数第2位まで。</p></header>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="standing-wave-mode" className="font-bold">演習モード</label><select id="standing-wave-mode" value={mode} onChange={event => { const selected = event.target.value as StandingWaveMode; setMode(selected); next(selected); }} className="border bg-white p-2"><option value="mix">実戦練習：定常波 全パターンランダム</option>{standingWavePatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{standingWaveLabels[pattern]}だけ</option>)}</select></div>
      <div className="border border-slate-300 bg-white p-6 text-center text-base font-bold md:text-lg">{problem.question}</div>
      {mode === 'mix' ? <fieldset className="space-y-2"><legend className="w-full text-center font-bold">条件に合う計算方法を選んでください。</legend><div className="grid gap-2 sm:grid-cols-2">{standingWavePatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex cursor-pointer items-center gap-2 ${method === pattern ? 'border-blue-400 bg-blue-100 font-bold' : ''}`}><input type="radio" name="standing-wave-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600"/>{standingWaveLabels[pattern]}</label>)}</div></fieldset> : <p role="status" className="text-center font-bold text-blue-800">基礎練習：{standingWaveLabels[mode]}に固定して繰り返します。</p>}
      <div className="text-center"><label htmlFor="standing-wave-answer" className="sr-only">計算結果</label><input id="standing-wave-answer" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値（小数第2位まで）" className="retro-input w-60 text-center"/><span className="ml-2 font-bold">{problem.unit}</span></div>
      <div className="flex justify-center gap-3"><button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic border-blue-400 bg-blue-100 font-bold disabled:cursor-not-allowed disabled:opacity-50">解答する</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div role="status" aria-live="polite" className={`border p-3 text-center font-bold ${correct ? 'border-emerald-400 bg-emerald-100 text-emerald-800' : 'border-red-400 bg-red-100 text-red-800'}`}>{correct ? '正解！' : `計算方法は「${standingWaveLabels[problem.pattern]}」、正解は ${formatStandingWaveAnswer(problem.answer)} ${problem.unit} です。`}<p className="mt-2 font-normal text-slate-700">{problem.explanation}</p></div>}
    </section>
  </main>;
}
