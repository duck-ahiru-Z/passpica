'use client';

import Link from 'next/link';
import { useState } from 'react';
import { rightDiskApproximation, rotationDiskRadius, rotationSectionIndices, rotationVolume } from '@/src/lib/calculus3VolumeVisual';

const W = 720;
const H = 330;
export default function Calculus3VolumeVisualPage() {
  const [upper, setUpper] = useState(1.5);
  const [sliceCount, setSliceCount] = useState(8);
  const yMax = upper ** 2 * 1.2;
  const leftX = (x: number) => 50 + (x / upper) * 265;
  const leftY = (y: number) => 278 - (y / yMax) * 220;
  const graphPath = Array.from({ length: 51 }, (_, index) => {
    const x = upper * index / 50;
    return `${index === 0 ? 'M' : 'L'} ${leftX(x).toFixed(1)} ${leftY(x ** 2).toFixed(1)}`;
  }).join(' ');
  const regionPath = `M ${leftX(0)} ${leftY(0)} ${Array.from({ length: 51 }, (_, index) => {
    const x = upper * index / 50;
    return `L ${leftX(x).toFixed(1)} ${leftY(x ** 2).toFixed(1)}`;
  }).join(' ')} L ${leftX(upper)} ${leftY(0)} Z`;

  const step = upper / sliceCount;
  const exact = rotationVolume(upper);
  const rightSum = rightDiskApproximation(upper, sliceCount);
  const solidLeft = 390;
  const solidRight = 675;
  const solidCenterY = 160;
  const solidRadius = 105;
  const solidX = (index: number) => solidLeft + (solidRight - solidLeft) * index / sliceCount;
  const diskRadius = (index: number) => rotationDiskRadius(index, sliceCount, solidRadius);
  const solidOutline = [
    ...Array.from({ length: sliceCount + 1 }, (_, index) => `L ${solidX(index).toFixed(1)} ${(solidCenterY - diskRadius(index)).toFixed(1)}`),
    ...Array.from({ length: sliceCount + 1 }, (_, offset) => {
      const index = sliceCount - offset;
      return `L ${solidX(index).toFixed(1)} ${(solidCenterY + diskRadius(index)).toFixed(1)}`;
    }),
  ].join(' ');
  const sectionIndices = rotationSectionIndices(sliceCount);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-5 text-slate-800 font-sans text-xs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500">数学III / 積分法</div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">回転体の体積・断面円板ビジュアル</h1>
        </div>
        <Link href="/learn" className="retro-btn-classic">学習一覧へ</Link>
      </div>

      <section className="retro-box bg-white p-4 space-y-4">
        <p className="text-slate-600 leading-relaxed">曲線 y=x² と x軸にはさまれた領域を x軸のまわりに回転します。左の領域が右の立体になり、位置 x の断面は半径 x² の円板です。</p>
        <div className="border border-slate-300 bg-slate-50 p-2 overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full min-w-[600px] h-auto" role="img" aria-label={`y=x²をx軸の周りに回転した立体の模式図。区間0から${upper.toFixed(2)}、断面円板数${sliceCount}。正確な体積は${exact.toFixed(4)}、右端円板和は${rightSum.toFixed(4)}。`}>
            <line x1="34" y1={leftY(0)} x2="326" y2={leftY(0)} stroke="#64748b" />
            <line x1={leftX(0)} y1="36" x2={leftX(0)} y2="286" stroke="#64748b" />
            <path d={regionPath} fill="#bfdbfe" />
            {Array.from({ length: sliceCount }, (_, index) => {
              const x = (index + 1) * step;
              return <line key={`slice-${index}`} x1={leftX(x)} y1={leftY(0)} x2={leftX(x)} y2={leftY(x ** 2)} stroke="#2563eb" strokeOpacity="0.55" />;
            })}
            <path d={graphPath} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
            <text x="56" y="35" fill="#334155" fontSize="12">平面領域 y=x²</text>
            <text x="300" y={leftY(0) + 18} fill="#475569" fontSize="11">x</text>

            <path d={`M ${solidOutline.slice(2)} Z`} fill="rgba(59,130,246,0.16)" stroke="#2563eb" strokeWidth="2" />
            <line x1={solidLeft - 10} y1={solidCenterY} x2={solidRight + 12} y2={solidCenterY} stroke="#475569" strokeDasharray="5 4" />
            {sectionIndices.map(index => {
              const radius = Math.max(2, diskRadius(index));
              return <g key={`disk-${index}`}>
                <ellipse cx={solidX(index)} cy={solidCenterY} rx={Math.max(2, radius * 0.35)} ry={radius} fill={index === Math.round(sliceCount / 2) ? 'rgba(245,158,11,0.42)' : 'rgba(37,99,235,0.1)'} stroke={index === Math.round(sliceCount / 2) ? '#b45309' : '#2563eb'} strokeWidth="1.5" />
              </g>;
            })}
            <text x={solidLeft + 2} y="35" fill="#334155" fontSize="12">x軸回転後の立体（模式図）</text>
            <text x={solidLeft + 20} y={solidCenterY + 125} fill="#475569" fontSize="11">断面：半径 x² の円板</text>
            <text x={solidX(Math.round(sliceCount / 2)) + 8} y={solidCenterY - diskRadius(Math.round(sliceCount / 2)) - 8} fill="#92400e" fontSize="10">位置 x の断面</text>
          </svg>
        </div>

        <label className="block space-y-2">
          <span className="font-bold">回転区間 [0, {upper.toFixed(2)}]</span>
          <input aria-label="回転区間の上端" type="range" min="0.5" max="2" step="0.05" value={upper} onChange={event => setUpper(Number(event.target.value))} className="w-full accent-blue-600" />
        </label>
        <label className="block space-y-2">
          <span className="font-bold">円板の分割数 n = {sliceCount}</span>
          <input aria-label="円板の分割数" type="range" min="4" max="20" step="4" value={sliceCount} onChange={event => setSliceCount(Number(event.target.value))} className="w-full accent-blue-600" />
        </label>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-center">
          <div className="border p-3 bg-blue-50"><div className="text-slate-500">断面積 A(x)</div><strong>πx⁴</strong></div>
          <div className="border p-3 bg-indigo-50"><div className="text-slate-500">正確な体積</div><strong>{exact.toFixed(4)}</strong></div>
          <div className="border p-3 bg-amber-50"><div className="text-slate-500">右端円板和（n={sliceCount}）</div><strong>{rightSum.toFixed(4)}</strong></div>
          <div className="border p-3 bg-emerald-50"><div className="text-slate-500">近似−正確</div><strong>{(rightSum - exact).toFixed(4)}</strong></div>
        </div>
        <div className="text-center rounded border bg-slate-50 p-3">V = ∫₀^{upper.toFixed(2)} πx⁴ dx = πb⁵/5（b={upper.toFixed(2)}）</div>
      </section>

      <section className="retro-box bg-slate-50 p-4 space-y-2">
        <h2 className="font-bold">読み取りポイント</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>高さ y=x² の領域を回すと、位置 x での断面円板の半径は x²、面積は π(x²)²=πx⁴ です。</li>
          <li>円板を右端の高さで足した近似は、この区間では正確な体積より大きくなります。分割数を増やして差を比べましょう。</li>
          <li>回転軸と積分方向を先に確認し、円板法・円環法・円筒殻法から適切な断面を選びます。</li>
        </ul>
      </section>
    </main>
  );
}
