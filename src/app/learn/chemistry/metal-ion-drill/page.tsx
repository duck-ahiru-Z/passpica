"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { generateMetalIonProblem, metalIonLabels, metalIonPatterns, type MetalIonMode, type MetalIonProblem } from '@/src/lib/metalIonDrill';

const answerOptions = ['Ag⁺・Pb²⁺', 'Cu²⁺', 'Fe³⁺・Al³⁺', 'Zn²⁺', 'Ca²⁺', '炎色反応・黄色'];

export default function MetalIonDrillPage() {
  const [mode, setMode] = useState<MetalIonMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<MetalIonProblem>(() => generateMetalIonProblem('mix'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: MetalIonMode = mode) => {
    setProblem(generateMetalIonProblem(selectedMode));
    setAnswer('');
    setChecked(false);
  };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer === problem.answer;
  return <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
      <Link href="/learn/chemistry/metal-ion" className="text-blue-600 hover:underline">金属イオン分離ビジュアルへ →</Link>
    </div>
    <header>
      <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">化学 金属イオン系統分析ドリル</h1>
      <p className="text-gray-600 mt-2">各段階を固定して反復し、実戦では試薬と条件から沈殿・確認方法を選びます。</p>
    </header>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="metal-ion-mode" className="font-bold">演習モード</label>
        <select id="metal-ion-mode" value={mode} onChange={event => {
          const selected = event.target.value as MetalIonMode;
          setMode(selected);
          next(selected);
        }} className="border p-2 bg-white">
          <option value="mix">実戦練習：金属イオン系統分析 全パターンランダム</option>
          {metalIonPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{metalIonLabels[pattern]}だけ</option>)}
        </select>
      </div>
      <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">{problem.prompt}</div>
      <fieldset className="space-y-2">
        <legend className="w-full text-center font-bold">{mode === 'mix' ? '実戦練習：分離段階に合う結果を選んでください。' : `基礎練習：${metalIonLabels[mode]}を反復します。`}</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {answerOptions.map(option => <label key={option} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
            <input type="radio" name="metal-ion-answer" value={option} checked={answer === option} onChange={() => { setAnswer(option); setChecked(false); }} className="accent-blue-600" />{option}
          </label>)}
        </div>
      </fieldset>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => setChecked(true)} disabled={!answer} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
        <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
      </div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
        {correct ? '正解！' : `正解は「${problem.answer}」です。`}<p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
        <Link href="/learn/chemistry/metal-ion" className="inline-block mt-2 text-blue-700 underline">分離フロー図で順番を確認する</Link>
      </div>}
    </section>
  </main>;
}
