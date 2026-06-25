"use client";

import { useState } from 'react';
import Link from 'next/link';

interface GasInfo {
  formula: string;
  name: string;
  method: 'water' | 'upward' | 'downward';
  methodJp: string;
  solubility: string;
  density: 'lighter' | 'heavier';
  densityExplain: string;
  colorOdor: string;
  dryAgent: string;
  reaction: string;
  explain: string;
}

const GASES: GasInfo[] = [
  {
    formula: 'NH3',
    name: 'アンモニア',
    method: 'upward',
    methodJp: '上方置換法',
    solubility: '極めて溶けやすい（塩基性）',
    density: 'lighter',
    densityExplain: '空気（平均分子量28.8）より軽い（分子量 17.0）',
    colorOdor: '無色・刺激臭',
    dryAgent: 'ソーダ石灰（塩基性乾燥剤）',
    reaction: '2NH4Cl + Ca(OH)2 ➔ CaCl2 + 2H2O + 2NH3',
    explain: '水に極めて溶けやすく、空気より軽いため、乾いた試験管や集気ビンを逆さにする「上方置換法」で捕集します。水に溶けるとアンモニア水（弱塩基性）になり、赤色リトマス紙を青変させます。酸性の乾燥剤（濃硫酸など）とは塩を作って反応してしまうため、ソーダ石灰を用いて乾燥させます。'
  },
  {
    formula: 'Cl2',
    name: '塩素',
    method: 'downward',
    methodJp: '下方置換法',
    solubility: '溶けやすい（水と反応し酸性）',
    density: 'heavier',
    densityExplain: '空気より極めて重い（分子量 70.9）',
    colorOdor: '黄緑色・刺激臭（有毒）',
    dryAgent: '濃硫酸、またはシリカゲル',
    reaction: 'MnO2 + 4HCl ➔ MnCl2 + 2H2O + Cl2',
    explain: '水に溶けて一部が塩酸(HCl)および次亜塩素酸(HClO)となり酸性を示します。空気よりかなり重いため「下方置換法」で集めます。強い酸化作用と漂白作用を持ち、湿らせたヨウ化カリウムデンプン紙を青変させます。'
  },
  {
    formula: 'HCl',
    name: '塩化水素',
    method: 'downward',
    methodJp: '下方置換法',
    solubility: '極めて溶けやすい（強酸性）',
    density: 'heavier',
    densityExplain: '空気より重い（分子量 36.5）',
    colorOdor: '無色・刺激臭',
    dryAgent: '濃硫酸、または十酸化四リン',
    reaction: 'NaCl + H2SO4 ➔ NaHSO4 + HCl',
    explain: '水に非常に溶けやすく、溶けると胃酸と同じ塩酸になります。空気より重いため「下方置換法」で集めます。塩基であるアンモニア（NH3）と接触すると、塩化アンモニウム（NH4Cl）の白色の煙（微粒子）を発生します。'
  },
  {
    formula: 'O2',
    name: '酸素',
    method: 'water',
    methodJp: '水上置換法',
    solubility: 'ほとんど溶けない（中性）',
    density: 'heavier',
    densityExplain: '空気とほぼ同等（分子量 32.0）',
    colorOdor: '無色・無臭',
    dryAgent: '濃硫酸、ソーダ石灰など何でも可',
    reaction: '2H2O2 ➔ 2H2O + O2 (触媒: MnO2)',
    explain: '水にほとんど溶けないため、気体を最も純粋に（空気が混ざらずに）回収できる「水上置換法」を使用します。助燃性があり、火のついた線香を入れると激しく炎を上げて燃えます。'
  },
  {
    formula: 'H2',
    name: '水素',
    method: 'water',
    methodJp: '水上置換法',
    solubility: 'ほとんど溶けない（中性）',
    density: 'lighter',
    densityExplain: '最も軽い気体（分子量 2.0）',
    colorOdor: '無色・無臭',
    dryAgent: '濃硫酸、ソーダ石灰など何でも可',
    reaction: 'Zn + H2SO4 ➔ ZnSO4 + H2',
    explain: 'すべての気体の中で最も軽く、水に難溶なため「水上置換法」で集めます（非常に軽いため、水上置換の方が漏れを最小限に抑えられます）。可燃性があり、空気との混合気体に点火すると「ポッ」と音を立てて爆発的に燃焼し、水（H2O）を生じます。'
  },
  {
    formula: 'CO2',
    name: '二酸化炭素',
    method: 'downward',
    methodJp: '下方置換法（または水上）',
    solubility: '少し溶ける（炭酸となり弱酸性）',
    density: 'heavier',
    densityExplain: '空気より重い（分子量 44.0）',
    colorOdor: '無色・無臭',
    dryAgent: '濃硫酸、または十酸化四リン',
    reaction: 'CaCO3 + 2HCl ➔ CaCl2 + H2O + CO2',
    explain: '水に少し溶ける（常温で水と同体積程度）ため、一般的には空気より重い性質を利用した「下方置換法」で集めます（一部水に溶けることを許容して水上置換で集めることもあります）。石灰水（水酸化カルシウム水溶液）に通すと、難溶性の炭酸カルシウム（CaCO3）の沈殿が生じて白濁します。'
  }
];

export default function GasCollectionPage() {
  const [selectedGas, setSelectedGas] = useState<GasInfo>(GASES[0]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・気体の捕集
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          気体の発生装置と捕集法
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          気体の性質（水への溶解性、空気に対する密度）に応じて、最適な捕集法（水上・上方・下方置換）が決定されます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：SVG捕集装置図解 (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[420px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700 text-sm">
            捕集方法：{selectedGas.methodJp} (選択気体: {selectedGas.formula})
          </div>

          {/* SVGによる捕集装置線画 */}
          <div className="flex items-center justify-center flex-grow py-6">
            <svg width="240" height="240" viewBox="0 0 160 160" className="overflow-visible">
              
              {/* 水上置換法 */}
              {selectedGas.method === 'water' && (
                <g>
                  {/* 水槽 */}
                  <rect x="20" y="110" width="120" height="40" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                  {/* 水面 */}
                  <line x1="20" y1="120" x2="140" y2="120" stroke="#2563eb" strokeWidth="1.5" />
                  
                  {/* 集気ビン（逆さ） */}
                  <rect x="65" y="60" width="30" height="70" fill="none" stroke="#475569" strokeWidth="1.5" />
                  <rect x="60" y="130" width="40" height="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                  
                  {/* ビンの中の水面 */}
                  <line x1="65" y1="90" x2="95" y2="90" stroke="#2563eb" strokeWidth="1.5" />
                  <rect x="66" y="91" width="28" height="39" fill="#93c5fd" opacity="0.3" />
                  
                  {/* 導入導管 */}
                  <path d="M 10 135 L 55 135 L 75 110 L 75 95" fill="none" stroke="#0f172a" strokeWidth="2" />
                  
                  {/* 泡（気体の上昇） */}
                  <circle cx="75" cy="85" r="3" fill="none" stroke="#2563eb" strokeWidth="1" />
                  <circle cx="77" cy="73" r="3" fill="none" stroke="#2563eb" strokeWidth="1" />
                  <circle cx="73" cy="65" r="3" fill="none" stroke="#2563eb" strokeWidth="1" />
                  
                  {/* 捕集した気体の領域 */}
                  <rect x="66" y="61" width="28" height="28" fill="#eab308" opacity="0.1" />

                  {/* テキスト説明 */}
                  <text x="80" y="145" fill="#475569" fontSize="9" textAnchor="middle">水</text>
                  <text x="80" y="52" fill="#0f172a" fontSize="9" textAnchor="middle" fontWeight="bold">難溶性気体の回収</text>
                </g>
              )}

              {/* 上方置換法 */}
              {selectedGas.method === 'upward' && (
                <g>
                  {/* スタンド棒 */}
                  <line x1="120" y1="20" x2="120" y2="140" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="100" y1="140" x2="140" y2="140" stroke="#94a3b8" strokeWidth="2" />

                  {/* 集気ビン（逆さ・口が下向き） */}
                  <rect x="50" y="40" width="36" height="80" fill="none" stroke="#475569" strokeWidth="1.5" />
                  <rect x="45" y="120" width="46" height="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

                  {/* 導入管（深く挿入する） */}
                  <path d="M 20 145 L 70 145 L 70 55" fill="none" stroke="#0f172a" strokeWidth="2" />

                  {/* 気体（ビン上部に溜まる） */}
                  <rect x="51" y="41" width="34" height="40" fill="#eab308" opacity="0.1" />

                  {/* 空気（下から押し出される） */}
                  <path d="M 60 115 L 60 132" fill="none" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arrow)" />
                  <text x="68" y="50" fill="#0f172a" fontSize="9" textAnchor="middle" fontWeight="bold">ビン上部へ捕集</text>
                </g>
              )}

              {/* 下方置換法 */}
              {selectedGas.method === 'downward' && (
                <g>
                  {/* 集気ビン（上向き） */}
                  <rect x="50" y="50" width="36" height="80" fill="none" stroke="#475569" strokeWidth="1.5" />
                  <rect x="45" y="44" width="46" height="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

                  {/* 導入管（底付近まで深く挿入する） */}
                  <path d="M 20 25 L 68 25 L 68 115" fill="none" stroke="#0f172a" strokeWidth="2" />

                  {/* 気体（ビン底に溜まる） */}
                  <rect x="51" y="90" width="34" height="39" fill="#eab308" opacity="0.1" />

                  {/* 空気（上から押し出される） */}
                  <path d="M 58 65 L 58 35" fill="none" stroke="#94a3b8" strokeWidth="1" />
                  <text x="68" y="125" fill="#0f172a" fontSize="9" textAnchor="middle" fontWeight="bold">ビン底部へ捕集</text>
                </g>
              )}

            </svg>
          </div>

          {/* 操作ボタン */}
          <div className="w-full border-t border-gray-200 pt-4 text-center">
            <span className="text-xs font-bold block mb-2 text-slate-700">
              【捕集法の選定基準】
            </span>
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto text-[10px]">
              <div className="border border-blue-200 bg-blue-50/50 p-1.5 rounded">
                <strong>水に難溶</strong><br/>➔ 水上置換
              </div>
              <div className="border border-red-200 bg-red-50/50 p-1.5 rounded">
                <strong>水溶・空気より軽い</strong><br/>➔ 上方置換
              </div>
              <div className="border border-amber-200 bg-amber-50/50 p-1.5 rounded">
                <strong>水溶・空気より重い</strong><br/>➔ 下方置換
              </div>
            </div>
          </div>

        </div>

        {/* 右側：気体詳細と物性表 (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 気体セレクトボトル */}
          <div className="retro-box space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 対象の気体を選択
            </h3>
            
            <div className="grid grid-cols-3 gap-1.5">
              {GASES.map((g) => (
                <button
                  key={g.formula}
                  onClick={() => setSelectedGas(g)}
                  className={`border border-gray-400 py-2 text-center rounded text-xs font-bold transition-all bg-slate-50 hover:bg-slate-100 ${selectedGas.formula === g.formula ? 'bg-amber-100 border-amber-600' : ''}`}
                >
                  <div className="font-mono">{g.formula}</div>
                  <div className="text-[9px] text-gray-500 font-normal">{g.name.slice(0, 5)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 物性テーブル */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ {selectedGas.name} ({selectedGas.formula}) の性質
            </h3>

            <table className="classic-table text-[10px]">
              <tbody>
                <tr>
                  <td className="bg-gray-50 font-bold w-20">捕集方法</td>
                  <td className="font-bold text-slate-800">{selectedGas.methodJp}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">水溶性</td>
                  <td>{selectedGas.solubility}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">比重・密度</td>
                  <td>{selectedGas.densityExplain}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">色・臭い</td>
                  <td>{selectedGas.colorOdor}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">乾燥剤</td>
                  <td>{selectedGas.dryAgent}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">実験室製法</td>
                  <td className="font-mono">{selectedGas.reaction}</td>
                </tr>
              </tbody>
            </table>

            {/* 詳細解説 */}
            <div className="bg-gray-50 border border-gray-200 p-2.5 leading-relaxed text-[11px] text-slate-600">
              {selectedGas.explain}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
