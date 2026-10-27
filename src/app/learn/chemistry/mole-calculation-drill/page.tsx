"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import { formatMoleAnswer, generateMoleProblem, isMoleAnswerCorrect, moleLabels, molePatterns, type MoleMode, type MolePattern } from '@/src/lib/chemistryMoleCalculation';

type Pattern = MolePattern;

export default function MoleCalculationDrillPage() {
  const [mode, setMode] = useState<MoleMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateMoleProblem('mix'));
  const [method, setMethod] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: MoleMode = mode) => { setProblem(generateMoleProblem(selectedMode)); setMethod(selectedMode === 'mix' ? '' : selectedMode); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = method === problem.pattern && isMoleAnswerCorrect(answer, problem.answer);

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">化学 物質量・反応計算ドリル</h1>
    <p className="text-gray-500 mb-6">問題の条件から計算方法を選び、数値まで求めます。各分類だけの基礎練習と、全分類から出る実戦練習を切り替えられます。</p>
    <Link href="/learn/chemistry/mole-concept-visual" className="retro-btn-classic inline-flex mb-2">mol と粒子数・質量・気体体積の関係をビジュアルで確認 →</Link>
    <Link href="/learn/chemistry/concentration-visual" className="retro-btn-classic inline-flex mb-4">モル濃度・希釈をビジュアルで確認 →</Link>
    <Link href="/learn/chemistry/acid-base" className="retro-btn-classic inline-flex mb-4">pHスケールと指示薬の色をビジュアルで確認 →</Link>
    <Link href="/learn/chemistry/stoichiometry-visual" className="retro-btn-classic inline-flex mb-4">制限試薬・過剰試薬をビジュアルで確認 →</Link>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="mole-mode" className="font-bold">演習モード</label><select id="mole-mode" value={mode} onChange={event => { const selected = event.target.value as MoleMode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：化学計算 全パターンランダム</option>{molePatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{moleLabels[pattern]}だけ</option>)}</select></div>
      <div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div>
      {mode === 'mix' ? <fieldset className="space-y-2"><legend className="w-full text-center font-bold">実戦練習：最初に使う計算方法を一つ選び、答えを入力しなさい。</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{molePatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="mole-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600" />{moleLabels[pattern]}</label>)}</div></fieldset> : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{moleLabels[mode]}に固定して繰り返します。</p>}
      <div className="text-center"><div className="flex items-center justify-center gap-2"><input aria-label="計算結果（小数第6位まで）" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値（小数第6位まで）" className="retro-input w-52 text-center" />{problem.unit && <span className="font-bold" aria-label={`単位 ${problem.unit}`}>{problem.unit}</span>}</div><p className="mt-1 text-xs text-slate-500">答えは小数第6位まで入力してください（それより細かい場合は四捨五入）。</p></div>
      <div className="flex justify-center gap-3"><button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `計算方法は「${moleLabels[problem.pattern]}」、正解は ${formatMoleAnswer(problem.answer)}${problem.unit ? ` ${problem.unit}` : ''} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}
    </section>
  </main>;
}
