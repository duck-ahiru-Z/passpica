"use client";

import { useState } from 'react';
import Link from 'next/link';

interface PhaseInfo {
  id: string;
  name: string;
  triplePoint: string;
  criticalPoint: string;
  meltingCurveSlope: string;
  meltingCurveExplain: string;
  sublimationExplain: string;
  explain: string;
}

const PHASES: Record<string, PhaseInfo> = {
  h2o: {
    id: 'h2o',
    name: '水 (H2O) の状態図',
    triplePoint: '0.01 ℃ , 6.11 × 10^2 Pa (約 0.006 気圧)',
    criticalPoint: '374 ℃ , 2.21 × 10^7 Pa (約 218 気圧)',
    meltingCurveSlope: '負の傾き (右下がり)',
    meltingCurveExplain: '融解曲線（固体と液体の境界線）は、温度を横軸・圧力を縦軸にすると右下がりです。氷 Ih は開いた結晶構造をとり、同じ質量なら液体の水より体積が大きく密度が小さいため、圧力を上げると融点はわずかに下がります。',
    sublimationExplain: '1気圧で氷を加熱する平衡経路は、まず融解曲線を横切って水になり、その後に蒸発曲線を横切って水蒸気になります。この経路では液体を経ずに昇華する境界を通りません（低圧では氷が直接昇華する場合もあります）。',
    explain: '氷 Ih では水素結合が比較的開いた結晶構造を作ります。融解すると分子の配置が組み替わり、同じ質量あたりの体積は氷より液体の水の方が小さくなります。この体積差が水の融解曲線の負の傾きに対応します。'
  },
  co2: {
    id: 'co2',
    name: '二酸化炭素 (CO2) の状態図',
    triplePoint: '-56.6 ℃ , 5.18 × 10^5 Pa (約 5.1 気圧)',
    criticalPoint: '31.1 ℃ , 7.38 × 10^6 Pa (約 73 気圧)',
    meltingCurveSlope: '正の傾き (右上がり／右傾斜)',
    meltingCurveExplain: '融解曲線（固体と液体の境界線）は右上がりです。三重点付近では固体 CO₂ のモル体積は液体より小さいため、圧力を上げると融点も上がります。',
    sublimationExplain: '三重点の圧力が約5.1気圧と非常に高いため、我々の日常生活の「1気圧」のラインは三重点より下に位置します。そのため、常温常圧下では液体になれず、固体（ドライアイス）から直接気体に「昇華」します。',
    explain: '三重点付近では固体 CO₂ のモル体積が液体 CO₂ より小さく、圧力を上げると融解温度も上がります。常圧で液体が存在しないのは、三重点圧力が大気圧を上回っているためです。'
  }
};

export default function PhaseDiagramPage() {
  const [selectedPhase, setSelectedPhase] = useState<string>('h2o');
  const info = PHASES[selectedPhase];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-sm">
      
      {/* ヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・状態図
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          物質の状態図（水・二酸化炭素の対比）
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          温度と圧力の変化に伴い、物質が固体・液体・気体へと変化する境界条件。水の「特異的な傾き」と二酸化炭素の「昇華性」を視覚的に理解します。
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={selectedPhase === 'h2o'}
          onClick={() => setSelectedPhase('h2o')}
          className={`retro-btn-classic font-bold py-1.5 px-4 ${selectedPhase === 'h2o' ? 'bg-[#cbd5e1]' : ''}`}
        >
          水 (H2O) の状態図
        </button>
        <button
          type="button"
          aria-pressed={selectedPhase === 'co2'}
          onClick={() => setSelectedPhase('co2')}
          className={`retro-btn-classic font-bold py-1.5 px-4 ${selectedPhase === 'co2' ? 'bg-[#cbd5e1]' : ''}`}
        >
          二酸化炭素 (CO2) の状態図
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：状態図グラフのSVG描画 (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[420px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700 text-sm">
            相図グラフ（圧力 P vs 温度 T）：{info.name}
          </div>

          {/* SVGによる状態図のフラット線画 */}
          <div className="flex items-center justify-center flex-grow py-4 w-full">
            <svg width="280" height="220" viewBox="0 0 200 160" className="overflow-visible font-mono text-[8px]" role="img" aria-label={`${info.name}の模式的な状態図。横軸は温度、縦軸は圧力です。固体・液体・気体の領域、昇華曲線、蒸気圧曲線、${info.meltingCurveSlope}の融解曲線、1気圧の位置、超臨界流体の領域を示します。三重点は${info.triplePoint}、臨界点は${info.criticalPoint}です。圧力と温度は比例目盛ではありません。`}>
              
              {/* x軸（温度 T）とy軸（圧力 P） */}
              <line x1="25" y1="130" x2="185" y2="130" stroke="#475569" strokeWidth="1.5" />
              <line x1="25" y1="15" x2="25" y2="130" stroke="#475569" strokeWidth="1.5" />
              <text x="180" y="140" fill="#475569" fontSize="8" fontWeight="bold">温度 T（℃）</text>
              <text x="5" y="12" fill="#475569" fontSize="8" fontWeight="bold">圧力 P（相対値）</text>

              {/* 三重点・臨界点のプロット座標 */}
              {/* 三重点:(90, 85), 臨界点:(150, 40) とする */}
              
              {/* 昇華曲線（三重点の左下） */}
              <path d="M 25 125 Q 60 115 90 85" fill="none" stroke="#0f172a" strokeWidth="1.5" />
              
              {/* 蒸気圧曲線（三重点と臨界点の間） */}
              <path d="M 90 85 Q 120 70 150 40" fill="none" stroke="#0f172a" strokeWidth="1.5" />

              {/* 融解曲線（三重点の真上付近） */}
              {selectedPhase === 'h2o' ? (
                // 水: 右下がり（負の傾き）の融解曲線
                <path d="M 90 85 Q 83 50 78 15" fill="none" stroke="#ef4444" strokeWidth="2" />
              ) : (
                // 二酸化炭素: 右上がりの融解曲線
                <path d="M 90 85 Q 96 50 102 15" fill="none" stroke="#0f172a" strokeWidth="1.5" />
              )}

              {/* 1気圧の破線ライン */}
              {selectedPhase === 'h2o' ? (
                // 水: 三重点より上に大気圧 (y=65付近)
                <g>
                  <line x1="25" y1="65" x2="185" y2="65" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="187" y="68" fill="#94a3b8">1 atm</text>
                </g>
              ) : (
                // 二酸化炭素: 三重点より下に大気圧 (y=110付近)
                <g>
                  <line x1="25" y1="110" x2="185" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="187" y="113" fill="#94a3b8">1 atm</text>
                </g>
              )}

              {/* 領域のイオン/物質名ラベル */}
              <text x="50" y="55" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">固体</text>
              <text x="115" y="45" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">液体</text>
              <text x="135" y="110" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">気体</text>
              
              {/* 超臨界流体（臨界点より高温・高圧） */}
              <rect x="151" y="15" width="34" height="25" fill="#fef08a" opacity="0.2" />
              <text x="168" y="30" fill="#a16207" fontSize="7" textAnchor="middle">超臨界流体</text>

              {/* 主要点のマーク */}
              <circle cx="90" cy="85" r="4" fill="#3b82f6" stroke="#0f172a" strokeWidth="1" />
              <text x="96" y="93" fill="#1d4ed8" fontWeight="bold">三重点</text>

              <circle cx="150" cy="40" r="4" fill="#16a34a" stroke="#0f172a" strokeWidth="1" />
              <text x="156" y="48" fill="#15803d" fontWeight="bold">臨界点</text>
            </svg>
          </div>

          <div className="w-full border-t border-gray-200 pt-4 text-center">
          <span className="text-xs text-gray-600">
              ※模式図（圧力・温度とも比例目盛ではありません）。曲線の交点・傾きと相の位置関係を示します。正確な代表値は右の表を参照してください。{selectedPhase === 'h2o' ? ' 赤い融解曲線は水に特徴的な負の傾きを示します。' : ' 黒い融解曲線は二酸化炭素の正の傾きを示します。'}
            </span>
          </div>

        </div>

        {/* 右側：各ポイントの数値・解説表 (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 定数比較表 */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 状態図の重要座標データ
            </h3>

            <table className="classic-table text-xs">
              <tbody>
                <tr>
                  <td className="bg-gray-50 font-bold w-20">融解曲線の傾き</td>
                  <td className="font-bold text-red-600 font-sans">{info.meltingCurveSlope}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">三重点の座標</td>
                  <td className="font-mono">{info.triplePoint}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">臨界点の座標</td>
                  <td className="font-mono">{info.criticalPoint}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 解説メモ */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 状態図から読み取る性質
            </h3>
            <div>
              <span className="font-bold text-slate-800 block text-xs">【融解曲線の傾き】</span>
              <p className="text-gray-600 text-xs leading-relaxed mt-0.5">{info.meltingCurveExplain}</p>
              <p className="text-gray-600 text-xs leading-relaxed mt-1">融解曲線の傾きは固体と液体のモル体積差に関係します。図の横軸は温度、縦軸は圧力です。</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block text-xs">【1気圧での挙動と昇華】</span>
              <p className="text-gray-600 text-xs leading-relaxed mt-0.5">{info.sublimationExplain}</p>
            </div>
            <p className="text-xs text-gray-600">
              ※臨界点を超えると、気体と液体の境界がなくなり、両方の性質を併せ持った「超臨界流体」になります。
            </p>
          </div>

        </div>

      </div>

      <section className="retro-box bg-slate-50 p-4 space-y-2">
        <h2 className="font-bold">状態図の判断を演習する</h2>
        <p className="text-slate-600">水と二酸化炭素の相図を見比べたら、三重点・臨界点・1気圧での相変化を問題で確認しましょう。</p>
        <Link href="/learn/chemistry/phase-diagram-drill" className="retro-btn-classic inline-flex">状態図の判断ドリルへ →</Link>
      </section>

    </div>
  );
}
