"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  formatRlcCalculationAnswer,
  generateRlcCalculationProblem,
  isRlcCalculationAnswerCorrect,
  rlcCalculationLabels,
  rlcCalculationPatterns,
  type RlcCalculationMode,
  type RlcCalculationProblem,
} from '@/src/lib/rlcCalculationDrill';

export default function AcCircuitDrillPage() {
  const [mode, setMode] = useState<RlcCalculationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<RlcCalculationProblem>(() => generateRlcCalculationProblem('mix'));
  const [method, setMethod] = useState<RlcCalculationMode | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const next = (selectedMode: RlcCalculationMode = mode) => {
    setProblem(generateRlcCalculationProblem(selectedMode));
    setMethod(selectedMode === 'mix' ? '' : selectedMode);
    setAnswer('');
    setChecked(false);
  };

  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = method === problem.pattern && isRlcCalculationAnswerCorrect(answer, problem.answer);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
        <Link href="/learn/physics/ac-circuit" className="text-blue-600 hover:underline">交流回路ビジュアルへ →</Link>
      </div>
      <header>
        <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">物理 交流回路・計算ドリル</h1>
        <p className="text-gray-600 mt-2">リアクタンスから共振まで、式の形に合う計算を個別練習し、実戦では方法を選んで答えます。答えは小数第2位まで。</p>
      </header>

      <section className="retro-box space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="rlc-mode" className="font-bold">演習モード</label>
          <select id="rlc-mode" value={mode} onChange={event => {
            const selectedMode = event.target.value as RlcCalculationMode;
            setMode(selectedMode);
            next(selectedMode);
          }} className="border p-2 bg-white">
            <option value="mix">実戦練習：交流回路 全パターンランダム</option>
            {rlcCalculationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{rlcCalculationLabels[pattern]}だけ</option>)}
          </select>
        </div>

        <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">{problem.question}</div>

        {mode === 'mix' ? (
          <fieldset className="space-y-2">
            <legend className="w-full text-center font-bold">実戦練習：問題に合う計算方法を選んでください。</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {rlcCalculationPatterns.map(pattern => (
                <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
                  <input type="radio" name="rlc-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600" />
                  {rlcCalculationLabels[pattern]}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{rlcCalculationLabels[mode]}に固定して繰り返します。</p>
        )}

        <div className="text-center">
          <label htmlFor="rlc-answer" className="sr-only">計算結果</label>
          <input id="rlc-answer" aria-label="計算結果" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値（小数第2位まで）" className="retro-input w-56 text-center" />
          <span className="ml-2 font-bold">{problem.unit}</span>
        </div>

        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
          <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
        </div>

        {checked && (
          <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
            {correct ? '正解！' : `計算方法は「${rlcCalculationLabels[problem.pattern]}」、正解は ${formatRlcCalculationAnswer(problem.answer)} ${problem.unit} です。`}
            <p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
          </div>
        )}
      </section>
    </main>
  );
}
