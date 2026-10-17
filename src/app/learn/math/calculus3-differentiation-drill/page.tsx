"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'chain' | 'product' | 'logarithmic' | 'parametric' | 'implicit' | 'inverse' | 'higher';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; answer: number; explanation: string };
const patterns: readonly Pattern[] = ['chain', 'product', 'logarithmic', 'parametric', 'implicit', 'inverse', 'higher'];
const labels: Record<Pattern, string> = { chain: '合成関数の微分', product: '積の微分', logarithmic: '対数微分', parametric: '媒介変数表示', implicit: '陰関数の微分', inverse: '逆関数の微分', higher: '高次導関数' };
const picker = new BalancedRandom(patterns);
function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const all: Record<Pattern, Problem> = {
    chain: { pattern, expression: '\\left.\\frac{dy}{dx}\\right|_{x=1},\\quad y=(3x^2+1)^5', answer: 7680, explanation: '連鎖律より y′=30x(3x²+1)⁴。x=1で7680。' },
    product: { pattern, expression: '\\left.\\frac{dy}{dx}\\right|_{x=\\pi/2},\\quad y=x^2\\sin x', answer: Math.PI, explanation: '積の微分より y′=2x sin x+x² cos x。x=π/2でπ。' },
    logarithmic: { pattern, expression: '\\left.\\frac{dy}{dx}\\right|_{x=1},\\quad y=x^x\\ (x>0)', answer: 1, explanation: '対数微分で y′=xˣ(ln x+1)。x=1で1。' },
    parametric: { pattern, expression: '\\left.\\frac{dy}{dx}\\right|_{t=1},\\quad x=t^2+1,\\ y=t^3-t', answer: 1, explanation: 'dy/dx=(3t²−1)/(2t)。t=1で1。' },
    implicit: { pattern, expression: '\\left.\\frac{dy}{dx}\\right|_{(x,y)=(1,1)},\\quad x^2+xy+y^2=3', answer: -1, explanation: '陰関数微分で y′=−(2x+y)/(x+2y)。点(1,1)では−1。' },
    inverse: { pattern, expression: 'f(x)=x^3+x の逆関数を g とする。g′(2)', answer: 0.25, explanation: 'f(1)=2、f′(1)=4なので、逆関数の微分公式 g′(2)=1/f′(1)=1/4。' },
    higher: { pattern, expression: '\\left.y^{\\prime\\prime}\\right|_{x=0},\\quad y=e^{2x}', answer: 4, explanation: 'y′=2e²ˣ、y′′=4e²ˣ。x=0で4。' },
  };
  return all[pattern];
}
export default function Calculus3DifferentiationDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useState<Problem>(() => generate('mix')); const [strategy, setStrategy] = useState<Pattern | ''>(''); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generate(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  const correct = strategy === problem.pattern && Math.abs(Number(answer) - problem.answer) < 0.01;
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 微分法・解法選択ドリル</h1><p className="text-gray-500 mb-6">式の形から微分法を選び、指定点での導関数の値を求めます。個別練習と全パターンランダムを切り替えられます。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => { const selectedMode = e.target.value as Mode; setMode(selectedMode); next(selectedMode); }} className="border p-1"><option value="mix">実戦練習：微分法 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><p className="text-center font-bold">最初に使う微分法を選び、導関数の値を入力しなさい。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setStrategy(p)} className={`retro-btn-classic ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div><input aria-label="導関数の値" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="導関数の値" className="retro-input mx-auto block w-40 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `解法は「${labels[problem.pattern]}」、答えは約 ${problem.answer.toFixed(3)} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
