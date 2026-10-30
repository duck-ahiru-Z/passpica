'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BalancedRandom } from '@/src/lib/balancedRandom';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { areFactorizationsEquivalent, factorizationLabels, factorizationPatterns, generateFactorizationQuestion, type FactorizationMode, type FactorizationPattern } from '@/src/lib/factorizationQuestions';

const mixedQuestions = new BalancedRandom(factorizationPatterns);
const labels: Record<FactorizationPattern, string> = factorizationLabels;
const initialMode: FactorizationMode = 'mix';

export default function FactorizationStrategyDrillPage() {
  const [mode, setMode] = useState<FactorizationMode>(initialMode);
  const [question, setQuestion] = useClientGeneratedState(() => generateFactorizationQuestion(mixedQuestions.next()));
  const [choice, setChoice] = useState('');
  const [factorAnswer, setFactorAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const next = (nextMode = mode) => {
    const chosen = nextMode === 'mix' ? mixedQuestions.next() : nextMode;
    setQuestion(generateFactorizationQuestion(chosen));
    setChoice('');
    setFactorAnswer('');
    setChecked(false);
  };

  if (!question) return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;
  const strategyCorrect = mode !== 'mix' || choice === question.answer;
  const factorizationCorrect = areFactorizationsEquivalent(factorAnswer, question.factorization);
  const correct = strategyCorrect && factorizationCorrect;

  return <main className="max-w-3xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
    <Link href="/drill" className="text-blue-700 hover:underline">← 無限演習ポータルへ戻る</Link>
    <header className="border-b border-slate-300 pb-3"><div className="text-slate-500">数学I / 数と式 / 因数分解</div><h1 className="text-xl md:text-2xl font-bold">因数分解・解法選択ドリル</h1><p className="mt-2 text-slate-600">苦手な型を固定して練習し、慣れたら式の形から解法を選び、因数分解を最後まで解きましょう。</p></header>
    <section className="retro-box bg-slate-50 p-4 space-y-3"><label htmlFor="factorization-mode" className="font-bold block">演習モード</label><select id="factorization-mode" value={mode} onChange={event => { const selected = event.target.value as FactorizationMode; setMode(selected); next(selected); }} className="border p-2 bg-white w-full"><option value="mix">実戦練習：因数分解 全パターンランダム</option>{factorizationPatterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{labels[pattern]}だけ</option>)}</select></section>
    <section className="retro-box bg-white p-5 space-y-4">
      <div className="font-bold text-blue-700">{mode === 'mix' ? '式の形から解法を選び、因数分解まで完成させましょう' : `基礎練習：${labels[mode]}の型で因数分解しましょう`}</div>
      <div className="border bg-slate-50 p-6 text-center text-xl font-bold" aria-label={`因数分解する式 ${question.expression}`}>{question.expression}</div>
      {mode === 'mix' && (
        <fieldset className="grid sm:grid-cols-2 gap-2">
          <legend className="sr-only">最初に使う解法を一つ選択</legend>
          {question.options.map(option => (
            <label key={option} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${choice === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>
              <input type="radio" name="factorization-strategy" value={option} checked={choice === option} onChange={() => { setChoice(option); setChecked(false); }} className="accent-blue-600" />{option}
            </label>
          ))}
        </fieldset>
      )}
      {mode !== 'mix' && <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">この問題は「{labels[mode]}」の型です。</p>}
      <div className="space-y-2">
        <label htmlFor="factorization-answer" className="block text-center font-semibold">因数の積の形で答えてください。</label>
        <input id="factorization-answer" aria-label="因数分解した式" value={factorAnswer} onChange={event => { setFactorAnswer(event.target.value); setChecked(false); }} placeholder="例：(x-3)(x+3)" className="retro-input block mx-auto w-full max-w-lg text-center" />
      </div>
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setChecked(true)} disabled={!factorAnswer.trim() || (mode === 'mix' && !choice)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold disabled:opacity-50">{mode === 'mix' ? '解法と答え合わせ' : '答え合わせ'}</button>
        <button type="button" onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button>
      </div>
      {checked && (
        <div role="status" aria-live="polite" className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
          {correct ? '正解！' : mode === 'mix' ? '確認しましょう。' : <>因数分解が違います。正解は {question.factorization} です。</>}
          {mode === 'mix' && (
            <div className="mt-2 space-y-1">
              <p>解法選択：{strategyCorrect ? `正解（${question.answer}）` : `不正解。着眼点は「${question.answer}」です。`}</p>
              <p>因数分解の式：{factorizationCorrect ? '正解です。' : `不正解。正しい因数分解は ${question.factorization} です。`}</p>
            </div>
          )}
          <p className="font-normal mt-2">{question.explanation}</p>
        </div>
      )}
    </section>
  </main>;
}
