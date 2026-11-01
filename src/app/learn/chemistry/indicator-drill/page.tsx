"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  generateIndicatorProblem,
  indicatorDrillLabels,
  indicatorDrillPatterns,
  isIndicatorColorAnswerCorrect,
  type IndicatorDrillMode,
} from '@/src/lib/chemistryIndicatorDrill';
import type { IndicatorKey } from '@/src/lib/chemistryIndicator';

const answerChoices: Record<IndicatorKey, readonly string[]> = {
  pp: ['無色', '赤紫色'],
  litmus: ['赤色', '赤紫色', '紫色', '青紫色', '青色'],
  mo: ['赤色', '赤橙色', '橙色', '黄橙色', '黄色'],
};

export default function IndicatorDrillPage() {
  const [mode, setMode] = useState<IndicatorDrillMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateIndicatorProblem('mix'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;

  const next = (selectedMode: IndicatorDrillMode = mode) => {
    setProblem(generateIndicatorProblem(selectedMode));
    setAnswer('');
    setChecked(false);
  };
  const correct = isIndicatorColorAnswerCorrect(answer, problem.answer);

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-sm">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">化学 中和指示薬・色判定ドリル</h1>
    <p className="text-gray-600 mb-4">pHと指示薬から色を判定します。指示薬ごとの基礎練習と、全指示薬を混ぜる実戦練習を切り替えられます。</p>
    <Link href="/learn/chemistry/acid-base" className="retro-btn-classic inline-flex mb-4">pHを動かして色変化をビジュアルで確認 →</Link>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="indicator-mode" className="font-bold">演習モード</label>
        <select
          id="indicator-mode"
          aria-label="中和指示薬の演習パターン"
          value={mode}
          onChange={event => {
            const selected = event.target.value as IndicatorDrillMode;
            setMode(selected);
            next(selected);
          }}
          className="border p-2 bg-white"
        >
          <option value="mix">実戦練習：指示薬 全パターンランダム</option>
          {indicatorDrillPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{indicatorDrillLabels[pattern]}だけ</option>)}
        </select>
      </div>
      <div className="bg-white border p-6 md:p-8 text-center text-base md:text-lg font-bold leading-relaxed">{problem.question}</div>
      {mode === 'mix'
        ? <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">実戦練習：指示薬の種類とpHの両方から色を判断します。</p>
        : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{indicatorDrillLabels[mode]}に固定して反復します。</p>}
      <fieldset className="space-y-2">
        <legend className="font-bold">示す色を選んでください</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {answerChoices[problem.pattern].map(color => (
            <label key={color} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${answer === color ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
              <input type="radio" name="indicator-color" value={color} checked={answer === color} onChange={() => { setAnswer(color); setChecked(false); }} className="accent-blue-600" />
              {color}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => setChecked(true)} disabled={!answer} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
        <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
      </div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
        {correct ? '正解！' : `不正解。${indicatorDrillLabels[problem.pattern]}の答えは「${problem.answer}」です。`}
        <div className="mt-2 font-normal text-slate-700">{problem.explanation}</div>
      </div>}
    </section>
  </main>;
}
