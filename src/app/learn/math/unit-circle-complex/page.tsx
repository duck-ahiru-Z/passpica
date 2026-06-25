"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function UnitCircleComplexPage() {
  // --- 状態管理 ---
  // 複素数 z1
  const [r1, setR1] = useState<number>(1.0);       // 絶対値 |z1|
  const [theta1, setTheta1] = useState<number>(45); // 偏角 θ1 (度)

  // 複素数 z2
  const [r2, setR2] = useState<number>(1.2);       // 絶対値 |z2|
  const [theta2, setTheta2] = useState<number>(60); // 偏角 θ2 (度)

  // 表示オプション
  const [showZ1, setShowZ1] = useState<boolean>(true);
  const [showZ2, setShowZ2] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // --- 数学計算 ---
  const rad1 = (theta1 * Math.PI) / 180;
  const rad2 = (theta2 * Math.PI) / 180;

  // デカルト座標表示
  const z1_x = r1 * Math.cos(rad1);
  const z1_y = r1 * Math.sin(rad1);

  const z2_x = r2 * Math.cos(rad2);
  const z2_y = r2 * Math.sin(rad2);

  // 積 z3 = z1 * z2
  const r3 = r1 * r2;
  const theta3 = (theta1 + theta2) % 360;
  const rad3 = (theta3 * Math.PI) / 180;
  
  const z3_x = r3 * Math.cos(rad3);
  const z3_y = r3 * Math.sin(rad3);

  // --- SVGプロット定数 ---
  const width = 320;
  const height = 320;
  const cx = 160;
  const cy = 160;
  const radius = 80; // 絶対値 = 1.0 が 80px に対応

  // ベクトル座標マッピング
  const getVecCoords = (x: number, y: number) => {
    return {
      x: cx + x * radius,
      y: cy - y * radius // SVGのy軸は下向きなので反転
    };
  };

  const c_z1 = getVecCoords(z1_x, z1_y);
  const c_z2 = getVecCoords(z2_x, z2_y);
  const c_z3 = getVecCoords(z3_x, z3_y);

  // 角度弧を描くパスヘルパー
  const getAngleArcPath = (rad: number, r_px: number) => {
    const endX = cx + r_px * Math.cos(rad);
    const endY = cy - r_px * Math.sin(rad);
    // 角度が180度を超えるかどうかのフラグ
    const largeArc = rad > Math.PI ? 1 : 0;
    return `M ${cx + r_px} ${cy} A ${r_px} ${r_px} 0 ${largeArc} 0 ${endX} ${endY}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 数学III・複素数平面
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          単位円と複素数平面の回転・極形式ビジュアル装置
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          2つの複素数 z₁、z₂ を操作し、その積 z₁・z₂ が複素数平面上で「回転と伸縮」を同時に表す幾何学的関係（ド・モアブルの定理と極形式の積）を視覚的に理解します。
        </p>
      </div>

      {/* メイングリッド：複素数平面 ＋ コントロール */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：複素数平面 (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[400px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700 flex justify-between items-center select-none">
            <span>複素数平面（ガウス平面）</span>
            <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              z₃ = z₁ × z₂
            </span>
          </div>

          {/* SVG描画 */}
          <div className="flex items-center justify-center flex-grow w-full relative">
            <svg 
              width={width} 
              height={height} 
              viewBox={`0 0 ${width} ${height}`} 
              className="overflow-visible font-mono"
            >
              {/* グリッド補助円（r = 0.5, 1.0, 1.5） */}
              {showGrid && (
                <>
                  <circle cx={cx} cy={cy} r={radius * 0.5} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  <circle cx={cx} cy={cy} r={radius * 1.5} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </>
              )}

              {/* 基準の単位円 (r = 1.0) */}
              <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,3" />
              
              {/* x軸・y軸 (実軸 Re・虚軸 Im) */}
              <line x1="10" y1={cy} x2={width - 10} y2={cy} stroke="#64748b" strokeWidth="1.5" />
              <line x1={cx} y1="10" x2={cx} y2={height - 10} stroke="#64748b" strokeWidth="1.5" />

              {/* 軸の先端矢印 */}
              <path d={`M ${width - 10} ${cy} L ${width - 16} ${cy - 3} L ${width - 16} ${cy + 3} Z`} fill="#64748b" />
              <path d={`M ${cx} 10 L ${cx - 3} 16 L ${cx + 3} 16 Z`} fill="#64748b" />

              {/* 軸ラベル */}
              <text x={width - 25} y={cy + 12} fill="#64748b" fontSize="9" fontWeight="bold">Re (実軸)</text>
              <text x={cx + 6} y="22" fill="#64748b" fontSize="9" fontWeight="bold">Im (虚軸)</text>
              <text x={cx + radius + 4} y={cy + 10} fill="#94a3b8" fontSize="8">1</text>
              <text x={cx - 10} y={cy - radius + 4} fill="#94a3b8" fontSize="8">i</text>
              <text x={cx - 14} y={cy + radius + 8} fill="#94a3b8" fontSize="8">-i</text>

              {/* 1. 偏角アーク表示 */}
              {showZ1 && theta1 > 0 && (
                <path d={getAngleArcPath(rad1, 20)} fill="none" stroke="#2563eb" strokeWidth="1.2" opacity="0.6" />
              )}
              {showZ2 && theta2 > 0 && (
                <path d={getAngleArcPath(rad2, 30)} fill="none" stroke="#ea580c" strokeWidth="1.2" opacity="0.6" />
              )}
              {theta3 > 0 && (
                <path d={getAngleArcPath(rad3, 40)} fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="1,1" opacity="0.8" />
              )}

              {/* 2. ベクトル z1 (青) */}
              {showZ1 && (
                <g>
                  <line x1={cx} y1={cy} x2={c_z1.x} y2={c_z1.y} stroke="#2563eb" strokeWidth="2" />
                  <circle cx={c_z1.x} cy={c_z1.y} r="4.5" fill="#fff" stroke="#2563eb" strokeWidth="1.5" />
                  <text x={c_z1.x + 6} y={c_z1.y - 4} fill="#2563eb" fontSize="9" fontWeight="bold">z₁</text>
                </g>
              )}

              {/* 3. ベクトル z2 (オレンジ) */}
              {showZ2 && (
                <g>
                  <line x1={cx} y1={cy} x2={c_z2.x} y2={c_z2.y} stroke="#ea580c" strokeWidth="2" />
                  <circle cx={c_z2.x} cy={c_z2.y} r="4.5" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
                  <text x={c_z2.x + 6} y={c_z2.y - 4} fill="#ea580c" fontSize="9" fontWeight="bold">z₂</text>
                </g>
              )}

              {/* 4. ベクトル z3 = z1 * z2 (紫) */}
              <g>
                <line x1={cx} y1={cy} x2={c_z3.x} y2={c_z3.y} stroke="#7c3aed" strokeWidth="2.5" />
                <circle cx={c_z3.x} cy={c_z3.y} r="5" fill="#7c3aed" stroke="#0f172a" strokeWidth="1.5" />
                <text x={c_z3.x + 6} y={c_z3.y - 4} fill="#7c3aed" fontSize="10" fontWeight="bold">z₃ = z₁·z₂</text>
              </g>

              {/* 幾何学的接続補助線 (z1からz3への回転比率を表現する等比三角形用) */}
            </svg>
          </div>

          {/* 表示トグル */}
          <div className="flex gap-4 border-t border-gray-200 pt-3 w-full justify-center text-[10px]">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showZ1} onChange={(e) => setShowZ1(e.target.checked)} />
              <span>z₁ を表示</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showZ2} onChange={(e) => setShowZ2(e.target.checked)} />
              <span>z₂ を表示</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
              <span>同心円グリッドを表示</span>
            </label>
          </div>

        </div>

        {/* 右側：コントロール ＋ 極形式数式モニター (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* コントロールボックス */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 複素数パラメータ調整
            </h3>

            {/* z1 のスライダー */}
            <div className="space-y-2 bg-blue-50/30 p-2.5 border border-blue-200">
              <span className="font-bold text-blue-800 block text-[10px]">複素数 z₁ (青色)</span>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>絶対値 |z₁| (長さ)</span>
                  <span className="font-mono text-blue-700">{r1.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.8"
                  step="0.05"
                  value={r1}
                  onChange={(e) => setR1(parseFloat(e.target.value))}
                  className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
                />
              </div>

              <div className="space-y-1 pt-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>偏角 θ₁ (角度)</span>
                  <span className="font-mono text-blue-700">{theta1}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={theta1}
                  onChange={(e) => setTheta1(parseInt(e.target.value))}
                  className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
                />
              </div>
            </div>

            {/* z2 のスライダー */}
            <div className="space-y-2 bg-orange-50/30 p-2.5 border border-orange-200">
              <span className="font-bold text-orange-800 block text-[10px]">複素数 z₂ (橙色)</span>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>絶対値 |z₂| (長さ)</span>
                  <span className="font-mono text-orange-700">{r2.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.8"
                  step="0.05"
                  value={r2}
                  onChange={(e) => setR2(parseFloat(e.target.value))}
                  className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
                />
              </div>

              <div className="space-y-1 pt-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>偏角 θ₂ (角度)</span>
                  <span className="font-mono text-orange-700">{theta2}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={theta2}
                  onChange={(e) => setTheta2(parseInt(e.target.value))}
                  className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
                />
              </div>
            </div>

            {/* ワンタップでリセット */}
            <div className="text-center">
              <button
                onClick={() => {
                  setR1(1.0); setTheta1(45);
                  setR2(1.2); setTheta2(60);
                }}
                className="retro-btn-classic text-[10px] bg-slate-50 border-slate-300 hover:bg-slate-100 py-1 px-3"
              >
                初期パラメータに戻す
              </button>
            </div>

          </div>

          {/* 数式モニター (極形式 ＋ オイラー形式 ＋ 直交形式) */}
          <div className="retro-box space-y-3 font-mono">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800 font-sans">
              ■ 複素数の数値表現
            </h3>

            {/* z1 数式 */}
            <div className="border border-blue-200 bg-blue-50/20 p-2 text-[10px] space-y-1">
              <span className="font-bold text-blue-800 font-sans">z₁ :</span>
              <div>極形式: {r1.toFixed(2)} (cos {theta1}° + i sin {theta1}°)</div>
              <div>オイラー: {r1.toFixed(2)} e^(i {theta1}°)</div>
              <div className="text-gray-500">直交形式: {z1_x.toFixed(3)} + {z1_y.toFixed(3)} i</div>
            </div>

            {/* z2 数式 */}
            <div className="border border-orange-200 bg-orange-50/20 p-2 text-[10px] space-y-1">
              <span className="font-bold text-orange-800 font-sans">z₂ :</span>
              <div>極形式: {r2.toFixed(2)} (cos {theta2}° + i sin {theta2}°)</div>
              <div>オイラー: {r2.toFixed(2)} e^(i {theta2}°)</div>
              <div className="text-gray-500">直交形式: {z2_x.toFixed(3)} + {z2_y.toFixed(3)} i</div>
            </div>

            {/* z3 数式 (積) */}
            <div className="border border-purple-200 bg-purple-50/20 p-2 text-[10px] space-y-1">
              <span className="font-bold text-purple-800 font-sans">z₃ = z₁ · z₂ :</span>
              <div className="font-bold text-purple-900">極形式: {r3.toFixed(2)} (cos {theta3}° + i sin {theta3}°)</div>
              <div>オイラー: {r3.toFixed(2)} e^(i {theta3}°)</div>
              <div className="text-gray-500">直交形式: {z3_x.toFixed(3)} + {z3_y.toFixed(3)} i</div>
            </div>

          </div>

          {/* 数学III解説メモ */}
          <div className="retro-box leading-relaxed space-y-2.5 bg-gray-50">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 積と「回転・拡大」の法則
            </h3>
            
            <div className="text-[10px] text-gray-600 space-y-2 leading-relaxed">
              <p>
                複素数平面における複素数の掛け算は、幾何学的に以下の性質を持ちます：
              </p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  <strong className="text-slate-800">絶対値 (長さ) の積</strong>:<br />
                  |z₃| = |z₁|・|z₂| (長さは掛け算になります。1.0 × 1.2 = {r3.toFixed(2)})。
                </li>
                <li>
                  <strong className="text-slate-800">偏角 (角度) の和</strong>:<br />
                  arg(z₃) = arg(z₁) + arg(z₂) (角度は足し算になります。{theta1}° + {theta2}° = {theta3}°)。
                </li>
              </ul>
              <p className="border-t border-gray-200 pt-2 text-[9px] text-gray-500">
                これにより、絶対値が1の複素数（単位円上の点）を掛けることは、平面上の点（またはベクトル）を**「長さは変えずに、角度だけ回転させる」**ことと同等になります。
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
