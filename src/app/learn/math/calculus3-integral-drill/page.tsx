"use client";

import { useState } from 'react';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'substitution' | 'parts' | 'rational' | 'trig' | 'radical';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; answer: number; hint: string; explanation: string };

const patterns: readonly Pattern[] = ['substitution', 'parts', 'rational', 'trig', 'radical'];
const variants = {
  substitution: new BalancedRandom([2, 3, 4, 5]),
  parts: new BalancedRandom([1, 2, 3]),
  rational: new BalancedRandom(Array.from({ length: 9 }, (_, index) => ({ a: Math.floor(index / 3) + 1, b: (index % 3) + 1 }))),
  trig: new BalancedRandom([3, 5, 7, 9]),
  radical: new BalancedRandom([1, 2, 3, 4, 5]),
};
const picker = new BalancedRandom(patterns);
const labels: Record<Pattern, string> = {
  substitution: '置換積分', parts: '部分積分', rational: '部分分数分解',
  trig: '三角関数の積分', radical: '平方根を含む積分',
};

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { displayMode: block, throwOnError: false }) }} />;
}

function generate(mode: Mode): Problem {
  const pattern = mode === 'mix' ? picker.next() : mode;
  const power = pattern === 'substitution' ? variants.substitution.next() : 2;
  const rate = pattern === 'parts' ? variants.parts.next() : 1;
  const { a: partialA, b: partialB } = pattern === 'rational' ? variants.rational.next() : { a: 1, b: 1 };
  const oddPower = pattern === 'trig' ? variants.trig.next() : 3;
  const upper = pattern === 'radical' ? variants.radical.next() : 1;
  const trigIntegral = Array.from({ length: (oddPower - 1) / 2 }, (_, index) => 2 * (index + 1) / (2 * (index + 1) + 1)).reduce((value, factor) => value * factor, 1);
  const problems: Record<Pattern, Problem> = {
    substitution: { pattern, expression: `\\int_0^1 2x(x^2+1)^{${power}}\\,dx`, answer: (2 ** (power + 1) - 1) / (power + 1), hint: '内側の式を u と置く', explanation: `u=x²+1 と置くと区間は1から2。積分値は (2^${power + 1}−1)/${power + 1}。` },
    parts: { pattern, expression: `\\int_0^1 x e^{${rate}x}\\,dx`, answer: (Math.exp(rate) * (rate - 1) + 1) / rate ** 2, hint: '多項式 × 指数関数', explanation: `部分積分で [xe^(${rate}x)/${rate}−e^(${rate}x)/${rate}²]₀¹。` },
    rational: { pattern, expression: `\\int_0^1 \\frac{${partialA + partialB}x+${2 * partialA + partialB}}{(x+1)(x+2)}\\,dx`, answer: partialA * Math.log(2) + partialB * Math.log(1.5), hint: '分母を一次式の積に分ける', explanation: `部分分数分解すると ${partialA}/(x+1)+${partialB}/(x+2)。積分値は ${partialA} ln 2 + ${partialB} ln(3/2)。` },
    trig: { pattern, expression: `\\int_0^{\\pi/2} \\sin^{${oddPower}} x\\,dx`, answer: trigIntegral, hint: 'sin x を1つ残して cos x に置換し、残りを整理', explanation: `sin の奇数乗を1つ残して置換するか、漸化式を使う。積分値は約 ${trigIntegral.toFixed(3)}。` },
    radical: { pattern, expression: `\\int_0^{${upper}} \\sqrt{x+1}\\,dx`, answer: (2 / 3) * ((upper + 1) ** 1.5 - 1), hint: 'ルートの中身を u と置く', explanation: `u=x+1 と置くと区間は1から${upper + 1}。積分値は (2/3)(${upper + 1}√${upper + 1}−1)。` },
  };
  return problems[pattern];
}

export default function Calculus3IntegralDrillPage() {
  const [mode, setMode] = useState<Mode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generate('mix'));
  const [strategy, setStrategy] = useState<Pattern | ''>('');
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (selectedMode = mode) => { setProblem(generate(selectedMode)); setStrategy(''); setAnswer(''); setChecked(false); };
  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const isCorrect = strategy === problem.pattern && Math.abs(Number(answer) - problem.answer) < 0.01;

  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 積分法・解法選択ドリル</h1>
    <p className="text-gray-500 mb-6">積分の式を見て、最初に選ぶべき解法を判断する練習です。基礎練習では解法を固定し、実戦練習では全パターンを混ぜます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span>
        <select value={mode} onChange={e => { const selectedMode = e.target.value as Mode; setMode(selectedMode); next(selectedMode); }} className="border p-1">
          <option value="mix">実戦練習：積分法 全パターンランダム</option>
          {patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}
        </select>
      </div>
      <div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} block /></div>
      <p className="text-center font-bold">最初に使う解法を選び、積分値を小数で入力しなさい。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setStrategy(p)} className={`retro-btn-classic ${strategy === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div>
      <input aria-label="積分値" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="積分値" className="retro-input mx-auto block w-40 text-center" />
      <div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div className={`p-3 border text-center font-bold ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{isCorrect ? '正解！' : `解法は「${labels[problem.pattern]}」、積分値は約 ${problem.answer.toFixed(3)} です。`}<div className="mt-2 font-normal text-slate-700"><MathEq math={problem.hint} />：{problem.explanation}</div></div>}
    </section>
  </main>;
}
