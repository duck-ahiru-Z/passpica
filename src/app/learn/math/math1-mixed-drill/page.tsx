'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BalancedRandom } from '@/src/lib/balancedRandom';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

type Area = 'expression' | 'quadratic' | 'trigonometry' | 'probability';
type Question = { area: Area; label: string; prompt: string; options: string[]; answer: string; explanation: string };
const labels: Record<Area, string> = { expression: '数と式', quadratic: '二次関数', trigonometry: '三角比', probability: '確率' };
const questions: Question[] = [
  { area: 'expression', label: '数と式', prompt: '二重根号 √(7+4√3) を外すとき、最初に考える形は？', options: ['(√a+√b)²', '(√a−√b)²', '共通因数でくくる', '有理化して分母を消す'], answer: '(√a+√b)²', explanation: 'a+b=7、2√ab=4√3 となる平方の形を探します。' },
  { area: 'quadratic', label: '二次関数', prompt: '定義域が指定された二次関数の最大・最小を調べる最初の確認は？', options: ['頂点と定義域の位置', '端点の値だけを比較', '軸の左右で場合分け', '平方完成してから判別式'], answer: '頂点と定義域の位置', explanation: '軸・頂点が定義域の内側にあるか、端点の値はいくつかを確認します。' },
  { area: 'trigonometry', label: '三角比', prompt: '3辺が与えられた三角形で角を求めるとき、まず使う公式は？', options: ['余弦定理', '正弦定理', '三角形の面積公式', '相互関係 sin²θ+cos²θ=1'], answer: '余弦定理', explanation: '2辺とその間の角、または3辺の関係から角を求めるには余弦定理を使います。' },
  { area: 'probability', label: '確率', prompt: '「少なくとも1回成功」の確率を求めるときの定石は？', options: ['余事象を使う', '場合の数を直接数える', '条件付き確率に分ける', '反復試行の公式を使う'], answer: '余事象を使う', explanation: '1回も成功しない確率を求めて1から引くと計算が簡単になります。' }
];
const areas: Area[] = Object.keys(labels) as Area[];
const picker = new BalancedRandom<Question>(questions);
const areaPickers = new Map(areas.map(area => [area, new BalancedRandom(questions.filter(q => q.area === area))]));

export default function Math1MixedDrill() {
  const [mode, setMode] = useState<'all' | Area>('all');
  const [question, setQuestion] = useClientGeneratedState(() => picker.next());
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (nextMode: 'all' | Area = mode) => { const q = nextMode === 'all' ? picker.next() : areaPickers.get(nextMode)!.next(); setQuestion(q); setAnswer(''); setChecked(false); };
  if (!question) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer === question.answer;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学I 総合・解法選択ランダムドリル</h1><p className="text-gray-500 mt-1">数学Iの問題の形から、最初に選ぶ解法を判断します。個別単元と総合ランダムを切り替えられます。</p></div><section className="retro-box bg-gray-50 p-4 space-y-3"><label className="font-bold block">■ 出題範囲</label><select value={mode} onChange={e => { const value = e.target.value as 'all' | Area; setMode(value); next(value); }} className="border p-2 bg-white"><option value="all">実戦練習：数学I 全体ランダム</option>{areas.map(area => <option key={area} value={area}>単元練習：{labels[area]}だけ</option>)}</select></section><section className="retro-box bg-white p-5 space-y-5"><div className="flex justify-between gap-2"><span className="font-bold text-blue-700">出題分野：{question.label}</span><span className="text-gray-500">最初の方針を選択</span></div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div><div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}</section></main>;
}
