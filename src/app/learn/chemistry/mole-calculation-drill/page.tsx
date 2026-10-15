"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'mass' | 'concentration' | 'dilution' | 'gas' | 'stoichiometry' | 'ph' | 'yield';
type Problem = { pattern: Pattern; question: string; answer: string; explanation: string };
const labels: Record<Pattern, string> = { mass: '質量から物質量', concentration: 'モル濃度', dilution: '希釈', gas: '気体の物質量', stoichiometry: '反応量比', ph: 'pH計算', yield: '収率' };
const problems: Record<Pattern, Problem> = {
  mass: { pattern: 'mass', question: '水 18 g は何 mol か。（H₂O = 18 g/mol）', answer: '1', explanation: 'n=m/M=18/18=1 mol。' },
  concentration: { pattern: 'concentration', question: 'NaCl 0.20 mol を水に溶かして 0.50 L とした。モル濃度は？', answer: '0.40', explanation: 'c=n/V=0.20/0.50=0.40 mol/L。' },
  dilution: { pattern: 'dilution', question: '2.0 mol/L の溶液 50 mL を 0.50 mol/L に薄める。全体を何 mL にするか。', answer: '200', explanation: '溶質の物質量一定より c₁V₁=c₂V₂。V₂=2.0×50/0.50=200 mL。' },
  gas: { pattern: 'gas', question: '標準状態で酸素 11.2 L は何 mol か。（モル体積 22.4 L/mol）', answer: '0.50', explanation: 'n=V/22.4=11.2/22.4=0.50 mol。' },
  stoichiometry: { pattern: 'stoichiometry', question: '2H₂ + O₂ → 2H₂O。H₂ 3.0 mol と完全反応する O₂ は何 mol か。', answer: '1.5', explanation: '係数比 H₂:O₂=2:1 より、3.0×1/2=1.5 mol。' },
  ph: { pattern: 'ph', question: '0.001 mol/L の強酸水溶液の pH は？', answer: '3', explanation: '[H⁺]=10⁻³ mol/L なので pH=−log₁₀[H⁺]=3。' },
  yield: { pattern: 'yield', question: '理論上 10 g 得られる反応で、実際に 8.0 g 得た。収率は？', answer: '80', explanation: '収率=実際量/理論量×100=8.0/10×100=80%。' },
};
const patterns: readonly Pattern[] = ['mass', 'concentration', 'dilution', 'gas', 'stoichiometry', 'ph', 'yield'];
const mixedPatternPicker = new BalancedRandom<Pattern>(patterns);

export default function MoleCalculationDrillPage() {
  const [pattern, setPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<Problem>(problems.mass);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const load = (selected: Pattern | 'mix') => { const p = selected === 'mix' ? mixedPatternPicker.next() : selected; setProblem(problems[p]); setAnswer(''); setChecked(false); };
  useEffect(() => { load('mix'); }, []);
  const correct = answer.trim() !== '' && Number.isFinite(Number(answer)) && Math.abs(Number(answer) - Number(problem.answer)) < 1e-9;
  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">化学 物質量・反応計算ドリル</h1><p className="text-gray-500 mb-6">物質量・濃度・希釈・気体・反応量比・pH・収率を個別に練習し、実戦では計算方法を判断しながら混合演習します。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={pattern} onChange={e => { const p = e.target.value as Pattern | 'mix'; setPattern(p); load(p); }} className="border p-1"><option value="mix">実戦練習：化学計算 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div><p className="text-center font-bold">答えを入力し、最初に使う計算を確認しなさい。</p><input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="数値" className="retro-input block mx-auto w-40 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => load(pattern)} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `不正解。正解は ${problem.answer} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
