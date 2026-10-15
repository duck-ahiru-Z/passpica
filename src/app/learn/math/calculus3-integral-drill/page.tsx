"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'substitution' | 'parts' | 'rational' | 'trig' | 'radical';
type Mode = Pattern | 'mix';
type Problem = { pattern: Pattern; expression: string; hint: string; explanation: string };

const patterns: readonly Pattern[] = ['substitution', 'parts', 'rational', 'trig', 'radical'];
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
  const problems: Record<Pattern, Problem> = {
    substitution: { pattern, expression: '\\int 2x(x^2+1)^4\\,dx', hint: '内側の式を u と置く', explanation: 'u=x^2+1 と置けば du=2x dx。' },
    parts: { pattern, expression: '\\int x e^x\\,dx', hint: '多項式 × 指数関数', explanation: 'x を微分側、e^x を積分側に選ぶ部分積分。' },
    rational: { pattern, expression: '\\int \\frac{3x+5}{(x+1)(x+2)}\\,dx', hint: '分母を一次式の積に分ける', explanation: '部分分数分解して、それぞれの対数積分にする。' },
    trig: { pattern, expression: '\\int \\sin^3 x\\,dx', hint: 'sin x を1つ残して cos x に置換', explanation: 'sin^3 x=sin x(1-cos^2 x) と変形する。' },
    radical: { pattern, expression: '\\int \\sqrt{x+1}\\,dx', hint: 'ルートの中身を u と置く', explanation: 'u=x+1 と置き、u^{1/2} の積分に直す。' },
  };
  return problems[pattern];
}

export default function Calculus3IntegralDrillPage() {
  const [mode, setMode] = useState<Mode>('mix');
  const [problem, setProblem] = useState<Problem>(() => generate('mix'));
  const [answer, setAnswer] = useState<Pattern | ''>('');
  const [checked, setChecked] = useState(false);
  useEffect(() => { setProblem(generate(mode)); setAnswer(''); setChecked(false); }, [mode]);
  const next = () => { setProblem(generate(mode)); setAnswer(''); setChecked(false); };
  const isCorrect = answer === problem.pattern;

  return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
    <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
    <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">数学III 積分法・解法選択ドリル</h1>
    <p className="text-gray-500 mb-6">積分の式を見て、最初に選ぶべき解法を判断する練習です。基礎練習では解法を固定し、実戦練習では全パターンを混ぜます。</p>
    <section className="retro-box space-y-5">
      <div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span>
        <select value={mode} onChange={e => setMode(e.target.value as Mode)} className="border p-1">
          <option value="mix">実戦練習：積分法 全パターンランダム</option>
          {patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}
        </select>
      </div>
      <div className="bg-white border p-8 text-center text-2xl"><MathEq math={problem.expression} block /></div>
      <p className="text-center font-bold">最初に使う解法を選びなさい。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{patterns.map(p => <button key={p} onClick={() => setAnswer(p)} className={`retro-btn-classic ${answer === p ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{labels[p]}</button>)}</div>
      <div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={next} className="retro-btn-classic">次の問題へ ➔</button></div>
      {checked && <div className={`p-3 border text-center font-bold ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{isCorrect ? '正解！' : `正解は「${labels[problem.pattern]}」です。`}<div className="mt-2 font-normal text-slate-700"><MathEq math={problem.hint} />：{problem.explanation}</div></div>}
    </section>
  </main>;
}
