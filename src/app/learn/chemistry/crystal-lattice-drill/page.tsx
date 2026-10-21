"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  crystalLatticeLabels,
  crystalLatticePatterns,
  formatCrystalLatticeAnswer,
  generateCrystalLatticeProblem,
  isCrystalLatticeAnswerCorrect,
  type CrystalLatticeMode,
  type CrystalLatticeProblem,
} from '@/src/lib/crystalLatticeDrill';

export default function CrystalLatticeDrillPage() {
  const [mode, setMode] = useState<CrystalLatticeMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<CrystalLatticeProblem>(() => generateCrystalLatticeProblem('mix'));
  const [method, setMethod] = useState<CrystalLatticeMode | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: CrystalLatticeMode = mode) => {
    setProblem(generateCrystalLatticeProblem(selectedMode));
    setMethod(selectedMode === 'mix' ? '' : selectedMode);
    setAnswer('');
    setChecked(false);
  };

  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = method === problem.pattern && isCrystalLatticeAnswerCorrect(answer, problem.answer, problem.decimals);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
        <Link href="/learn/chemistry/crystal-lattice" className="text-blue-600 hover:underline">結晶格子ビジュアルへ →</Link>
      </div>
      <header>
        <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">化学 結晶格子・計算ドリル</h1>
        <p className="text-gray-600 mt-2">BCC・FCCの構造を見分け、原子数・配位数から格子定数・原子半径・密度まで練習します。答えは表示桁に合わせて入力してください。</p>
      </header>

      <section className="retro-box space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="lattice-mode" className="font-bold">演習モード</label>
          <select id="lattice-mode" value={mode} onChange={event => {
            const selectedMode = event.target.value as CrystalLatticeMode;
            setMode(selectedMode);
            next(selectedMode);
          }} className="border p-2 bg-white">
            <option value="mix">実戦練習：結晶格子 全パターンランダム</option>
            {crystalLatticePatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{crystalLatticeLabels[pattern]}だけ</option>)}
          </select>
        </div>

        <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">{problem.question}</div>

        {mode === 'mix' ? (
          <fieldset className="space-y-2">
            <legend className="w-full text-center font-bold">実戦練習：構造と問いに合う考え方を選んでください。</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {crystalLatticePatterns.map(pattern => (
                <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
                  <input type="radio" name="lattice-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600" />
                  {crystalLatticeLabels[pattern]}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{crystalLatticeLabels[mode]}に固定して繰り返します。</p>
        )}

        <div className="text-center">
          <label htmlFor="lattice-answer" className="sr-only">計算結果</label>
          <input id="lattice-answer" aria-label="計算結果" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder={`数値（小数第${problem.decimals}位まで）`} className="retro-input w-56 text-center" />
          <span className="ml-2 font-bold">{problem.unit}</span>
        </div>

        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
          <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
        </div>

        {checked && (
          <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
            {correct ? '正解！' : `考え方は「${crystalLatticeLabels[problem.pattern]}」、正解は ${formatCrystalLatticeAnswer(problem.answer, problem.decimals)} ${problem.unit} です。`}
            <p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
          </div>
        )}
      </section>
    </main>
  );
}
