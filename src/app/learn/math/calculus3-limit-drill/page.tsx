"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

type Pattern = 'factor' | 'rationalize' | 'dominant' | 'squeeze' | 'sequence';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; answer: string; explanation: string };
const patterns: readonly Pattern[] = ['factor', 'rationalize', 'dominant', 'squeeze', 'sequence'];
const labels: Record<Pattern, string> = { factor: '因数分解・約分', rationalize: '有理化', dominant: '最高次の比較', squeeze: 'はさみうち', sequence: '数列の極限' };
const picker = new BalancedRandom(patterns);
function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const all: Record<Pattern, Problem> = {
    factor: { pattern, expression: '\\lim_{x\\to 2}\\frac{x^2-4}{x-2}', answer: '4', explanation: '分子を (x-2)(x+2) と因数分解して約分する。極限値は4。' },
    rationalize: { pattern, expression: '\\lim_{x\\to 0}\\frac{\\sqrt{1+x}-1}{x}', answer: '0.5', explanation: '分子の共役を掛けると1/(√(1+x)+1)となり、極限値は1/2。' },
    dominant: { pattern, expression: '\\lim_{x\\to\\infty}\\frac{3x^2-x+1}{x^2+4}', answer: '3', explanation: '分子・分母をxの最高次で割り、最高次係数の比3を得る。' },
    squeeze: { pattern, expression: '\\lim_{x\\to 0}x\\sin\\frac{1}{x}', answer: '0', explanation: '-|x|≤x sin(1/x)≤|x| とはさみ、両端が0へ近づくことを使う。' },
    sequence: { pattern, expression: '\\lim_{n\\to\\infty}\\left(\\frac{2n+1}{2n-3}\\right)', answer: '1', explanation: '分子・分母をnで割り、数列の極限1を得る。' },
  };
  return all[pattern];
}
export default function Calculus3LimitDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useClientGeneratedState(() => generate('mix')); const [strategy, setStrategy] = useState<Pattern | ''>(''); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generate(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = strategy === problem.pattern && Math.abs(Number(answer) - Number(problem.answer)) < 1e-9;
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 極限・解法選択ドリル</h1><p className="text-gray-500 mb-6">式の形から方針を選び、極限値まで求める練習です。個別練習と全パターンランダムを切り替えられます。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => { const selected = e.target.value as Mode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：極限 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><p className="text-center font-bold">最初に使う方針を選び、極限値を入力しなさい。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setStrategy(p)} className={`retro-btn-classic ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div><input aria-label="極限値" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="極限値" className="retro-input mx-auto block w-40 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `方針は「${labels[problem.pattern]}」、極限値は ${problem.answer} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
