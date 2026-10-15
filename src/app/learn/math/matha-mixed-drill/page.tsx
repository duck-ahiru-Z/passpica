'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BalancedRandom } from '@/src/lib/balancedRandom';
type Area = 'counting' | 'probability' | 'integer' | 'geometry';
type Question = { area: Area; prompt: string; answer: string; options: string[]; explanation: string };
const labels: Record<Area, string> = { counting: '場合の数', probability: '確率', integer: '整数', geometry: '図形の性質' };
const areas: Area[] = ['counting', 'probability', 'integer', 'geometry'];
const questions: Question[] = [
  { area: 'counting', prompt: '同じものを含む並べ方を数えるときの基本方針は？', answer: '全体を階乗で数え重複を割る', options: ['全体を階乗で数え重複を割る', '順列で位置を先に決める', '組合せで選んでから並べる', '円順列として回転を同一視する'], explanation: '同じものの入れ替えを区別して数えた分を、それぞれの重複階乗で割ります。' },
  { area: 'probability', prompt: '「少なくとも1回起こる」確率を求める定石は？', answer: '余事象を使う', options: ['余事象を使う', '反復試行の公式を使う', '場合の数を直接数える', '条件付き確率に分ける'], explanation: '少なくとも1回は、1−（1回も起こらない確率）で求めると整理しやすくなります。' },
  { area: 'integer', prompt: '整数解の個数を調べる不定方程式で、最初に確認することは？', answer: '最大公約数による可解条件', options: ['最大公約数による可解条件', '合同式で余りを調べる', 'ユークリッドの互除法を使う', '正の解の範囲を先に絞る'], explanation: 'ax+by=c 型では gcd(a,b) が c を割り切るかを先に確認します。' },
  { area: 'geometry', prompt: '円に内接する四角形の角を扱う代表的な性質は？', answer: '対角の和が180度', options: ['対角の和が180度', '円周角の定理を使う', '接線と弦の定理を使う', '対角線の交点を調べる'], explanation: '円に内接する四角形では、向かい合う角の和が180度です。' },
];
export default function MathAMixedDrillPage() {
  const [mode, setMode] = useState<Area | 'all'>('all'); const [question, setQuestion] = useState(questions[0]); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false); const [queue] = useState(() => new BalancedRandom<Area>(areas));
  const next = (selected: Area | 'all' = mode) => { const area = selected === 'all' ? queue.next() : selected; setQuestion(questions.find(q => q.area === area)!); setAnswer(''); setChecked(false); };
  const correct = answer === question.answer;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学A 総合・解法選択ランダムドリル</h1><p className="text-gray-500 mt-1">分野を固定して反復することも、数学A全体から解法を判断することもできます。</p></div><section className="retro-box bg-gray-50 p-4 space-y-3"><label className="font-bold block">■ 演習モード</label><select value={mode} onChange={e => { const value = e.target.value as Area | 'all'; setMode(value); next(value); }} className="border p-2 bg-white"><option value="all">実戦練習：数学A 全体ランダム</option>{areas.map(area => <option key={area} value={area}>基礎練習：{labels[area]}だけ</option>)}</select></section><section className="retro-box bg-white p-5 space-y-5"><div className="font-bold text-blue-700">出題：{labels[question.area]}</div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div><div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}</section></main>;
}
