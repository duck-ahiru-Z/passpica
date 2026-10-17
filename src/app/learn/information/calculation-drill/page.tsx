"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import { generateInformationProblem, informationLabels, informationPatterns, type InformationMode, type InformationPattern } from '@/src/lib/informationCalculation';

type Pattern = InformationPattern;
const numericPatterns = new Set<Pattern>(['data', 'transfer', 'sampling', 'compression']);
const normalizeAnswer = (value: string) => value.trim().replaceAll(',', '').replaceAll(' ', '').toLowerCase();

export default function InformationCalculationDrillPage() {
  const [mode, setMode] = useState<InformationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateInformationProblem('mix'));
  const [method, setMethod] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generateInformationProblem(selectedMode)); setMethod(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedExpected = normalizeAnswer(problem.answer);
  const answerCorrect = numericPatterns.has(problem.pattern) && normalizedAnswer !== '' && normalizedExpected !== '' && Number.isFinite(Number(normalizedAnswer))
    ? Number(normalizedAnswer) === Number(normalizedExpected)
    : normalizedAnswer === normalizedExpected;
  const correct = answer.trim() !== '' && method === problem.pattern && answerCorrect;

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">情報I 計算・処理ドリル</h1>
    <p className="text-gray-500 mb-6">問題の形から処理方法を選び、計算結果まで答える練習です。分類別の基礎練習と全パターンランダムを切り替えられます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="information-mode" className="font-bold">演習モード</label><select id="information-mode" value={mode} onChange={event => { const selected = event.target.value as InformationMode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：情報計算 全パターンランダム</option>{informationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{informationLabels[pattern]}だけ</option>)}</select></div>
      <div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div>
      <p className="text-center font-bold">最初に使う処理方法を選び、答えを入力しなさい。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{informationPatterns.map(pattern => <button key={pattern} type="button" onClick={() => setMethod(pattern)} className={`retro-btn-classic ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{informationLabels[pattern]}</button>)}</div>
      <input aria-label="計算結果" value={answer} onChange={event => setAnswer(event.target.value)} placeholder="答え" className="retro-input block mx-auto w-48 text-center" />
      <div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `処理方法は「${informationLabels[problem.pattern]}」、正解は ${problem.answer} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}
    </section>
  </main>;
}
