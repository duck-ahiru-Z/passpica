'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  getSpringVisualState,
  springMaximumExtension,
  springMinimumExtension,
  springConstant,
} from '@/src/lib/springVisual';

const REST_POSITION = 340;

export default function SpringVisualPage() {
  const [extension, setExtension] = useState(0.12);
  const state = getSpringVisualState(extension);
  const blockCenter = REST_POSITION + state.extension * 450;
  const blockLeft = blockCenter - 36;
  const coilPoints = Array.from({ length: 17 }, (_, index) => {
    const progress = index / 16;
    const x = 100 + (blockLeft - 100) * progress;
    const y = index === 0 || index === 16 ? 138 : 138 + (index % 2 === 0 ? -17 : 17);
    return `${x},${y}`;
  }).join(' ');
  const forceDirection = Math.sign(state.restoringForce);
  const forceLength = Math.min(74, 18 + Math.abs(state.restoringForce) * 1.2);
  const forceStart = forceDirection < 0 ? blockLeft - 6 : blockCenter + 6;
  const forceEnd = forceStart + forceDirection * forceLength;
  const graphX = 440 + ((state.extension - springMinimumExtension) / (springMaximumExtension - springMinimumExtension)) * 200;
  const graphY = 145 - (state.restoringForce / (springConstant * Math.abs(springMinimumExtension))) * 68;
  const forceText = `${state.restoringForce > 0 ? '+' : ''}${state.restoringForce.toFixed(1)}`;
  const energyText = state.elasticPotentialEnergy.toFixed(2);

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 text-sm text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-500">物理 / 力学</p>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">ばねの伸び・復元力・弾性エネルギービジュアル</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/learn/physics/motion-calculation-drill" className="retro-btn-classic">ばねの計算演習へ →</Link>
          <Link href="/learn" className="retro-btn-classic">学習一覧へ</Link>
        </div>
      </div>

      <section className="retro-box space-y-4 bg-white p-4">
        <p className="leading-relaxed text-slate-600">ばね定数 k={springConstant} N/m のばねを自然長から伸ばす・縮める量 x を動かします。復元力は変位と反対向き、弾性エネルギーは伸ばしても縮めても蓄えられます。</p>

        <svg viewBox="0 0 680 260" className="block h-auto w-full border border-slate-300 bg-slate-50" role="img" aria-label={`ばねの変位${state.extension.toFixed(2)}メートル、復元力${forceText}ニュートン、弾性エネルギー${energyText}ジュール。変位と反対向きに復元力がはたらきます。`}>
          <defs>
            <marker id="spring-force-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#dc2626" />
            </marker>
          </defs>
          <line x1="70" y1="70" x2="70" y2="205" stroke="#475569" strokeWidth="8" />
          <line x1="80" y1="180" x2="635" y2="180" stroke="#334155" strokeWidth="2" />
          <line x1={REST_POSITION} y1="78" x2={REST_POSITION} y2="198" stroke="#64748b" strokeDasharray="5 5" />
          <text x={REST_POSITION} y="218" textAnchor="middle" fill="#475569" fontSize="13">自然長 x=0</text>
          <polyline points={coilPoints} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinejoin="round" />
          <rect x={blockLeft} y="112" width="72" height="52" rx="5" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="3" />
          <text x={blockCenter} y="144" textAnchor="middle" fill="#1e3a8a" fontSize="15" fontWeight="bold">物体</text>
          {forceDirection !== 0 && <line x1={forceStart} y1="92" x2={forceEnd} y2="92" stroke="#dc2626" strokeWidth="4" markerEnd="url(#spring-force-arrow)" />}
          <text x={blockCenter} y="68" textAnchor="middle" fill="#b91c1c" fontSize="14" fontWeight="bold">復元力 {forceDirection === 0 ? '0 N' : `${forceText} N`}</text>

          <text x="440" y="34" fill="#334155" fontSize="14" fontWeight="bold">F = −kx</text>
          <line x1="440" y1="145" x2="640" y2="145" stroke="#64748b" />
          <line x1="540" y1="65" x2="540" y2="225" stroke="#64748b" />
          <line x1="440" y1="77" x2="640" y2="213" stroke="#0f766e" strokeWidth="3" />
          <circle cx={graphX} cy={graphY} r="7" fill="#dc2626" stroke="white" strokeWidth="2" />
          <text x="440" y="244" fill="#475569" fontSize="12">−0.20 m</text>
          <text x="603" y="244" fill="#475569" fontSize="12">+0.20 m</text>
          <text x="545" y="62" fill="#475569" fontSize="12">F（N）</text>
          <text x="612" y="160" fill="#475569" fontSize="12">x（m）</text>
        </svg>

        <label className="block space-y-2">
          <span className="font-bold">変位 x = {state.extension.toFixed(2)} m</span>
          <input aria-label="ばねの変位" type="range" min={springMinimumExtension} max={springMaximumExtension} step="0.01" value={state.extension} onChange={event => setExtension(Number(event.target.value))} className="w-full accent-blue-600" />
          <span className="block text-xs text-slate-500">負の値は圧縮、正の値は伸長です。x=0を通り過ぎると復元力の向きが反転します。</span>
        </label>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="border bg-blue-50 p-3"><span className="text-slate-600">変位 x</span><p className="text-lg font-bold">{state.extension.toFixed(2)} m</p></div>
          <div className="border bg-red-50 p-3"><span className="text-slate-600">復元力 F=−kx</span><p className="text-lg font-bold">{forceText} N</p><p className="text-xs">伸び・縮みと反対向き</p></div>
          <div className="border bg-amber-50 p-3"><span className="text-slate-600">弾性エネルギー U=½kx²</span><p className="text-lg font-bold">{energyText} J</p><p className="text-xs">xの正負によらず0以上</p></div>
        </div>
      </section>

      <section className="retro-box space-y-2 bg-slate-50 p-4">
        <h2 className="font-bold">読み取りポイント</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>復元力は F=−kx。xが正なら左向き、xが負なら右向きにはたらきます。</li>
          <li>弾性エネルギー U=½kx² は変位を2乗するので、同じ大きさだけ伸ばした場合と縮めた場合で等しくなります。</li>
          <li>自然長では復元力も弾性エネルギーも0です。ばねの力の計算問題で確認しましょう。</li>
        </ul>
      </section>
    </main>
  );
}
