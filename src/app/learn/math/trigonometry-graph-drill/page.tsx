'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import {
  createTrigGraphProblemPicker,
  isTrigGraphAnswerCorrect,
  isTrigGraphStrategyValid,
  trigGraphLabels,
  trigGraphPatterns,
  type TrigGraphMode,
  type TrigGraphPattern,
  type TrigGraphProblem,
} from '@/src/lib/trigonometryGraphDrill';

export default function TrigonometryGraphDrillPage() {
  const picker = useRef<ReturnType<typeof createTrigGraphProblemPicker> | null>(null);
  if (picker.current == null) { picker.current = createTrigGraphProblemPicker(); }
  const [mode, setMode] = useState<TrigGraphMode>('mix');
  const [problem, setProblem] = useClientGeneratedState<TrigGraphProblem>(() => picker.current!.next('mix'));
  const [strategy, setStrategy] = useState<TrigGraphPattern | ''>('');
  const [answers, setAnswers] = useState<{ problem: TrigGraphProblem | null; values: string[] }>({ problem: null, values: [] });
  const [checked, setChecked] = useState(false);

  const next = (nextMode: TrigGraphMode = mode) => {
    const nextProblem = picker.current!.next(nextMode);
    setProblem(nextProblem);
    setAnswers({ problem: nextProblem, values: nextProblem.answers.map(() => '') });
    setStrategy(nextMode === 'mix' ? '' : nextMode);
    setChecked(false);
  };

  if (!problem) return <main className="max-w-3xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const answerValues = answers.problem === problem ? answers.values : problem.answers.map(() => '');
  const strategyCorrect = mode !== 'mix' || isTrigGraphStrategyValid(problem, strategy);
  const answerCorrect = isTrigGraphAnswerCorrect(problem, answerValues);
  const correct = strategyCorrect && answerCorrect;
  const answersText = problem.answers.map((answer, index) => `${problem.answerLabels[index]} ${answer.toFixed(2)}${problem.unit}`).join('、');

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
        <Link href="/learn/math/trigonometry-graph" className="text-blue-600 hover:underline">三角関数グラフのビジュアルへ →</Link>
      </div>
      <header>
        <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2">数学II 三角関数グラフ・解法選択ドリル</h1>
        <p className="text-gray-600 mt-2">振幅・周期・平行移動・値域・tanの漸近線を個別に練習し、実戦では式を見て解法を選びます。</p>
      </header>

      <section className="retro-box space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="trig-graph-mode" className="font-bold">演習モード</label>
          <select id="trig-graph-mode" value={mode} onChange={event => {
            const selectedMode = event.target.value as TrigGraphMode;
            setMode(selectedMode);
            next(selectedMode);
          }} className="border p-2 bg-white">
            <option value="mix">実戦練習：三角関数グラフ 全パターンランダム</option>
            {trigGraphPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{trigGraphLabels[pattern]}だけ</option>)}
          </select>
        </div>

        <div className="bg-white border border-slate-300 p-5 text-center space-y-3">
          <p className="text-xs text-slate-500">問題の関数</p>
          <p className="font-mono text-xl font-bold" aria-label={`関数 ${problem.expression}`}>{problem.expression}</p>
          <p className="font-bold">{problem.question}</p>
        </div>

        {mode === 'mix' ? (
          <fieldset className="space-y-2">
            <legend className="w-full text-center font-bold">実戦練習：最初に調べる性質を選んでください。</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {trigGraphPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${strategy === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
                <input type="radio" name="trig-graph-strategy" value={pattern} checked={strategy === pattern} onChange={() => { setStrategy(pattern); setChecked(false); }} className="accent-blue-600" />
                {trigGraphLabels[pattern]}
              </label>)}
            </div>
          </fieldset>
        ) : <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{trigGraphLabels[mode]}に固定して反復します。</p>}

        <div className={`grid ${problem.answers.length === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
          {problem.answers.map((_, index) => <label key={problem.answerLabels[index]} className="block text-center font-bold">
            {problem.answerLabels[index]}{problem.unit ? `（${problem.unit}）` : ''}
            <input
              type="number"
              step="any"
              value={answerValues[index] ?? ''}
              aria-label={`答え：${problem.answerLabels[index]}`}
              onChange={event => {
                setAnswers(previous => ({
                  problem,
                  values: (previous.problem === problem ? previous.values : problem.answers.map(() => '')).map((answer, answerIndex) => answerIndex === index ? event.target.value : answer),
                }));
                setChecked(false);
              }}
              className="block w-full border p-2 mt-1 bg-white text-center font-normal"
            />
          </label>)}
        </div>

        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => setChecked(true)} disabled={!(answerValues.length === problem.answers.length && answerValues.every(answer => answer.trim() !== '') && (mode !== 'mix' || strategy !== ''))} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed">解答する</button>
          <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
        </div>

        {checked && <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
          {correct ? '正解！' : mode === 'mix' && !strategyCorrect ? `性質の選択が違います。正しい方法は「${trigGraphLabels[problem.pattern]}」です。答えは ${answersText}。` : `不正解。正しい答えは ${answersText}。`}
          <p className="mt-2 font-normal text-slate-700">{problem.explanation}</p>
          <Link href="/learn/math/trigonometry-graph" className="inline-block mt-2 text-blue-700 underline">グラフの変形をビジュアルで確認する</Link>
        </div>}
      </section>
    </main>
  );
}
