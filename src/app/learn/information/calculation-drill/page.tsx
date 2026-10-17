"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BalancedRandom } from '@/src/lib/balancedRandom';

type Pattern = 'binary' | 'data' | 'transfer' | 'logic' | 'sampling' | 'compression' | 'complement';
type Problem = { pattern: Pattern; question: string; answer: string; explanation: string };
const labels: Record<Pattern, string> = { binary: '2進数変換', data: 'データ量', transfer: '通信時間', logic: '論理演算', sampling: '標本化', compression: '圧縮率', complement: '補数表現' };
const patterns: readonly Pattern[] = ['binary', 'data', 'transfer', 'logic', 'sampling', 'compression', 'complement'];
const problems: Record<Pattern, Problem> = {
  binary: { pattern: 'binary', question: '10進数の 13 を2進数で表せ。', answer: '1101', explanation: '13=8+4+1 なので、各桁は 1101₂。' },
  data: { pattern: 'data', question: '1024×768画素、24 bit/画素の画像データ量は何 byte か。（圧縮なし）', answer: '2359296', explanation: '1024×768×24÷8=2,359,296 byte。' },
  transfer: { pattern: 'transfer', question: '80 MB のファイルを 20 Mbps で送る。何秒か。（1 MB=10⁶ byte）', answer: '32', explanation: '80×8 Mbps ÷20 Mbps=32 s。' },
  logic: { pattern: 'logic', question: 'A=1、B=0 のとき、A AND (NOT B) の値は？', answer: '1', explanation: 'NOT B=1、A AND 1=1。' },
  sampling: { pattern: 'sampling', question: '標本化周波数 44.1 kHz、量子化ビット数 16 bit、ステレオ2 chで1秒の音声データ量は何 byte か。', answer: '176400', explanation: '44,100×16×2÷8=176,400 byte。' },
  compression: { pattern: 'compression', question: '元データ 12 MB を 3 MB にした。圧縮率は何 % か。', answer: '25', explanation: '圧縮後/元データ×100=3/12×100=25%。' },
  complement: { pattern: 'complement', question: '8 bitの2の補数表現で、11111101₂が表す整数は？', answer: '-3', explanation: '最上位ビットが負。反転して00000010、1を加えて3なので−3。' },
};
const picker = new BalancedRandom(patterns);
export default function InformationCalculationDrillPage() {
  const [mode, setMode] = useState<Pattern | 'mix'>('mix'); const [problem, setProblem] = useState<Problem>(() => problems[picker.next()]); const [answer, setAnswer] = useState(''); const [checked, setChecked] = useState(false);
  const load = (selected: Pattern | 'mix') => { const p = selected === 'mix' ? picker.next() : selected; setProblem(problems[p]); setAnswer(''); setChecked(false); };
  const normalizeAnswer = (value: string) => value.trim().replaceAll(',', '').replaceAll(' ', '').toLowerCase();
  const numericPatterns = new Set<Pattern>(['data', 'transfer', 'sampling', 'compression']);
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedExpected = normalizeAnswer(problem.answer);
  const correct = numericPatterns.has(problem.pattern) && normalizedAnswer !== '' && normalizedExpected !== '' && Number.isFinite(Number(normalizedAnswer)) && Number(normalizedAnswer) === Number(normalizedExpected)
    ? true
    : normalizedAnswer === normalizedExpected;
  return <main className="max-w-3xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs"><Link href="/drill" className="text-blue-600 hover:underline">← 無限演習ポータルへ戻る</Link><h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">情報I 計算・処理ドリル</h1><p className="text-gray-500 mb-6">2進数・データ量・通信時間・論理演算・標本化・圧縮率・補数表現を個別に練習し、実戦では処理方法を判断します。</p><section className="retro-box space-y-5"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">演習モード</span><select value={mode} onChange={e => { const p = e.target.value as Pattern | 'mix'; setMode(p); load(p); }} className="border p-1"><option value="mix">実戦練習：情報計算 全パターンランダム</option>{patterns.map(p => <option key={p} value={p}>基礎練習：{labels[p]}だけ</option>)}</select></div><div className="bg-white border p-8 text-center text-lg font-bold">{problem.question}</div><input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="答え" className="retro-input block mx-auto w-48 text-center" /><div className="flex justify-center gap-3"><button onClick={() => setChecked(true)} className="retro-btn-classic bg-blue-100 border-blue-400 font-bold">解答する</button><button onClick={() => load(mode)} className="retro-btn-classic">次の問題へ ➔</button></div>{checked && <div className={`p-3 border text-center font-bold ${correct ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>{correct ? '正解！' : `不正解。正解は ${problem.answer} です。`}<div className="mt-2 font-normal text-slate-700">{problem.explanation}</div></div>}</section></main>;
}
