"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  createOrganicStructureProblemPicker,
  organicStructureLabels,
  organicStructurePatterns,
  type OrganicStructureMode,
} from '@/src/lib/organicStructureDrill';

export default function OrganicStructureDrillPage() {
  const pickerRef = useRef<ReturnType<typeof createOrganicStructureProblemPicker> | null>(null);
  if (pickerRef.current === null) pickerRef.current = createOrganicStructureProblemPicker();
  const makeProblem = pickerRef.current;
  const [mode, setMode] = useState<OrganicStructureMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => makeProblem('mix'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const next = (selectedMode: OrganicStructureMode = mode) => {
    setProblem(makeProblem(selectedMode));
    setAnswer('');
    setChecked(false);
  };

  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;

  const correct = answer === problem.answer;
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
        <Link href="/learn/chemistry/organic-3d" className="text-blue-600 hover:underline">有機3D分子モデルで確認 →</Link>
      </div>
      <header>
        <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">有機化学・立体構造の解法選択ドリル</h1>
        <p className="text-gray-600 mt-2">分子の形、混成軌道、配座、幾何異性の特徴を個別に練習し、慣れたら全パターンのランダム問題で判断力を確認します。</p>
      </header>
      <section className="retro-box space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="organic-structure-mode" className="font-bold">演習モード</label>
          <select
            id="organic-structure-mode"
            value={mode}
            onChange={event => {
              const selected = event.target.value as OrganicStructureMode;
              setMode(selected);
              next(selected);
            }}
            className="border p-2 bg-white"
          >
            <option value="mix">実戦練習：有機立体構造 全パターンランダム</option>
            {organicStructurePatterns.map(pattern => (
              <option key={pattern} value={pattern}>基礎練習：{organicStructureLabels[pattern]}だけ</option>
            ))}
          </select>
        </div>
        <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">{problem.prompt}</div>
        <fieldset className="space-y-2">
          <legend className="w-full text-center font-bold">
            {mode === 'mix' ? '実戦練習：分子の形や条件から正しい説明を選びましょう。' : `基礎練習：${organicStructureLabels[mode]}を反復します。`}
          </legend>
          <div className="space-y-2">
            {problem.choices.map((choice, index) => (
              <label key={choice} className={`retro-btn-classic flex items-start gap-3 cursor-pointer ${answer === choice ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
                <input
                  type="radio"
                  name="organic-structure-answer"
                  value={choice}
                  checked={answer === choice}
                  onChange={() => { setAnswer(choice); setChecked(false); }}
                  className="mt-1 accent-blue-600"
                />
                <span><span className="mr-2">{['ア', 'イ', 'ウ'][index]}</span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setChecked(true)} disabled={!answer} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
          <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
        </div>
        {checked && (
          <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
            {correct ? '正解！' : `正解は「${problem.answer}」です。`}
            <p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
            <Link href="/learn/chemistry/organic-3d" className="inline-block mt-2 text-blue-700 underline">3Dモデルを回転して立体構造を確認する</Link>
          </div>
        )}
      </section>
    </main>
  );
}
