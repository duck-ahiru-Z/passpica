"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import { generateInformationProblem, informationModeLabels, informationModes, informationStrategies, informationStrategyLabels, isInformationAnswerCorrect, type InformationMode, type InformationStrategy } from '@/src/lib/informationCalculation';

export default function InformationCalculationDrillPage() {
  const [mode, setMode] = useState<InformationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateInformationProblem('mix'));
  const [method, setMethod] = useState<InformationStrategy | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: InformationMode = mode) => {
    setProblem(generateInformationProblem(selectedMode));
    setMethod(selectedMode === 'mix' ? '' : selectedMode.startsWith('logic:') ? selectedMode.slice('logic:'.length) as InformationStrategy : selectedMode as InformationStrategy);
    setAnswer(''); setChecked(false);
  };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer.trim() !== '' && (mode !== 'mix' || method === problem.strategy) && isInformationAnswerCorrect(problem.pattern, answer, problem.answer);

  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <Link href="/learn/information/pcm-sampling-visual" className="ml-4 text-blue-600 hover:underline">PCM標本化ビジュアルへ →</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">情報I 計算・処理ドリル</h1>
    <p className="text-gray-500 mb-6">問題の形から処理方法を選び、計算結果まで答える練習です。分類別の基礎練習と全パターンランダムを切り替えられます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="information-mode" className="font-bold">演習モード</label><select id="information-mode" value={mode} onChange={event => { const selected = event.target.value as InformationMode; setMode(selected); next(selected); }} className="border p-1"><option value="mix">実戦練習：情報計算 全パターンランダム</option><optgroup label="基礎練習：分野別">{informationModes.filter(value => !value.startsWith('logic:')).map(value => <option key={value} value={value}>基礎練習：{informationModeLabels[value]}だけ</option>)}</optgroup><optgroup label="基礎練習：論理演算別">{informationModes.filter(value => value.startsWith('logic:')).map(value => <option key={value} value={value}>基礎練習：{informationModeLabels[value]}だけ</option>)}</optgroup></select></div>
      <div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div>
      {mode === 'mix' ? <fieldset className="space-y-2"><legend className="w-full text-center font-bold">実戦練習：最初に使う処理方法を一つ選び、答えを入力しなさい。</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{informationStrategies.map(strategy => <label key={strategy} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${method === strategy ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="information-method" value={strategy} checked={method === strategy} onChange={() => { setMethod(strategy); setChecked(false); }} className="accent-blue-600" />{informationStrategyLabels[strategy]}</label>)}</div></fieldset> : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{informationModeLabels[mode]}に固定して繰り返します。</p>}
      <div className="flex items-center justify-center gap-2"><input aria-label="計算結果" value={answer} onChange={event => { setAnswer(event.target.value); setChecked(false); }} placeholder="答え" className="retro-input w-48 text-center" />{problem.unit && <span aria-label="答えの単位" className="font-bold">{problem.unit}</span>}</div>
      <div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} disabled={!method || answer.trim() === ''} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `処理方法は「${informationStrategyLabels[problem.strategy]}」、正解は ${problem.answer}${problem.unit ? ` ${problem.unit}` : ''} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}
    </section>
  </main>;
}
