"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { generateOrganicSeparationProblem, organicSeparationLabels, organicSeparationPatterns, type OrganicSeparationMode, type OrganicSeparationProblem } from '@/src/lib/organicSeparationDrill';

const choices = ['アニリン', '安息香酸', 'フェノール', 'ニトロベンゼン'];

export default function OrganicSeparationDrillPage() {
  const [mode, setMode] = useState<OrganicSeparationMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<OrganicSeparationProblem>(() => generateOrganicSeparationProblem('mix'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: OrganicSeparationMode = mode) => {
    setProblem(generateOrganicSeparationProblem(selectedMode));
    setAnswer('');
    setChecked(false);
  };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer === problem.answer;
  return <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
      <Link href="/learn/chemistry/organic-separation" className="text-blue-600 hover:underline">有機分離シミュレーターへ →</Link>
    </div>
    <header>
      <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">化学 有機化合物の分離・判断ドリル</h1>
      <p className="text-gray-600 mt-2">酸・塩基の強さから試薬を選び、どの物質が水層へ移るか判断します。</p>
    </header>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="organic-separation-mode" className="font-bold">演習モード</label>
        <select id="organic-separation-mode" value={mode} onChange={event => {
          const selected = event.target.value as OrganicSeparationMode;
          setMode(selected);
          next(selected);
        }} className="border p-2 bg-white">
          <option value="mix">実戦練習：有機化合物の分離 全パターンランダム</option>
          {organicSeparationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{organicSeparationLabels[pattern]}だけ</option>)}
        </select>
      </div>
      <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">{problem.prompt}</div>
      <fieldset className="space-y-2">
        <legend className="w-full text-center font-bold">{mode === 'mix' ? '実戦練習：試薬と酸・塩基の性質から移動する物質を判断してください。' : `基礎練習：${organicSeparationLabels[mode]}を反復します。`}</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {choices.map(choice => <label key={choice} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${answer === choice ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
            <input type="radio" name="organic-separation-answer" value={choice} checked={answer === choice} onChange={() => { setAnswer(choice); setChecked(false); }} className="accent-blue-600" />{choice}
          </label>)}
        </div>
      </fieldset>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => setChecked(true)} disabled={!answer} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
        <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
      </div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
        {correct ? '正解！' : `正解は「${problem.answer}」です。`}<p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
        <Link href="/learn/chemistry/organic-separation" className="inline-block mt-2 text-blue-700 underline">分液漏斗の図で層の移動を確認する</Link>
      </div>}
    </section>
  </main>;
}
