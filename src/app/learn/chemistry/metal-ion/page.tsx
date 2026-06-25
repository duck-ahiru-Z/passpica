"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Step {
  id: number;
  reagent: string;
  reagentFormula: string;
  precipitates: string[];
  remains: string[];
  precipitateColor: string;
  precipitateColorHex: string;
  reaction: string;
  explain: string;
}

const STEPS: Step[] = [
  {
    id: 0,
    reagent: '初期状態',
    reagentFormula: '-',
    precipitates: [],
    remains: ['Ag+', 'Pb2+', 'Cu2+', 'Fe3+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+'],
    precipitateColor: '-',
    precipitateColorHex: '#ffffff',
    reaction: '-',
    explain: 'すべての金属イオン（銀、鉛、銅、鉄(III)、アルミニウム、亜鉛、カルシウム、ナトリウム）が均一に溶けている状態です。ここから順に試薬を加えて沈殿分離します。'
  },
  {
    id: 1,
    reagent: '① 希塩酸を静かに加える',
    reagentFormula: 'HCl',
    precipitates: ['AgCl (白色)', 'PbCl2 (白色)'],
    remains: ['Cu2+', 'Fe3+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+'],
    precipitateColor: '白色',
    precipitateColorHex: '#f8fafc',
    reaction: 'Ag+ + Cl- ➔ AgCl↓ , Pb2+ + 2Cl- ➔ PbCl2↓',
    explain: '塩化物イオン(Cl-)と結合して難溶性の沈殿を作る銀イオン(Ag+)と鉛イオン(Pb2+)が、塩化物の白色沈殿として同時に沈殿します。★ポイント: 塩化鉛(PbCl2)は熱水に溶けて再電離する性質を持ち、この点で塩化銀(AgCl)と区別できます。'
  },
  {
    id: 2,
    reagent: '② 濾液を酸性にした状態で、硫化水素を通す',
    reagentFormula: 'H2S (酸性下)',
    precipitates: ['CuS (黒色)'],
    remains: ['Fe3+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+'],
    precipitateColor: '黒色',
    precipitateColorHex: '#1e293b',
    reaction: 'Cu2+ + S2- ➔ CuS↓',
    explain: '酸性条件下（H+濃度が高く、電離平衡により硫化物イオンS2-濃度が極めて低い状態）では、S2-と非常に強く結びつく溶解度積の極端に小さい金属（イオン化傾向の小さい銅Cu2+や鉛Pb2+）のみが硫化物沈殿(CuS)として沈殿します。イオン化傾向が比較的大きい鉄や亜鉛はここでは沈殿しません。'
  },
  {
    id: 3,
    reagent: '③ 濾液を煮沸してH2Sを除去後、硝酸を加えて酸化し、過剰のアンモニア水を加える',
    reagentFormula: 'HNO3 ➔ NH3水 (過剰)',
    precipitates: ['Fe(OH)3 (赤褐色)', 'Al(OH)3 (白色ゲル状)'],
    remains: ['[Zn(NH3)4]2+ (溶解)', 'Ca2+', 'Na+'],
    precipitateColor: '赤褐色 ＆ 白色ゲル状',
    precipitateColorHex: '#b45309',
    reaction: 'Fe3+ + 3OH- ➔ Fe(OH)3↓ , Al3+ + 3OH- ➔ Al(OH)3↓',
    explain: '煮沸してH2Sを追い出した後、硝酸で鉄をFe3+に酸化し、アンモニア水を過剰に加えます。塩基性（OH-）になり、鉄とアルミニウムが水酸化物の沈殿として落ちます。★ポイント: 亜鉛イオン(Zn2+)も一度は水酸化物Zn(OH)2を作りますが、アンモニア水を過剰に加えることで無色透明の錯イオン [Zn(NH3)4]2+ となり再溶解します。'
  },
  {
    id: 4,
    reagent: '④ 濾液に再び硫化水素を通す',
    reagentFormula: 'H2S (塩基性下)',
    precipitates: ['ZnS (白色)'],
    remains: ['Ca2+', 'Na+'],
    precipitateColor: '白色',
    precipitateColorHex: '#f1f5f9',
    reaction: 'Zn2+ + S2- ➔ ZnS↓',
    explain: 'アンモニアによって塩基性になった条件下では、S2-の電離度が大きくなりS2-濃度が十分に高くなります。これにより、酸性下では沈殿しなかったイオン化傾向中程度の金属（亜鉛Zn2+やマンガンMn2+）が硫化物(ZnS)として沈殿します。硫化亜鉛(ZnS)は、黒色が多い金属硫化物の中で珍しく「白色」を呈するため試験で非常によく問われます。'
  },
  {
    id: 5,
    reagent: '⑤ 濾液に炭酸アンモニウム水溶液を加える',
    reagentFormula: '(NH4)2CO3',
    precipitates: ['CaCO3 (白色)'],
    remains: ['Na+'],
    precipitateColor: '白色',
    precipitateColorHex: '#f8fafc',
    reaction: 'Ca2+ + CO3 2- ➔ CaCO3↓',
    explain: '炭酸イオン(CO3 2-)を加えることで、アルカリ土類金属であるカルシウムイオン(Ca2+)やバリウムイオン(Ba2+)が、炭酸塩(CaCO3)の白色沈殿として分離されます。'
  },
  {
    id: 6,
    reagent: '⑥ 最後に残った濾液の炎色反応を確認する',
    reagentFormula: '炎色反応',
    precipitates: ['Na+ (黄色)'],
    remains: [],
    precipitateColor: '黄色 (炎色反応)',
    precipitateColorHex: '#eab308',
    reaction: 'Na ➔ 黄色発色',
    explain: '最後まで沈殿を作らず濾液中に残ったナトリウムイオン(Na+)は、白金線につけてガスバーナーの炎に入れることで、特有の強い黄色（炎色反応）を確認して特定します。'
  }
];

export default function MetalIonPage() {
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
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・金属系統分析
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          金属イオンの系統分析・沈殿分離フロー
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          各試薬を加えることで、溶液中の多様な金属イオンが溶解度の違い（溶解度積）に基づいて段階的に分離されていく様子をシミュレートします。
        </p>
      </div>

      {/* シミュレーション操作バー */}
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
          ステップ: {currentStepIdx} / {STEPS.length - 1} {currentStepIdx > 0 && `(加えた試薬: ${step.reagentFormula})`}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：SVGフロー図解 (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[420px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700 text-sm">
            分離状態：{step.reagent}
          </div>

          {/* ビーカーと沈殿のフラットSVG */}
          <div className="flex items-center justify-center py-6 w-full relative">
            <svg width="280" height="240" viewBox="0 0 160 140" className="overflow-visible font-sans">
              
              {/* ビーカー */}
              <rect x="35" y="25" width="90" height="80" fill="none" stroke="#334155" strokeWidth="1.5" />
              
              {/* 上層：濾液 (残っているイオン) */}
              <rect x="36" y="45" width="88" height="60" fill="#f0f9ff" opacity="0.8" />
              
              {/* 濾液内のイオン表記 */}
              <g>
                {step.remains.map((ion, idx) => {
                  // ランダムに散布するための固定座標
                  const coords = [
                    [45, 60], [65, 55], [85, 65], [105, 58], 
                    [55, 75], [75, 78], [95, 76], [110, 85]
                  ];
                  const [x, y] = coords[idx] || [60, 60];
                  return (
                    <text key={ion} x={x} y={y} fill="#1e3a8a" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {ion}
                    </text>
                  );
                })}
                {step.remains.length === 0 && (
                  <text x="80" y="70" fill="#94a3b8" fontSize="10" fontStyle="italic" textAnchor="middle">
                    （イオンなし）
                  </text>
                )}
              </g>

              {/* 下層：沈殿 (沈殿したイオン) */}
              {step.precipitates.length > 0 && (
                <g>
                  {/* 沈殿物の層 */}
                  <rect 
                    x="36" 
                    y="92" 
                    width="88" 
                    height="12" 
                    fill={step.precipitateColorHex} 
                    stroke="#475569" 
                    strokeWidth="1"
                    className="transition-colors duration-300"
                  />
                  {/* 沈殿物のテキスト */}
                  <text 
                    x="80" 
                    y="101" 
                    fill={step.precipitateColorHex === '#f8fafc' || step.precipitateColorHex === '#f1f5f9' ? '#334155' : '#ffffff'} 
                    fontSize="8" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {step.precipitates.join(' , ')}
                  </text>
                </g>
              )}

              {/* ビーカー底のテキスト */}
              <text x="80" y="118" fill="#475569" fontSize="9" textAnchor="middle">分離ビーカー</text>
            </svg>
          </div>

          {/* フローチャートミニマップ */}
          <div className="w-full border-t border-gray-200 pt-4 text-center text-[9px] text-gray-500 font-mono flex justify-center gap-1.5 flex-wrap">
            {STEPS.map((s, idx) => (
              <span 
                key={s.id} 
                className={`px-1.5 py-0.5 border ${currentStepIdx === idx ? 'border-amber-600 bg-amber-50 font-bold text-slate-800' : 'border-gray-200 text-gray-400'}`}
              >
                {idx === 0 ? 'Start' : `試薬${idx}`}
              </span>
            ))}
          </div>

        </div>

        {/* 右側：化学反応式と詳細説明 (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 反応式カード */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 沈殿生成反応式
            </h3>

            <table className="classic-table text-[10px]">
              <tbody>
                <tr>
                  <td className="bg-gray-50 font-bold w-24">加えた試薬</td>
                  <td className="font-bold text-slate-800 font-mono">{step.reagentFormula}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">沈殿した物質</td>
                  <td className="font-bold text-red-600">
                    {step.precipitates.length > 0 ? step.precipitates.join(' , ') : 'なし'}
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">沈殿の色</td>
                  <td className="font-bold text-slate-800">{step.precipitateColor}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">イオン反応式</td>
                  <td className="font-mono text-slate-700 break-words">{step.reaction}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 解説カード */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 分離の化学的メカニズム
            </h3>
            <p className="text-gray-600 text-[11px]">
              {step.explain}
            </p>
            <p className="text-[10px] text-gray-500">
              ※系統分離の順序（HCl ➔ H2S(酸性) ➔ 煮沸/HNO3/NH3(過剰) ➔ H2S(塩基性) ➔ CO3 2- ➔ 炎色反応）は、入試問題の基本構造としてそのまま出題されます。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
