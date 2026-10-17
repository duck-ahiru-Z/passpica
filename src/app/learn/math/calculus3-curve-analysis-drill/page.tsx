"use client";

import Link from 'next/link';
import { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

type Pattern = 'increase' | 'extrema' | 'concavity' | 'tangent' | 'normal' | 'motion';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; prompt: string; answer: number; explanation: string };
const patterns: readonly Pattern[] = ['increase', 'extrema', 'concavity', 'tangent', 'normal', 'motion'];
const labels: Record<Pattern, string> = { increase: '増減', extrema: '極大・極小', concavity: '凹凸・変曲点', tangent: '接線', normal: '法線', motion: '速度・加速度' };
const picker = new BalancedRandom(patterns);
const variants = {
  increase: new BalancedRandom([1, 2, 3, 4, 5]),
  extrema: new BalancedRandom([1, 2, 3, 4, 5]),
  concavity: new BalancedRandom([1, 2, 3, 4, 5]),
  tangent: new BalancedRandom([1, 2, 3, 4, 5]),
  normal: new BalancedRandom([1, 2, 3, 4, 5]),
  motion: new BalancedRandom([1, 2, 3, 4, 5]),
};

function MathEq({ math }: { math: string }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;
}

function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const n = variants[pattern].next();
  const all: Record<Pattern, Problem> = {
    increase: { pattern, expression: `f(x)=x^3-${3 * n ** 2}x`, prompt: 'x>0 の範囲で増加・減少が切り替わる境界 x を求めなさい。', answer: n, explanation: `f′(x)=3(x²−${n ** 2})。x>0 では x=${n} で f′ の符号が負から正に変わるため、この境界で減少から増加に切り替わります。` },
    extrema: { pattern, expression: `f(x)=x^3-${3 * n ** 2}x`, prompt: 'この関数の極大値と極小値の差（極大値−極小値）を求めなさい。', answer: 4 * n ** 3, explanation: `f′(x)=3(x²−${n ** 2}) より臨界点は ±${n}。f(−${n})=${2 * n ** 3}、f(${n})=−${2 * n ** 3}。差は ${4 * n ** 3}。` },
    concavity: { pattern, expression: `f(x)=x^3-${3 * n}x^2`, prompt: '変曲点の x 座標を求めなさい。', answer: n, explanation: `f′′(x)=6x−${6 * n} は x=${n} の前後で符号が変わるため、変曲点の x 座標は ${n}。` },
    tangent: { pattern, expression: `y=x^2+${n}x,\\; x=1`, prompt: '指定された点での接線の傾きを求めなさい。', answer: 2 + n, explanation: `y′=2x+${n}。x=1 での傾きは ${2 + n}。` },
    normal: { pattern, expression: `y=x^2+${n}x,\\; x=1`, prompt: '指定された点での法線の傾きを求めなさい。', answer: -1 / (2 + n), explanation: `接線の傾きは y′(1)=${2 + n}。法線の傾きはその負の逆数 −1/${2 + n}。` },
    motion: { pattern, expression: `x(t)=t^3-${3 * n}t,\\; t=1`, prompt: '時刻 t=1 における速度を求めなさい。', answer: 3 - 3 * n, explanation: `速度 v(t)=x′(t)=3t²−${3 * n}。t=1 で v=${3 - 3 * n}。` },
  };
  return all[pattern];
}

export default function Calculus3CurveAnalysisDrill() {
  const [mode, setMode] = useState<Mode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generate('mix'));
  const [strategy, setStrategy] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generate(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const numericAnswer = Number(answer);
  const correct = answer.trim() !== '' && Number.isFinite(numericAnswer) && strategy === problem.pattern && Math.abs(numericAnswer - problem.answer) <= 0.001;

  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学III 曲線分析・解法選択ドリル</h1><p className="text-gray-500 mt-1">増減・極値・凹凸・接線・法線・運動。問題の形から解法を選び、計算まで練習できます。</p></div>
    <section className="retro-box bg-gray-50 p-4 space-y-3"><label htmlFor="curve-mode" className="font-bold block">■ 演習モード</label><select id="curve-mode" value={mode} onChange={e => { const value = e.target.value as Mode; setMode(value); next(value); }} className="border p-2 bg-white"><option value="mix">実戦練習：曲線分析 全パターンランダム</option>{patterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{labels[pattern]}だけ</option>)}</select></section>
    <section className="retro-box bg-white p-5 space-y-5"><div className="flex justify-between gap-2"><span className="font-bold text-blue-700">出題：{labels[problem.pattern]}</span><span className="text-gray-500">解法を選び、計算</span></div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed"><MathEq math={problem.expression} /></div><p className="text-center font-bold">{problem.prompt}</p><div className="grid sm:grid-cols-2 gap-2">{patterns.map(pattern => <button key={pattern} onClick={() => setStrategy(pattern)} className={`retro-btn-classic ${strategy === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[pattern]}</button>)}</div><input aria-label="数値の答え" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="数値の答え" className="retro-input mx-auto block w-40 text-center" /><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `解法は「${labels[problem.pattern]}」、答えは約 ${problem.answer.toFixed(3)} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section>
  </main>;
}
