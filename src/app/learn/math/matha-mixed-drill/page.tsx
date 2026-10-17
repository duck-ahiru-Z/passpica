'use client';
import { useState } from 'react';
import Link from 'next/link';
import { generateMathAQuestion, mathAAreas, mathALabels, type MathAMode } from '@/src/lib/mathAMixedQuestions';

export default function MathAMixedDrillPage() {
  const [mode, setMode] = useState<MathAMode>('all');
  const [question, setQuestion] = useState(() => generateMathAQuestion('all'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selected: MathAMode = mode) => { setQuestion(generateMathAQuestion(selected)); setAnswer(''); setChecked(false); };
  const correct = answer === question.answer;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学A 総合・解法選択ランダムドリル</h1><p className="text-gray-500 mt-1">分野を固定して反復することも、数学A全体から解法を判断することもできます。</p></div><section className="retro-box bg-gray-50 p-4 space-y-3"><label htmlFor="math-a-mode" className="font-bold block">■ 演習モード</label><select id="math-a-mode" value={mode} onChange={e => { const value = e.target.value as MathAMode; setMode(value); next(value); }} className="border p-2 bg-white"><option value="all">実戦練習：数学A 全体ランダム</option>{mathAAreas.map(area => <option key={area} value={area}>基礎練習：{mathALabels[area]}だけ</option>)}</select></section><section className="retro-box bg-white p-5 space-y-5"><div className="font-bold text-blue-700">出題：{mathALabels[question.area]}</div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div><div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}</section></main>;
}
