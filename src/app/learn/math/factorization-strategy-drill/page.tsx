'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BalancedRandom } from '@/src/lib/balancedRandom';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { factorizationLabels, factorizationPatterns, generateFactorizationQuestion, type FactorizationMode, type FactorizationPattern } from '@/src/lib/factorizationQuestions';

const mixedQuestions = new BalancedRandom(factorizationPatterns);
const labels: Record<FactorizationPattern, string> = factorizationLabels;
const initialMode: FactorizationMode = 'mix';

export default function FactorizationStrategyDrillPage() {
  const [mode, setMode] = useState<FactorizationMode>(initialMode);
  const [question, setQuestion] = useClientGeneratedState(() => generateFactorizationQuestion(mixedQuestions.next()));
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState(false);

  const next = (nextMode = mode) => {
    const chosen = nextMode === 'mix' ? mixedQuestions.next() : nextMode;
    setQuestion(generateFactorizationQuestion(chosen));
    setChoice('');
    setChecked(false);
  };

  if (!question) return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  return <main className="max-w-3xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-700 hover:underline">← 無限演習ポータルへ戻る</Link>
    <header className="border-b border-slate-300 pb-3"><div className="text-slate-500">数学I / 数と式 / 因数分解</div><h1 className="text-xl md:text-2xl font-bold">因数分解・解法選択ドリル</h1><p className="mt-2 text-slate-600">苦手な型を固定して練習し、慣れたら式の形から解法を選ぶ全パターンランダムへ。</p></header>
    <section className="retro-box bg-slate-50 p-4 space-y-3"><label htmlFor="factorization-mode" className="font-bold block">演習モード</label><select id="factorization-mode" value={mode} onChange={event => { const selected = event.target.value as FactorizationMode; setMode(selected); next(selected); }} className="border p-2 bg-white w-full"><option value="mix">実戦練習：因数分解 全パターンランダム</option>{factorizationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{labels[pattern]}だけ</option>)}</select></section>
    <section className="retro-box bg-white p-5 space-y-4"><div className="font-bold text-blue-700">式の形を見て、最初に使う解法を選びましょう</div><div className="border bg-slate-50 p-6 text-center text-xl font-bold" aria-label={`因数分解する式 ${question.expression}`}>{question.expression}</div><fieldset className="grid sm:grid-cols-2 gap-2"><legend className="sr-only">最初に使う解法を一つ選択</legend>{question.options.map(option => <label key={option} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${choice === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="factorization-strategy" value={option} checked={choice === option} onChange={() => { setChoice(option); setChecked(false); }} className="accent-blue-600" />{option}</label>)}</fieldset><div className="flex justify-center gap-2"><button type="button" onClick={() => setChecked(true)} disabled={!choice} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50">解法を確認</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${choice === question.answer ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>{choice === question.answer ? '正解！' : `着眼点は「${question.answer}」です。`}<p className="font-normal mt-2">{question.explanation}</p></div>}</section>
  </main>;
}
