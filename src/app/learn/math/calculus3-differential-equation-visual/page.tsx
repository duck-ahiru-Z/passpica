'use client';

import { useState } from 'react';
import Link from 'next/link';

const WIDTH = 640;
const HEIGHT = 360;
const LEFT = 56;
const RIGHT = 610;
const TOP = 24;
const BOTTOM = 316;
const X_MIN = -2;
const X_MAX = 2;
const Y_MIN = -1;
const Y_MAX = 4.5;
const xToSvg = (x: number) => LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * (RIGHT - LEFT);
const yToSvg = (y: number) => BOTTOM - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (BOTTOM - TOP);

export default function Calculus3DifferentialEquationVisualPage() {
  const [rate, setRate] = useState(0.5);
  const [initialValue, setInitialValue] = useState(1);
  const [time, setTime] = useState(1);
  const solution = (x: number) => initialValue * Math.exp(rate * x);
  const currentValue = solution(time);
  const field = [];
  for (let x = -2; x <= 2.001; x += 0.5) {
    for (let y = -1; y <= 4.001; y += 0.5) {
      const slope = rate * y;
      const halfWidth = 8 / Math.sqrt(1 + slope * slope);
      const halfHeight = slope * halfWidth;
      field.push({ x1: xToSvg(x - halfWidth * 0.006), y1: yToSvg(y - halfHeight * 0.006), x2: xToSvg(x + halfWidth * 0.006), y2: yToSvg(y + halfHeight * 0.006) });
    }
  }
  const curve = Array.from({ length: 161 }, (_, index) => {
    const x = X_MIN + (X_MAX - X_MIN) * index / 160;
    return `${index === 0 ? 'M' : 'L'} ${xToSvg(x).toFixed(2)} ${yToSvg(solution(x)).toFixed(2)}`;
  }).join(' ');

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs text-slate-500">数学III / 微分方程式</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">傾き場と指数関数の解</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">微分方程式 dy/dx = ky は、各点での傾きが y の値に比例する関係です。初期値 y(0) を通る解 y = y(0)e^(kx) と傾き場を重ね、k の符号で増加・一定・減少がどう変わるかを見ます。</p>
        <div className="border border-slate-300 bg-slate-50 p-2">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block w-full h-auto" role="img" aria-label={`微分方程式 dy/dx=${rate}y の傾き場と解 y=${initialValue}e^(${rate}x)。x=${time.toFixed(2)} の点は y=${currentValue.toFixed(3)}。`}>
            <defs><clipPath id="slope-field-plot"><rect x={LEFT} y={TOP} width={RIGHT - LEFT} height={BOTTOM - TOP} /></clipPath></defs>
            {[0, 1, 2, 3, 4].map(y => <g key={`y${y}`}><line x1={LEFT} y1={yToSvg(y)} x2={RIGHT} y2={yToSvg(y)} stroke="#e2e8f0" /><text x={LEFT - 10} y={yToSvg(y) + 4} textAnchor="end" fill="#475569" fontSize="12">{y}</text></g>)}
            {[-2, -1, 0, 1, 2].map(x => <g key={`x${x}`}><line x1={xToSvg(x)} y1={TOP} x2={xToSvg(x)} y2={BOTTOM} stroke="#e2e8f0" /><text x={xToSvg(x)} y={BOTTOM + 20} textAnchor="middle" fill="#475569" fontSize="12">{x}</text></g>)}
            <line x1={LEFT} y1={yToSvg(0)} x2={RIGHT} y2={yToSvg(0)} stroke="#64748b" strokeWidth="1.5" />
            <line x1={xToSvg(0)} y1={TOP} x2={xToSvg(0)} y2={BOTTOM} stroke="#64748b" strokeWidth="1.5" />
            <g clipPath="url(#slope-field-plot)" stroke="#94a3b8" strokeWidth="1.4">{field.map((segment, index) => <line key={index} {...segment} />)}<path d={curve} fill="none" stroke="#2563eb" strokeWidth="3" /></g>
            <line x1={xToSvg(time)} y1={yToSvg(0)} x2={xToSvg(time)} y2={yToSvg(currentValue)} stroke="#f97316" strokeDasharray="4 4" />
            <circle cx={xToSvg(time)} cy={yToSvg(currentValue)} r="6" fill="#f97316" stroke="white" strokeWidth="2" />
            <text x={RIGHT - 4} y={TOP + 14} textAnchor="end" fill="#2563eb" fontSize="12">解 y=y₀e^(kx)</text>
          </svg>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2 text-xs text-slate-600"><span className="text-slate-500">━ 傾き場</span><span className="text-blue-700">━ 指数関数の解</span><span className="text-orange-600">● 選択した時刻と値</span></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1"><span className="font-bold">比例定数 k = {rate.toFixed(2)}</span><input aria-label="比例定数k" type="range" min="-0.5" max="0.5" step="0.01" value={rate} onChange={event => setRate(Number(event.target.value))} className="w-full accent-blue-600" /><span className="block text-xs text-slate-500">k &gt; 0 で増加、k = 0 で一定、k &lt; 0 で減少</span></label>
          <label className="block space-y-1"><span className="font-bold">初期値 y(0) = {initialValue.toFixed(1)}</span><input aria-label="初期値y0" type="range" min="0.5" max="1.5" step="0.1" value={initialValue} onChange={event => setInitialValue(Number(event.target.value))} className="w-full accent-blue-600" /></label>
        </div>
        <label className="block space-y-1"><span className="font-bold">時刻 x = {time.toFixed(2)}：y(x) = {currentValue.toFixed(3)}</span><input aria-label="解上の時刻x" type="range" min={X_MIN} max={X_MAX} step="0.01" value={time} onChange={event => setTime(Number(event.target.value))} className="w-full accent-orange-600" /></label>
        <div className="grid gap-2 sm:grid-cols-3"><div className="border bg-blue-50 p-3"><span className="block text-xs text-slate-500">微分方程式</span><strong>dy/dx = {rate.toFixed(2)}y</strong></div><div className="border bg-emerald-50 p-3"><span className="block text-xs text-slate-500">初期条件</span><strong>y(0) = {initialValue.toFixed(1)}</strong></div><div className="border bg-amber-50 p-3"><span className="block text-xs text-slate-500">この時刻の解</span><strong>y({time.toFixed(2)}) = {currentValue.toFixed(3)}</strong></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">読み取りポイント</h2><ul className="list-disc pl-5 space-y-1"><li>灰色の短い線分が各点での傾きです。青い解曲線はどの点でも傾き場に沿います。</li><li>k を変えると、y の増減の向きと速さが変わります。初期値 y(0) は解曲線の通る点を決めます。</li><li>解は変数分離 dy/y = k dx から y = y₀e^(kx) と求められます。</li></ul><Link href="/learn/math/calculus3-differential-equation-drill" className="retro-btn-classic inline-flex">微分方程式の個別・ランダム演習へ →</Link></section>
    </main>
  );
}
