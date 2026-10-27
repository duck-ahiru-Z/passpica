'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { exponentialSequenceTerm, sineRatioForNonzeroRadians } from '@/src/lib/calculus3LimitVisual';

const WIDTH = 620;
const HEIGHT = 300;
const SEQUENCE_MAX_N = 100;
const SEQUENCE_MAX_Y = Math.exp(2.5) * 1.1;

export default function Calculus3LimitVisualPage() {
  const [x, setX] = useState(0.8);
  const [coefficient, setCoefficient] = useState(1);
  const [n, setN] = useState(4);
  const sx = (value: number) => 60 + ((value + 3.2) / 6.4) * (WIDTH - 90);
  const sy = (value: number) => HEIGHT - 34 - ((value + 0.2) / 1.4) * (HEIGHT - 60);

  const curvePath = useMemo(() => {
    const points = Array.from({ length: 161 }, (_, index) => -3.2 + index * 0.04).filter(value => Math.abs(value) > 1e-9);
    const left = points.filter(value => value < 0);
    const right = points.filter(value => value > 0);
    const pathFor = (side: number[]) => side.map((value, index) => `${index === 0 ? 'M' : 'L'} ${sx(value).toFixed(1)} ${sy(sineRatioForNonzeroRadians(value)).toFixed(1)}`).join(' ');
    return `${pathFor(left)} ${pathFor(right)}`;
  }, []);

  const current = sineRatioForNonzeroRadians(x);
  const mirrored = sineRatioForNonzeroRadians(-x);
  const sequenceValue = (term: number) => exponentialSequenceTerm(coefficient, term);
  const sequenceLimit = Math.exp(coefficient);
  const sequencePath = Array.from({ length: SEQUENCE_MAX_N }, (_, index) => index + 1)
    .map((term, index) => `${index === 0 ? 'M' : 'L'} ${60 + ((term - 1) / (SEQUENCE_MAX_N - 1)) * (WIDTH - 90)} ${HEIGHT - 34 - (sequenceValue(term) / SEQUENCE_MAX_Y) * (HEIGHT - 60)}`)
    .join(' ');
  const sequenceX = 60 + ((n - 1) / (SEQUENCE_MAX_N - 1)) * (WIDTH - 90);
  const sequenceY = HEIGHT - 34 - (sequenceValue(n) / SEQUENCE_MAX_Y) * (HEIGHT - 60);
  const sequenceLimitY = HEIGHT - 34 - (sequenceLimit / SEQUENCE_MAX_Y) * (HEIGHT - 60);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500">数学III / 極限</div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">極限の直感：関数と数列</h1>
        </div>
        <Link href="/learn" className="retro-btn-classic">学習一覧へ</Link>
      </div>

      <section className="retro-box bg-white p-4 space-y-4">
        <div>
          <h2 className="font-bold text-base">xを0へ近づけると、値はどこへ近づく？</h2>
          <p className="text-slate-600 mt-1 leading-relaxed">xはラジアンで測ります。スライダーを動かして、左右から近づく点と y = 1 の関係を観察します。x = 0 では式を直接割れませんが、極限値は読み取れます。</p>
        </div>
        <div className="border border-slate-300 bg-slate-50 p-2">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full h-auto" role="img" aria-label="sin x を x で割った関数のグラフ。x軸はラジアンで−π、−1、0、1、π。x=0では関数は定義されず、極限値1に白抜きの点があります。">
            <line x1={sx(-3.2)} y1={sy(0)} x2={sx(3.2)} y2={sy(0)} stroke="#64748b" strokeWidth="1" />
            <line x1={sx(0)} y1={sy(-0.2)} x2={sx(0)} y2={sy(1.2)} stroke="#64748b" strokeWidth="1" />
            {[-Math.PI, -1, 1, Math.PI].map((value, index) => <g key={`x-tick-${index}`}><line x1={sx(value)} y1={sy(0) - 4} x2={sx(value)} y2={sy(0) + 4} stroke="#64748b" /><text x={sx(value)} y={sy(0) + 17} textAnchor="middle" fill="#475569" fontSize="11">{['−π', '−1', '1', 'π'][index]}</text></g>)}
            <text x={sx(0) - 8} y={sy(0) + 17} textAnchor="end" fill="#475569" fontSize="11">0</text>
            <line x1={sx(-3.2)} y1={sy(1)} x2={sx(3.2)} y2={sy(1)} stroke="#dc2626" strokeDasharray="5 4" strokeWidth="1.5" />
            <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
            <line x1={sx(-x)} y1={sy(0)} x2={sx(-x)} y2={sy(mirrored)} stroke="#16a34a" strokeDasharray="3 3" />
            <line x1={sx(x)} y1={sy(0)} x2={sx(x)} y2={sy(current)} stroke="#16a34a" strokeDasharray="3 3" />
            <circle cx={sx(-x)} cy={sy(mirrored)} r="5" fill="#16a34a" />
            <circle cx={sx(x)} cy={sy(current)} r="5" fill="#16a34a" />
            <circle cx={sx(0)} cy={sy(1)} r="5" fill="#f8fafc" stroke="#2563eb" strokeWidth="2" aria-hidden="true" />
            <text x={sx(2.55)} y={sy(1) - 7} fill="#b91c1c" fontSize="12">y = 1</text>
            <text x={sx(2.55)} y={sy(0) - 7} fill="#475569" fontSize="12">x</text>
            <text x={sx(0) + 6} y={sy(1.2) + 12} fill="#475569" fontSize="12">y</text>
          </svg>
        </div>

        <label className="block space-y-2">
          <span className="font-bold">x（ラジアン）= ±{x.toFixed(2)} に近づける</span>
          <input aria-label="x（ラジアン）の大きさ" type="range" min="0.05" max="2.8" step="0.05" value={x} onChange={(event) => setX(Number(event.target.value))} className="w-full accent-blue-600" />
        </label>

        <div className="grid sm:grid-cols-3 gap-2">
          <div className="border border-slate-300 p-3 bg-blue-50"><div className="text-slate-500">右から</div><div className="font-bold text-lg">{current.toFixed(5)}</div></div>
          <div className="border border-slate-300 p-3 bg-green-50"><div className="text-slate-500">左から</div><div className="font-bold text-lg">{mirrored.toFixed(5)}</div></div>
          <div className="border border-slate-300 p-3 bg-red-50"><div className="text-slate-500">極限値</div><div className="font-bold text-lg">1</div></div>
        </div>
      </section>

      <section className="retro-box bg-white p-4 space-y-4">
        <div>
          <h2 className="font-bold text-base">数列 (1 + a/n)ⁿ は eᵃ に近づく</h2>
          <p className="text-slate-600 mt-1 leading-relaxed">nを大きくしながら数列の値を追い、水平線 y=eᵃ に近づく様子を見ます。係数 a を変えると、近づく先も eᵃ に変わります。</p>
        </div>
        <div className="border border-slate-300 bg-slate-50 p-2">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full h-auto" role="img" aria-label={`数列 (1+${coefficient}/n) の n 乗のグラフ。n=${n} の値 ${sequenceValue(n).toFixed(5)} は、極限値 e の ${coefficient} 乗、約 ${sequenceLimit.toFixed(5)} に近づいています。`}>
            <line x1="60" y1={HEIGHT - 34} x2={WIDTH - 30} y2={HEIGHT - 34} stroke="#64748b" />
            <line x1="60" y1="24" x2="60" y2={HEIGHT - 34} stroke="#64748b" />
            {[0, 5, 10].map(value => {
              const y = HEIGHT - 34 - (value / SEQUENCE_MAX_Y) * (HEIGHT - 60);
              return <g key={`sequence-y-${value}`}><line x1="56" y1={y} x2={WIDTH - 30} y2={y} stroke="#cbd5e1" strokeDasharray="3 4" /><text x="50" y={y + 4} textAnchor="end" fill="#475569" fontSize="11">{value}</text></g>;
            })}
            {[1, 25, 50, 75, 100].map(value => {
              const xPos = 60 + ((value - 1) / (SEQUENCE_MAX_N - 1)) * (WIDTH - 90);
              return <g key={`sequence-x-${value}`}><line x1={xPos} y1={HEIGHT - 34} x2={xPos} y2={HEIGHT - 30} stroke="#64748b" /><text x={xPos} y={HEIGHT - 12} textAnchor="middle" fill="#475569" fontSize="11">{value}</text></g>;
            })}
            <line x1="60" y1={sequenceLimitY} x2={WIDTH - 30} y2={sequenceLimitY} stroke="#dc2626" strokeDasharray="5 4" strokeWidth="1.5" />
            <path d={sequencePath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
            <line x1={sequenceX} y1={HEIGHT - 34} x2={sequenceX} y2={sequenceY} stroke="#16a34a" strokeDasharray="3 3" />
            <circle cx={sequenceX} cy={sequenceY} r="5" fill="#16a34a" />
            <text x={WIDTH - 34} y={sequenceLimitY - 7} textAnchor="end" fill="#b91c1c" fontSize="12">y = e^{coefficient}</text>
            <text x={WIDTH - 30} y={HEIGHT - 42} textAnchor="end" fill="#475569" fontSize="12">n</text>
          </svg>
        </div>
        <label className="block space-y-2">
          <span className="font-bold">係数 a = {coefficient.toFixed(1)}</span>
          <input aria-label="指数型数列の係数 a" type="range" min="0.5" max="2.5" step="0.5" value={coefficient} onChange={event => setCoefficient(Number(event.target.value))} className="w-full accent-blue-600" />
        </label>
        <label className="block space-y-2">
          <span className="font-bold">項番号 n = {n}</span>
          <input aria-label="数列の項番号 n" type="range" min="1" max={SEQUENCE_MAX_N} step="1" value={n} onChange={event => setN(Number(event.target.value))} className="w-full accent-green-600" />
        </label>
        <div className="grid sm:grid-cols-3 gap-2">
          <div className="border border-slate-300 p-3 bg-blue-50"><div className="text-slate-500">n番目の値 (1+a/n)ⁿ</div><div className="font-bold text-lg">{sequenceValue(n).toFixed(5)}</div></div>
          <div className="border border-slate-300 p-3 bg-red-50"><div className="text-slate-500">極限値 eᵃ</div><div className="font-bold text-lg">{sequenceLimit.toFixed(5)}</div></div>
          <div className="border border-slate-300 p-3 bg-green-50"><div className="text-slate-500">極限値との差</div><div className="font-bold text-lg">{(sequenceLimit - sequenceValue(n)).toFixed(5)}</div></div>
        </div>
        <p className="text-sm text-slate-700">基本極限 lim(n→∞)(1+1/n)ⁿ=e から、lim(n→∞)(1+a/n)ⁿ=eᵃ。</p>
      </section>

      <section className="retro-box bg-slate-50 p-4 space-y-2">
        <h2 className="font-bold">読み取りポイント</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>xの絶対値を小さくすると、左右の点が y = 1 に近づきます。</li>
          <li>このページは、式の値と「近づく先」を区別する直感を補助します。</li>
          <li>発展問題では、はさみうちの原理や連続性を使って極限値を説明します。</li>
        </ul>
        <Link href="/learn/math/calculus3-limit-drill" className="retro-btn-classic inline-flex">極限の解法選択を問題で練習する →</Link>
      </section>
    </main>
  );
}
