'use client';

import Link from 'next/link';
import { useState } from 'react';
import { calculateIdealGasVolume, idealGasConstantKPaLiters } from '@/src/lib/idealGasLaw';

const BOTTOM = 286;
const VOLUME_MIN = calculateIdealGasVolume(0.5, 120, 250);
const VOLUME_MAX = calculateIdealGasVolume(1.5, 80, 350);
const particleColumns = [250, 292, 334, 376];
const particleRows = [0.28, 0.55, 0.82];
const format = (value: number, digits = 2) => Number(value.toFixed(digits)).toString();

export default function IdealGasVisualPage() {
  const [amount, setAmount] = useState(1);
  const [pressure, setPressure] = useState(101.3);
  const [temperature, setTemperature] = useState(273);
  const volume = calculateIdealGasVolume(amount, pressure, temperature);
  const normalizedVolume = (volume - VOLUME_MIN) / (VOLUME_MAX - VOLUME_MIN);
  const chamberHeight = 60 + normalizedVolume * 145;
  const pistonY = BOTTOM - chamberHeight;
  const ariaSummary = `理想気体の状態方程式 PV=nRT。物質量${format(amount)} mol、圧力${format(pressure, 1)} kPa、絶対温度${temperature} K、体積${format(volume)} L。固定した物質量では圧力が高いほど体積が小さく、温度が高いほど体積が大きい。`;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[11px] text-slate-500">化学 / 気体の状態方程式</div><h1 className="text-xl md:text-2xl font-bold text-slate-900">圧力・体積・温度と物質量（PV=nRT）</h1></div><div className="flex flex-wrap gap-2"><Link href="/learn/chemistry/mole-calculation-drill" className="retro-btn-classic">気体の計算演習へ →</Link><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div></div>
      <section className="retro-box bg-white p-4 space-y-5">
        <p className="text-slate-600 leading-relaxed">理想気体の状態方程式 PV=nRT では、圧力 P・体積 V・絶対温度 T・物質量 n が結び付きます。スライダーで状態を変え、ピストンの位置と気体の体積がどう動くかを見ます。温度は必ず K（ケルビン）で代入します。</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1"><span className="font-bold">物質量 n = {format(amount, 1)} mol</span><input aria-label="気体の物質量" type="range" min="0.5" max="1.5" step="0.1" value={amount} onChange={event => setAmount(Number(event.target.value))} className="w-full accent-violet-600" /></label>
          <label className="block space-y-1"><span className="font-bold">圧力 P = {format(pressure, 1)} kPa</span><input aria-label="気体の圧力" type="range" min="80" max="120" step="0.1" value={pressure} onChange={event => setPressure(Number(event.target.value))} className="w-full accent-blue-600" /></label>
          <label className="block space-y-1"><span className="font-bold">絶対温度 T = {temperature} K（{(temperature - 273).toFixed(0)}℃）</span><input aria-label="気体の絶対温度" type="range" min="250" max="350" step="1" value={temperature} onChange={event => setTemperature(Number(event.target.value))} className="w-full accent-orange-600" /></label>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)] items-center">
          <div className="border border-slate-300 bg-sky-50 p-2">
            <svg viewBox="0 0 600 340" className="block w-full h-auto" role="img" aria-label={ariaSummary}>
              <defs>
                <marker id="gas-pressure-arrow" markerWidth="8" markerHeight="8" refX="4" refY="7" orient="auto"><path d="M0,0 L8,0 L4,8 z" fill="#2563eb" /></marker>
              </defs>
              <text x="300" y="27" textAnchor="middle" fill="#334155" fontSize="15" fontWeight="bold">断熱したシリンダー内の理想気体（粒子は模式図）</text>
              <line x1="218" y1="55" x2="218" y2={BOTTOM} stroke="#475569" strokeWidth="7" />
              <line x1="408" y1="55" x2="408" y2={BOTTOM} stroke="#475569" strokeWidth="7" />
              <line x1="218" y1={BOTTOM} x2="408" y2={BOTTOM} stroke="#475569" strokeWidth="8" />
              <rect x="207" y={pistonY - 12} width="212" height="18" rx="3" fill="#64748b" stroke="#334155" strokeWidth="2" />
              <line x1="313" y1="48" x2="313" y2={pistonY - 13} stroke="#64748b" strokeWidth="8" />
              <line x1="275" y1="48" x2="275" y2="93" stroke="#2563eb" strokeWidth="3" markerEnd="url(#gas-pressure-arrow)" />
              <line x1="351" y1="48" x2="351" y2="93" stroke="#2563eb" strokeWidth="3" markerEnd="url(#gas-pressure-arrow)" />
              {particleRows.flatMap((row, rowIndex) => particleColumns.map((x, columnIndex) => {
                const y = BOTTOM - chamberHeight * row;
                return <circle key={`${rowIndex}-${columnIndex}`} cx={x} cy={y} r="7" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" />;
              }))}
              <text x="431" y={pistonY - 2} fill="#334155" fontSize="13">可動ピストン</text>
              <text x="300" y="320" textAnchor="middle" fill="#475569" fontSize="13">粒子の数は固定（模式表示） · ピストンの高さで体積変化を表示</text>
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded border border-sky-200 bg-sky-50 p-4"><p className="text-xs text-slate-600">体積（PV=nRT から）</p><p className="text-3xl font-black text-sky-900">{format(volume, 3)} L</p></div>
            <div className="rounded border bg-white p-4 space-y-2"><p className="font-bold">状態方程式</p><p className="font-mono text-lg">PV = nRT</p><p className="text-sm">V = nRT / P</p><p className="text-xs leading-5 text-slate-600">= {format(amount, 1)} × {idealGasConstantKPaLiters} × {temperature} / {format(pressure, 1)}</p><p className="border-t pt-2 font-mono">= {format(volume, 3)} L</p></div>
            <p className="text-xs leading-5 text-slate-600">R = {idealGasConstantKPaLiters} kPa·L/(mol·K)。このスライダー範囲では、体積は約 {format(VOLUME_MIN)}〜{format(VOLUME_MAX)} L に変化します。</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3"><div className="border bg-violet-50 p-3"><span className="block text-xs text-slate-500">物質量 n</span><strong>{format(amount, 1)} mol</strong></div><div className="border bg-blue-50 p-3"><span className="block text-xs text-slate-500">圧力 P</span><strong>{format(pressure, 1)} kPa</strong></div><div className="border bg-orange-50 p-3"><span className="block text-xs text-slate-500">絶対温度 T</span><strong>{temperature} K</strong></div></div>
      </section>
      <section className="retro-box bg-slate-50 p-4 space-y-2"><h2 className="font-bold">変化の読み取り</h2><ul className="list-disc pl-5 space-y-1"><li>物質量と温度を固定して圧力を上げると、気体の体積は小さくなります。</li><li>物質量と圧力を固定して絶対温度を上げると、気体の体積は大きくなります。</li><li>理想気体モデルによる計算です。温度を摂氏で与えられたときは、K = ℃ + 273 を使ってから代入します。</li></ul><div className="flex flex-wrap gap-2 pt-2"><Link href="/learn/chemistry/mole-calculation-drill" className="retro-btn-classic inline-flex">気体の物質量・体積を個別／ランダム演習 →</Link><Link href="/learn/chemistry/mole-concept-visual" className="retro-btn-classic inline-flex">モルと標準状態の体積も見る →</Link></div></section>
    </main>
  );
}
