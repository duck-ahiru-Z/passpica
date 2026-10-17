"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'speed' | 'acceleration' | 'freefall' | 'work' | 'momentum' | 'kineticEnergy' | 'spring';
type Problem = { pattern: Pattern; question: string; answer: string; unit: string; explanation: string };
const labels: Record<Pattern, string> = { speed: '平均速度', acceleration: '加速度', freefall: '自由落下', work: '仕事', momentum: '運動量', kineticEnergy: '運動エネルギー', spring: 'ばねの力' };
const patterns: readonly Pattern[] = ['speed', 'acceleration', 'freefall', 'work', 'momentum', 'kineticEnergy', 'spring'];
const problems: Record<Pattern, Problem> = {
  speed: { pattern: 'speed', question: '自転車が 120 m を 10 s で進んだ。平均速度は？', answer: '12', unit: 'm/s', explanation: 'v=移動距離/時間=120/10=12 m/s。' },
  acceleration: { pattern: 'acceleration', question: '速度が 4 m/s から 10 m/s に 3 s で変化した。加速度は？', answer: '2', unit: 'm/s²', explanation: 'a=速度変化/時間=(10-4)/3=2 m/s²。' },
  freefall: { pattern: 'freefall', question: '静かに落とした物体の 2 s 後の速さを求めよ。g=9.8 m/s²。', answer: '19.6', unit: 'm/s', explanation: 'v=gt=9.8×2=19.6 m/s。' },
  work: { pattern: 'work', question: '20 N の力で物体を力の向きに 3 m 動かした。仕事は？', answer: '60', unit: 'J', explanation: 'W=Fs=20×3=60 J。' },
  momentum: { pattern: 'momentum', question: '質量 2 kg の物体が 6 m/s で動く。運動量の大きさは？', answer: '12', unit: 'kg·m/s', explanation: '運動量 p=mv=2×6=12 kg·m/s。' },
  kineticEnergy: { pattern: 'kineticEnergy', question: '質量 4 kg の物体が 5 m/s で動く。運動エネルギーは？', answer: '50', unit: 'J', explanation: 'K=1/2 mv²=1/2×4×25=50 J。' },
  spring: { pattern: 'spring', question: 'ばね定数 200 N/m のばねを 0.10 m 伸ばした。ばねの弾性力は？', answer: '20', unit: 'N', explanation: 'フックの法則 F=kx=200×0.10=20 N。' },
};
const picker = new BalancedRandom(patterns);

export default function MotionCalculationDrillPage() {
  const [mode, setMode] = useState<Pattern | 'mix'>('mix'); const [problem, setProblem] = useClientGeneratedState(() => problems[picker.next()]); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const load = (selected: Pattern | 'mix') => { const p = selected === 'mix' ? picker.next() : selected; setProblem(problems[p]); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer.trim() !== '' && Number.isFinite(Number(answer)) && Math.abs(Number(answer) - Number(problem.answer)) < 1e-9;
  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">物理 力学・計算ドリル</h1><p className="text-gray-500 mb-6">平均速度・加速度・自由落下・仕事・運動量・エネルギー・ばねを個別に練習し、実戦では条件から使う公式を判断します。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => { const p = e.target.value as Pattern | 'mix'; setMode(p); load(p); }} className="border p-1"><option value="mix">実戦練習：力学 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div><div className="text-center"><input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="数値" className="retro-input w-40 text-center" /><span className="ml-2 font-bold">{problem.unit}</span></div><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => load(mode)} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `不正解。正解は ${problem.answer} ${problem.unit} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
