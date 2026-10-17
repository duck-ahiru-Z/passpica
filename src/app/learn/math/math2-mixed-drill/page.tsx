"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { generateMath2Question, math2Areas, math2Labels, type Math2Mode } from '@/src/lib/math2MixedQuestions';

export default function Math2MixedDrillPage() {
  const [mode, setMode] = useState<Math2Mode>('all');
  const [question, setQuestion] = useClientGeneratedState(() => generateMath2Question('all'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: Math2Mode = mode) => { setQuestion(generateMath2Question(selectedMode)); setAnswer(''); setChecked(false); };
  if (!question) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer === question.answer;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学II 総合・解法選択ランダムドリル</h1><p className="text-gray-500 mt-1">微積分・三角関数・指数対数・図形と方程式の多様な問題から、解法を見分ける練習です。分野別の基礎練習も選べます。</p></div>
    <section className="retro-box bg-gray-50 p-4 space-y-3"><label htmlFor="math2-mode" className="font-bold block">■ 演習モード</label><select id="math2-mode" value={mode} onChange={event => { const selectedMode = event.target.value as Math2Mode; setMode(selectedMode); next(selectedMode); }} className="border p-2 bg-white"><option value="all">実戦練習：数学II 全体ランダム</option>{math2Areas.map(area => <option key={area} value={area}>基礎練習：{math2Labels[area]}だけ</option>)}</select></section>
    <section className="retro-box bg-white p-5 space-y-5"><div className="font-bold text-blue-700">出題：{math2Labels[question.area]}</div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div><div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} type="button" onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}</section>
  </main>;
}
