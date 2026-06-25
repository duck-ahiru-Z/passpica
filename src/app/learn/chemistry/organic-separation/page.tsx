"use client";

import { useState } from 'react';
import Link from 'next/link';

interface SeparationStep {
  id: number;
  operation: string;
  reagent: string;
  etherLayer: string[];
  waterLayer: string[];
  reaction: string;
  explain: string;
}

const STEPS: SeparationStep[] = [
  {
    id: 0,
    operation: '初期状態（混合エーテル溶液）',
    reagent: '-',
    etherLayer: ['アニリン (塩基性)', '安息香酸 (強酸性)', 'フェノール (弱酸性)', 'ニトロベンゼン (中性)'],
    waterLayer: [],
    reaction: '-',
    explain: 'アニリン、安息香酸、フェノール、ニトロベンゼンの4つの有機化合物がエーテル（有機溶媒層）に均一に溶けている初期状態です。水とエーテルを混ぜると、互いに混ざり合わず、密度の小さいエーテルが「上層（エーテル層）」、水が「下層（水層）」に分離します。'
  },
  {
    id: 1,
    operation: '① 希塩酸 (HCl) 水溶液を加えて振り混ぜる',
    reagent: 'HCl aq',
    etherLayer: ['安息香酸', 'フェノール', 'ニトロベンゼン'],
    waterLayer: ['アニリン塩酸塩 (C6H5NH3+ Cl-)'],
    reaction: 'C6H5NH2 (塩基) + HCl ➔ C6H5NH3+ Cl- (塩/水溶性)',
    explain: '塩基性物質であるアニリン(C6H5NH2)のみが塩酸(HCl)と中和反応し、イオン性の塩であるアニリン塩酸塩となって水に溶け出します。これにより、上層（エーテル層）から下層（水層）へとアニリンが分離されます。'
  },
  {
    id: 2,
    operation: '② 残ったエーテル層に炭酸水素ナトリウム (NaHCO3) 水溶液を加える',
    reagent: 'NaHCO3 aq',
    etherLayer: ['フェノール', 'ニトロベンゼン'],
    waterLayer: ['安息香酸ナトリウム (C6H5COO- Na+)'],
    reaction: 'C6H5COOH (酸) + NaHCO3 ➔ C6H5COONa (塩/水溶性) + H2O + CO2',
    explain: '酸性の強さは「安息香酸(カルボン酸) ＞ 炭酸 ＞ フェノール」の順です。炭酸より強い酸である安息香酸のみが、炭酸水素ナトリウム(NaHCO3)と反応（弱酸の遊離反応）して安息香酸ナトリウム塩となり水層に移動します。フェノールは炭酸より弱い酸のため、ここでは塩を作らずエーテル層に留まります。'
  },
  {
    id: 3,
    operation: '③ さらに残ったエーテル層に水酸化ナトリウム (NaOH) 水溶液を加える',
    reagent: 'NaOH aq',
    etherLayer: ['ニトロベンゼン'],
    waterLayer: ['ナトリウムフェノキシド (C6H5O- Na+)'],
    reaction: 'C6H5OH (酸) + NaOH ➔ C6H5ONa (塩/水溶性) + H2O',
    explain: '水酸化ナトリウム(強塩基)を加えることで、弱酸性物質であるフェノール(C6H5OH)がナトリウムフェノキシド塩となって水層に溶け出します。中性物質であるニトロベンゼン(C6H5NO2)は、酸とも塩基とも反応しないため、最後まで上層のエーテル層に残ります。'
  }
];

export default function OrganicSeparationPage() {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const step = STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・有機化合物分離
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          有機化合物の系統分離
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          混合有機溶媒に酸・塩基の試薬を加えることで、アニリン（塩基性）、安息香酸（カルボン酸）、フェノール（弱酸性）、ニトロベンゼン（中性）を段階的に水層へ分離するプロセスを学びます。
        </p>
      </div>

      {/* 操作バー */}
      <div className="border border-gray-300 bg-gray-50 p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <button 
            onClick={handlePrev} 
            disabled={currentStepIdx === 0}
            className="retro-btn-classic disabled:opacity-50 font-bold"
          >
            ◀ 戻る
          </button>
          <button 
            onClick={handleNext} 
            disabled={currentStepIdx === STEPS.length - 1}
            className="retro-btn-classic disabled:opacity-50 font-bold"
          >
            進む ▶
          </button>
          <button 
            onClick={handleReset} 
            className="retro-btn-classic text-gray-600 font-bold"
          >
            最初から
          </button>
        </div>

        <div className="font-bold text-slate-700 text-sm">
          手順: {currentStepIdx} / {STEPS.length - 1} {currentStepIdx > 0 && `(投入した試薬: ${step.reagent})`}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：分液漏斗のSVG図面 (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[420px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700 text-sm">
            分液漏斗（セパラトリー・ファンネル）内部の溶解状態
          </div>

          {/* 分液漏斗のフラットSVG */}
          <div className="flex items-center justify-center py-6 w-full relative">
            <svg width="240" height="240" viewBox="0 0 160 160" className="overflow-visible font-sans">
              
              {/* 分液漏斗のアウトライン（涙のしずく型） */}
              <path 
                d="M 80 20 C 50 20 40 70 80 120 C 120 70 110 20 80 20 Z" 
                fill="none" 
                stroke="#334155" 
                strokeWidth="1.5" 
              />
              {/* 下部コック栓 */}
              <rect x="76" y="120" width="8" height="15" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
              <line x1="70" y1="128" x2="90" y2="128" stroke="#334155" strokeWidth="2" />
              {/* 排出口 */}
              <line x1="80" y1="135" x2="80" y2="155" stroke="#334155" strokeWidth="1.5" />

              {/* 上層：エーテル層（境界線 y=70） */}
              <path 
                d="M 54 55 C 50 65 47 70 48 75 L 112 75 C 113 70 110 65 106 55 C 98 45 88 40 80 40 C 72 40 62 45 54 55 Z" 
                fill="#fef08a" 
                opacity="0.3" 
              />
              <text x="80" y="50" fill="#a16207" fontSize="8" fontWeight="bold" textAnchor="middle">
                [上層] エーテル層（有機溶媒）
              </text>
              {/* エーテル層の溶質 */}
              <g>
                {step.etherLayer.map((item, idx) => {
                  const yPos = 58 + idx * 5;
                  return (
                    <text key={item} x="80" y={yPos} fill="#854d0e" fontSize="7" fontWeight="bold" textAnchor="middle">
                      {item}
                    </text>
                  );
                })}
              </g>

              {/* 下層：水層（境界線 y=75 〜 y=110） */}
              {step.waterLayer.length > 0 && (
                <g>
                  <path 
                    d="M 48 76 C 50 85 58 100 76 115 L 84 115 C 102 100 110 85 112 76 Z" 
                    fill="#93c5fd" 
                    opacity="0.3" 
                  />
                  <text x="80" y="86" fill="#1d4ed8" fontSize="8" fontWeight="bold" textAnchor="middle">
                    [下層] 水層（水溶液）
                  </text>
                  {/* 水層の溶質 */}
                  <g>
                    {step.waterLayer.map((item, idx) => {
                      const yPos = 94 + idx * 6;
                      return (
                        <text key={item} x="80" y={yPos} fill="#1e40af" fontSize="7" fontWeight="bold" textAnchor="middle">
                          {item}
                        </text>
                      );
                    })}
                  </g>
                </g>
              )}

            </svg>
          </div>

          <div className="w-full border-t border-gray-200 pt-4 text-center">
            <span className="text-[10px] text-gray-500 font-mono">
              ※エーテルと水は混ざり合わず、水の方が密度が大きいため必ず水が下層にきます。
            </span>
          </div>

        </div>

        {/* 右側：化学反応式と中和・酸性度の比較表 (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 物性テーブル */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 分離抽出反応のまとめ
            </h3>

            <table className="classic-table text-[10px]">
              <tbody>
                <tr>
                  <td className="bg-gray-50 font-bold w-20">操作段階</td>
                  <td className="text-slate-800">{step.operation}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">投入した試薬</td>
                  <td className="font-bold text-slate-800 font-mono">{step.reagent}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">水層へ移動した塩</td>
                  <td className="font-bold text-red-600">
                    {step.waterLayer.length > 0 ? step.waterLayer.join(', ') : 'なし'}
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">中和反応式</td>
                  <td className="font-mono text-slate-700 break-words">{step.reaction}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 酸性度の序列暗記コラム */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 入試攻略のポイント：酸の強さの比較
            </h3>
            
            <div className="bg-white border border-gray-300 p-2 text-center text-red-600 font-bold text-[11px]">
              スルホン酸 ＞ カルボン酸 ＞ 炭酸 ＞ フェノール
            </div>

            <p className="text-gray-600 text-[11px]">
              - **強塩基(NaOH)** を加えると、安息香酸とフェノールの**両方**が塩を作って水に溶けます。<br/>
              - **弱塩基(NaHCO3)** を加えると、炭酸より強い酸である安息香酸**のみ**が塩を作り、フェノールは塩を作らず遊離します。この中和選択性を利用して二者を分離します。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
