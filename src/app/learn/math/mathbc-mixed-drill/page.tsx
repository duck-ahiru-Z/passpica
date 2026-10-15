'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BalancedRandom } from '@/src/lib/balancedRandom';
type Area = 'sequence' | 'sigma' | 'vector' | 'complex' | 'conic';
type Question = { area: Area; subject: string; prompt: string; answer: string; options: string[]; explanation: string };
const labels: Record<Area, string> = { sequence: '数列', sigma: '数列の和', vector: 'ベクトル', complex: '複素数平面', conic: '図形と方程式' };
const areas: Area[] = ['sequence', 'sigma', 'vector', 'complex', 'conic'];
const questions: Question[] = [
  { area: 'sequence', subject: '数学B', prompt: '漸化式 aₙ₊₁=raₙ+d を解く基本方針は？', answer: '定常値を引いて等比数列にする', options: ['定常値を引いて等比数列にする', '階差をとって和に戻す', '特性方程式を立てる', '初項と公比を直接推定する'], explanation: '定常値を引くと差が等比数列になり、一般項を求めやすくなります。' },
  { area: 'sigma', subject: '数学B', prompt: 'Σ(k²+2k) のような和を計算する最初の方針は？', answer: '既知のΣkとΣk²に分ける', options: ['既知のΣkとΣk²に分ける', '望遠鏡和になる形を探す', '等比数列の和に変形する', '和の線形性で項ごとに分ける'], explanation: '和の線形性を使い、Σk・Σk²など既知の公式へ分解します。' },
  { area: 'vector', subject: '数学C', prompt: '空間ベクトルで2直線の位置関係を調べるとき、まず見るものは？', answer: '方向ベクトルと連立条件', options: ['方向ベクトルと連立条件', '内積が0かを調べる', '交点を与える係数を連立する', '位置ベクトルの差を方向ベクトルで表す'], explanation: '方向ベクトルの関係と、交点を与えるパラメータの連立可否を確認します。' },
  { area: 'complex', subject: '数学C', prompt: '複素数 z の積を極形式で扱う利点は？', answer: '絶対値を掛け偏角を足せる', options: ['絶対値を掛け偏角を足せる', '偏角の差から商を処理できる', 'ド・モアブルの定理を使える', '回転と拡大として図形的に見られる'], explanation: '積では絶対値が積、偏角が和になるため、回転と拡大を整理できます。' },
  { area: 'conic', subject: '数学C', prompt: '楕円の接線を求めるときの基本的な入口は？', answer: '接点条件と傾き・微分', options: ['接点条件と傾き・微分', '標準形から焦点と軸を確認する', '接線の公式を接点に適用する', '判別式が0となる条件を使う'], explanation: '接点を通る条件と接線の傾きを連立し、標準形または微分で整理します。' },
];
export default function MathBCMixedDrillPage() {
  const [mode, setMode] = useState<Area | 'all'>('all'); const [question, setQuestion] = useState(questions[0]); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false); const [queue] = useState(() => new BalancedRandom<Area>(areas));
  const next = (selected: Area | 'all' = mode) => { const area = selected === 'all' ? queue.next() : selected; setQuestion(questions.find(q => q.area === area)!); setAnswer(''); setChecked(false); };
  const correct = answer === question.answer;
  return <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><div className="border-b border-gray-300 pb-2"><h1 className="text-xl md:text-2xl font-bold text-slate-900">数学B・C 総合・解法選択ランダムドリル</h1><p className="text-gray-500 mt-1">数学B・Cの主要分野を固定して練習し、実戦では分野を横断して解法を判断します。</p></div><section className="retro-box bg-gray-50 p-4 space-y-3"><label className="font-bold block">■ 演習モード</label><select value={mode} onChange={e => { const value = e.target.value as Area | 'all'; setMode(value); next(value); }} className="border p-2 bg-white"><option value="all">実戦練習：数学B・C 全体ランダム</option>{areas.map(area => <option key={area} value={area}>基礎練習：{labels[area]}だけ</option>)}</select></section><section className="retro-box bg-white p-5 space-y-5"><div className="font-bold text-blue-700">出題：{question.subject} / {labels[question.area]}</div><div className="border border-slate-300 bg-slate-50 p-6 text-center text-base md:text-lg font-bold leading-relaxed">{question.prompt}</div><div className="grid sm:grid-cols-2 gap-2">{question.options.map(option => <button key={option} onClick={() => setAnswer(option)} className={`retro-btn-classic ${answer === option ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}>{option}</button>)}</div><div className="flex justify-center gap-2"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => next()} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `正解は「${question.answer}」です。`}<div className="mt-2 font-normal text-slate-700">{question.explanation}</div></div>}</section></main>;
}
