'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { formatWaveAnswer, generateWaveCalculationProblem, isWaveAnswerCorrect, waveCalculationLabels, waveCalculationPatterns, type WaveCalculationMode, type WaveCalculationProblem } from '@/src/lib/physicsWaveCalculation';

export default function WaveCalculationDrillPage() {
  const [mode, setMode] = useState<WaveCalculationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<WaveCalculationProblem>(() => generateWaveCalculationProblem('mix'));
  const [method, setMethod] = useState<WaveCalculationMode | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (nextMode: WaveCalculationMode = mode) => {
    setProblem(generateWaveCalculationProblem(nextMode));
    setMethod(nextMode === 'mix' ? '' : nextMode);
    setAnswer('');
    setChecked(false);
  };

  if (!problem) return <main className="mx-auto max-w-3xl px-4 py-8">問題を準備しています…</main>;
  const correct = method === problem.pattern && isWaveAnswerCorrect(answer, problem.answer);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm text-slate-800">
      <div className="flex flex-wrap gap-4"><Link href="/drill" className="text-blue-700 hover:underline">← 無限演習ポータル</Link><Link href="/learn/physics/wave-superposition-visual" className="text-blue-700 hover:underline">波の重ね合わせビジュアル →</Link></div>
      <header><h1 className="border-b border-slate-300 pb-2 text-xl font-bold md:text-2xl">物理 波動・計算ドリル</h1><p className="mt-2 text-slate-600">波の速さ・周期・振動数・位相差・合成振幅を、公式選びから練習します。答えは小数第3位まで。</p></header>
      <section className="retro-box space-y-5">
        <div className="flex flex-wrap items-center gap-2"><label htmlFor="wave-mode" className="font-bold">演習モード</label><select id="wave-mode" value={mode} onChange={event => { const value = event.target.value as WaveCalculationMode; setMode(value); next(value); }} className="border bg-white p-2"><option value="mix">実戦練習：波動 全パターンランダム</option>{waveCalculationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{waveCalculationLabels[pattern]}だけ</option>)}</select></div>
        <div className="border border-slate-300 bg-white p-6 text-center text-base font-bold md:text-lg">{problem.question}</div>
        {mode === 'mix' ? <fieldset className="space-y-2"><legend className="w-full text-center font-bold">問題に合う計算方法を選んでください。</legend><div className="grid gap-2 sm:grid-cols-2">{waveCalculationPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex cursor-pointer items-center gap-2 ${method === pattern ? 'border-blue-400 bg-blue-100 font-bold' : ''}`}><input type="radio" name="wave-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600" />{waveCalculationLabels[pattern]}</label>)}</div></fieldset> : <p role="status" className="text-center font-bold text-blue-800">基礎練習：{waveCalculationLabels[mode]}に固定して繰り返します。</p>}
        <div className="text-center"><label htmlFor="wave-answer" className="sr-only">計算結果</label><input id="wave-answer" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値（小数第3位まで）" className="retro-input w-60 text-center" /><span className="ml-2 font-bold">{problem.unit}</span></div>
        <div className="flex justify-center gap-3"><button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic border-blue-400 bg-blue-100 font-bold disabled:cursor-not-allowed disabled:opacity-50">解答する</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
        {checked && <div role="status" aria-live="polite" className={`border p-3 text-center font-bold ${correct ? 'border-emerald-400 bg-emerald-100 text-emerald-800' : 'border-red-400 bg-red-100 text-red-800'}`}>{correct ? '正解！' : `計算方法は「${waveCalculationLabels[problem.pattern]}」、正解は ${formatWaveAnswer(problem.answer)} ${problem.unit} です。`}<p className="mt-2 font-normal text-slate-700">{problem.explanation}</p></div>}
      </section>
    </main>
  );
}
