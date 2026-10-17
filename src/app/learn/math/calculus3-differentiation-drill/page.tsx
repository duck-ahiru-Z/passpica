"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { differentiationLabels, differentiationPatterns, generateDifferentiationProblem, isDifferentiationAnswerCorrect, type DifferentiationMode, type DifferentiationPattern, type DifferentiationProblem } from '@/src/lib/calculus3Differentiation';

type Pattern = DifferentiationPattern;
type Mode = DifferentiationMode;
type Problem = DifferentiationProblem;

function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
export default function Calculus3DifferentiationDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useClientGeneratedState<Problem>(() => generateDifferentiationProblem('mix')); const [strategy, setStrategy] = useState<Pattern | ''>(''); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const next = (selectedMode: Mode = mode) => { setProblem(generateDifferentiationProblem(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = strategy === problem.pattern && isDifferentiationAnswerCorrect(answer, problem.answer);
  const strategyIsCorrect = strategy === problem.pattern;
  const valueIsCorrect = isDifferentiationAnswerCorrect(answer, problem.answer);
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 微分法・解法選択ドリル</h1><p className="text-gray-500 mb-6">式の形から微分法を選び、指定点での導関数の値を求めます。個別練習と全パターンランダムを切り替えられます。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><label htmlFor="differentiation-mode" className="font-bold">演習モード</label><select id="differentiation-mode" aria-label="微分法の演習パターン" value={mode} onChange={e => { const selectedMode = e.target.value as Mode; setMode(selectedMode); next(selectedMode); }} className="border p-1"><option value="mix">実戦練習：微分法 全パターンランダム</option>{differentiationPatterns.map(p => <option key={p} value={p}>基礎練習：{differentiationLabels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><fieldset className="space-y-2"><legend className="w-full text-center font-bold">最初に使う微分法を一つ選び、導関数の値を入力しなさい。</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{differentiationPatterns.map(p => <label key={p} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="differentiation-strategy" value={p} checked={strategy === p} onChange={() => setStrategy(p)} className="accent-blue-600" />{differentiationLabels[p]}</label>)}</div></fieldset><input aria-label="導関数の値" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="導関数の値" className="retro-input mx-auto block w-40 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} disabled={!strategy || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : <>不正解。{!strategyIsCorrect && <>解法は「{differentiationLabels[problem.pattern]}」です。 </>}{!valueIsCorrect && <>答えは約 {problem.answer.toFixed(3)} です。</>}</>}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
