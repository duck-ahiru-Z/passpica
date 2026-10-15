'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BalancedRandom } from '@/src/lib/balancedRandom';
type Area = 'calculus' | 'trig' | 'log' | 'geometry';
type Question = { area: Area; prompt: string; answer: string; options: string[]; explanation: string };
const labels: Record<Area, string> = { calculus: '微分・積分', trig: '三角関数', log: '指数・対数', geometry: '図形と方程式' };
const areas: Area[] = ['calculus', 'trig', 'log', 'geometry'];
const questions: Question[] = [
  { area: 'calculus', prompt: '曲線 y=f(x) と直線 x=a で囲まれた面積を求める。最初に確認することは？', answer: '交点と上下関係', options: ['交点と上下関係', '定積分の区間を先に固定', '微分して増減を確認', '面積公式をそのまま適用'], explanation: '積分区間と被積分関数の符号を決めるため、交点と上下関係を確認します。' },
  { area: 'trig', prompt: 'sinθ+cosθ の最大値を求めるときの基本方針は？', answer: '合成', options: ['合成', '相互関係で cosθ を消去', '二倍角公式', '単位円で範囲を確認'], explanation: 'sinθ+cosθ=√2 sin(θ+π/4) と合成すると最大値が読めます。' },
  { area: 'log', prompt: 'log_a(x-1)+log_a(x+1) を扱う前に必要な確認は？', answer: '真数条件', options: ['真数条件', '底の条件', '対数の和を積にまとめる', '指数に戻して確認'], explanation: '対数の真数が正となる範囲を先に定めます。' },
  { area: 'geometry', prompt: '点と直線の距離を求めるときに使う代表的な式は？', answer: '点と直線の距離公式', options: ['点と直線の距離公式', '垂線の傾きを求めて交点を出す', '平行な直線間の距離公式', '座標の差を直接取る'], explanation: '直線を Ax+By+C=0 に整理し、距離公式を適用します。' },
];
export default function Math2MixedDrillPage() {
  const [mode, setMode] = useState<Area | 'all'>('all'); const [question, setQuestion] = useState(questions[0]); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false); const [queue] = useState(() => new BalancedRandom<Area>(areas));
  const next = (selected: Area | 'all' = mode) => { const area = selected === 'all' ? queue.next() : selected; setQuestion(questions.find(q => q.area === area)!); setAnswer(''); setChecked(false); };
  const correct = answer === question.answer;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学II 総合・解法選択ランダムドリル</h1><p className="text-gray-500 mt-1">単元を固定して基礎練習することも、数学II全体から解法を判断することもできます。</p></div><section className="retro-box bg-gray-50 p-4 space-y-3"><label className="font-bold block">■ 演習モード</label><select value={mode} onChange={e => { const value = e.target.value as Area | 'all'; setMode(value); next(value); }} className="border p-2 bg-white"><option value="all">実戦練習：数学II 全体ランダム</option>{areas.map(area => <option key={area} value={area}>基礎練習：{labels[area]}だけ</option>)}</select></section><section className="retro-box bg-white p-5 space-y-5"><div className="font-bold text-blue-700">出題：{labels[question.area]}</div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div><div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}</section></main>;
}
