"use client";

import { useState } from 'react';
import Link from 'next/link';

interface LatticeInfo {
  type: 'bcc' | 'fcc';
  name: string;
  coordinationNum: number;
  atomsPerCell: number;
  packingEfficiency: string;
  contactFormula: string;
  contactFormulaExplain: string;
  metals: string;
  explain: string;
}

const LATTICES: Record<'bcc' | 'fcc', LatticeInfo> = {
  bcc: {
    type: 'bcc',
    name: '体心立方格子 (Body-Centered Cubic)',
    coordinationNum: 8,
    atomsPerCell: 2,
    packingEfficiency: '約 68 %',
    contactFormula: '√3 a = 4r',
    contactFormulaExplain: '立方体の体対角線の長さは √3a です。この線上で頂点・体心・反対側の頂点の原子が接するため、r + 2r + r = 4r となります。',
    metals: 'Na（ナトリウム）, K（カリウム）, Fe（鉄/常温）など',
    explain: '単位格子の中心に原子が1個、各頂点に1/8個の原子が8個配置されています。原子は立方体の対角線に沿って中心の原子と接しており、x, y, z方向のそれぞれの面同士では接していません。比較的隙間の多い構造（充填率68%）です。'
  },
  fcc: {
    type: 'fcc',
    name: '面心立方格子 (Face-Centered Cubic)',
    coordinationNum: 12,
    atomsPerCell: 4,
    packingEfficiency: '約 74 %',
    contactFormula: '√2 a = 4r',
    contactFormulaExplain: '各正方形の面対角線の長さは √2a です。この線上で頂点・面心・反対側の頂点の原子が接するため、r + 2r + r = 4r となります。',
    metals: 'Al（アルミニウム）, Cu（銅）, Ag（銀）など',
    explain: '単位格子の各頂点に1/8個の原子が8個、各面の中心に1/2個の原子が6個配置されています。原子は各面の対角線に沿って接しており、この配列は空間を最も効率的に埋める最密充填構造（充填率74%）の一つです。'
  }
};

export default function CrystalLatticePage() {
  const [selectedType, setSelectedType] = useState<'bcc' | 'fcc'>('bcc');
  const info = LATTICES[selectedType];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-sm">
      
      {/* ヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・結晶格子
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          固体の結晶格子モデルと計算法
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          金属結晶の代表的な単位格子（体心立方・面心立方）の立体配置と、計算問題の第一歩となる原子の接触断面図を示します。
        </p>
        <Link href="/learn/chemistry/crystal-lattice-drill" className="retro-btn-classic inline-flex mt-3">
          結晶格子の計算問題で練習する →
        </Link>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={selectedType === 'bcc'}
          onClick={() => setSelectedType('bcc')}
          className={`retro-btn-classic font-bold py-1.5 px-4 ${selectedType === 'bcc' ? 'bg-[#cbd5e1]' : ''}`}
        >
          体心立方格子 (BCC)
        </button>
        <button
          type="button"
          aria-pressed={selectedType === 'fcc'}
          onClick={() => setSelectedType('fcc')}
          className={`retro-btn-classic font-bold py-1.5 px-4 ${selectedType === 'fcc' ? 'bg-[#cbd5e1]' : ''}`}
        >
          面心立方格子 (FCC)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：SVG格子図解 ＆ 断面図 (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col md:flex-row gap-6 justify-between min-h-[400px]">
          
          {/* 1. 立体ワイヤーフレームモデル */}
          <div className="flex-1 flex flex-col items-center justify-between border border-gray-100 p-3 bg-gray-50/20">
            <span className="font-bold text-slate-700 block border-b border-gray-200 pb-1 w-full text-center text-[11px]">
              ① 単位格子の配置図
            </span>
            
            <div className="py-6 flex items-center justify-center flex-grow">
              <svg width="180" height="180" viewBox="0 0 120 120" className="overflow-visible" role="img" aria-label={selectedType === 'bcc' ? '体心立方格子の配置図。立方体の8つの頂点と立方体の中心に原子があります。' : '面心立方格子の配置図。立方体の8つの頂点と6つの面の中心に原子があります。'}>
                {/* 立方体ワイヤーフレーム */}
                <path d="M 20 40 L 80 40 L 100 20 L 40 20 Z" fill="none" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 20 100 L 80 100 L 100 80 L 40 80 Z" fill="none" stroke="#94a3b8" strokeWidth="1" />
                <line x1="20" y1="40" x2="20" y2="100" stroke="#94a3b8" strokeWidth="1" />
                <line x1="80" y1="40" x2="80" y2="100" stroke="#94a3b8" strokeWidth="1" />
                <line x1="100" y1="20" x2="100" y2="80" stroke="#94a3b8" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="80" stroke="#94a3b8" strokeWidth="1" />

                {/* 体心立方格子 (BCC) の点 */}
                {selectedType === 'bcc' && (
                  <g>
                    {/* 8個の頂点原子 */}
                    {[[20,40], [80,40], [100,20], [40,20], [20,100], [80,100], [100,80], [40,80]].map(([x,y], idx) => (
                      <circle key={idx} cx={x} cy={y} r="8" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                    ))}
                    {/* 中心の原子 */}
                    <circle cx="60" cy="60" r="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                  </g>
                )}

                {/* 面心立方格子 (FCC) の点 */}
                {selectedType === 'fcc' && (
                  <g>
                    {/* 8個の頂点原子 */}
                    {[[20,40], [80,40], [100,20], [40,20], [20,100], [80,100], [100,80], [40,80]].map(([x,y], idx) => (
                      <circle key={idx} cx={x} cy={y} r="8" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                    ))}
                    {/* 各面の中央原子（6個） */}
                    {/* 上・下・前・右・左・奥の各面の中心（斜投影） */}
                    {[[70,30], [50,90], [50,70], [90,70], [30,70], [70,50]].map(([x,y], idx) => (
                      <circle key={idx} cx={x} cy={y} r="8" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
                    ))}
                  </g>
                )}
              </svg>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              {selectedType === 'bcc' ? '頂点×8 (1/8個分) ＋ 中心×1 (1個分)' : '頂点×8 (1/8個分) ＋ 各面の中央×6 (1/2個分)'}
            </div>
          </div>

          {/* 2. 接触断面図 */}
          <div className="flex-1 flex flex-col items-center justify-between border border-gray-100 p-3 bg-gray-50/20">
            <span className="font-bold text-slate-700 block border-b border-gray-200 pb-1 w-full text-center text-[11px]">
              ② 原子同士が接触する断面
            </span>
            
            <div className="py-6 flex items-center justify-center flex-grow">
              <svg width="180" height="180" viewBox={selectedType === 'bcc' ? '0 0 160 120' : '0 0 120 120'} className="overflow-visible" role="img" aria-label={selectedType === 'bcc' ? '体心立方格子の体対角線を含む断面。角の原子、中心原子、角の原子が接し、対角線は√3 a、原子半径は合計4rです。' : '面心立方格子の面を通る断面。四隅の原子と面中心の原子が対角線上で接し、対角線は√2 a、原子半径は合計4rです。'}>
                {selectedType === 'bcc' ? (
                  <g>
                    {/* The BCC body-diagonal section has sides a and √2a, so its diagonal is √3a. */}
                    <defs><clipPath id="bcc-section"><rect x="20" y="20" width="113.14" height="80" /></clipPath></defs>
                    <g clipPath="url(#bcc-section)">
                      {[{ x: 20, y: 20 }, { x: 133.14, y: 20 }, { x: 20, y: 100 }, { x: 133.14, y: 100 }].map(({ x, y }, index) => (
                        <circle key={index} cx={x} cy={y} r="34.64" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                      ))}
                      <circle cx="76.57" cy="60" r="34.64" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                    </g>
                    <rect x="20" y="20" width="113.14" height="80" fill="none" stroke="#334155" strokeWidth="1.5" />
                    <line x1="20" y1="20" x2="133.14" y2="100" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="4" y="62" fill="#475569" fontSize="9">a</text>
                    <text x="76.57" y="113" fill="#475569" fontSize="9" textAnchor="middle">√2 a</text>
                  </g>
                ) : (
                  <g>
                    {/* An FCC face is a square of side a; its diagonal is √2a = 4r. */}
                    <defs><clipPath id="fcc-section"><rect x="20" y="20" width="80" height="80" /></clipPath></defs>
                    <g clipPath="url(#fcc-section)">
                      {[{ x: 20, y: 20 }, { x: 100, y: 20 }, { x: 20, y: 100 }, { x: 100, y: 100 }].map(({ x, y }, index) => (
                        <circle key={index} cx={x} cy={y} r="28.28" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                      ))}
                      <circle cx="60" cy="60" r="28.28" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
                    </g>
                    <rect x="20" y="20" width="80" height="80" fill="none" stroke="#334155" strokeWidth="1.5" />
                    <line x1="20" y1="20" x2="100" y2="100" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="8" y="62" fill="#475569" fontSize="9">a</text>
                    <text x="60" y="113" fill="#475569" fontSize="9" textAnchor="middle">a</text>
                  </g>
                )}
              </svg>
            </div>

            <div className="text-xs text-red-600 text-center font-bold">
              対角線上で原子が接触 ➔ {info.contactFormula}
            </div>
          </div>

        </div>

        {/* 右側：諸数値の対比表と詳細解説 (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 定数比較表 */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 結晶格子の諸元・定数
            </h3>

            <table className="classic-table text-xs">
              <tbody>
                <tr>
                  <td className="bg-gray-50 font-bold w-28">単位格子中の原子数</td>
                  <td className="font-bold text-slate-800 font-mono text-center">{info.atomsPerCell} 個</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">配位数（接する原子）</td>
                  <td className="font-bold text-slate-800 font-mono text-center">{info.coordinationNum}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">空間充填率</td>
                  <td className="font-bold text-slate-800 font-mono text-center">{info.packingEfficiency}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">限界接触条件式</td>
                  <td className="font-bold text-red-600 font-mono text-center">{info.contactFormula}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">代表的な金属結晶</td>
                  <td>{info.metals}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 関係式と解説 */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 関係式の導出ポイント
            </h3>
            <p className="font-semibold text-slate-800">
              {info.contactFormulaExplain}
            </p>
            <p className="text-gray-600 text-xs">
              {info.explain}
            </p>
            <p className="text-xs text-gray-500">
              ※六方最密構造 (HCP) は、立方体ではなく正六角柱を基準とし、配位数は面心と同じ12、充填率も同じく約74%です。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
