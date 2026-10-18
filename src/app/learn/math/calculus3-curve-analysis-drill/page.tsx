"use client";

import Link from 'next/link';
import { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { curveLabels, curvePatterns, generateCurveProblem, isCurveAnswerCorrect, type CurveMode, type CurvePattern } from '@/src/lib/calculus3CurveAnalysis';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

type Pattern = CurvePattern;
type Mode = CurveMode;

function MathEq({ math }: { math: string }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;
}

export default function Calculus3CurveAnalysisDrill() {
  const [mode, setMode] = useState<Mode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateCurveProblem('mix'));
  const [strategy, setStrategy] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: Mode = mode) => { setProblem(generateCurveProblem(selectedMode)); setStrategy(selectedMode === 'mix' ? '' : selectedMode); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = strategy === problem.pattern && isCurveAnswerCorrect(answer, problem.answer);
  const strategyIsCorrect = strategy === problem.pattern;
  const valueIsCorrect = isCurveAnswerCorrect(answer, problem.answer);

  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学III 曲線分析・解法選択ドリル</h1><p className="text-gray-500 mt-1">増減・極値・凹凸・接線・法線・運動。問題の形から解法を選び、計算まで練習できます。</p></div>
    <section className="retro-box bg-gray-50 p-4 space-y-3"><label htmlFor="curve-mode" className="font-bold block">■ 演習モード</label><select id="curve-mode" value={mode} onChange={e => { const value = e.target.value as Mode; setMode(value); next(value); }} className="border p-2 bg-white"><option value="mix">実戦練習：曲線分析 全パターンランダム</option>{curvePatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{curveLabels[pattern]}だけ</option>)}</select></section>
    <section className="retro-box bg-white p-5 space-y-5"><div className="flex justify-between gap-2"><span className="font-bold text-blue-700">{mode === 'mix' ? '解法を選んで答えよう' : '数値を計算して答えよう'}</span><span className="text-gray-500">問題の形を見極める</span></div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed"><MathEq math={problem.expression} /></div><p className="text-center font-bold">{problem.prompt}</p>{mode === 'mix' ? <fieldset className="space-y-2"><legend className="font-bold">実戦練習：解法を一つ選んでください</legend><div className="grid sm:grid-cols-2 gap-2">{curvePatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${strategy === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="curve-strategy" value={pattern} checked={strategy === pattern} onChange={() => { setStrategy(pattern); setChecked(false); }} className="accent-blue-600" />{curveLabels[pattern]}</label>)}</div></fieldset> : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{curveLabels[mode]}に固定して繰り返します。</p>}<input aria-label="数値の答え" value={answer} onChange={e => { setAnswer(e.target.value); setChecked(false); }} placeholder="数値の答え" className="retro-input mx-auto block w-40 text-center" /><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} disabled={!strategy || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : <>不正解。{!strategyIsCorrect && <>解法は「{curveLabels[problem.pattern]}」です。 </>}{!valueIsCorrect && <>答えは約 {problem.answer.toFixed(3)} です。</>}</>}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section>
  </main>;
}
