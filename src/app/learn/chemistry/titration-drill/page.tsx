"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  generateTitrationProblem, isTitrationAnswerCorrect, titrationLabels, titrationPatterns,
  type TitrationMode, type TitrationPattern,
} from '@/src/lib/chemistryTitration';

export default function TitrationDrillPage() {
  const [mode, setMode] = useState<TitrationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateTitrationProblem('mix'));
  const [method, setMethod] = useState<TitrationPattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const next = (selectedMode: TitrationMode = mode) => {
    setProblem(generateTitrationProblem(selectedMode));
    setMethod(selectedMode === 'mix' ? '' : selectedMode);
    setAnswer('');
    setChecked(false);
  };
  const correct = problem !== null && method === problem.pattern && isTitrationAnswerCorrect(answer, problem.answer);

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-sm">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">化学 中和滴定・濃度計算ドリル</h1>
    <p className="text-gray-600 mb-6">中和点での物質量比を反応式の係数から判断します。価数ごとの基礎練習と、解法を選ぶ全パターン混合を切り替えられます。</p>
    <div className="mb-4 flex flex-wrap gap-2"><Link href="/learn/chemistry/titration-visual" className="retro-btn-classic inline-flex">中和点とpH変化をビジュアルで確認 →</Link><Link href="/learn/chemistry/acid-base" className="retro-btn-classic inline-flex">酸塩基指示薬を確認 →</Link></div>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="titration-mode" className="font-bold">演習モード</label><select id="titration-mode" aria-label="中和滴定の演習パターン" value={mode} onChange={event => { const selected = event.target.value as TitrationMode; setMode(selected); next(selected); }} className="border p-2 bg-white"><option value="mix">実戦練習：中和滴定 全パターンランダム</option>{titrationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{titrationLabels[pattern]}だけ</option>)}</select></div>
      <div className="bg-white border p-6 md:p-8 text-center text-base md:text-lg font-bold leading-relaxed">{problem?.question ?? '問題を準備しています…'}</div>
      {mode === 'mix' ? <fieldset className="space-y-2"><legend className="font-bold">実戦練習：反応式の係数比を選んでから濃度を入力（小数第3位まで、許容誤差 ±0.0005）</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{titrationPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="titration-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600" />{titrationLabels[pattern]}</label>)}</div></fieldset> : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{titrationLabels[mode]}に固定して反復します。</p>}
      {mode !== 'mix' && <p className="text-center text-slate-600">濃度は mol/L で、小数第3位まで入力してください（許容誤差 ±0.0005）。</p>}
      <div className="flex items-center justify-center gap-2"><label htmlFor="titration-answer" className="sr-only">酸のモル濃度</label><input id="titration-answer" aria-label="酸のモル濃度（小数第3位まで）" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値（小数第3位まで）" className="retro-input w-52 text-center" /><span className="font-bold">mol/L</span></div>
      <div className="flex justify-center gap-3"><button type="button" onClick={() => setChecked(true)} disabled={!problem || !method || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && problem && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `反応式の係数比は「${titrationLabels[problem.pattern]}」、正解は約 ${problem.answer.toFixed(3)} mol/L です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}
    </section>
  </main>;
}
