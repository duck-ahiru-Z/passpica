"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import { formatMoleAnswer, generateMoleProblem, isMoleAnswerCorrect, moleLabels, molePatterns, type MoleMode, type MolePattern } from '@/src/lib/chemistryMoleCalculation';

type Pattern = MolePattern;

export default function MoleCalculationDrillPage() {
  const [mode, setMode] = useState<MoleMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateMoleProblem('mix'));
  const [method, setMethod] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generateMoleProblem(selectedMode)); setMethod(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = method === problem.pattern && isMoleAnswerCorrect(answer, problem.answer);

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">化学 物質量・反応計算ドリル</h1>
    <p className="text-gray-500 mb-6">問題の条件から計算方法を選び、数値まで求めます。各分類だけの基礎練習と、全分類から出る実戦練習を切り替えられます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="mole-mode" className="font-bold">演習モード</label><select id="mole-mode" value={mode} onChange={event => { const selected = event.target.value as MoleMode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：化学計算 全パターンランダム</option>{molePatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{moleLabels[pattern]}だけ</option>)}</select></div>
      <div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div>
      <fieldset className="space-y-2"><legend className="w-full text-center font-bold">最初に使う計算方法を一つ選び、答えを入力しなさい。</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{molePatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="mole-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600" />{moleLabels[pattern]}</label>)}</div></fieldset>
      <div className="flex items-center justify-center gap-2"><input aria-label="計算結果" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値" className="retro-input w-40 text-center" />{problem.unit && <span className="font-bold" aria-label={`単位 ${problem.unit}`}>{problem.unit}</span>}</div>
      <div className="flex justify-center gap-3"><button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `計算方法は「${moleLabels[problem.pattern]}」、正解は ${formatMoleAnswer(problem.answer)}${problem.unit ? ` ${problem.unit}` : ''} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}
    </section>
  </main>;
}
