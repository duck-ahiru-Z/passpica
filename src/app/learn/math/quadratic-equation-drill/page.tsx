'use client';

import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  createQuadraticEquationScheduler,
  generateQuadraticEquationProblem,
  isQuadraticEquationAnswerCorrect,
  quadraticEquationLabels,
  quadraticEquationPatterns,
  type QuadraticEquationMode,
  type QuadraticEquationPattern,
  type QuadraticEquationProblem,
} from '@/src/lib/quadraticEquationProblems';

const mixedQuestions = createQuadraticEquationScheduler();
const generate = (pattern: QuadraticEquationMode): QuadraticEquationProblem =>
  generateQuadraticEquationProblem(pattern === 'mix' ? mixedQuestions.next() : pattern);

function MathEq({ math }: { math: string }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;
}

export default function QuadraticEquationDrillPage() {
  const [mode, setMode] = useState<QuadraticEquationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generate('mix'));
  const [chosenMethod, setChosenMethod] = useState<QuadraticEquationPattern | ''>('');
  const [firstRoot, setFirstRoot] = useState('');
  const [secondRoot, setSecondRoot] = useState('');
  const [checked, setChecked] = useState(false);

  const next = (nextMode: QuadraticEquationMode = mode) => {
    setProblem(generate(nextMode));
    setChosenMethod('');
    setFirstRoot('');
    setSecondRoot('');
    setChecked(false);
  };

  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  const methodCorrect = mode !== 'mix' || chosenMethod === problem.pattern;
  const rootsCorrect = isQuadraticEquationAnswerCorrect(problem, firstRoot, secondRoot);
  const correct = methodCorrect && rootsCorrect;
  const rootsText = `x≈${problem.roots[0].toFixed(3)}, ${problem.roots[1].toFixed(3)}`;

  return <main className="max-w-3xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-700 hover:underline">← 無限演習ポータルへ戻る</Link>
    <header className="border-b border-slate-300 pb-3">
      <div className="text-slate-500">数学I / 2次関数 / 2次方程式</div>
      <h1 className="text-xl md:text-2xl font-bold">二次方程式・解法選択ドリル</h1>
      <p className="mt-2 text-slate-600">苦手な解き方を固定して練習し、慣れたら式の形から解法を選ぶ全パターンランダムに挑戦します。解は小数第3位まで入力できます。</p>
    </header>

    <section className="retro-box bg-slate-50 p-4 space-y-2">
      <label htmlFor="quadratic-equation-mode" className="font-bold block">演習モード</label>
      <select id="quadratic-equation-mode" value={mode} onChange={event => {
        const selected = event.target.value as QuadraticEquationMode;
        setMode(selected);
        next(selected);
      }} className="border p-2 bg-white w-full">
        <option value="mix">実戦練習：二次方程式 全パターンランダム</option>
        {quadraticEquationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{quadraticEquationLabels[pattern]}だけ</option>)}
      </select>
    </section>

    <section className="retro-box bg-white p-5 space-y-4">
      <div className="border bg-slate-50 p-6 text-center text-xl font-bold" aria-label={`二次方程式 ${problem.expression}`}><MathEq math={problem.expression} /></div>
      {mode === 'mix' ? <fieldset className="grid sm:grid-cols-2 gap-2">
        <legend className="font-bold mb-2">最初に使う解法を選んでください</legend>
        {quadraticEquationPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${chosenMethod === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
          <input type="radio" name="quadratic-equation-method" value={pattern} checked={chosenMethod === pattern} onChange={() => { setChosenMethod(pattern); setChecked(false); }} className="accent-blue-600" />
          {quadraticEquationLabels[pattern]}
        </label>)}
      </fieldset> : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{quadraticEquationLabels[mode]}の型です。2つの解を求めましょう。</p>}

      <fieldset className="space-y-2">
        <legend className="font-bold">2つの解を小数第3位まで入力（順不同）</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">1つ目の解
            <input aria-label="1つ目の解" type="number" step="0.001" value={firstRoot} onChange={event => { setFirstRoot(event.target.value); setChecked(false); }} className="retro-input block w-full mt-1" />
          </label>
          <label className="block">2つ目の解
            <input aria-label="2つ目の解" type="number" step="0.001" value={secondRoot} onChange={event => { setSecondRoot(event.target.value); setChecked(false); }} className="retro-input block w-full mt-1" />
          </label>
        </div>
      </fieldset>

      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setChecked(true)} disabled={!firstRoot.trim() || !secondRoot.trim() || (mode === 'mix' && !chosenMethod)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50">答え合わせ</button>
        <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
      </div>

      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
        {correct ? '正解！' : mode === 'mix' && !methodCorrect ? `最初の解法は「${quadraticEquationLabels[problem.pattern]}」です。` : `解は ${rootsText} です。`}
        <p className="font-normal mt-2">{problem.explanation}</p>
      </div>}
    </section>
  </main>;
}
