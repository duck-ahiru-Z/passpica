"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import { generateMotionProblem, motionLabels, motionPatterns, type MotionMode, type MotionPattern } from '@/src/lib/physicsMotionCalculation';

type Pattern = MotionPattern;

export default function MotionCalculationDrillPage() {
  const [mode, setMode] = useState<MotionMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateMotionProblem('mix'));
  const [method, setMethod] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generateMotionProblem(selectedMode)); setMethod(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const numericAnswer = Number(answer);
  const correct = answer.trim() !== '' && Number.isFinite(numericAnswer) && method === problem.pattern && Math.abs(numericAnswer - problem.answer) < 1e-9;

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">物理 力学・計算ドリル</h1>
    <p className="text-gray-500 mb-6">問題の条件から使う公式を選び、数値まで計算します。公式別の基礎練習と、全パターンを混ぜた実戦練習を切り替えられます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="motion-mode" className="font-bold">演習モード</label><select id="motion-mode" value={mode} onChange={event => { const selectedMode = event.target.value as MotionMode; setMode(selectedMode); next(selectedMode); }} className="border p-1"><option value="mix">実戦練習：力学 全パターンランダム</option>{motionPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{motionLabels[pattern]}だけ</option>)}</select></div>
      <div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div>
      <p className="text-center font-bold">最初に使う公式を選び、数値を入力しなさい。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{motionPatterns.map(pattern => <button key={pattern} type="button" onClick={() => setMethod(pattern)} className={`retro-btn-classic ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{motionLabels[pattern]}</button>)}</div>
      <div className="text-center"><input aria-label="計算結果" value={answer} onChange={event => setAnswer(event.target.value)} placeholder="数値" className="retro-input w-40 text-center" /><span className="ml-2 font-bold">{problem.unit}</span></div>
      <div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `使う公式は「${motionLabels[problem.pattern]}」、正解は ${problem.answer} ${problem.unit} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}
    </section>
  </main>;
}
