'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'separation' | 'initial' | 'growth' | 'motion';
type Problem = { pattern: Pattern; expression: string; answer: string; explanation: string };
const patterns: readonly Pattern[] = ['separation', 'initial', 'growth', 'motion'];
const labels: Record<Pattern, string> = { separation: '変数分離', initial: '初期条件', growth: '指数成長', motion: '速度から位置' };
const problems: Record<Pattern, Problem> = {
  separation: { pattern: 'separation', expression: 'dy/dx = 2y,  y(0)=1 の一般解', answer: 'y=e^(2x)', explanation: 'dy/y=2dx を積分し、初期条件から定数を決めると y=e^(2x)。' },
  initial: { pattern: 'initial', expression: 'dy/dx = 3x²,  y(1)=5 の解', answer: 'y=x^3+4', explanation: '積分して y=x³+C。x=1, y=5 を代入して C=4。' },
  growth: { pattern: 'growth', expression: 'dN/dt = 0.2N の増加率', answer: '20%', explanation: 'dN/dt=kN の k=0.2 は、単位時間あたり20%の比例増加を表す。' },
  motion: { pattern: 'motion', expression: '速度 v(t)=6t のとき、初期位置0からの位置 x(t)', answer: '3t^2', explanation: 'x(t)=∫v(t)dt=∫6t dt=3t²（初期位置0）。' },
};
const picker = new BalancedRandom(patterns);

export default function DifferentialEquationDrillPage() {
  const [mode, setMode] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<Problem>(problems.separation);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const load = (selected: Pattern | 'mix') => { const pattern = selected === 'mix' ? picker.next() : selected; setProblem(problems[pattern]); setAnswer(''); setChecked(false); };
  useEffect(() => { load('mix'); }, []);
  const correct = answer.trim().replaceAll(' ', '') === problem.answer.replaceAll(' ', '');
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学III 微分方程式・初歩計算ドリル</h1><p className="text-gray-500 mt-1">微分方程式の形を見て、積分・初期条件・成長モデルの扱いを判断します。</p></div><section className="retro-box bg-white p-5 space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={event => { const next = event.target.value as Pattern | 'mix'; setMode(next); load(next); }} className="border p-2"><option value="mix">実戦練習：微分方程式 全パターンランダム</option>{patterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{labels[pattern]}だけ</option>)}</select></div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-lg font-bold">{problem.expression}</div><input value={answer} onChange={event => setAnswer(event.target.value)} placeholder="解答" className="retro-input block mx-auto w-full max-w-md text-center" /><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => load(mode)} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は ${problem.answer} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
