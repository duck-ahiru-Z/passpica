'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  generateNumberRepresentationProblem,
  isNumberRepresentationAnswerCorrect,
  numberRepresentationLabels,
  numberRepresentationPatterns,
  type NumberRepresentationPattern,
  type NumberRepresentationMode,
  type NumberRepresentationProblem,
} from '@/src/lib/informationNumberRepresentationDrill';

export default function NumberRepresentationDrillPage() {
  const [mode, setMode] = useState<NumberRepresentationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<NumberRepresentationProblem>(() => generateNumberRepresentationProblem('mix'));
  const [strategy, setStrategy] = useState<NumberRepresentationPattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: NumberRepresentationMode = mode) => {
    setProblem(generateNumberRepresentationProblem(selectedMode));
    setStrategy(selectedMode === 'mix' ? '' : selectedMode);
    setAnswer('');
    setChecked(false);
  };

  if (!problem) return <main className="mx-auto max-w-3xl px-4 py-8">問題を準備しています…</main>;
  const answerCorrect = isNumberRepresentationAnswerCorrect(problem, answer);
  const strategyCorrect = mode !== 'mix' || strategy === problem.pattern;
  const correct = strategyCorrect && answerCorrect;

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm text-slate-800">
      <div className="flex flex-wrap gap-4">
        <Link href="/drill" className="text-blue-700 underline">← 無限演習ポータルへ戻る</Link>
        <Link href="/learn/information/number-representation-visual" className="text-blue-700 underline">数値表現ビジュアルへ →</Link>
      </div>
      <header>
        <h1 className="border-b pb-2 text-2xl font-bold">情報I 2進数・2の補数ドリル</h1>
        <p className="mt-2 text-slate-600">符号の読み方やビットの重みを個別に練習し、実戦では表現方法を自分で見分けます。</p>
      </header>
      <section className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
        <label className="flex flex-wrap items-center gap-3 font-bold" htmlFor="number-representation-mode">
          演習モード
          <select id="number-representation-mode" aria-label="演習モード" value={mode} className="border bg-white p-2" onChange={event => {
            const selected = event.target.value as NumberRepresentationMode;
            setMode(selected);
            next(selected);
          }}>
            <option value="mix">実戦練習：数値表現 全パターンランダム</option>
            {numberRepresentationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{numberRepresentationLabels[pattern]}だけ</option>)}
          </select>
        </label>
        <div className="border bg-slate-50 p-6 text-center text-lg font-bold" aria-live="polite">{problem.question}</div>
        {mode === 'mix' && <fieldset className="space-y-2">
          <legend className="w-full text-center font-semibold">実戦練習：問題の表現方法を選んでから答えてください。</legend>
          <div className="grid sm:grid-cols-2 gap-2">{numberRepresentationPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${strategy === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
            <input type="radio" name="number-representation-strategy" value={pattern} checked={strategy === pattern} onChange={() => { setStrategy(pattern); setChecked(false); }} className="accent-blue-600" />
            {numberRepresentationLabels[pattern]}
          </label>)}</div>
        </fieldset>}
        {mode !== 'mix' && <p role="status" className="text-center font-semibold text-blue-800">基礎練習：{numberRepresentationLabels[mode]}に固定して繰り返します。</p>}
        <div className="text-center">
          <label htmlFor="number-representation-answer" className="sr-only">答え</label>
          <input id="number-representation-answer" aria-label="答え" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値または8 bitの2進数" className="w-full max-w-sm border p-3 text-center font-mono" />
        </div>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setChecked(true)} disabled={!answer.trim() || (mode === 'mix' && !strategy)} className="rounded border bg-blue-100 px-4 py-2 font-bold disabled:opacity-50">解答する</button>
          <button type="button" onClick={() => next()} className="rounded border px-4 py-2">次の問題へ ➔</button>
        </div>
        {checked && <div role="status" aria-live="polite" className={`border p-4 text-center ${correct ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-amber-400 bg-amber-50 text-amber-900'}`}>
          <strong>{correct ? '正解！' : <>{mode === 'mix' && !strategyCorrect && <>方式は「{numberRepresentationLabels[problem.pattern]}」です。 </>}{!answerCorrect && <>正解は {problem.answer} です。</>}</>}</strong>
          <p className="mt-2 text-slate-700">{problem.explanation}</p>
        </div>}
      </section>
    </main>
  );
}
