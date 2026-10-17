"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'between-curves' | 'x-axis-rotation' | 'y-axis-rotation' | 'curve-length';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; answer: number; explanation: string };
const patterns: readonly Pattern[] = ['between-curves', 'x-axis-rotation', 'y-axis-rotation', 'curve-length'];
const labels: Record<Pattern, string> = { 'between-curves': '2曲線間の面積', 'x-axis-rotation': 'x軸回転体の体積', 'y-axis-rotation': 'y軸回転体の体積', 'curve-length': '曲線の長さ' };
const picker = new BalancedRandom(patterns);
function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const all: Record<Pattern, Problem> = {
    'between-curves': { pattern, expression: 'y=x,\\ y=x^2\\quad(0\\le x\\le1)', answer: 1 / 6, explanation: '上の関数から下の関数を引く。∫₀¹(x−x²)dx=1/6。' },
    'x-axis-rotation': { pattern, expression: 'y=x^2\\quad(0\\le x\\le1)', answer: Math.PI / 5, explanation: 'V=π∫₀¹(x²)²dx=π/5。半径を二乗して積分する。' },
    'y-axis-rotation': { pattern, expression: 'y=\\sqrt{x}\\quad(0\\le x\\le4)', answer: 8 * Math.PI / 5, explanation: 'y軸まわりの円板法を使う。x=y²より半径²は4−y⁴、V=π∫₀²(4−y⁴)dy=8π/5。' },
    'curve-length': { pattern, expression: 'y=\\frac{2}{3}x^{3/2}\\quad(0\\le x\\le1)', answer: (4 * Math.sqrt(2) - 2) / 3, explanation: 'y′=√xなのでL=∫₀¹√(1+x)dx=(4√2−2)/3。' },
  };
  return all[pattern];
}
export default function Calculus3AreaVolumeDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useState<Problem>(() => generate('mix')); const [strategy, setStrategy] = useState<Pattern | ''>(''); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generate(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  const correct = strategy === problem.pattern && Math.abs(Number(answer) - problem.answer) < 0.01;
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 面積・体積・曲線の長さドリル</h1><p className="text-gray-500 mb-6">図形の条件から方針を選び、面積・体積・長さを数値で求めます。答えは小数第2位までの誤差を許容します。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => { const selected = e.target.value as Mode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：面積・体積 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><p className="text-center font-bold">最初の方針を選び、答えを小数で入力しなさい。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setStrategy(p)} className={`retro-btn-classic ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div><input aria-label="計算結果" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="計算結果" className="retro-input mx-auto block w-40 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `方針は「${labels[problem.pattern]}」、答えは約 ${problem.answer.toFixed(3)} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
