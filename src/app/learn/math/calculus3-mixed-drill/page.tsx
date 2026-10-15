'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Area = 'limit' | 'differentiation' | 'integral' | 'geometry' | 'differential-equation';
type Question = { area: Area; areaLabel: string; prompt: string; options: string[]; answer: string; explanation: string };

const questions: Question[] = [
  { area: 'limit', areaLabel: '極限', prompt: 'lim x→0 (sin x / x) を考えるとき、中心となる見方は？', options: ['基本極限・はさみうち', '最高次の項を比較', 'テイラー展開', '連続性から代入'], answer: '基本極限・はさみうち', explanation: 'sin x / x の基本極限を軸に、必要なら不等式ではさんで極限値を確定します。' },
  { area: 'limit', areaLabel: '極限', prompt: 'lim x→∞ (3x²−1)/(x²+2) の方針は？', options: ['最高次の項を比較', '基本極限を利用', '有理化', 'はさみうち'], answer: '最高次の項を比較', explanation: '分子・分母を x² で割ると、最高次係数の比 3 が残ります。' },
  { area: 'differentiation', areaLabel: '微分法', prompt: 'y = log(sin x) を微分するとき、最初に意識する方法は？', options: ['合成関数の微分', '積の微分', '商の微分', '媒介変数表示の微分'], answer: '合成関数の微分', explanation: '外側の log と内側の sin x を分け、(log u)ʼ = uʼ/u を使います。' },
  { area: 'differentiation', areaLabel: '微分法', prompt: 'x = t², y = t³ の dy/dx を求める方法は？', options: ['媒介変数表示の微分', '合成関数の微分', '対数微分', '陰関数の微分'], answer: '媒介変数表示の微分', explanation: 'dx/dt と dy/dt を求め、dy/dx = (dy/dt)/(dx/dt) とします。' },
  { area: 'integral', areaLabel: '積分法', prompt: '∫ x cos(x²) dx に最初に試す方法は？', options: ['置換積分', '部分積分', '部分分数分解', '三角関数の積分公式'], answer: '置換積分', explanation: 'u = x² と置けば du = 2x dx となり、積分が直接簡単になります。' },
  { area: 'integral', areaLabel: '積分法', prompt: '∫ x eˣ dx に最初に試す方法は？', options: ['部分積分', '置換積分', '部分分数分解', '三角関数の積分公式'], answer: '部分積分', explanation: '多項式 x と eˣ の積なので、部分積分で x の次数を下げます。' },
  { area: 'geometry', areaLabel: '面積・体積', prompt: '曲線 y=f(x) と x軸で囲まれた領域を y軸のまわりに回転する体積は？', options: ['円筒殻法を検討', '断面積を積分', '上下関係と交点を確認', '媒介変数で曲線を追う'], answer: '円筒殻法を検討', explanation: 'x を半径とする薄い円筒殻を考えると、2πx・高さ・dx の形で立式できます。' },
  { area: 'geometry', areaLabel: '面積・体積', prompt: '2曲線の間の面積を求める最初の確認は？', options: ['上下関係と交点', '円筒殻法', '断面積の積分', '曲線の長さの公式'], answer: '上下関係と交点', explanation: '交点で積分区間を決め、上の関数−下の関数を積分します。' },
  { area: 'differential-equation', areaLabel: '微分方程式', prompt: 'dy/dx = 3x²y の一般解を求める最初の方針は？', options: ['変数分離', '初期条件を先に代入', '両辺をそのまま積分', '速度と位置の関係を使う'], answer: '変数分離', explanation: 'y≠0 の範囲で dy/y = 3x²dx と変形し、両辺を積分します。' },
  { area: 'differential-equation', areaLabel: '微分方程式', prompt: '速度 v(t) が与えられ、初期位置も指定されているとき位置を求める方法は？', options: ['速度を積分して初期条件を使う', '変数分離', '初期条件を使わず定数を0にする', '加速度をもう一度微分する'], answer: '速度を積分して初期条件を使う', explanation: '位置の導関数が速度なので、v(t) を積分して積分定数を初期位置で決めます。' },
];

const areaOrder: Area[] = ['limit', 'differentiation', 'integral', 'geometry', 'differential-equation'];
const picker = new BalancedRandom<Question>(questions);
const areaPickers = new Map(areaOrder.map(area => [area, new BalancedRandom(questions.filter(q => q.area === area))]));

export default function Calculus3MixedDrillPage() {
  const [mode, setMode] = useState<'all' | Area>('all');
  const [question, setQuestion] = useState<Question>(questions[0]);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const next = (nextMode = mode) => {
    const nextQuestion = nextMode === 'all' ? picker.next() : areaPickers.get(nextMode)?.next() ?? picker.next();
    setQuestion(nextQuestion);
    setAnswer('');
    setChecked(false);
  };

  const chooseMode = (value: 'all' | Area) => {
    setMode(value);
    next(value);
  };

  const correct = answer === question.answer;

  useEffect(() => { next('all'); }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link>
      <div className="border-b border-gray-300 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">数学III 総合・解法選択ランダムドリル</h1>
        <p className="text-gray-500 mt-1">単元名を見て解くのではなく、問題の形から最初の方針を選ぶ実戦練習です。</p>
      </div>
      <section className="retro-box bg-gray-50 p-4 space-y-3">
        <label className="font-bold block">■ 出題範囲</label>
        <select value={mode} onChange={e => chooseMode(e.target.value as 'all' | Area)} className="border p-2 bg-white">
          <option value="all">実戦練習：数学III 全体ランダム</option>
          <option value="limit">極限だけ</option>
          <option value="differentiation">微分法だけ</option>
          <option value="integral">積分法だけ</option>
          <option value="geometry">面積・体積だけ</option>
          <option value="differential-equation">微分方程式だけ</option>
        </select>
      </section>
      <section className="retro-box bg-white p-5 space-y-5">
        <div className="flex items-center justify-between gap-2"><span className="font-bold text-blue-700">出題分野：{question.areaLabel}</span><span className="text-gray-500">方針を選択</span></div>
        <div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div>
        <div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div>
        <div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>
        {checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}
      </section>
    </main>
  );
}
