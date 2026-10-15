"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'factor' | 'rationalize' | 'dominant' | 'squeeze' | 'sequence';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; explanation: string };
const patterns: readonly Pattern[] = ['factor', 'rationalize', 'dominant', 'squeeze', 'sequence'];
const labels: Record<Pattern, string> = { factor: '因数分解・約分', rationalize: '有理化', dominant: '最高次の比較', squeeze: 'はさみうち', sequence: '数列の極限' };
const picker = new BalancedRandom(patterns);
function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const all: Record<Pattern, Problem> = {
    factor: { pattern, expression: '\\lim_{x\\to 2}\\frac{x^2-4}{x-2}', explanation: '分子を (x-2)(x+2) と因数分解して約分する。' },
    rationalize: { pattern, expression: '\\lim_{x\\to 0}\\frac{\\sqrt{1+x}-1}{x}', explanation: '分子の共役を掛けて分母のxを消す。' },
    dominant: { pattern, expression: '\\lim_{x\\to\\infty}\\frac{3x^2-x+1}{x^2+4}', explanation: '分子・分母をxの最高次で割り、最高次係数を比較する。' },
    squeeze: { pattern, expression: '\\lim_{x\\to 0}x\\sin\\frac{1}{x}', explanation: '-|x|\\le x\\sin(1/x)\\le |x| を使う。' },
    sequence: { pattern, expression: '\\lim_{n\\to\\infty}\\left(\\frac{2n+1}{2n-3}\\right)', explanation: '分子・分母をnで割り、数列の極限を求める。' },
  };
  return all[pattern];
}
export default function Calculus3LimitDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useState<Problem>(() => generate('factor')); const [answer, setAnswer] = useState<Pattern | ''>(''); const [checked, setChecked] = useState(false);
  useEffect(() => { setProblem(generate(mode)); setAnswer(''); setChecked(false); }, [mode]);
  const next = () => { setProblem(generate(mode)); setAnswer(''); setChecked(false); };
  const correct = answer === problem.pattern;
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 極限・解法選択ドリル</h1><p className="text-gray-500 mb-6">極限の式の形を見て、最初に選ぶ方針を判断します。個別練習と全パターンランダムに対応しています。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => setMode(e.target.value as Mode)} className="border p-1"><option value="mix">実戦練習：極限 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><p className="text-center font-bold">最初に使う方針を選びなさい。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setAnswer(p)} className={`retro-btn-classic ${answer === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={next} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${labels[problem.pattern]}」です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
