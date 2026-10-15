"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'chain' | 'product' | 'logarithmic' | 'parametric' | 'implicit' | 'inverse' | 'higher';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; explanation: string };
const patterns: readonly Pattern[] = ['chain', 'product', 'logarithmic', 'parametric', 'implicit', 'inverse', 'higher'];
const labels: Record<Pattern, string> = { chain: '合成関数の微分', product: '積の微分', logarithmic: '対数微分', parametric: '媒介変数表示', implicit: '陰関数の微分', inverse: '逆関数の微分', higher: '高次導関数' };
const picker = new BalancedRandom(patterns);
function MathEq({ math }: { math: string }) { return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />; }
function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const all: Record<Pattern, Problem> = {
    chain: { pattern, expression: 'y=(3x^2+1)^5', explanation: '外側の5乗と内側の3x^2+1を分けて連鎖律を使う。' },
    product: { pattern, expression: 'y=x^2\\sin x', explanation: 'x^2 と sin x の積として積の微分を使う。' },
    logarithmic: { pattern, expression: 'y=x^x\\ (x>0)', explanation: '両辺の対数を取ってから微分する。' },
    parametric: { pattern, expression: 'x=t^2+1,\\ y=t^3-t', explanation: 'dy/dx=(dy/dt)/(dx/dt) を使う。' },
    implicit: { pattern, expression: 'x^2+xy+y^2=3', explanation: 'yをxの関数とみなし、両辺をxで微分する。' },
    inverse: { pattern, expression: 'f(x)=x^3+x の逆関数の導関数', explanation: '逆関数の微分公式を使い、逆関数を直接解かずに求める。' },
    higher: { pattern, expression: 'y=e^{2x} の y\u2033', explanation: '一度微分した式をもう一度微分し、高次導関数を求める。' },
  };
  return all[pattern];
}
export default function Calculus3DifferentiationDrillPage() {
  const [mode, setMode] = useState<Mode>('mix'); const [problem, setProblem] = useState<Problem>({ pattern: 'chain', expression: 'y=(3x^2+1)^5', explanation: '外側の5乗と内側の3x^2+1を分けて連鎖律を使う。' }); const [answer, setAnswer] = useState<Pattern | ''>(''); const [checked, setChecked] = useState(false);
  useEffect(() => { setProblem(generate(mode)); setAnswer(''); setChecked(false); }, [mode]);
  const next = () => { setProblem(generate(mode)); setAnswer(''); setChecked(false); };
  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 微分法・解法選択ドリル</h1><p className="text-gray-500 mb-6">式の形から、最初に選ぶ微分法を判断します。個別練習と全パターンランダムを切り替えられます。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => setMode(e.target.value as Mode)} className="border p-1"><option value="mix">実戦練習：微分法 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} /></div><p className="text-center font-bold">最初に使う微分法を選びなさい。</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setAnswer(p)} className={`retro-btn-classic ${answer === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={next} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${answer === problem.pattern ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{answer === problem.pattern ? '正解！' : `正解は「${labels[problem.pattern]}」です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
