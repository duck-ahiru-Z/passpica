'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type CurveKind = 'ellipse' | 'hyperbola' | 'parabola';
const WIDTH = 480;
const HEIGHT = 340;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const SCALE = 34;
const X_MIN = -6.4;
const X_MAX = 6.4;
const Y_MIN = -5;
const Y_MAX = 5;
const sx = (x: number) => CENTER_X + x * SCALE;
const sy = (y: number) => CENTER_Y - y * SCALE;
const pathFrom = (points: Array<[number, number]>) => points.map(([x, y], index) => `${index ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`).join(' ');

export default function ConicSectionsVisualPage() {
  const [kind, setKind] = useState<CurveKind>('ellipse');
  const [a, setA] = useState(4);
  const [b, setB] = useState(3);
  const [p, setP] = useState(1.5);
  const ellipsePaths = useMemo(() => {
    const points = Array.from({ length: 241 }, (_, index) => {
      const theta = (2 * Math.PI * index) / 240;
      return [a * Math.cos(theta), b * Math.sin(theta)] as [number, number];
    });
    return pathFrom(points);
  }, [a, b]);
  const hyperbolaPaths = useMemo(() => {
    const xs = Array.from({ length: 161 }, (_, index) => a + ((5.9 - a) * index) / 160);
    return [1, -1].flatMap(signX => [1, -1].map(signY => pathFrom(xs.map(x => [signX * x, signY * b * Math.sqrt((x * x) / (a * a) - 1)]))));
  }, [a, b]);
  const parabolaPaths = useMemo(() => {
    const ys = Array.from({ length: 181 }, (_, index) => -4.8 + (9.6 * index) / 180);
    return [pathFrom(ys.map(y => [y * y / (4 * p), y]))];
  }, [p]);
  const cEllipse = Math.sqrt(Math.max(0, a * a - b * b));
  const cHyperbola = Math.sqrt(a * a + b * b);
  const curvePath = kind === 'ellipse' ? [ellipsePaths] : kind === 'hyperbola' ? hyperbolaPaths : parabolaPaths;
  const equation = kind === 'ellipse'
    ? `x²/${a * a} + y²/${b * b} = 1`
    : kind === 'hyperbola' ? `x²/${a * a} − y²/${b * b} = 1` : `y² = ${4 * p}x`;
  const focusDescription = kind === 'ellipse'
    ? `焦点 F₁, F₂ = (±${cEllipse.toFixed(2)}, 0)　 c² = a² − b²`
    : kind === 'hyperbola' ? `焦点 F₁, F₂ = (±${cHyperbola.toFixed(2)}, 0)　 c² = a² + b²`
      : `焦点 F = (${p.toFixed(2)}, 0)　準線 x = −${p.toFixed(2)}`;
  const visualDescription = kind === 'ellipse'
    ? `楕円 ${equation}。長半径a=${a}、短半径b=${b}、焦点距離c=${cEllipse.toFixed(2)}。`
    : kind === 'hyperbola' ? `双曲線 ${equation}。a=${a}、b=${b}、焦点距離c=${cHyperbola.toFixed(2)}。漸近線の傾きは±${(b / a).toFixed(2)}。`
      : `放物線 ${equation}。焦点は(${p.toFixed(2)},0)、準線はx=−${p.toFixed(2)}。`;

  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-8 text-sm text-slate-800">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-500">数学III / 式と曲線</p><h1 className="text-xl font-bold md:text-2xl">楕円・双曲線・放物線ビジュアル</h1></div><Link href="/learn" className="retro-btn-classic">学習一覧へ</Link></div>
    <section className="retro-box space-y-4 bg-white p-4 sm:p-6">
      <p className="leading-6 text-slate-600">標準形の係数を動かし、曲線の形と焦点・準線の位置がどう結び付くかを比較します。図の点や線は、選んだ式から計算しています。</p>
      <label className="block font-bold" htmlFor="conic-kind">曲線を選択</label>
      <select id="conic-kind" aria-label="曲線の種類" className="w-full border bg-white p-2 sm:w-auto" value={kind} onChange={event => { const nextKind = event.target.value as CurveKind; setKind(nextKind); if (nextKind === 'ellipse') setB(current => Math.min(current, a)); }}>
        <option value="ellipse">楕円</option><option value="hyperbola">双曲線</option><option value="parabola">放物線</option>
      </select>
      {kind !== 'parabola' ? <div className="grid gap-4 sm:grid-cols-2">
        <label className="block font-semibold">{kind === 'ellipse' ? '長半径 a' : '実半軸 a'} = {a.toFixed(1)}<input aria-label={kind === 'ellipse' ? '長半径 a' : '実半軸 a'} className="mt-2 w-full accent-blue-700" type="range" min="2" max="5" step="0.5" value={a} onChange={event => { const nextA = Number(event.target.value); setA(nextA); if (kind === 'ellipse') setB(current => Math.min(current, nextA)); }} /></label>
        <label className="block font-semibold">{kind === 'ellipse' ? '短半径 b' : '虚半軸 b'} = {b.toFixed(1)}<input aria-label={kind === 'ellipse' ? '短半径 b' : '虚半軸 b'} className="mt-2 w-full accent-blue-700" type="range" min="1" max={kind === 'ellipse' ? a : 3} step="0.5" value={b} onChange={event => setB(Number(event.target.value))} /></label>
      </div> : <label className="block font-semibold">焦点距離 p = {p.toFixed(1)}<input aria-label="焦点距離 p" className="mt-2 w-full accent-blue-700" type="range" min="0.5" max="2.5" step="0.5" value={p} onChange={event => setP(Number(event.target.value))} /></label>}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(250px,0.7fr)]">
        <div className="border bg-slate-50 p-2">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block h-auto w-full" role="img" aria-label={visualDescription}>
            <defs><clipPath id="conic-plot-clip"><rect x={sx(X_MIN)} y={sy(Y_MAX)} width={(X_MAX - X_MIN) * SCALE} height={(Y_MAX - Y_MIN) * SCALE} /></clipPath></defs>
            <line x1={sx(X_MIN)} y1={sy(0)} x2={sx(X_MAX)} y2={sy(0)} stroke="#94a3b8" /><line x1={sx(0)} y1={sy(Y_MIN)} x2={sx(0)} y2={sy(Y_MAX)} stroke="#94a3b8" />
            {kind === 'hyperbola' && <g clipPath="url(#conic-plot-clip)"><line x1={sx(X_MIN)} y1={sy((b / a) * X_MIN)} x2={sx(X_MAX)} y2={sy((b / a) * X_MAX)} stroke="#94a3b8" strokeDasharray="5 4" /><line x1={sx(X_MIN)} y1={sy((-b / a) * X_MIN)} x2={sx(X_MAX)} y2={sy((-b / a) * X_MAX)} stroke="#94a3b8" strokeDasharray="5 4" /></g>}
            {kind === 'parabola' && <line x1={sx(-p)} y1={sy(Y_MIN)} x2={sx(-p)} y2={sy(Y_MAX)} stroke="#d97706" strokeDasharray="5 4" />}
            <g clipPath="url(#conic-plot-clip)">{curvePath.map((curve, index) => <path key={index} d={curve} fill="none" stroke="#2563eb" strokeWidth="3" />)}</g>
            {kind === 'ellipse' && <g fill="#dc2626"><circle cx={sx(-cEllipse)} cy={sy(0)} r="5"/><circle cx={sx(cEllipse)} cy={sy(0)} r="5"/></g>}
            {kind === 'hyperbola' && <g fill="#dc2626"><circle cx={sx(-cHyperbola)} cy={sy(0)} r="5"/><circle cx={sx(cHyperbola)} cy={sy(0)} r="5"/></g>}
            {kind === 'parabola' && <circle cx={sx(p)} cy={sy(0)} r="5" fill="#dc2626"/>}
            <text x={sx(X_MAX) - 7} y={sy(0) - 7} textAnchor="end" fill="#64748b" fontSize="12">x</text><text x={sx(0) + 7} y={sy(Y_MAX) + 15} fill="#64748b" fontSize="12">y</text>
          </svg>
          <p className="px-2 pb-1 text-xs text-slate-500">青：曲線　赤：焦点　破線：漸近線または準線</p>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs font-bold text-blue-800">現在の方程式</p><p className="mt-2 break-words text-lg font-black">{equation}</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold text-slate-500">図形の要素</p><p className="mt-2 font-semibold">{focusDescription}</p>{kind === 'hyperbola' && <p className="mt-2 text-slate-600">漸近線：y = ±{(b / a).toFixed(2)}x</p>}{kind === 'parabola' && <p className="mt-2 text-slate-600">放物線上の点は、焦点と準線からの距離が等しくなります。</p>}</div>
          <div className="flex flex-wrap gap-2">{kind === 'ellipse' ? <Link href="/learn/math/ellipse-drill" className="retro-btn-classic">楕円の焦点・方程式を練習 →</Link> : <Link href="/learn/math/hyperbola-parabola-drill" className="retro-btn-classic">双曲線・放物線を練習 →</Link>}{kind === 'ellipse' && <Link href="/learn/math/hyperbola-parabola-drill" className="retro-btn-classic">双曲線・放物線も練習 →</Link>}</div>
        </div>
      </div>
    </section>
  </main>;
}
