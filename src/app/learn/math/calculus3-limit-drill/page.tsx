"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { generateLimitProblem, limitLabels, limitPatterns, type LimitMode, type LimitPattern, type LimitProblem } from '@/src/lib/calculus3Limits';

type Pattern = LimitPattern;
type Mode = LimitMode;
type Problem = LimitProblem;

function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
export default function Calculus3LimitDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useClientGeneratedState<Problem>(() => generateLimitProblem('mix')); const [strategy, setStrategy] = useState<Pattern | ''>(''); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const next = (selectedMode: Mode = mode) => { setProblem(generateLimitProblem(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const numericAnswer = Number(answer);
  const correct = answer.trim() !== '' && Number.isFinite(numericAnswer) && strategy === problem.pattern && Math.abs(numericAnswer - Number(problem.answer)) <= 0.0005 + 1e-12;
  const strategyIsCorrect = strategy === problem.pattern;
  const valueIsCorrect = answer.trim() !== '' && Number.isFinite(numericAnswer) && Math.abs(numericAnswer - Number(problem.answer)) <= 0.0005 + 1e-12;
  const isContinuity = problem.pattern === 'continuity';
  const answerLabel = isContinuity ? '連続となる定数 k' : '極限値';
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 極限・解法選択ドリル</h1><p className="text-gray-500 mb-6">式の形から方針を選び、極限値や連続条件を求める練習です。個別練習と全パターンランダムを切り替えられます。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><label htmlFor="limit-mode" className="font-bold">演習モード</label><select id="limit-mode" aria-label="極限の演習パターン" value={mode} onChange={e => { const selected = e.target.value as Mode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：極限 全パターンランダム</option>{limitPatterns.map(p => <option key={p} value={p}>基礎練習：{limitLabels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><fieldset className="space-y-2"><legend className="w-full text-center font-bold">最初に使う方針を一つ選び、{answerLabel}を{isContinuity ? '求めなさい。' : '小数第3位まで入力しなさい。'}</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{limitPatterns.map(p => <label key={p} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="limit-strategy" value={p} checked={strategy === p} onChange={() => { setStrategy(p); setChecked(false); }} className="accent-blue-600" />{limitLabels[p]}</label>)}</div></fieldset><input aria-label={answerLabel} value={answer} onChange={e => { setAnswer(e.target.value); setChecked(false); }} placeholder={answerLabel} className="retro-input mx-auto block w-40 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} disabled={!strategy || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : <>不正解。{!strategyIsCorrect && <>方針は「{limitLabels[problem.pattern]}」です。 </>}{!valueIsCorrect && <>{answerLabel}は {problem.answer} です。</>}</>}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
