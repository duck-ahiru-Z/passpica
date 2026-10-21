"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  flameMetalLabels, flameMetals, generateFlameReactionProblem,
  type FlameReactionMode, type FlameReactionProblem,
} from '@/src/lib/flameReactionDrill';

export default function FlameReactionDrillPage() {
  const [mode, setMode] = useState<FlameReactionMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<FlameReactionProblem>(() => generateFlameReactionProblem('mix'));
  const [color, setColor] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: FlameReactionMode = mode) => {
    setProblem(generateFlameReactionProblem(selectedMode));
    setColor('');
    setChecked(false);
  };

  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = color === problem.color;
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
        <Link href="/learn/chemistry/flame-reaction" className="text-blue-600 hover:underline">炎色反応ビジュアルへ →</Link>
      </div>
      <header>
        <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">化学 炎色反応・元素識別ドリル</h1>
        <p className="text-gray-600 mt-2">元素ごとの色を個別反復し、実戦モードでは元素を見て炎色を判断します。</p>
      </header>
      <section className="retro-box space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="flame-mode" className="font-bold">演習モード</label>
          <select id="flame-mode" value={mode} onChange={event => {
            const selectedMode = event.target.value as FlameReactionMode;
            setMode(selectedMode);
            next(selectedMode);
          }} className="border p-2 bg-white">
            <option value="mix">実戦練習：炎色反応 全元素ランダム</option>
            {flameMetals.map(metal => <option key={metal} value={metal}>基礎練習：{flameMetalLabels[metal]}だけ</option>)}
          </select>
        </div>
        <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">
          {problem.name}（{problem.formula}）の炎色反応は何色か。
        </div>
        <fieldset className="space-y-2">
          <legend className="w-full text-center font-bold">{mode === 'mix' ? '実戦練習：元素に対応する炎色を選んでください。' : `基礎練習：${flameMetalLabels[mode]}の色を反復します。`}</legend>
          <div className="grid sm:grid-cols-3 gap-2">
            {['赤色', '黄色', '赤紫色', '青緑色', '橙赤色', '黄緑色'].map(option => <label key={option} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${color === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
              <input type="radio" name="flame-color" value={option} checked={color === option} onChange={() => { setColor(option); setChecked(false); }} className="accent-blue-600" />
              {option}
            </label>)}
          </div>
        </fieldset>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setChecked(true)} disabled={!color} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
          <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
        </div>
        {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
          {correct ? '正解！' : `正解は「${problem.color}」です。`}
          <p className="mt-2 font-normal text-slate-700">{problem.mnemonic}。この炎色反応は{problem.color}です。ビジュアルで炎の色も確かめられます。</p>
          <Link href="/learn/chemistry/flame-reaction" className="inline-block mt-2 text-blue-700 underline">炎色反応シミュレーターで確認する</Link>
        </div>}
      </section>
    </main>
  );
}
