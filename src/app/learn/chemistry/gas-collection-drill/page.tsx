"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  gasCollectionLabels, gasCollectionPatterns, generateGasCollectionProblem, getGasCollectionAcceptedAnswerLabel, isGasCollectionAnswerCorrect,
  type GasCollectionMode, type GasCollectionPattern, type GasCollectionProblem, type GasCollectionMethod,
} from '@/src/lib/gasCollectionDrill';

const methods: readonly { pattern: GasCollectionMode; method: GasCollectionMethod }[] = [
  { pattern: 'waterDisplacement', method: '水上置換法' },
  { pattern: 'upwardDisplacement', method: '上方置換法' },
  { pattern: 'downwardDisplacement', method: '下方置換法' },
];

export default function GasCollectionDrillPage() {
  const [mode, setMode] = useState<GasCollectionMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<GasCollectionProblem>(() => generateGasCollectionProblem('mix'));
  const [method, setMethod] = useState<GasCollectionPattern | ''>('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: GasCollectionMode = mode) => {
    setProblem(generateGasCollectionProblem(selectedMode));
    setMethod(selectedMode === 'mix' ? '' : selectedMode);
    setChecked(false);
  };

  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = isGasCollectionAnswerCorrect(problem, method);
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
        <Link href="/learn/chemistry/gas-collection" className="text-blue-600 hover:underline">気体の捕集ビジュアルへ →</Link>
      </div>
      <header>
        <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">化学 気体の捕集法・判断ドリル</h1>
        <p className="text-gray-600 mt-2">水への溶けやすさを先に確認し、空気との密度差も使って捕集法を判断します。</p>
      </header>
      <section className="retro-box space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="gas-collection-mode" className="font-bold">演習モード</label>
          <select id="gas-collection-mode" value={mode} onChange={event => {
            const selectedMode = event.target.value as GasCollectionMode;
            setMode(selectedMode);
            next(selectedMode);
          }} className="border p-2 bg-white">
            <option value="mix">実戦練習：気体の捕集法 全パターンランダム</option>
            {gasCollectionPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{gasCollectionLabels[pattern]}だけ</option>)}
          </select>
        </div>
        <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">{problem.question}</div>
        {mode === 'mix' ? (
          <fieldset className="space-y-2">
            <legend className="w-full text-center font-bold">実戦練習：性質から捕集法を選んでください。</legend>
            <div className="grid sm:grid-cols-3 gap-2">
              {methods.map(option => <label key={option.pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === option.pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
                <input type="radio" name="gas-collection-method" value={option.pattern} checked={method === option.pattern} onChange={() => { setMethod(option.pattern as GasCollectionPattern); setChecked(false); }} className="accent-blue-600" />
                {option.method}
              </label>)}
            </div>
          </fieldset>
        ) : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{gasCollectionLabels[mode]}に固定して反復します。</p>}
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setChecked(true)} disabled={!method} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
          <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
        </div>
        {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
          {correct ? '正解！' : `正解は「${getGasCollectionAcceptedAnswerLabel(problem)}」です。`}
          <p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
          <Link href="/learn/chemistry/gas-collection" className="inline-block mt-2 text-blue-700 underline">装置図で捕集法を確認する</Link>
        </div>}
      </section>
    </main>
  );
}
