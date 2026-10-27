"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import { formatMotionAnswer, generateMotionProblem, getMotionExplanation, isMotionMethodValid, motionLabels, motionPatterns, type MotionMode, type MotionPattern } from '@/src/lib/physicsMotionCalculation';

type Pattern = MotionPattern;

export default function MotionCalculationDrillPage() {
  const [mode, setMode] = useState<MotionMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateMotionProblem('mix'));
  const [method, setMethod] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: MotionMode = mode) => { setProblem(generateMotionProblem(selectedMode)); setMethod(selectedMode === 'mix' ? '' : selectedMode); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const numericAnswer = Number(answer);
  const displayedAnswer = Number(formatMotionAnswer(problem.answer));
  const correct = answer.trim() !== '' && Number.isFinite(numericAnswer) && isMotionMethodValid(problem, method) && Math.abs(numericAnswer - displayedAnswer) < 1e-9;

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-sm">
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
      <Link href="/learn/physics/motion-visual" className="text-blue-600 hover:underline">等加速度運動ビジュアルへ →</Link>
      <Link href="/learn/physics/spring-visual" className="text-blue-600 hover:underline">ばねの弾性力ビジュアルへ →</Link>
      <Link href="/learn/physics/simple-harmonic-visual" className="text-blue-600 hover:underline">単振動ビジュアルへ →</Link>
      <Link href="/learn/physics/projectile-visual" className="text-blue-600 hover:underline">投射運動ビジュアルへ →</Link>
      <Link href="/learn/physics/impulse-momentum-visual" className="text-blue-600 hover:underline">力積と運動量変化のビジュアルへ →</Link>
    </div>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">物理 力学・計算ドリル</h1>
    <p className="text-gray-500 mb-6">問題の条件から使う公式を選び、数値まで計算します。公式別の基礎練習と、全パターンを混ぜた実戦練習を切り替えられます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="motion-mode" className="font-bold">演習モード</label><select id="motion-mode" value={mode} onChange={event => { const selectedMode = event.target.value as MotionMode; setMode(selectedMode); next(selectedMode); }} className="border p-1"><option value="mix">実戦練習：力学 全パターンランダム</option>{motionPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{motionLabels[pattern]}だけ</option>)}</select></div>
      <div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div>
      {mode === 'mix' ? <fieldset className="space-y-2"><legend className="w-full text-center font-bold">実戦練習：最初に使う公式を一つ選び、数値を入力しなさい。</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{motionPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="motion-method" value={pattern} checked={method === pattern} onChange={() => { setMethod(pattern); setChecked(false); }} className="accent-blue-600" />{motionLabels[pattern]}</label>)}</div></fieldset> : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{motionLabels[mode]}に固定して繰り返します。</p>}
      <div className="text-center"><input aria-label="計算結果" inputMode="decimal" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="数値（小数は第6位まで）" className="retro-input w-48 text-center" /><span className="ml-2 font-bold" aria-label={`単位 ${problem.unit}`}>{problem.unit}</span><p className="mt-1 text-xs text-slate-500">小数の答えは小数第6位まで入力できます。</p></div>
      <div className="flex justify-center gap-3"><button type="button" onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `使う公式は「${motionLabels[problem.pattern]}」、正解は ${formatMotionAnswer(problem.answer)} ${problem.unit} です。`}<div className="mt-2 font-normal text-slate-700">{correct ? getMotionExplanation(problem, method) : problem.explanation}</div></div>}
    </section>
  </main>;
}
