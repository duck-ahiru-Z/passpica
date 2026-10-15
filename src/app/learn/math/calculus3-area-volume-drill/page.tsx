"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'between-curves' | 'x-axis-rotation' | 'y-axis-rotation' | 'curve-length';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; explanation: string };
const patterns: readonly Pattern[] = ['between-curves', 'x-axis-rotation', 'y-axis-rotation', 'curve-length'];
const labels: Record<Pattern, string> = { 'between-curves': '2曲線間の面積', 'x-axis-rotation': 'x軸回転体の体積', 'y-axis-rotation': 'y軸回転体の体積', 'curve-length': '曲線の長さ' };
const picker = new BalancedRandom(patterns);
function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const all: Record<Pattern, Problem> = {
    'between-curves': { pattern, expression: 'y=x,\\ y=x^2\\quad(0\\le x\\le1)', explanation: '上の関数から下の関数を引いて、xについて積分する。' },
    'x-axis-rotation': { pattern, expression: 'y=x^2\\quad(0\\le x\\le1)', explanation: 'π∫(半径)^2 dx。半径はyの値になる。' },
    'y-axis-rotation': { pattern, expression: 'y=\\sqrt{x}\\quad(0\\le x\\le4)', explanation: '円筒殻の方法なら2π∫x·y dx。' },
    'curve-length': { pattern, expression: 'y=\\frac{2}{3}x^{3/2}\\quad(0\\le x\\le1)', explanation: 'L=∫√(1+(dy/dx)^2) dx を使う。' },
  };
  return all[pattern];
}
export default function Calculus3AreaVolumeDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useState<Problem>(() => generate('between-curves')); const [answer, setAnswer] = useState<Pattern | ''>(''); const [checked, setChecked] = useState(false);
  useEffect(() => { setProblem(generate(mode)); setAnswer(''); setChecked(false); }, [mode]);
  const next = () => { setProblem(generate(mode)); setAnswer(''); setChecked(false); };
  const correct = answer === problem.pattern;
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 面積・体積・曲線の長さドリル</h1><p className="text-gray-500 mb-6">図形の条件を見て、どの積分の立式を選ぶか判断します。個別練習と全パターンランダムに対応しています。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => setMode(e.target.value as Mode)} className="border p-1"><option value="mix">実戦練習：面積・体積 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><p className="text-center font-bold">最初に使う立式を選びなさい。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setAnswer(p)} className={`retro-btn-classic ${answer === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={next} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${labels[problem.pattern]}」です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
