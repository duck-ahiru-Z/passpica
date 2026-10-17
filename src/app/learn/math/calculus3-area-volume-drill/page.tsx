"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { generateGeometryProblem, geometryLabels, geometryPatterns, type GeometryMode, type GeometryPattern } from '@/src/lib/calculus3Geometry';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

type Pattern = GeometryPattern;
type Mode = GeometryMode;
function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
export default function Calculus3AreaVolumeDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useClientGeneratedState(() => generateGeometryProblem('mix')); const [strategy, setStrategy] = useState<Pattern | ''>(''); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generateGeometryProblem(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const numericAnswer = Number(answer);
  const correct = answer.trim() !== '' && Number.isFinite(numericAnswer) && strategy === problem.pattern && Math.abs(numericAnswer - problem.answer) <= 0.0005 + 1e-12;
  const strategyIsCorrect = strategy === problem.pattern;
  const valueIsCorrect = answer.trim() !== '' && Number.isFinite(numericAnswer) && Math.abs(numericAnswer - problem.answer) <= 0.0005 + 1e-12;
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 面積・体積・曲線の長さドリル</h1><p className="text-gray-500 mb-6">図形の条件から方針を選び、面積・体積・長さを数値で求めます。係数・指数・区間も変わる個別練習と全パターンランダムです。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><label htmlFor="geometry-mode" className="font-bold">演習モード</label><select id="geometry-mode" aria-label="面積・体積の演習パターン" value={mode} onChange={e => { const selected = e.target.value as Mode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：面積・体積 全パターンランダム</option>{geometryPatterns.map(p => <option key={p} value={p}>基礎練習：{geometryLabels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><p className="mb-4 text-base font-semibold">{problem.prompt}</p><MathEq math={problem.expression} /></div><fieldset className="space-y-2"><legend className="w-full text-center font-bold">最初の方針を選び、答えを小数第3位まで入力しなさい（許容誤差 ±0.0005）。</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{geometryPatterns.map(p => <button key={p} type="button" aria-pressed={strategy === p} onClick={() => setStrategy(p)} className={`retro-btn-classic ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{geometryLabels[p]}</button>)}</div></fieldset><input aria-label="計算結果" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="計算結果（小数第3位まで）" className="retro-input mx-auto block w-48 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} disabled={!strategy || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : <>不正解。{!strategyIsCorrect && <>方針は「{geometryLabels[problem.pattern]}」です。 </>}{!valueIsCorrect && <>答えは約 {problem.answer.toFixed(3)} です。</>}</>}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
