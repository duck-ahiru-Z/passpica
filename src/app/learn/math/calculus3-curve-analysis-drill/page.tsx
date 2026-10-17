'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BalancedRandom } from '@/src/lib/balancedRandom';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

type Pattern = 'increase' | 'extrema' | 'concavity' | 'tangent' | 'motion' | 'normal';
type Question = { pattern: Pattern; prompt: string; options: string[]; answer: string; explanation: string };
const labels: Record<Pattern, string> = { increase: '増減', extrema: '極大・極小', concavity: '凹凸・変曲点', tangent: '接線', motion: '速度・加速度', normal: '法線' };
const questions: Record<Pattern, Question> = {
  increase: { pattern: 'increase', prompt: '関数の増減を調べるとき、最初に作る表は？', options: ['f′(x)の符号表', '臨界点の一覧表', '定義域と端点の表', '増減を数値計算で確かめる表'], answer: 'f′(x)の符号表', explanation: '導関数の符号から、増加する区間と減少する区間を判定します。' },
  extrema: { pattern: 'extrema', prompt: '極大・極小の候補を見つける最初の条件は？', options: ['f′(x)=0 または未定義', 'f′(x)の符号が変わる点を調べる', '端点を候補に加える', 'f′′(x)の値で即断する'], answer: 'f′(x)=0 または未定義', explanation: '臨界点を求めた後、前後のf′の符号変化を確認します。' },
  concavity: { pattern: 'concavity', prompt: 'グラフの凹凸と変曲点を調べるときに使うものは？', options: ['f′′(x)の符号', 'f′′(x)=0 の候補', '二階導関数の符号変化', '接線の傾きの変化'], answer: 'f′′(x)の符号', explanation: '二階導関数の符号で凹凸を調べ、符号が変わる点を変曲点の候補にします。' },
  tangent: { pattern: 'tangent', prompt: '曲線 y=f(x) の x=a における接線の傾きは？', options: ['f′(a)', '点(a,f(a))を通る直線を立てる', '接線の公式 y−f(a)=f′(a)(x−a)', '微分係数の極限で求める'], answer: 'f′(a)', explanation: '接線の傾きは、その点での導関数の値 f′(a) です。' },
  motion: { pattern: 'motion', prompt: '位置 x(t) から速度と加速度を求める方法は？', options: ['一階微分が速度、二階微分が加速度', '速度をさらに微分して加速度にする', '加速度を積分して速度を得る', '初期条件を使って位置と速度を決める'], answer: '一階微分が速度、二階微分が加速度', explanation: 'v(t)=x′(t)、a(t)=v′(t)=x′′(t) です。' },
  normal: { pattern: 'normal', prompt: '接線の傾きが m の点で、法線の傾きは？', options: ['−1/m（m≠0）', '接線との積が−1になる', '接線に垂直な方向を使う', 'm=0 なら法線は垂直'], answer: '−1/m（m≠0）', explanation: '接線と法線は直交するため、傾きの積が−1になります。' }
};
const patterns = Object.keys(labels) as Pattern[];
const picker = new BalancedRandom<Pattern>(patterns);

export default function Calculus3CurveAnalysisDrill() {
  const [mode, setMode] = useState<Pattern | 'mix'>('mix');
  const [question, setQuestion] = useClientGeneratedState(() => questions[picker.next()]);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const next = (nextMode: Pattern | 'mix' = mode) => { const pattern = nextMode === 'mix' ? picker.next() : nextMode; setQuestion(questions[pattern]); setAnswer(''); setChecked(false); };
  if (!question) return <main className="max-w-4xl mx-auto px-4 py-8">問題を準備しています…</main>;
  const correct = answer === question.answer;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学III 曲線分析・解法選択ドリル</h1><p className="text-gray-500 mt-1">増減・極値・凹凸・接線・運動を、個別練習と全パターンランダムで判断します。</p></div><section className="retro-box bg-gray-50 p-4 space-y-3"><label className="font-bold block">■ 演習モード</label><select value={mode} onChange={e => { const value = e.target.value as Pattern | 'mix'; setMode(value); next(value); }} className="border p-2 bg-white"><option value="mix">実戦練習：曲線分析 全パターンランダム</option>{patterns.map(pattern => <option key={pattern} value={pattern}>基礎練習：{labels[pattern]}だけ</option>)}</select></section><section className="retro-box bg-white p-5 space-y-5"><div className="flex justify-between gap-2"><span className="font-bold text-blue-700">出題：{labels[question.pattern]}</span><span className="text-gray-500">最初の方針を選択</span></div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div><div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}</section></main>;
}
