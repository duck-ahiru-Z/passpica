"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { generateIntegralProblem, integralLabels, integralPatterns, type IntegralMode, type IntegralPattern, type IntegralProblem } from '@/src/lib/calculus3Integrals';

type Pattern = IntegralPattern;
type Mode = IntegralMode;
type Problem = IntegralProblem;

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { displayMode: block, throwOnError: false }) }} />;
}

export default function Calculus3IntegralDrillPage() {
  const [mode, setMode] = useState<Mode>('mix');
  const [problem, setProblem] = useClientGeneratedState<Problem>(() => generateIntegralProblem('mix'));
  const [strategy, setStrategy] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: Mode = mode) => { setProblem(generateIntegralProblem(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const numericAnswer = Number(answer);
  const isCorrect = answer.trim() !== '' && Number.isFinite(numericAnswer) && strategy === problem.pattern && Math.abs(numericAnswer - problem.answer) < 0.01;

  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 積分法・解法選択ドリル</h1>
    <p className="text-gray-500 mb-6">積分の式を見て、最初に選ぶべき解法を判断する練習です。基礎練習では解法を固定し、実戦練習では全パターンを混ぜます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="integral-mode" className="font-bold">演習モード</label>
        <select id="integral-mode" aria-label="積分の演習パターン" value={mode} onChange={e => { const selectedMode = e.target.value as Mode; setMode(selectedMode); next(selectedMode); }} className="border p-1">
          <option value="mix">実戦練習：積分法 全パターンランダム</option>
          {integralPatterns.map(p => <option key={p} value={p}>基礎練習：{integralLabels[p]}だけ</option>)}
        </select>
      </div>
      <div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} block /></div>
      <p className="text-center font-bold">最初に使う解法を選び、積分値を小数で入力しなさい。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{integralPatterns.map(p => <button key={p} type="button" aria-pressed={strategy === p} onClick={() => setStrategy(p)} className={`retro-btn-classic ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{integralLabels[p]}</button>)}</div>
      <input aria-label="積分値" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="積分値" className="retro-input mx-auto block w-40 text-center" />
      <div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} disabled={!strategy || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div className={`p-3 border text-center font-bold ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{isCorrect ? '正解！' : `解法は「${integralLabels[problem.pattern]}」、積分値は約 ${problem.answer.toFixed(3)} です。`}<div className="mt-2 font-normal text-slate-700"><span className="font-semibold">{problem.hint}</span>：{problem.explanation}</div></div>}
    </section>
  </main>;
}
