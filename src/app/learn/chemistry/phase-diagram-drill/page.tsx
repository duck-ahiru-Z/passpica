"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { generatePhaseProblem, phasePatternLabels, phasePatterns, type PhaseMode, type PhaseProblem } from '@/src/lib/phaseDiagramDrill';

const outcomes = [...new Set(phasePatterns.map(pattern => generatePhaseProblem(pattern).answer))];

export default function PhaseDiagramDrillPage() {
  const [mode, setMode] = useState<PhaseMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<PhaseProblem>(() => generatePhaseProblem('mix'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode: PhaseMode = mode) => {
    setProblem(generatePhaseProblem(selectedMode));
    setAnswer('');
    setChecked(false);
  };
  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer === problem.answer;
  return <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
      <Link href="/learn/chemistry/phase-diagram" className="text-blue-600 hover:underline">水・CO₂状態図ビジュアルへ →</Link>
    </div>
    <header>
      <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">化学 状態図・相変化の判断ドリル</h1>
      <p className="text-gray-600 mt-2">融解曲線の傾き、三重点、臨界点、1気圧での挙動を個別・混合で練習します。</p>
    </header>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="phase-mode" className="font-bold">演習モード</label>
        <select id="phase-mode" value={mode} onChange={event => {
          const selected = event.target.value as PhaseMode;
          setMode(selected);
          next(selected);
        }} className="border p-2 bg-white">
          <option value="mix">実戦練習：状態図 全パターンランダム</option>
          {phasePatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{phasePatternLabels[pattern]}だけ</option>)}
        </select>
      </div>
      <div className="bg-white border border-slate-300 p-6 text-center text-base md:text-lg font-bold">{problem.question}</div>
      <fieldset className="space-y-2">
        <legend className="w-full text-center font-bold">{mode === 'mix' ? '実戦練習：物質と状態図の条件から判断してください。' : `基礎練習：${phasePatternLabels[mode]}を反復します。`}</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {outcomes.map(outcome => <label key={outcome} className={`retro-btn-classic flex items-start gap-2 cursor-pointer ${answer === outcome ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
            <input type="radio" name="phase-answer" value={outcome} checked={answer === outcome} onChange={() => { setAnswer(outcome); setChecked(false); }} className="accent-blue-600 mt-0.5" />{outcome}
          </label>)}
        </div>
      </fieldset>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => setChecked(true)} disabled={!answer} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
        <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
      </div>
      {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
        {correct ? '正解！' : `正解は「${problem.answer}」です。`}<p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
        <Link href="/learn/chemistry/phase-diagram" className="inline-block mt-2 text-blue-700 underline">相図の曲線・代表値を図で確認する</Link>
      </div>}
    </section>
  </main>;
}
