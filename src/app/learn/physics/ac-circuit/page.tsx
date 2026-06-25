"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ACCircuitPage() {
  // --- 状態管理 ---
  const [r, setR] = useState<number>(100);     // 抵抗 R (Ω)
  const [l, setL] = useState<number>(0.4);     // コイル L (H)
  const [c, setC] = useState<number>(40);      // コンデンサ C (μF)
  const [f, setF] = useState<number>(50);      // 周波数 f (Hz)
  const [v0, setV0] = useState<number>(50);    // 電圧振幅 V0 (V)

  // 表示モード
  const [showPhasor, setShowPhasor] = useState<boolean>(true);

  // --- 電気力学計算 ---
  const omega = 2 * Math.PI * f;               // 角周波数 ω (rad/s)
  const xl = omega * l;                       // コイルのリアクタンス XL (Ω)
  const xc = 1 / (omega * c * 1e-6);          // コンデンサのリアクタンス XC (Ω)
  const x = xl - xc;                          // 合成リアクタンス X (Ω)
  const z = Math.sqrt(r * r + x * x);         // インピーダンス Z (Ω)
  const i0 = v0 / z;                          // 電流振幅 I0 (A)

  // 位相差 φ (rad) - 電圧に対する電流の遅れ角（電流基準だと電圧が φ 進む）
  // tan(φ) = (XL - XC) / R
  const phi = Math.atan2(x, r);
  const phiDeg = (phi * 180) / Math.PI;       // 度数法

  // 各素子の最大電圧 (V = I0 * X)
  const vr0 = i0 * r;
  const vl0 = i0 * xl;
  const vc0 = i0 * xc;

  // --- SVGプロットパス生成 ---
  // 波形グラフ描画
  const generateWaveforms = () => {
    const vPoints: string[] = [];
    const iPoints: string[] = [];
    
    const w = 400; // グラフ横幅
    const h = 160; // グラフ縦幅
    const cy = 80;  // 基準線 Y
    
    // 表示範囲は 2周期分とする
    const tMax = 2 / f; // 2周期 (秒)
    
    // 描画倍率
    const scaleT = (w - 40) / tMax;
    const scaleV = 55 / v0; // 電圧最大振幅が55pxになるよう調整
    const scaleI = 55 / (v0 / r); // 電流も抵抗のみの時と同じスケール感になるよう調整 (I0_max = V0/R)

    for (let px = 20; px <= w - 20; px++) {
      // 画面座標 px から 時間 t (s) を逆算
      const t = ((px - 20) / (w - 40)) * tMax;
      
      // 電圧 v(t) = V0 * sin(ωt)
      const vt = v0 * Math.sin(omega * t);
      // 電流 i(t) = I0 * sin(ωt - φ)
      const it = i0 * Math.sin(omega * t - phi);

      const pyV = cy - vt * scaleV;
      const pyI = cy - it * scaleI * r * 0.8; // 視覚的に重ねやすくなるよう調整

      if (px === 20) {
        vPoints.push(`M ${px} ${pyV.toFixed(1)}`);
        iPoints.push(`M ${px} ${pyI.toFixed(1)}`);
      } else {
        vPoints.push(`L ${px} ${pyV.toFixed(1)}`);
        iPoints.push(`L ${px} ${pyI.toFixed(1)}`);
      }
    }

    return {
      vPath: vPoints.join(' '),
      iPath: iPoints.join(' ')
    };
  };

  const { vPath, iPath } = generateWaveforms();

  // フェーザ図（ベクトル）の表示スケール
  // 電流ベクトル I0 は常にX軸上にプロット (電流基準フェーザ)
  // VR は X軸方向 (I0 * R)
  // VL は Y軸上方向 (I0 * XL)
  // VC は Y軸下方向 (I0 * XC)
  // V  は (VR, VL - VC) の斜め方向
  const vectorScale = 75 / Math.max(vr0, Math.max(vl0, vc0));
  const v_cx = 100;
  const v_cy = 100;

  const vec_vr_x = v_cx + vr0 * vectorScale;
  const vec_vr_y = v_cy;

  const vec_vl_x = v_cx;
  const vec_vl_y = v_cy - vl0 * vectorScale; // 上向きが負

  const vec_vc_x = v_cx;
  const vec_vc_y = v_cy + vc0 * vectorScale; // 下向きが正

  const vec_v_x = v_cx + vr0 * vectorScale;
  const vec_v_y = v_cy - (vl0 - vc0) * vectorScale;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 物理・電磁気（交流）
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          交流回路とインピーダンス位相ずれシミュレーター
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          抵抗 R、自己インダクタンス L、電気容量 C を直列につないだ交流回路で、周波数や素子の大きさを変化させて電圧と電流の位相のズレを観察します。
        </p>
      </div>

      {/* RLC直列回路の概略図 (Geocities風アスキー/SVGモデル) */}
      <div className="border border-gray-300 bg-gray-50 p-4 text-center">
        <span className="font-bold text-[10px] text-gray-500 block mb-2 select-none">【RLC 直列交流回路モデル】</span>
        <div className="flex justify-center items-center gap-2 font-mono text-slate-600 text-sm">
          <span>~ (AC電源) ─── [ R: 抵抗 ] ─── [ L: コイル ] ─── [ C: コンデンサ ] ─── (閉回路)</span>
        </div>
      </div>

      {/* メイングリッド：左グラフィック、右コントロール */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：グラフビジュアライザ (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* タイムライン波形グラフ */}
          <div className="border border-gray-300 bg-white p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
              <span className="font-bold text-slate-700">■ 電圧 v(t) と電流 i(t) の瞬時値波形（2周期分）</span>
              <div className="flex gap-4 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-600 inline-block"></span> 電圧 v(t)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-600 inline-block"></span> 電流 i(t) (x80倍拡大表示)</span>
              </div>
            </div>

            <div className="w-full aspect-[5/2] max-h-[240px]">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible font-mono">
                {/* 軸 */}
                <line x1="15" y1="80" x2="385" y2="80" stroke="#94a3b8" strokeWidth="1" />
                <line x1="20" y1="10" x2="20" y2="150" stroke="#94a3b8" strokeWidth="1" />
                <text x="370" y="93" fill="#64748b" fontSize="8" fontWeight="bold">時間 t ➔</text>
                <text x="25" y="15" fill="#64748b" fontSize="8" fontWeight="bold">振幅 ➔</text>

                {/* 補助縦線（周期区切り） */}
                <line x1="200" y1="15" x2="200" y2="145" stroke="#f1f5f9" strokeWidth="1" />
                <text x="195" y="155" fill="#94a3b8" fontSize="7">1周期 (T)</text>
                <line x1="380" y1="15" x2="380" y2="145" stroke="#f1f5f9" strokeWidth="1" />
                <text x="365" y="155" fill="#94a3b8" fontSize="7">2周期 (2T)</text>

                {/* 1. 電圧波形（赤線） */}
                <path d={vPath} fill="none" stroke="#dc2626" strokeWidth="2" />

                {/* 2. 電流波形（青線） */}
                <path d={iPath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
              </svg>
            </div>
            
            {/* 位相差説明看板 */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 text-center text-[10px]">
              {phiDeg > 0.5 ? (
                <span className="text-red-700 font-bold">
                  【誘導性回路】 電圧の位相が電流より <span className="text-lg font-mono font-extrabold">{phiDeg.toFixed(1)}°</span> 進んでいます (電流が遅れる)。コイルの影響が大。
                </span>
              ) : phiDeg < -0.5 ? (
                <span className="text-blue-700 font-bold">
                  【容量性回路】 電流の位相が電圧より <span className="text-lg font-mono font-extrabold">{Math.abs(phiDeg).toFixed(1)}°</span> 進んでいます (電流が進む)。コンデンサの影響が大。
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  【共振状態】 電圧と電流の位相差はほぼ <span className="text-lg font-mono font-extrabold">0°</span> です。インピーダンスは純抵抗成分のみになり、電流が最大化します。
                </span>
              )}
            </div>
          </div>

          {/* ベクトル回転図 (フェーザ図) */}
          {showPhasor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 bg-white p-5">
              
              <div className="flex flex-col items-center justify-center">
                <span className="font-bold text-slate-700 text-[10px] mb-3 select-none">■ 各素子の電圧フェーザ（電流基準）</span>
                <svg viewBox="0 0 200 200" className="w-48 h-48 overflow-visible border border-gray-100 bg-gray-50/50">
                  {/* 軸 */}
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="100" y1="10" x2="100" y2="190" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                  <text x="180" y="112" fill="#94a3b8" fontSize="8" fontWeight="bold">Re</text>
                  <text x="105" y="20" fill="#94a3b8" fontSize="8" fontWeight="bold">Im</text>

                  {/* 基準電流ベクトル I (常に右向き) */}
                  <line x1="100" y1="100" x2="150" y2="100" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3,1" />
                  <text x="153" y="103" fill="#2563eb" fontSize="8" fontWeight="bold">I₀</text>

                  {/* VR ベクトル (右向き赤) */}
                  <g>
                    <line x1="100" y1="100" x2={vec_vr_x} y2={vec_vr_y} stroke="#dc2626" strokeWidth="2" />
                    <path d={`M ${vec_vr_x} ${vec_vr_y} L ${vec_vr_x - 5} ${vec_vr_y - 3} L ${vec_vr_x - 5} ${vec_vr_y + 3} Z`} fill="#dc2626" />
                    <text x={vec_vr_x - 10} y={vec_vr_y - 6} fill="#dc2626" fontSize="8" fontWeight="bold">VR</text>
                  </g>

                  {/* VL ベクトル (上向き緑) */}
                  <g>
                    <line x1="100" y1="100" x2={vec_vl_x} y2={vec_vl_y} stroke="#16a34a" strokeWidth="2" />
                    <path d={`M ${vec_vl_x} ${vec_vl_y} L ${vec_vl_x - 3} ${vec_vl_y + 5} L ${vec_vl_x + 3} ${vec_vl_y + 5} Z`} fill="#16a34a" />
                    <text x={vec_vl_x + 6} y={vec_vl_y + 8} fill="#16a34a" fontSize="8" fontWeight="bold">VL</text>
                  </g>

                  {/* VC ベクトル (下向きオレンジ) */}
                  <g>
                    <line x1="100" y1="100" x2={vec_vc_x} y2={vec_vc_y} stroke="#ea580c" strokeWidth="2" />
                    <path d={`M ${vec_vc_x} ${vec_vc_y} L ${vec_vc_x - 3} ${vec_vc_y - 5} L ${vec_vc_x + 3} ${vec_vc_y - 5} Z`} fill="#ea580c" />
                    <text x={vec_vc_x + 6} y={vec_vc_y - 4} fill="#ea580c" fontSize="8" fontWeight="bold">VC</text>
                  </g>

                  {/* 全電圧合成ベクトル V (紫色) */}
                  <g>
                    <line x1="100" y1="100" x2={vec_v_x} y2={vec_v_y} stroke="#7c3aed" strokeWidth="2.5" />
                    {/* 矢印先端 */}
                    <circle cx={vec_v_x} cy={vec_v_y} r="3" fill="#7c3aed" />
                    <text x={vec_v_x + 6} y={vec_v_y - 2} fill="#7c3aed" fontSize="8" fontWeight="bold">V₀ (合成)</text>
                  </g>

                  {/* 平行四辺形の補助点線 */}
                  <line x1={vec_vr_x} y1={vec_vr_y} x2={vec_v_x} y2={vec_v_y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1={v_cx} y1={v_cy - (vl0 - vc0) * vectorScale} x2={vec_v_x} y2={vec_v_y} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
                  
                  {/* 合成リアクタンスベクトル (縦軸上) */}
                  <line x1={v_cx} y1={v_cy} x2={v_cx} y2={v_cy - (vl0 - vc0) * vectorScale} stroke="#7c3aed" strokeWidth="1" strokeDasharray="2,2" />

                  {/* 位相差角度アーク φ */}
                  <path
                    d={`M 120 100 A 20 20 0 0 ${phi > 0 ? 0 : 1} ${100 + 20 * Math.cos(-phi)} ${100 + 20 * Math.sin(-phi)}`}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="1.5"
                  />
                  <text x="124" y={phi > 0 ? 94 : 110} fill="#7c3aed" fontSize="9" fontWeight="bold">φ</text>
                </svg>
              </div>

              {/* ベクトルの説明 */}
              <div className="flex flex-col justify-center text-[10px] leading-relaxed space-y-2 text-gray-600 bg-gray-50 p-3.5 border border-gray-200">
                <span className="font-bold text-slate-800 text-xs block border-b border-gray-300 pb-1">ベクトル図の読み方</span>
                <p>
                  電流 I₀ の向きを基準（横軸）にとると：
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>抵抗電圧 <strong className="text-red-700">VR</strong> は電流と同位相。</li>
                  <li>コイル電圧 <strong className="text-green-700">VL</strong> は電流より位相が 90° 進む（上方向）。</li>
                  <li>コンデンサ電圧 <strong className="text-orange-700">VC</strong> は電流より位相が 90° 遅れる（下方向）。</li>
                  <li>全体の合成電圧 <strong className="text-purple-700">V₀</strong> はこれらを足し合わせた合成ベクトルになり、その傾き角 <strong className="text-purple-700">φ</strong> が位相のズレを表します。</li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* 右側：パラメータ調節 ＋ 計算値モニター (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 調節スライダーボックス */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 回路パラメータの調整
            </h3>

            {/* 抵抗 R */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>R : 抵抗値</span>
                <span className="font-mono text-xs text-red-600">{r} Ω</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={r}
                onChange={(e) => setR(parseInt(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* 自己インダクタンス L */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>L : 自己インダクタンス</span>
                <span className="font-mono text-xs text-green-600">{l.toFixed(2)} H</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={l}
                onChange={(e) => setL(parseFloat(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* 電気容量 C */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>C : コンデンサ電気容量</span>
                <span className="font-mono text-xs text-orange-600">{c} μF</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={c}
                onChange={(e) => setC(parseInt(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* 周波数 f */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>f : 電源周波数</span>
                <span className="font-mono text-xs text-blue-600">{f} Hz</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={f}
                onChange={(e) => setF(parseInt(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* 電圧振幅 V0 */}
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between items-center text-slate-700 font-bold">
                <span>V₀ : 電源電圧（最大値）</span>
                <span className="font-mono text-xs text-purple-600">{v0} V</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={v0}
                onChange={(e) => setV0(parseInt(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            {/* 共振状態にする簡易ボタン */}
            <div className="border-t border-gray-200 pt-3 text-center">
              <button
                onClick={() => {
                  setF(50);
                  setL(0.5);
                  setC(20);
                }}
                className="retro-btn-classic bg-emerald-50 border-emerald-400 text-emerald-800 font-bold hover:bg-emerald-100 py-1.5 px-3 text-[10px]"
              >
                共振状態に設定 (50Hz, 0.5H, 20μF)
              </button>
            </div>

          </div>

          {/* リアルタイム計算値モニター */}
          <div className="retro-box space-y-3 font-mono">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800 font-sans">
              ■ リアルタイム計算値モニター
            </h3>
            
            <table className="w-full text-[10px] leading-normal border-collapse">
              <tbody>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1.5 font-bold text-slate-700">コイルリアクタンス XL</td>
                  <td className="py-1.5 text-right">{xl.toFixed(2)} Ω</td>
                </tr>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1.5 font-bold text-slate-700">コンデンサリアクタンス XC</td>
                  <td className="py-1.5 text-right">{xc.toFixed(2)} Ω</td>
                </tr>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1.5 font-bold text-slate-700">合成インピーダンス Z</td>
                  <td className="py-1.5 text-right text-purple-700 font-bold">{z.toFixed(2)} Ω</td>
                </tr>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1.5 font-bold text-slate-700">電流振幅 I₀</td>
                  <td className="py-1.5 text-right text-blue-700 font-bold">{i0.toFixed(4)} A</td>
                </tr>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1.5 font-bold text-slate-700">位相差角 φ (電流基準)</td>
                  <td className="py-1.5 text-right text-red-600 font-bold">{phiDeg.toFixed(2)}°</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-slate-700">共振周波数 f₀ (現在値基準)</td>
                  <td className="py-1.5 text-right text-emerald-700 font-bold">
                    {(1 / (2 * Math.PI * Math.sqrt(l * c * 1e-6))).toFixed(2)} Hz
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200">
              <label className="flex items-center gap-1 cursor-pointer font-sans text-[10px]">
                <input
                  type="checkbox"
                  checked={showPhasor}
                  onChange={(e) => setShowPhasor(e.target.checked)}
                />
                <span>ベクトル図 (フェーザ図) を表示する</span>
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
