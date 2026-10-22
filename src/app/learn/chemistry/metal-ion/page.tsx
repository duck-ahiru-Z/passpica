"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Step {
  id: number;
  fractionLabel: string;
  reagent: string;
  reagentFormula: string;
  precipitates: string[];
  remains: string[];
  precipitateColor: string;
  precipitateColors: string[];
  reaction: string;
  explain: string;
}

const STEPS: Step[] = [
  {
    id: 0,
    fractionLabel: '試料溶液',
    reagent: '初期状態',
    reagentFormula: '-',
    precipitates: [],
    remains: ['Ag+', 'Pb2+', 'Cu2+', 'Fe3+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+'],
    precipitateColor: '-',
    precipitateColors: [],
    reaction: '-',
    explain: 'すべての金属イオン（銀、鉛、銅、鉄(III)、アルミニウム、亜鉛、カルシウム、ナトリウム）が均一に溶けている状態です。ここから順に試薬を加えて沈殿分離します。'
  },
  {
    id: 1,
    fractionLabel: '試料溶液',
    reagent: '① 希塩酸を静かに加える',
    reagentFormula: 'HCl',
    precipitates: ['AgCl (白色)', 'PbCl2 (白色)'],
    remains: ['Cu2+', 'Fe3+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+'],
    precipitateColor: '白色',
    precipitateColors: ['#f8fafc', '#f8fafc'],
    reaction: 'Ag+ + Cl- ➔ AgCl↓ , Pb2+ + 2Cl- ➔ PbCl2↓',
    explain: '塩化物イオン(Cl-)と結合して難溶性の沈殿を作る銀イオン(Ag+)と鉛イオン(Pb2+)が、塩化物の白色沈殿として同時に沈殿します。ここではまだ2種類は混合物です。次の熱水抽出と冷却で分けます。'
  },
  {
    id: 2,
    fractionLabel: '①で得た塩化物沈殿',
    reagent: '② 沈殿を熱水で抽出してろ別する',
    reagentFormula: '熱水',
    precipitates: ['AgCl (白色)'],
    remains: ['Pb2+ (熱水抽出液)'],
    precipitateColor: '白色',
    precipitateColors: ['#f8fafc'],
    reaction: 'PbCl2(s) ⇌ Pb2+(aq) + 2Cl-(aq) (熱水)',
    explain: '①で得たAgClとPbCl2の混合沈殿に熱水を加えます。PbCl2は熱水に溶けますが、AgClは溶けにくく固体として残るため、ろ過するとAgClを残渣、Pb2+を含む熱水抽出液として分けられます。'
  },
  {
    id: 3,
    fractionLabel: '②の熱水抽出液（Pb2+）',
    reagent: '③ 熱水抽出液を冷却する',
    reagentFormula: '冷却',
    precipitates: ['PbCl2 (白色)'],
    remains: [],
    precipitateColor: '白色',
    precipitateColors: ['#f8fafc'],
    reaction: 'Pb2+(aq) + 2Cl-(aq) ⇌ PbCl2(s) (冷却)',
    explain: '熱水に溶けたPbCl2は冷却すると溶解度が下がり、白色結晶として再び析出します。ろ過してAgClとは別の画分として回収します。'
  },
  {
    id: 4,
    fractionLabel: '①で分けた塩化物沈殿のろ液',
    reagent: '④ ろ液を酸性にして硫化水素を通す',
    reagentFormula: 'H2S (酸性下)',
    precipitates: ['CuS (黒色)', 'S (淡黄色)'],
    remains: ['Fe2+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+'],
    precipitateColor: '黒色 ＆ 淡黄色',
    precipitateColors: ['#1e293b', '#fde68a'],
    reaction: 'Cu2+ + H2S ➔ CuS↓ + 2H+ , 2Fe3+ + H2S ➔ 2Fe2+ + S↓ + 2H+',
    explain: '①で分けた塩化物沈殿のろ液に戻り、酸性条件で硫化水素を通します。酸性下ではS2-濃度が低く保たれるため、この対象イオンの硫化物では溶解度積の小さいCuSだけが沈殿します。一方、Fe3+はH2Sに還元されてFe2+となり、単体硫黄S（淡黄色）が生じます。Fe2+はこの段階では溶液中に残り、次段階でH2Sを除いて硝酸でFe3+へ酸化してから分離します。'
  },
  {
    id: 5,
    fractionLabel: '④の酸性H2Sろ液',
    reagent: '⑤ H2Sを除去し、硝酸で酸化後、過剰のアンモニア水を加える',
    reagentFormula: 'HNO3 ➔ NH3水 (過剰)',
    precipitates: ['Fe(OH)3', 'Al(OH)3'],
    remains: ['[Zn(NH3)4]2+ (溶解)', 'Ca2+', 'Na+'],
    precipitateColor: '赤褐色 ＆ 白色ゲル状',
    precipitateColors: ['#b45309', '#f8fafc'],
    reaction: 'Fe3+ + 3OH- ➔ Fe(OH)3↓ , Al3+ + 3OH- ➔ Al(OH)3↓',
    explain: '前段階でH2SによりFe2+となった鉄は、煮沸してH2Sを追い出した後、硝酸でFe3+に酸化します。その後アンモニア水を過剰に加えると、塩基性（OH-）になりFe(OH)3とAl(OH)3が沈殿します。★ポイント: 亜鉛イオン(Zn2+)も一度は水酸化物Zn(OH)2を作りますが、アンモニア水を過剰に加えることで無色透明の錯イオン [Zn(NH3)4]2+ となり再溶解します。'
  },
  {
    id: 6,
    fractionLabel: '⑤のアンモニア性ろ液',
    reagent: '⑥ ろ液に再び硫化水素を通す',
    reagentFormula: 'H2S (塩基性下)',
    precipitates: ['ZnS (白色)'],
    remains: ['Ca2+', 'Na+'],
    precipitateColor: '白色',
    precipitateColors: ['#f1f5f9'],
    reaction: 'Zn2+ + S2- ➔ ZnS↓',
    explain: 'アンモニアによって塩基性になった条件下では、S2-の電離度が大きくなりS2-濃度が十分に高くなります。これにより、酸性下では沈殿しなかった亜鉛イオン(Zn2+)が硫化物(ZnS)として沈殿します。このモデルで対象にしているのはZn2+です。硫化亜鉛(ZnS)は白色を呈するため、色も重要な確認点です。'
  },
  {
    id: 7,
    fractionLabel: '⑥の塩基性H2Sろ液',
    reagent: '⑦ ろ液に炭酸アンモニウム水溶液を加える',
    reagentFormula: '(NH4)2CO3',
    precipitates: ['CaCO3 (白色)'],
    remains: ['Na+'],
    precipitateColor: '白色',
    precipitateColors: ['#f8fafc'],
    reaction: 'Ca2+ + CO3 2- ➔ CaCO3↓',
    explain: 'この段階では、濾液に残っているカルシウムイオン(Ca2+)に炭酸イオン(CO3 2-)を加え、白色の炭酸カルシウム(CaCO3)として沈殿分離します。'
  },
  {
    id: 8,
    fractionLabel: '⑦のろ液',
    reagent: '⑧ 最後に残ったろ液の炎色反応を確認する',
    reagentFormula: '炎色反応',
    precipitates: [],
    remains: [],
    precipitateColor: '黄色 (炎色反応)',
    precipitateColors: [],
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
        <Link href="/learn/chemistry/metal-ion-drill" className="retro-btn-classic inline-flex mt-3">金属イオンの判別を問題で練習する →</Link>
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
            <svg width="280" height="240" viewBox="0 0 160 140" className="overflow-visible font-sans" role="img" aria-label={`ステップ${currentStepIdx}。処理画分：${step.fractionLabel}。残っているイオン：${step.remains.join('、') || 'なし'}。${step.precipitates.length ? `今回の沈殿：${step.precipitates.join('、')}（${step.precipitateColor}）` : currentStepIdx === STEPS.length - 1 ? '沈殿はなく、ナトリウムの黄色い炎色反応を図示します。' : '今回の沈殿はありません。'}`}>
              
              {/* ビーカー */}
              <rect x="35" y="25" width="90" height="80" fill="none" stroke="#334155" strokeWidth="1.5" />
              
              {/* 上層：濾液 (残っているイオン) */}
              <rect x="36" y="45" width="88" height="45" fill="#f0f9ff" opacity="0.8" />
              
              {/* 濾液内のイオン表記 */}
              <g>
                {step.remains.map((ion, idx) => {
                  const columns = Math.min(step.remains.length > 4 ? 3 : 2, step.remains.length);
                  const row = Math.floor(idx / columns);
                  const column = idx % columns;
                  const hasLongComplex = step.remains.length === 3 && step.remains.some((remainingIon) => remainingIon.length > 9);
                  const x = hasLongComplex ? (idx === 0 ? 80 : idx === 1 ? 62 : 98) : columns === 1 ? 80 : columns === 2 ? 62 + column * 36 : 48 + column * 32;
                  const y = hasLongComplex ? (idx === 0 ? 65 : 82) : step.remains.length > 4 ? 57 + row * 14 : step.remains.length > 2 ? 60 + row * 16 : 66 + row * 16;
                  return (
                    <text key={ion} x={x} y={y} fill="#1e3a8a" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {ion}
                    </text>
                  );
                })}
                {currentStepIdx === STEPS.length - 1 ? (
                  <g aria-hidden="true">
                    <path d="M80 48 C72 60 65 67 68 78 C70 87 76 91 80 92 C88 88 94 82 92 73 C91 66 85 59 80 48Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                    <path d="M80 65 C76 72 74 76 76 82 C77 85 79 87 81 88 C86 83 86 77 80 65Z" fill="#fb923c" />
                    <text x="80" y="101" fill="#854d0e" fontSize="8" fontWeight="bold" textAnchor="middle">Na の黄色い炎色反応</text>
                  </g>
                ) : step.remains.length === 0 ? (
                  <text x="80" y="70" fill="#94a3b8" fontSize="10" fontStyle="italic" textAnchor="middle">
                    （イオンなし）
                  </text>
                ) : null}
              </g>

              {/* 下層：この段階で生じた沈殿（炎色反応は沈殿として描かない） */}
              {step.precipitates.length > 0 && (
                <g>
                  {/* 沈殿物の層 */}
                  {step.precipitates.map((precipitate, idx) => {
                    const count = step.precipitates.length;
                    const segmentWidth = count === 2 ? 44 : 88 / count;
                    const segmentX = count === 2 ? 36 + idx * 44 : 36;
                    const isMixedColorPair = count === 2 && step.precipitateColors[0] !== step.precipitateColors[1];
                    const segmentY = isMixedColorPair ? 82 : 90;
                    const segmentHeight = isMixedColorPair ? 8 : 14;
                    const color = step.precipitateColors[idx] ?? step.precipitateColors[0] ?? '#f8fafc';
                    return (
                      <rect
                        key={`${precipitate}-${idx}`}
                        x={segmentX}
                        y={segmentY}
                        width={segmentWidth}
                        height={segmentHeight}
                        fill={color}
                        stroke="#475569"
                        strokeWidth="1"
                        className="transition-colors duration-300"
                      />
                    );
                  })}
                  {/* 沈殿物名は二色沈殿でも色境界をまたがないよう、層の上に表示 */}
                  {step.precipitates.map((precipitate, idx) => {
                    const count = step.precipitates.length;
                    const x = count === 2 ? 58 + idx * 44 : 80;
                    const isMixedColorPair = count === 2 && step.precipitateColors[0] !== step.precipitateColors[1];
                    const y = isMixedColorPair ? 88 : 100;
                    const color = step.precipitateColors[idx] ?? step.precipitateColors[0] ?? '#f8fafc';
                    const textFill = color === '#f8fafc' || color === '#f1f5f9' ? '#334155' : '#ffffff';
                    const shortLabel = precipitate.replace(/ \(.+\)$/, '');
                    return (
                      <text key={`label-${precipitate}`} x={x} y={y} fill={textFill} fontSize={count === 2 ? 6 : 8} fontWeight="bold" textAnchor="middle">
                        {shortLabel}
                      </text>
                    );
                  })}
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
                  title={s.reagent}
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
              ■ {currentStepIdx === STEPS.length - 1 ? '最終確認' : '沈殿生成反応式'}
            </h3>

            <table className="classic-table text-[10px]">
              <tbody>
                <tr>
                  <td className="bg-gray-50 font-bold w-24">処理画分</td>
                  <td className="font-bold text-slate-800">{step.fractionLabel}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold w-24">{currentStepIdx === STEPS.length - 1 ? '確認方法' : '加えた試薬'}</td>
                  <td className="font-bold text-slate-800 font-mono">{step.reagentFormula}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">沈殿した物質</td>
                  <td className="font-bold text-red-600">
                    {step.precipitates.length > 0 ? step.precipitates.join(' , ') : 'なし'}
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">{currentStepIdx === STEPS.length - 1 ? '炎色反応' : '沈殿の色'}</td>
                  <td className="font-bold text-slate-800">{step.precipitateColor}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">{currentStepIdx === STEPS.length - 1 ? '観察内容' : 'イオン反応式'}</td>
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
              ※この教材は、記載した金属イオンを対象にした系統分離の一例です。対象イオンや実験条件により、試薬・操作・分離順序は変わります。
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
