"use client";

import { useState } from 'react';
import Link from 'next/link';

interface MetalIon {
  id: string;
  name: string;
  symbol: string;
  initialColor: string; // CSS color string
  initialBgClass: string;
  desc: string;
}

const METAL_IONS: MetalIon[] = [
  { id: 'Cu2+', name: '銅(II)イオン', symbol: 'Cu²', initialColor: 'rgba(56, 189, 248, 0.4)', initialBgClass: 'bg-sky-100', desc: '水溶液中では水和して青色（[Cu(H₂O)₄]²⁺）を示します。' },
  { id: 'Fe3+', name: '鉄(III)イオン', symbol: 'Fe³⁺', initialColor: 'rgba(234, 179, 8, 0.35)', initialBgClass: 'bg-yellow-100', desc: '水溶液中では黄褐色を示します。加水分解しやすく酸性です。' },
  { id: 'Fe2+', name: '鉄(II)イオン', symbol: 'Fe²⁺', initialColor: 'rgba(187, 247, 208, 0.3)', initialBgClass: 'bg-green-100', desc: '淡緑色を示しますが、空気中で徐々に酸化されて鉄(III)に変化します。' },
  { id: 'Al3+', name: 'アルミニウムイオン', symbol: 'Al³⁺', initialColor: 'rgba(255, 255, 255, 0.1)', initialBgClass: 'bg-slate-50', desc: '無色透明です。典型元素であり、両性金属の性質を持ちます。' },
  { id: 'Zn2+', name: '亜鉛イオン', symbol: 'Zn²⁺', initialColor: 'rgba(255, 255, 255, 0.1)', initialBgClass: 'bg-slate-50', desc: '無色透明です。アルミニウムと同様に両性金属です。' },
  { id: 'Ag+', name: '銀イオン', symbol: 'Ag⁺', initialColor: 'rgba(255, 255, 255, 0.1)', initialBgClass: 'bg-slate-50', desc: '無色透明です。ハロゲン等と多様な沈殿を作ります。' },
  { id: 'Pb2+', name: '鉛(II)イオン', symbol: 'Pb²⁺', initialColor: 'rgba(255, 255, 255, 0.1)', initialBgClass: 'bg-slate-50', desc: '無色透明です。熱水に溶ける塩化物の沈殿など、特徴的な挙動を示します。' }
];

interface Reagent {
  id: string;
  name: string;
  symbol: string;
  desc: string;
}

const REAGENTS: Reagent[] = [
  { id: 'NaOH', name: '水酸化ナトリウム水溶液', symbol: 'NaOH', desc: '強塩基。両性金属の沈殿を過剰添加により錯イオンとして再溶解させます。' },
  { id: 'NH3', name: 'アンモニア水', symbol: 'NH₃', desc: '弱塩基。特定の金属イオン（Ag, Cu, Zn）と安定なアンミン錯体を作って再溶解させます。' },
  { id: 'HCl', name: '希塩酸', symbol: 'HCl', desc: '酸性。塩化物イオン（Cl⁻）がAg⁺やPb²⁺と白色沈殿を作ります。' },
  { id: 'KI', name: 'ヨウ化カリウム水溶液', symbol: 'KI', desc: 'ヨウ化物イオン（I⁻）がAg⁺（黄色沈殿）、Pb²⁺（黄色沈殿）などと反応します。' },
  { id: 'H2S', name: '硫化水素', symbol: 'H₂S', desc: '気体を通じるか水溶液を滴下。液性（酸性・塩基性）により沈殿する金属が変わります。' }
];

// 反応シミュレーション結果のインターフェース
interface ReactionResult {
  liquidColor: string;       // 反応後の上澄み液の色 (CSS color)
  precipitateColor: string;  // 沈殿物の色 (CSS color, ""の場合は沈殿なし)
  formula: string;           // 化学反応式
  description: string;       // 現象の説明文
}

export default function InorganicColorsPage() {
  const [selectedIon, setSelectedIon] = useState<string>('Cu2+');
  const [selectedReagent, setSelectedReagent] = useState<string>('NaOH');
  const [amount, setAmount] = useState<'small' | 'excess'>('small');
  
  // H2S滴下用の液性選択（H2S選択時のみ有効）
  const [h2sPh, setH2sPh] = useState<'acidic' | 'alkaline'>('acidic');

  // 金属イオンの詳細情報を取得
  const currentIon = METAL_IONS.find(i => i.id === selectedIon) || METAL_IONS[0];
  const currentReagent = REAGENTS.find(r => r.id === selectedReagent) || REAGENTS[0];

  // 反応結果の判定ロジック
  const getReactionResult = (): ReactionResult => {
    const isExcess = amount === 'excess';

    // 1. 銅イオン (Cu2+)
    if (selectedIon === 'Cu2+') {
      if (selectedReagent === 'NaOH') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgb(56, 189, 248)', // 青白色
          formula: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (青白色沈殿)',
          description: '水酸化ナトリウムを加えると、青白色の水酸化銅(II)の沈殿が生成します。過剰に加えても沈殿は溶けません。'
        };
      }
      if (selectedReagent === 'NH3') {
        if (!isExcess) {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: 'rgb(56, 189, 248)', // 青白色
            formula: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (青白色沈殿)',
            description: '少量のアンモニア水を加えると、塩基性を示すため、まず青白色の水酸化銅(II)の沈殿が生成します。'
          };
        } else {
          return {
            liquidColor: 'rgba(29, 78, 216, 0.85)', // 深青色溶液
            precipitateColor: '',
            formula: 'Cu(OH)₂ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻ (深青色溶液)',
            description: 'アンモニア水を過剰に加えると、水酸化銅(II)沈殿がテトラアンミン銅(II)錯イオンとなって再溶解し、深青色（濃青色）の透明な水溶液になります。'
          };
        }
      }
      if (selectedReagent === 'H2S') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: '#1e293b', // 黒色
          formula: 'Cu²⁺ + S²⁻ → CuS↓ (黒色沈殿)',
          description: '硫化水素を通じると、液性に関係なく極めて難溶な硫化銅(II)の黒色沈殿が生成します（酸性・塩基性どちらでも沈殿）。'
        };
      }
      if (selectedReagent === 'HCl' || selectedReagent === 'KI') {
        return {
          liquidColor: currentIon.initialColor,
          precipitateColor: '',
          formula: '変化なし',
          description: '銅(II)イオンは塩化物イオンやヨウ化物イオンの希薄溶液とは沈殿を形成しないため、変化はありません（※高濃度KIの場合は酸化還元反応を起こしますが、高校範囲では変化なしと扱います）。'
        };
      }
    }

    // 2. 鉄(III)イオン (Fe3+)
    if (selectedIon === 'Fe3+') {
      if (selectedReagent === 'NaOH' || selectedReagent === 'NH3') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgb(180, 83, 9)', // 赤褐色
          formula: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓ (赤褐色沈殿)',
          description: '塩基（水酸化ナトリウム水溶液またはアンモニア水）を加えると、赤褐色の水酸化鉄(III)沈殿が生成します。過剰に加えても溶解しません。'
        };
      }
      if (selectedReagent === 'H2S') {
        // 酸性条件下で還元反応が起きる
        if (h2sPh === 'acidic') {
          return {
            liquidColor: 'rgba(187, 247, 208, 0.35)', // Fe2+ の淡緑色
            precipitateColor: 'rgba(254, 240, 138, 0.65)', // 黄白色（コロイド状の単体イオウ）
            formula: '2Fe³⁺ + H₂S → 2Fe²⁺ + S↓ + 2H⁺ (イオウの白濁 ＋ Fe²⁺の淡緑色)',
            description: '酸性条件下で硫化水素を通じると、Fe³⁺が還元されて淡緑色のFe²⁺になり、同時にH₂Sが酸化されて単体の硫黄（S）の黄白色のコロイド沈殿（白濁）が生じます。'
          };
        } else {
          // 塩基性ではFeS（黒色）が沈殿
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: '#1e293b', // 黒色
            formula: 'Fe²⁺ (還元後) + S²⁻ → FeS↓ (黒色沈殿)',
            description: '塩基性条件下では、還元されたFe²⁺とS²⁻が反応し、硫化鉄(II)の黒色沈殿が生成します。'
          };
        }
      }
      return {
        liquidColor: currentIon.initialColor,
        precipitateColor: '',
        formula: '変化なし',
        description: '希塩酸やヨウ化カリウム溶液を加えても、顕著な沈殿は生成しません。'
      };
    }

    // 3. 鉄(II)イオン (Fe2+)
    if (selectedIon === 'Fe2+') {
      if (selectedReagent === 'NaOH' || selectedReagent === 'NH3') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgb(64, 110, 80)', // 緑白色（汚緑色）
          formula: 'Fe²⁺ + 2OH⁻ → Fe(OH)₂↓ (緑白色沈殿)',
          description: '塩基を加えると、緑白色（空気中の酸素で一部酸化されると黒緑色/汚緑色になる）の水酸化鉄(II)沈殿が生成します。過剰に加えても溶けません。'
        };
      }
      if (selectedReagent === 'H2S') {
        if (h2sPh === 'acidic') {
          return {
            liquidColor: currentIon.initialColor,
            precipitateColor: '',
            formula: '酸性下では沈殿せず (イオンのまま存在)',
            description: '鉄(II)イオンはイオン化傾向が比較的大きいため、酸性の硫化水素中では沈殿を生成せず、淡緑色の溶液のまま変化しません。'
          };
        } else {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: '#1e293b', // 黒色
            formula: 'Fe²⁺ + S²⁻ → FeS↓ (黒色沈殿)',
            description: '中性〜塩基性（アンモニア水等で調整）の条件下で硫化水素を通じると、硫化鉄(II)の黒色沈殿が生成します。'
          };
        }
      }
      return {
        liquidColor: currentIon.initialColor,
        precipitateColor: '',
        formula: '変化なし',
        description: '塩化物やヨウ化物の添加では沈殿しません。'
      };
    }

    // 4. アルミニウムイオン (Al3+)
    if (selectedIon === 'Al3+') {
      if (selectedReagent === 'NaOH') {
        if (!isExcess) {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: 'rgba(241, 245, 249, 0.9)', // 白色ゲル状
            formula: 'Al³⁺ + 3OH⁻ → Al(OH)₃↓ (白色ゲル状沈殿)',
            description: '少量の水酸化ナトリウムを加えると、白色ゲル状の水酸化アルミニウム沈殿が生成します。'
          };
        } else {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: '',
            formula: 'Al(OH)₃ + OH⁻ → [Al(OH)₄]⁻ (テトラヒドロキシドアルミニウム酸イオン・無色溶液)',
            description: 'アルミニウムは両性金属であるため、強塩基である水酸化ナトリウムを過剰に加えると、沈殿がテトラヒドロキシドアルミニウム酸イオン（錯イオン）となって再溶解し、無色透明になります。'
          };
        }
      }
      if (selectedReagent === 'NH3') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgba(241, 245, 249, 0.9)', // 白色ゲル状
          formula: 'Al³⁺ + 3OH⁻ → Al(OH)₃↓ (過剰の弱塩基には不溶)',
          description: '弱塩基であるアンモニア水を加えると白色の水酸化アルミニウム沈殿が生成します。過剰に加えても、アンモニア水では錯イオンを作らないため、沈殿は溶けずに残ります（両性金属の判別の重要ポイントです）。'
        };
      }
      return {
        liquidColor: currentIon.initialColor,
        precipitateColor: '',
        formula: '変化なし',
        description: '酸やハロゲン化物イオンとは沈殿を作りません。'
      };
    }

    // 5. 亜鉛イオン (Zn2+)
    if (selectedIon === 'Zn2+') {
      if (selectedReagent === 'NaOH') {
        if (!isExcess) {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: 'rgba(241, 245, 249, 0.9)', // 白色沈殿
            formula: 'Zn²⁺ + 2OH⁻ → Zn(OH)₂↓ (白色沈殿)',
            description: '水酸化ナトリウムを加えると、白色の水酸化亜鉛沈殿が生成します。'
          };
        } else {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: '',
            formula: 'Zn(OH)₂ + 2OH⁻ → [Zn(OH)₄]²⁻ (テトラヒドロキシド亜鉛(II)酸イオン・無色溶液)',
            description: '亜鉛も両性金属なので、強塩基である水酸化ナトリウムを過剰に加えると、錯イオンとなって再溶解し、無色透明になります。'
          };
        }
      }
      if (selectedReagent === 'NH3') {
        if (!isExcess) {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: 'rgba(241, 245, 249, 0.9)', // 白色
            formula: 'Zn²⁺ + 2OH⁻ → Zn(OH)₂↓ (白色沈殿)',
            description: '少量のアンモニア水を加えると、白色の水酸化亜鉛沈殿が生成します。'
          };
        } else {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: '',
            formula: 'Zn(OH)₂ + 4NH₃ → [Zn(NH₃)₄]²⁺ + 2OH⁻ (テトラアンミン亜鉛(II)イオン・無色溶液)',
            description: 'アンモニア水を過剰に加えると、亜鉛イオンは安定なテトラアンミン亜鉛(II)錯イオンを形成するため、沈殿が再び溶解して無色透明になります（Al³⁺との重要な区別点です）。'
          };
        }
      }
      if (selectedReagent === 'H2S') {
        if (h2sPh === 'acidic') {
          return {
            liquidColor: currentIon.initialColor,
            precipitateColor: '',
            formula: '酸性下では沈殿せず',
            description: '亜鉛はイオン化傾向が中程度であるため、酸性の硫化水素水溶液では沈殿を生じません。'
          };
        } else {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: 'rgba(241, 245, 249, 0.9)', // 白色沈殿
            formula: 'Zn²⁺ + S²⁻ → ZnS↓ (白色沈殿)',
            description: '中性〜塩基性の条件下で硫化水素を通じると、**金属硫化物としては非常に珍しい「白色」**の硫化亜鉛(ZnS)沈殿が生成します（非常によく狙われる知識です）。'
          };
        }
      }
      return {
        liquidColor: currentIon.initialColor,
        precipitateColor: '',
        formula: '変化なし',
        description: '酸やヨウ化物イオンでは沈殿しません。'
      };
    }

    // 6. 銀イオン (Ag+)
    if (selectedIon === 'Ag+') {
      if (selectedReagent === 'NaOH') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgb(113, 63, 18)', // 褐色沈殿
          formula: '2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O (酸化銀・褐色沈殿)',
          description: '水酸化ナトリウムを加えると、水酸化銀は不安定ですぐに脱水縮合するため、**褐色（暗褐色）の酸化銀(Ag₂O)**の沈殿が生成します。過剰に加えても溶けません。'
        };
      }
      if (selectedReagent === 'NH3') {
        if (!isExcess) {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: 'rgb(113, 63, 18)', // 褐色沈殿
            formula: '2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O (酸化銀・褐色沈殿)',
            description: '少量のアンモニア水を加えると、褐色の酸化銀(Ag₂O)沈殿が生成します。'
          };
        } else {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: '',
            formula: 'Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]⁺ + 2OH⁻ (ジアンミン銀(I)イオン・無色溶液)',
            description: 'アンモニア水を過剰に加えると、ジアンミン銀(I)錯イオン（無色）となって再び溶け、透明になります。'
          };
        }
      }
      if (selectedReagent === 'HCl') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgba(255, 255, 255, 0.95)', // 白色
          formula: 'Ag⁺ + Cl⁻ → AgCl↓ (塩化銀・白色沈殿)',
          description: '塩酸を加えると、光で分解しやすい塩化銀(AgCl)の白色沈殿が生成します。この沈殿は過剰のアンモニア水には溶けますが、酸には溶けません。'
        };
      }
      if (selectedReagent === 'KI') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgb(254, 240, 138)', // 黄色
          formula: 'Ag⁺ + I⁻ → AgI↓ (ヨウ化銀・黄色沈殿)',
          description: 'ヨウ化カリウム溶液を加えると、ヨウ化銀(AgI)の黄色（淡黄色）沈殿が生成します。この沈殿は水やアンモニア水にも不溶です。'
        };
      }
      if (selectedReagent === 'H2S') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: '#1e293b', // 黒色
          formula: '2Ag⁺ + S²⁻ → Ag₂S↓ (硫化銀・黒色沈殿)',
          description: '硫化水素を通じると、液性に関係なく極めて溶けにくい硫化銀(Ag₂S)の黒色沈殿が生成します。'
        };
      }
    }

    // 7. 鉛(II)イオン (Pb2+)
    if (selectedIon === 'Pb2+') {
      if (selectedReagent === 'NaOH') {
        if (!isExcess) {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: 'rgba(241, 245, 249, 0.9)', // 白色
            formula: 'Pb²⁺ + 2OH⁻ → Pb(OH)₂↓ (白色沈殿)',
            description: '水酸化ナトリウムを加えると、白色の水酸化鉛(II)沈殿が生成します。'
          };
        } else {
          return {
            liquidColor: 'rgba(248, 250, 252, 0.1)',
            precipitateColor: '',
            formula: 'Pb(OH)₂ + 2OH⁻ → [Pb(OH)₄]²⁻ (テトラヒドロキシド鉛(II)酸イオン・無色溶液)',
            description: '鉛は両性金属であるため、過剰の強塩基を加えると錯イオンを形成して再溶解し、無色透明になります。'
          };
        }
      }
      if (selectedReagent === 'NH3') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgba(241, 245, 249, 0.9)', // 白色
          formula: 'Pb²⁺ + 2OH⁻ → Pb(OH)₂↓ (過剰の弱塩基には不溶)',
          description: 'アンモニア水を加えると白色の水酸化鉛(II)沈殿が生成しますが、アンモニア過剰でも錯イオンを作らないため、沈殿は溶けずに残ります。'
        };
      }
      if (selectedReagent === 'HCl') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgba(255, 255, 255, 0.95)', // 白色
          formula: 'Pb²⁺ + 2Cl⁻ → PbCl₂↓ (塩化鉛・白色沈殿)',
          description: '塩酸を加えると塩化鉛(II)の白色沈殿が生成します。**この沈殿は「熱水に溶ける」という入試に頻出のユニークな性質**を持ちます。'
        };
      }
      if (selectedReagent === 'KI') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: 'rgb(234, 179, 8)', // 黄色
          formula: 'Pb²⁺ + 2I⁻ → PbI₂↓ (ヨウ化鉛・黄色沈殿)',
          description: 'ヨウ化カリウムを加えるとヨウ化鉛(II)の美しい黄色沈殿が生成します。熱水に溶かしゆっくり冷却すると、黄金色の結晶がキラキラ光りながら沈殿する「黄金の雨」現象が見られます。'
        };
      }
      if (selectedReagent === 'H2S') {
        return {
          liquidColor: 'rgba(248, 250, 252, 0.1)',
          precipitateColor: '#1e293b', // 黒色
          formula: 'Pb²⁺ + S²⁻ → PbS↓ (硫化鉛・黒色沈殿)',
          description: '硫化水素を通じると、液性に関係なく硫化鉛(II)の黒色沈殿が速やかに生成します。'
        };
      }
    }

    return {
      liquidColor: currentIon.initialColor,
      precipitateColor: '',
      formula: 'データ未定義',
      description: '反応結果が取得できません。'
    };
  };

  const reaction = getReactionResult();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 無機化学・物質の色
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          無機物質の色と沈殿・イオン反応シミュレーター
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          ビーカーの金属イオンと加える試薬を選択し、沈殿の色や錯イオン形成による再溶解の様子をバーチャル試験管で視覚的に観察します。
        </p>
      </div>

      {/* 操作パネル ＋ 試験管グラフィック */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左・中央：操作部と試験管 (2/3) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-300 bg-white p-6">
          
          {/* 操作選択 */}
          <div className="space-y-4">
            
            {/* 金属イオン選択 */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 block">① 対象の金属イオンを選択</span>
              <div className="flex flex-col gap-1">
                {METAL_IONS.map(ion => (
                  <button
                    key={ion.id}
                    onClick={() => setSelectedIon(ion.id)}
                    className={`retro-btn-classic text-left flex justify-between items-center ${selectedIon === ion.id ? 'bg-[#cbd5e1] font-bold' : ''}`}
                  >
                    <span>{ion.name}</span>
                    <span className="font-mono text-[10px] bg-white/60 px-1 py-0.5 rounded border border-gray-300">{ion.symbol}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 leading-normal pt-1 italic">
                {currentIon.desc}
              </p>
            </div>

            {/* 試薬選択 */}
            <div className="space-y-1.5 border-t border-gray-200 pt-3">
              <span className="font-bold text-slate-700 block">② 添加する試薬を選択</span>
              <div className="flex flex-col gap-1">
                {REAGENTS.map(reagent => (
                  <button
                    key={reagent.id}
                    onClick={() => setSelectedReagent(reagent.id)}
                    className={`retro-btn-classic text-left flex justify-between items-center ${selectedReagent === reagent.id ? 'bg-[#cbd5e1] font-bold' : ''}`}
                  >
                    <span>{reagent.name}</span>
                    <span className="font-mono text-[10px] bg-white/60 px-1 py-0.5 rounded border border-gray-300">{reagent.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 添加量または液性の詳細調整 */}
            <div className="space-y-2 border-t border-gray-200 pt-3">
              <span className="font-bold text-slate-700 block">③ 添加量・条件の調整</span>
              
              {/* NaOH or NH3 の場合の添加量 */}
              {(selectedReagent === 'NaOH' || selectedReagent === 'NH3') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAmount('small')}
                    className={`flex-1 retro-btn-classic font-bold py-1.5 ${amount === 'small' ? 'bg-[#94a3b8] text-white' : ''}`}
                  >
                    少量加える
                  </button>
                  <button
                    onClick={() => setAmount('excess')}
                    className={`flex-1 retro-btn-classic font-bold py-1.5 ${amount === 'excess' ? 'bg-[#94a3b8] text-white' : ''}`}
                  >
                    過剰に加える
                  </button>
                </div>
              )}

              {/* H2S の場合の液性選択 */}
              {selectedReagent === 'H2S' && (
                <div className="space-y-1.5 bg-gray-50 p-2 border border-gray-300">
                  <span className="font-bold text-gray-600 block text-[10px]">■ 硫化水素を通じる際の液性：</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setH2sPh('acidic')}
                      className={`flex-1 retro-btn-classic py-1 text-[11px] ${h2sPh === 'acidic' ? 'bg-[#cbd5e1] font-bold' : ''}`}
                    >
                      酸性 (HCl酸性など)
                    </button>
                    <button
                      onClick={() => setH2sPh('alkaline')}
                      className={`flex-1 retro-btn-classic py-1 text-[11px] ${h2sPh === 'alkaline' ? 'bg-[#cbd5e1] font-bold' : ''}`}
                    >
                      中性〜塩基性 (NH₃塩基性)
                    </button>
                  </div>
                </div>
              )}

              {/* HCl or KI の場合の補足 */}
              {(selectedReagent === 'HCl' || selectedReagent === 'KI') && (
                <div className="text-[10px] text-gray-500 bg-gray-50 p-2 border border-gray-300 leading-normal">
                  一般的な希溶液を少量添加した際の、沈殿反応のみを確認します。
                </div>
              )}
            </div>

          </div>

          {/* ビジュアル試験管描画 */}
          <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 py-6 min-h-[300px]">
            <span className="font-bold text-[10px] text-slate-500 mb-4 select-none">【バーチャル反応試験管】</span>
            
            <div className="relative w-28 h-64">
              {/* 試験管枠および内部液のSVG */}
              <svg viewBox="0 0 100 240" className="w-full h-full overflow-visible">
                {/* 液体層：下半分の液 */}
                <path
                  d="M 20 80 L 20 200 A 30 30 0 0 0 80 200 L 80 80 Z"
                  fill={reaction.liquidColor}
                  className="transition-all duration-300"
                />

                {/* 沈殿物レイヤー（ある場合） */}
                {reaction.precipitateColor && (
                  <g>
                    {/* ビーカー底部の堆積沈殿 */}
                    <path
                      d="M 21.5 175 C 30 185, 70 185, 78.5 175 L 78.5 200 A 30 30 0 0 1 21.5 200 Z"
                      fill={reaction.precipitateColor}
                      className="transition-all duration-300"
                    />
                    {/* 沈殿物コロイド・サスペンションの点々 */}
                    <circle cx="30" cy="150" r="1.5" fill={reaction.precipitateColor} opacity="0.8" />
                    <circle cx="45" cy="160" r="2" fill={reaction.precipitateColor} opacity="0.7" />
                    <circle cx="65" cy="145" r="1.5" fill={reaction.precipitateColor} opacity="0.8" />
                    <circle cx="55" cy="170" r="1" fill={reaction.precipitateColor} opacity="0.9" />
                    <circle cx="38" cy="135" r="2" fill={reaction.precipitateColor} opacity="0.6" />
                    <circle cx="70" cy="165" r="1.8" fill={reaction.precipitateColor} opacity="0.75" />
                    <circle cx="48" cy="120" r="1.2" fill={reaction.precipitateColor} opacity="0.5" />
                  </g>
                )}

                {/* 試験管のガラス輪郭 */}
                <path
                  d="M 20 20 L 20 200 A 30 30 0 0 0 80 200 L 80 20"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                
                {/* 試験管の上部リップフチ */}
                <ellipse cx="50" cy="20" rx="32" ry="5" fill="none" stroke="#94a3b8" strokeWidth="3" />

                {/* 反応ラベル吹き出し */}
                {reaction.precipitateColor ? (
                  <g transform="translate(5, 205)">
                    <rect x="0" y="0" width="90" height="24" rx="3" fill="#0f172a" opacity="0.85" />
                    <text x="45" y="15" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">
                      沈殿あり
                    </text>
                  </g>
                ) : (
                  <g transform="translate(5, 205)">
                    <rect x="0" y="0" width="90" height="24" rx="3" fill="#475569" opacity="0.85" />
                    <text x="45" y="15" fill="#ffffff" fontSize="9" textAnchor="middle">
                      可溶・澄明
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[10px] text-gray-500">
                イオン：<strong className="text-slate-800">{currentIon.name}</strong> ＋ 試薬：<strong className="text-slate-800">{currentReagent.name}</strong>
              </span>
            </div>

          </div>

        </div>

        {/* 右側：化学反応式と解説まとめ (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 反応式モニター */}
          <div className="retro-box space-y-3.5 border-blue-400">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-blue-800 flex items-center gap-1">
              <span>■</span> 化学反応方程式
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 p-3 font-mono text-blue-900 break-words text-[11px] leading-relaxed">
              {reaction.formula}
            </div>

            <div className="text-[11px] leading-relaxed text-gray-600 space-y-2">
              <span className="font-bold text-slate-800 block">■ 現象解説:</span>
              <p>{reaction.description}</p>
            </div>
          </div>

          {/* 無機色・沈殿の暗記要点 */}
          <div className="retro-box leading-relaxed space-y-3 bg-gray-50">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 入試直結！暗記重要ポイント
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-gray-600">
              <li>
                <strong className="text-slate-800">両性金属 (Al, Zn, Pb, Sn)</strong>:<br />
                少量の強塩基 (NaOH) で水酸化物の沈殿を作るが、<strong className="text-blue-700">過剰の NaOH で錯イオンとなって溶ける</strong>。
              </li>
              <li>
                <strong className="text-slate-800">過剰アンモニア水 (NH₃) で溶けるもの</strong>:<br />
                <strong className="text-blue-700">Ag⁺, Cu²⁺, Zn²⁺</strong>。テトラアンミン等のアンミン錯体を作り、再溶解する（Al³⁺やPb²⁺は溶けないので識別法として超重要）。
              </li>
              <li>
                <strong className="text-slate-800">硫化物の沈殿色</strong>:<br />
                金属硫化物はほとんどが**黒色**だが、<strong className="text-amber-700">ZnS（白色）</strong>、<strong className="text-yellow-600">CdS（黄色）</strong>、<strong className="text-pink-600">MnS（淡桃色/肉色）</strong>は極めて重要。
              </li>
              <li>
                <strong className="text-slate-800">液性による硫化水素沈殿の違い</strong>:<br />
                イオン化傾向が Zn 以上の重金属 (Fe²⁺, Ni²⁺, Mn²⁺ など) は、<strong className="text-rose-700">中性〜塩基性のみ沈殿</strong>し、酸性下では溶ける。Cu²⁺, Pb²⁺, Ag⁺ 等のイオン化傾向が非常に小さい金属は酸性下でも沈殿する。
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
