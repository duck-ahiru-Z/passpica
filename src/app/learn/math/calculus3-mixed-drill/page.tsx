'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { createCalculus3MixedQuestionPicker, type Calculus3MixedMode, type Calculus3Question } from '@/src/lib/calculus3MixedQuestions';

const picker = createCalculus3MixedQuestionPicker();

export default function Calculus3MixedDrillPage() {
  const [mode, setMode] = useState<Calculus3MixedMode>('all');
  const [question, setQuestion] = useClientGeneratedState<Calculus3Question>(() => picker.next());
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const next = (nextMode = mode) => {
    const nextQuestion = picker.next(nextMode);
    setQuestion(nextQuestion);
    setAnswer('');
    setChecked(false);
  };

  const chooseMode = (value: Calculus3MixedMode) => {
    setMode(value);
    next(value);
  };

  if (!question) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer === question.answer;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
      <div className="border-b border-gray-300 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">数学III 総合・解法選択ランダムドリル</h1>
        <p className="text-gray-500 mt-1">単元名を見て解くのではなく、問題の形から最初の方針を選ぶ実戦練習です。</p>
      </div>
      <section className="retro-box bg-gray-50 p-4 space-y-3">
        <label className="font-bold block">■ 出題範囲</label>
        <select value={mode} onChange={e => chooseMode(e.target.value as Calculus3MixedMode)} className="border p-2 bg-white">
          <option value="all">実戦練習：数学III 全体ランダム</option>
          <option value="limit">極限だけ</option>
          <option value="differentiation">微分法だけ</option>
          <option value="integral">積分法だけ</option>
          <option value="geometry">面積・体積だけ</option>
          <option value="differential-equation">微分方程式だけ</option>
        </select>
      </section>
      <section className="retro-box bg-white p-5 space-y-5">
        <div className="flex items-center justify-between gap-2"><span className="font-bold text-blue-700">{mode === 'all' ? '数学III・実戦問題' : `出題分野：${question.areaLabel}`}</span><span className="text-gray-500">方針を選択</span></div>
        <div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div>
        <div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div>
        <div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
        {checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}
      </section>
    </main>
  );
}
