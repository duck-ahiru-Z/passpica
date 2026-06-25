"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

type TrigonometricFunc = 'sin' | 'cos' | 'tan';

interface Preset {
  name: string;
  func: TrigonometricFunc;
  a: number;
  b: number;
  c: number;
  d: number;
  description: string;
}

const PRESETS: Preset[] = [
  {
    name: '① 基本形 (y = sin θ)',
    func: 'sin',
    a: 1.0,
    b: 1.0,
    c: 0,
    d: 0.0,
    description: '基本となるサイン波です。振幅1、周期360° (2π) です。'
  },
  {
    name: '② 振幅を2倍にする (y = 2 sin θ)',
    func: 'sin',
    a: 2.0,
    b: 1.0,
    c: 0,
    d: 0.0,
    description: 'a = 2 にすることで、波の高さ（振幅）が縦方向に2倍に拡大します。'
  },
  {
    name: '③ 周期を半分にする (y = sin 2θ)',
    func: 'sin',
    a: 1.0,
    b: 2.0,
    c: 0,
    d: 0.0,
    description: 'b = 2 にすることで、波の密度が2倍になり、周期が 180° (π) に短縮されます。'
  },
  {
    name: '④ 右へ平行移動 (y = cos(θ - 60°))',
    func: 'cos',
    a: 1.0,
    b: 1.0,
    c: 60,
    d: 0.0,
    description: 'c = 60° にすることで、コサインのグラフ全体が右（正の方向）へ 60° 平行移動します。'
  },
  {
    name: '⑤ 上へ平行移動 (y = sin θ + 1)',
    func: 'sin',
    a: 1.0,
    b: 1.0,
    c: 0,
    d: 1.0,
    description: 'd = 1 にすることで、グラフ全体が上方向へ 1 目盛り分平行移動します。'
  },
  {
    name: '⑥ 応用：よく出る形 (y = 2 cos(2θ - 60°) + 1)',
    func: 'cos',
    a: 2.0,
    b: 2.0,
    c: 30, // 2(θ - 30) = 2θ - 60
    d: 1.0,
    description: '式を 2cos(2(θ - 30°)) + 1 と変形します。振幅2倍、周期半分、右へ30°、上へ1移動します。'
  },
  {
    name: '⑦ タンジェントの移動 (y = tan(θ + 45°))',
    func: 'tan',
    a: 1.0,
    b: 1.0,
    c: -45,
    d: 0.0,
    description: 'c = -45° にすることで、漸近線を含めた正接波形全体が左へ 45° 平行移動します。'
  }
];

export default function TrigonometryGraphPage() {
  // --- 状態管理 ---
  const [func, setFunc] = useState<TrigonometricFunc>('sin');
  const [a, setA] = useState<number>(1.0); // 縦倍率
  const [b, setB] = useState<number>(1.0); // 横倍率
  const [c, setC] = useState<number>(0);   // 左右移動 (度数法)
  const [d, setD] = useState<number>(0.0); // 上下移動
  
  // 表示トグル
  const [showBase, setShowBase] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showProbe, setShowProbe] = useState<boolean>(true);
  
  // 座標プローブ位置
  const [probeX, setProbeX] = useState<number>(60);

  // プリセット適用
  const applyPreset = (preset: Preset) => {
    setFunc(preset.func);
    setA(preset.a);
    setB(preset.b);
    setC(preset.c);
    setD(preset.d);
  };

  // 全リセット
  const handleReset = () => {
    setA(1.0);
    setB(1.0);
    setC(0);
    setD(0.0);
  };

  // --- SVGプロットパラメータ ---
  const width = 500;
  const height = 300;
  const cx = 250; // 原点 X
  const cy = 150; // 原点 Y
  const scaleX = 200 / 360; // 360度 = 200px
  const scaleY = 110 / 3.0; // 3.0単位 = 110px
  const maxMathY = 3.5;

  // 基準波形の数式評価
  const evalBase = (deg: number): number => {
    const rad = (deg * Math.PI) / 180;
    if (func === 'sin') return Math.sin(rad);
    if (func === 'cos') return Math.cos(rad);
    return Math.tan(rad);
  };

  // 変形波形の数式評価
  const evalTrans = (deg: number): number => {
    const inputDeg = b * (deg - c);
    const rad = (inputDeg * Math.PI) / 180;
    if (func === 'sin') return a * Math.sin(rad) + d;
    if (func === 'cos') return a * Math.cos(rad) + d;
    return a * Math.tan(rad) + d;
  };

  // SVGパス生成
  const generatePath = (isTransformed: boolean) => {
    const points: string[] = [];
    let isFirst = true;
    let lastY = 0;

    for (let deg = -360; deg <= 360; deg += 2) {
      const yVal = isTransformed ? evalTrans(deg) : evalBase(deg);
      
      const isOut = Math.abs(yVal) > maxMathY + 1.0;
      const isJump = !isFirst && func === 'tan' && (Math.abs(yVal - lastY) > 2.5) && (yVal * lastY < 0);

      const px = cx + deg * scaleX;
      const py = cy - yVal * scaleY;

      if (isOut) {
        isFirst = true;
      } else if (isJump) {
        points.push(`M ${px.toFixed(1)} ${py.toFixed(1)}`);
      } else {
        if (isFirst) {
          points.push(`M ${px.toFixed(1)} ${py.toFixed(1)}`);
          isFirst = false;
        } else {
          points.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
        }
      }
      lastY = yVal;
    }
    return points.join(' ');
  };

  // 数式の日本語整形テキスト
  const getEquationText = () => {
    const termA = a === 1 ? '' : a === -1 ? '-' : `${a}`;
    const termB = b === 1 ? '' : `${b}`;
    const termC = c === 0 ? 'θ' : c > 0 ? `(θ - ${c}°)` : `(θ + ${Math.abs(c)}°)`;
    
    let inner = termB ? `${termB}${termC}` : termC;
    if (termB && c !== 0) {
      inner = `${termB}${termC}`;
    }

    // カッコの整理
    const termFunc = `${func}`;
    const mainTerm = termB && c !== 0 ? `${termFunc}(${inner})` : `${termFunc} ${inner}`;
    
    let termD = '';
    if (d > 0) termD = ` + ${d}`;
    else if (d < 0) termD = ` - ${Math.abs(d)}`;

    return `y = ${termA}${mainTerm}${termD}`;
  };

  // プローブの座標値
  const probeYBase = evalBase(probeX);
  const probeYTrans = evalTrans(probeX);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 数学II・三角関数
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          三角関数の平行移動・拡大縮小シミュレーター
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          式 $y = a \sin(b(\theta - c)) + d$ の各係数 $a, b, c, d$ を操作し、波の振幅・周期・位置がどのように変形するかを学びます。
        </p>
      </div>

      {/* プリセット選択エリア */}
      <div className="border border-gray-300 bg-gray-50 p-4 space-y-2.5">
        <span className="font-bold text-slate-700 block">■ 学びたいグラフのプリセットを選択</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="retro-btn-classic text-left text-[11px]"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* メインレイアウト：左グラフ、右コントロール */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：グラフビジュアライザ (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 動的方程式看板 */}
          <div className="border border-gray-400 bg-white p-3 text-center">
            <span className="text-[10px] text-gray-400 font-bold block mb-1">【現在表示中の関数式】</span>
            <div className="text-lg md:text-xl font-bold text-blue-700 font-mono tracking-wide">
              {getEquationText()}
            </div>
          </div>

          {/* SVGプロットボックス */}
          <div className="border border-gray-300 bg-white p-4 flex flex-col items-center justify-center min-h-[340px]">
            <div className="w-full aspect-[5/3] max-w-2xl relative">
              <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-full overflow-visible font-mono"
              >
                {/* グリッド線 */}
                {showGrid && (
                  <>
                    {/* 横軸グリッド */}
                    {[-3, -2, -1, 1, 2, 3].map(y => (
                      <line
                        key={`grid-y-${y}`}
                        x1="45"
                        y1={cy - y * scaleY}
                        x2="455"
                        y2={cy - y * scaleY}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    ))}
                    {/* 縦軸グリッド */}
                    {[-360, -270, -180, -90, 90, 180, 270, 360].map(x => (
                      <line
                        key={`grid-x-${x}`}
                        x1={cx + x * scaleX}
                        y1="25"
                        x2={cx + x * scaleX}
                        y2="265"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    ))}
                  </>
                )}

                {/* 主要座標軸 */}
                <line x1="40" y1={cy} x2="460" y2={cy} stroke="#94a3b8" strokeWidth="1.5" /> {/* θ軸 */}
                <line x1={cx} y1="20" x2={cx} y2="270" stroke="#94a3b8" strokeWidth="1.5" /> {/* y軸 */}

                {/* 軸の矢印 */}
                <path d={`M 460 ${cy} L 454 ${cy - 4} L 454 ${cy + 4} Z`} fill="#94a3b8" />
                <path d={`M ${cx} 20 L ${cx - 4} 26 L ${cx + 4} 26 Z`} fill="#94a3b8" />

                {/* 軸ラベル */}
                <text x="470" y={cy + 4} fill="#64748b" fontSize="10" fontWeight="bold">θ</text>
                <text x={cx - 15} y="15" fill="#64748b" fontSize="10" fontWeight="bold">y</text>
                <text x={cx + 5} y={cy + 12} fill="#64748b" fontSize="9">0</text>

                {/* X軸目盛りラベル */}
                {[
                  { deg: -360, rad: '-2π', offset: -10 },
                  { deg: -270, rad: '-3π/2', offset: -15 },
                  { deg: -180, rad: '-π', offset: -8 },
                  { deg: -90, rad: '-π/2', offset: -12 },
                  { deg: 90, rad: 'π/2', offset: -10 },
                  { deg: 180, rad: 'π', offset: -5 },
                  { deg: 270, rad: '3π/2', offset: -12 },
                  { deg: 360, rad: '2π', offset: -8 }
                ].map(tick => (
                  <g key={`tick-x-${tick.deg}`}>
                    <line x1={cx + tick.deg * scaleX} y1={cy - 3} x2={cx + tick.deg * scaleX} y2={cy + 3} stroke="#64748b" strokeWidth="1" />
                    <text x={cx + tick.deg * scaleX + tick.offset} y={cy + 15} fill="#64748b" fontSize="8" className="select-none">
                      {tick.rad}
                    </text>
                    <text x={cx + tick.deg * scaleX - 12} y={cy + 25} fill="#94a3b8" fontSize="7" className="select-none">
                      ({tick.deg}°)
                    </text>
                  </g>
                ))}

                {/* Y軸目盛りラベル */}
                {[-3, -2, -1, 1, 2, 3].map(y => (
                  <g key={`tick-y-${y}`}>
                    <line x1={cx - 3} y1={cy - y * scaleY} x2={cx + 3} y2={cy - y * scaleY} stroke="#64748b" strokeWidth="1" />
                    <text x={cx - 16} y={cy - y * scaleY + 3} fill="#64748b" fontSize="8" className="select-none text-right">
                      {y}
                    </text>
                  </g>
                ))}

                {/* 1. 基準波形（グレーの破線） */}
                {showBase && (
                  <path
                    d={generatePath(false)}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                  />
                )}

                {/* 2. 変形波形（青色の太線） */}
                <path
                  d={generatePath(true)}
                  fill="none"
                  stroke={func === 'sin' ? '#2563eb' : func === 'cos' ? '#dc2626' : '#d97706'}
                  strokeWidth="2.3"
                />

                {/* 3. 座標プローブ（縦ガイド線 ＋ プロット点） */}
                {showProbe && (
                  <>
                    {/* ガイド線 */}
                    <line
                      x1={cx + probeX * scaleX}
                      y1="25"
                      x2={cx + probeX * scaleX}
                      y2="265"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />

                    {/* 基準波形上の点 */}
                    {showBase && Math.abs(probeYBase) <= maxMathY && (
                      <circle
                        cx={cx + probeX * scaleX}
                        cy={cy - probeYBase * scaleY}
                        r="4.5"
                        fill="#fff"
                        stroke="#64748b"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* 変形波形上の点 */}
                    {Math.abs(probeYTrans) <= maxMathY && (
                      <circle
                        cx={cx + probeX * scaleX}
                        cy={cy - probeYTrans * scaleY}
                        r="5"
                        fill="#10b981"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* 凡例トグルボタン群 */}
          <div className="flex flex-wrap justify-between items-center gap-2 border border-gray-300 p-2.5 bg-gray-50">
            <div className="flex gap-4">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBase}
                  onChange={(e) => setShowBase(e.target.checked)}
                />
                <span>基準グラフ表示 (グレー破線)</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                <span>グリッド線表示</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProbe}
                  onChange={(e) => setShowProbe(e.target.checked)}
                />
                <span>座標プローブ有効化</span>
              </label>
            </div>
            <button
              onClick={handleReset}
              className="retro-btn-classic bg-amber-50 border-amber-400 font-bold hover:bg-amber-100"
            >
              パラメータ初期化
            </button>
          </div>

        </div>

        {/* 右側：コントロールパネル (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* コントロールボックス */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 関数とパラメータの調整
            </h3>

            {/* 関数選択 */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 block">1. 対象の関数を選択</span>
              <div className="grid grid-cols-3 gap-1">
                {(['sin', 'cos', 'tan'] as TrigonometricFunc[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFunc(f)}
                    className={`retro-btn-classic text-center font-bold ${func === f ? 'bg-[#cbd5e1] font-bold' : ''}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* パラメータ a (縦拡大) */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>a : 縦の倍率 (振幅)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="-3.0"
                    max="3.0"
                    value={a}
                    onChange={(e) => setA(parseFloat(e.target.value) || 0)}
                    className="retro-input w-12 text-center text-[10px]"
                  />
                  <button onClick={() => setA(1.0)} className="text-[9px] border border-gray-300 px-1 py-0.5 bg-white">1.0</button>
                </div>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* パラメータ b (横倍率/周期) */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>b : 横の倍率 (周期係数)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="4.0"
                    value={b}
                    onChange={(e) => setB(Math.max(0.1, parseFloat(e.target.value) || 1))}
                    className="retro-input w-12 text-center text-[10px]"
                  />
                  <button onClick={() => setB(1.0)} className="text-[9px] border border-gray-300 px-1 py-0.5 bg-white">1.0</button>
                </div>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* パラメータ c (左右平行移動) */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>c : 左右平行移動 (角度)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="5"
                    min="-360"
                    max="360"
                    value={c}
                    onChange={(e) => setC(parseInt(e.target.value) || 0)}
                    className="retro-input w-12 text-center text-[10px]"
                  />
                  <button onClick={() => setC(0)} className="text-[9px] border border-gray-300 px-1 py-0.5 bg-white">0°</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-360"
                  max="360"
                  step="15"
                  value={c}
                  onChange={(e) => setC(parseInt(e.target.value))}
                  className="flex-grow cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 px-0.5">
                <span>左に360°</span>
                <span>0°</span>
                <span>右に360°</span>
              </div>
            </div>

            {/* パラメータ d (上下平行移動) */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>d : 上下平行移動</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="-3.0"
                    max="3.0"
                    value={d}
                    onChange={(e) => setD(parseFloat(e.target.value) || 0)}
                    className="retro-input w-12 text-center text-[10px]"
                  />
                  <button onClick={() => setD(0.0)} className="text-[9px] border border-gray-300 px-1 py-0.5 bg-white">0.0</button>
                </div>
              </div>
              <input
                type="range"
                min="-3.0"
                max="3.0"
                step="0.1"
                value={d}
                onChange={(e) => setD(parseFloat(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* プローブ位置調整 */}
            {showProbe && (
              <div className="space-y-1 border-t border-gray-200 pt-2.5">
                <div className="flex justify-between items-center text-emerald-800 font-bold">
                  <span>プローブ点 θ 位置の調整</span>
                  <span className="font-mono text-[10px] bg-emerald-50 border border-emerald-300 px-1.5 py-0.5">
                    θ = {probeX}° ({((probeX * Math.PI) / 180).toFixed(2)} rad)
                  </span>
                </div>
                <input
                  type="range"
                  min="-360"
                  max="360"
                  step="5"
                  value={probeX}
                  onChange={(e) => setProbeX(parseInt(e.target.value))}
                  className="w-full cursor-ew-resize h-1 bg-emerald-100 rounded appearance-none border border-emerald-400"
                />
              </div>
            )}

          </div>

          {/* リアルタイム座標モニター（プローブ詳細） */}
          {showProbe && (
            <div className="retro-box space-y-3 bg-emerald-50/20 border-emerald-300">
              <h3 className="font-bold border-b border-emerald-300 pb-1.5 text-emerald-900 flex items-center gap-1">
                <span>■</span> 座標プローブモニター (θ = {probeX}°)
              </h3>
              
              <table className="w-full text-[10px] font-mono text-left leading-normal border-collapse">
                <thead>
                  <tr className="border-b border-emerald-200 text-emerald-800 font-sans">
                    <th className="pb-1">対象</th>
                    <th className="pb-1 text-right">高さ y</th>
                    <th className="pb-1 text-right">座標値 (θ, y)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dashed border-emerald-100 text-gray-500">
                    <td className="py-1">基準 {func}</td>
                    <td className="py-1 text-right">{Math.abs(probeYBase) > 99 ? '未定義' : probeYBase.toFixed(4)}</td>
                    <td className="py-1 text-right">({probeX}°, {Math.abs(probeYBase) > 99 ? '未定義' : probeYBase.toFixed(2)})</td>
                  </tr>
                  <tr className="text-blue-900 font-bold">
                    <td className="py-1.5">変形後</td>
                    <td className="py-1.5 text-right">{Math.abs(probeYTrans) > maxMathY ? '範囲外/未定義' : probeYTrans.toFixed(4)}</td>
                    <td className="py-1.5 text-right">({probeX}°, {Math.abs(probeYTrans) > maxMathY ? '範囲外' : probeYTrans.toFixed(2)})</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-[10px] leading-relaxed text-emerald-800 bg-white p-2 border border-emerald-200">
                <span className="font-bold block">💡 座標の解釈:</span>
                基準グラフの点（白ドット）がパラメータ変更によって移動・伸縮し、緑ドットの位置に変化した様子を表しています。
              </div>
            </div>
          )}

          {/* 解説メモ */}
          <div className="retro-box leading-relaxed space-y-3 bg-gray-50">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 変形の数学的パラメータの意味
            </h3>
            <table className="w-full text-[10px] leading-normal border-collapse">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 font-bold text-slate-700 w-12">振幅</td>
                  <td className="py-1 text-gray-600">
                    {func === 'tan' ? '定義なし' : `最大値・最小値の幅：|a| = ${Math.abs(a).toFixed(1)}`}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 font-bold text-slate-700">周期</td>
                  <td className="py-1 text-gray-600">
                    {func === 'tan' 
                      ? `180° / b = ${(180 / b).toFixed(1)}° (${(Math.PI / b).toFixed(2)} rad)`
                      : `360° / b = ${(360 / b).toFixed(1)}° (${((2 * Math.PI) / b).toFixed(2)} rad)`
                    }
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 font-bold text-slate-700">値域</td>
                  <td className="py-1 text-gray-600">
                    {func === 'tan' 
                      ? '実数全体' 
                      : `[ ${(-Math.abs(a) + d).toFixed(2)}, ${(Math.abs(a) + d).toFixed(2)} ]`
                    }
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-slate-700">移動量</td>
                  <td className="py-1 text-gray-600">
                    θ方向に {c > 0 ? `右へ ${c}°` : c < 0 ? `左へ ${Math.abs(c)}°` : '移動なし'}、
                    y方向に {d > 0 ? `上へ ${d}` : d < 0 ? `下へ ${Math.abs(d)}` : '移動なし'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
