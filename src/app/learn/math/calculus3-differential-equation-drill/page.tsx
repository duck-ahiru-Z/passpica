'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { differentialEquationLabels, differentialEquationPatterns, generateDifferentialEquationProblem, type DifferentialEquationMode, type DifferentialEquationPattern, type DifferentialEquationProblem } from '@/src/lib/calculus3DifferentialEquations';

type Pattern = DifferentialEquationPattern;
type Mode = DifferentialEquationMode;
type Problem = DifferentialEquationProblem;

export default function DifferentialEquationDrillPage() {
  const [mode, setMode] = useState<Mode>('mix');
  const [problem, setProblem] = useClientGeneratedState<Problem>(() => generateDifferentialEquationProblem('mix'));
  const [strategy, setStrategy] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const load = (selected: Mode) => { setProblem(generateDifferentialEquationProblem(selected)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer.trim().replaceAll(' ', '') === problem.answer.replaceAll(' ', '') && strategy === problem.pattern;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学III 微分方程式・初歩計算ドリル</h1><p className="text-gray-500 mt-1">式の形から解法を選び、解や値を求めます。固定パターンの反復と全パターン混合の実戦練習を切り替えられます。</p></div><section className="retro-box bg-white p-5 space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={event => { const nextMode = event.target.value as Mode; setMode(nextMode); load(nextMode); }} className="border p-2"><option value="mix">実戦練習：微分方程式 全パターンランダム</option>{differentialEquationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{differentialEquationLabels[pattern]}だけ</option>)}</select></div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-lg font-bold">{problem.expression}</div><p className="text-center font-bold">最初に使う方法を選び、答えを入力してください。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{differentialEquationPatterns.map(pattern => <button key={pattern} onClick={() => setStrategy(pattern)} className={`retro-btn-classic ${strategy === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{differentialEquationLabels[pattern]}</button>)}</div><input aria-label="微分方程式の解または値" value={answer} onChange={event => setAnswer(event.target.value)} placeholder="解または値" className="retro-input block mx-auto w-full max-w-md text-center" /><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => load(mode)} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `解法は「${differentialEquationLabels[problem.pattern]}」、正解は ${problem.answer} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
