"use client";

import { useState } from 'react';
import Link from 'next/link';

interface ProcessInfo {
  id: string;
  name: string;
  overallReaction: string;
  catalyst: string;
  rawMaterials: string;
  stages: { name: string; reaction: string }[];
  explain: string;
}

const PROCESSES: Record<string, ProcessInfo> = {
  contact: {
    id: 'contact',
    name: '接触法（硫酸 H2SO4 の製造）',
    overallReaction: '2S + 3O2 + 2H2O ➔ 2H2SO4',
    catalyst: '酸化バナジウム(V) V2O5',
    rawMaterials: '硫黄 S (または黄鉄鉱 FeS2) , 空気 , 水',
    stages: [
      { name: '1. 硫黄の燃焼', reaction: 'S + O2 ➔ SO2' },
      { name: '2. 二酸化硫黄の酸化 (触媒: V2O5)', reaction: '2SO2 + O2 ⇄ 2SO3' },
      { name: '3. 三酸化硫黄を濃硫酸に吸収させ、希硫酸で希釈', reaction: 'SO3 + H2O ➔ H2SO4' }
    ],
    explain: '接触法の最大の鍵は「二酸化硫黄(SO2)の酸化」の可逆反応段階です。ここで触媒として「酸化バナジウム(V) V2O5」を用いて効率よく三酸化硫黄(SO3)を得ます。生成したSO3を直接水に加えると多量の熱が発生して酸霧（細かい霧状）になり吸収しにくいため、一旦「濃硫酸」に吸収させて「発煙硫酸」とし、それを希硫酸で薄めることで安全かつ効率的に高濃度硫酸を製造します。'
  },
  ostwald: {
    id: 'ostwald',
    name: 'オストワルト法（硝酸 HNO3 の製造）',
    overallReaction: 'NH3 + 2O2 ➔ HNO3 + H2O',
    catalyst: '白金 Pt',
    rawMaterials: 'アンモニア NH3 , 空気 , 水',
    stages: [
      { name: '1. アンモニアの酸化 (触媒: Pt, 800℃)', reaction: '4NH3 + 5O2 ➔ 4NO + 6H2O' },
      { name: '2. 一酸化窒素の酸化（常温で速やかに進行）', reaction: '2NO + O2 ➔ 2NO2' },
      { name: '3. 二酸化窒素を温水に吸収させる', reaction: '3NO2 + H2O ➔ 2HNO3 + NO' }
    ],
    explain: 'アンモニア(NH3)を出発原料として硝酸を作ります。第1段階のアンモニア酸化反応では「白金 Pt」触媒が高温(約800℃)で必要になります。第3段階の水への吸収反応で副生する一酸化窒素(NO)は、第2段階に戻して循環利用されるため、効率よく原料を硝酸へと変換できます。'
  },
  solvay: {
    id: 'solvay',
    name: 'アンモニアソーダ法／ソルベー法（炭酸ナトリウム Na2CO3 の製造）',
    overallReaction: '2NaCl + CaCO3 ➔ Na2CO3 + CaCl2',
    catalyst: 'なし（副生成物アンモニア・CO2は100%循環回収）',
    rawMaterials: '塩化ナトリウム NaCl , 石灰石 CaCO3',
    stages: [
      { name: '1. 食塩水にNH3を飽和させ、CO2を通す', reaction: 'NaCl + H2O + NH3 + CO2 ➔ NaHCO3↓ + NH4Cl' },
      { name: '2. 炭酸水素ナトリウムを加熱（熱分解）', reaction: '2NaHCO3 ➔ Na2CO3 + H2O + CO2' },
      { name: '3. 石灰石を加熱（CO2発生）', reaction: 'CaCO3 ➔ CaO + CO2' },
      { name: '4. 生石灰に水を加え消石灰に', reaction: 'CaO + H2O ➔ Ca(OH)2' },
      { name: '5. 塩化アンモニウムと消石灰からNH3を回収', reaction: '2NH4Cl + Ca(OH)2 ➔ CaCl2 + 2H2O + 2NH3' }
    ],
    explain: '安価な食塩(NaCl)と石灰石(CaCO3)から、工業的に重要な炭酸ナトリウム(Na2CO3)を製造します。この製法の特徴は、炭酸水素ナトリウム(NaHCO3)の沈殿を作るために一時的にアンモニア(NH3)を介在させますが、最終段階の水酸化カルシウム(消石灰)との反応により、そのアンモニアを全て排気せずに100%回収して循環再利用する点にあります。全体での実質的な反応は「食塩＋石灰石 ➔ 炭酸ナトリウム＋塩化カルシウム」になります。'
  }
};

export default function IndustrialProcessPage() {
  const [selectedProcess, setSelectedProcess] = useState<string>('contact');
  const proc = PROCESSES[selectedProcess];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・工業的製法
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          無機工業化学の製造プロセス
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          接触法・オストワルト法・アンモニアソーダ法の工業的生産フローチャート。原料から最終化合物に至るパイプラインと反応式を学習します。
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2">
        {Object.values(PROCESSES).map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProcess(p.id)}
            className={`retro-btn-classic font-bold py-1.5 px-4 ${selectedProcess === p.id ? 'bg-[#cbd5e1]' : ''}`}
          >
            {p.name.split('（')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：SVGフローチャート (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[420px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700 text-sm">
            製造ライン流程図：{proc.name}
          </div>

          {/* SVGによるプロセスパイプライン */}
          <div className="flex items-center justify-center flex-grow py-6 w-full">
            <svg width="340" height="200" viewBox="0 0 340 200" className="overflow-visible font-sans">
              
              {/* 接触法・オストワルト法（直列フロー） */}
              {(selectedProcess === 'contact' || selectedProcess === 'ostwald') && (
                <g>
                  {/* 反応段階ボックス 1 */}
                  <rect x="15" y="60" width="80" height="40" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  <text x="55" y="80" fill="#0f172a" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {selectedProcess === 'contact' ? '原料: 硫黄 S' : '原料: アンモニア NH3'}
                  </text>
                  <text x="55" y="93" fill="#64748b" fontSize="7" textAnchor="middle">
                    {selectedProcess === 'contact' ? 'S + O2 ➔ SO2' : '4NH3 + 5O2 ➔ 4NO'}
                  </text>

                  {/* 矢印 1 */}
                  <line x1="95" y1="80" x2="125" y2="80" stroke="#475569" strokeWidth="1.5" />
                  <polygon points="125,80 120,77 120,83" fill="#475569" />
                  <text x="110" y="74" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">
                    {selectedProcess === 'contact' ? '燃焼' : 'Pt触媒/800℃'}
                  </text>

                  {/* 反応段階ボックス 2 */}
                  <rect x="125" y="60" width="80" height="40" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  <text x="165" y="80" fill="#0f172a" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {selectedProcess === 'contact' ? '酸化: SO3 得る' : '酸化: NO2 得る'}
                  </text>
                  <text x="165" y="93" fill="#64748b" fontSize="7" textAnchor="middle">
                    {selectedProcess === 'contact' ? '2SO2 + O2 ⇄ 2SO3' : '2NO + O2 ➔ 2NO2'}
                  </text>
                  {/* 接触法の触媒表示 */}
                  {selectedProcess === 'contact' && (
                    <text x="165" y="52" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="middle">
                      触媒: V2O5
                    </text>
                  )}

                  {/* 矢印 2 */}
                  <line x1="205" y1="80" x2="235" y2="80" stroke="#475569" strokeWidth="1.5" />
                  <polygon points="235,80 230,77 230,83" fill="#475569" />
                  <text x="220" y="74" fill="#475569" fontSize="7" textAnchor="middle">
                    {selectedProcess === 'contact' ? '濃硫酸吸収' : '水に吸収'}
                  </text>

                  {/* 反応段階ボックス 3 */}
                  <rect x="235" y="60" width="85" height="40" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
                  <text x="277.5" y="80" fill="#166534" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {selectedProcess === 'contact' ? '製品: 硫酸 H2SO4' : '製品: 硝酸 HNO3'}
                  </text>
                  <text x="277.5" y="93" fill="#15803d" fontSize="7" textAnchor="middle">
                    {selectedProcess === 'contact' ? 'SO3 + H2O ➔ H2SO4' : '3NO2 + H2O ➔ 2HNO3'}
                  </text>

                  {/* オストワルト法のNOリサイクル矢印 */}
                  {selectedProcess === 'ostwald' && (
                    <path d="M 277.5 100 L 277.5 130 L 165 130 L 165 100" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
                  )}
                  {selectedProcess === 'ostwald' && (
                    <text x="221.25" y="126" fill="#2563eb" fontSize="7" textAnchor="middle">
                      副生 NO を循環回収 ➔ 2段階へ
                    </text>
                  )}
                </g>
              )}

              {/* アンモニアソーダ法（循環式フロー） */}
              {selectedProcess === 'solvay' && (
                <g>
                  {/* 主要反応経路 */}
                  <rect x="15" y="25" width="90" height="35" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  <text x="60" y="42" fill="#0f172a" fontSize="7.5" fontWeight="bold" textAnchor="middle">① NaCl + NH3 + CO2</text>
                  <text x="60" y="52" fill="#64748b" fontSize="6.5" textAnchor="middle">➔ NaHCO3↓ + NH4Cl</text>

                  <line x1="105" y1="42" x2="135" y2="42" stroke="#475569" strokeWidth="1.5" />
                  <polygon points="135,42 130,39 130,45" fill="#475569" />
                  <text x="120" y="36" fill="#475569" fontSize="7" textAnchor="middle">加熱分解</text>

                  <rect x="135" y="25" width="85" height="35" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
                  <text x="177.5" y="42" fill="#166534" fontSize="7.5" fontWeight="bold" textAnchor="middle">② Na2CO3 (炭酸ナトリウム)</text>
                  <text x="177.5" y="52" fill="#15803d" fontSize="6.5" textAnchor="middle">※副生CO2は①へリサイクル</text>

                  {/* 原料発生経路 */}
                  <rect x="15" y="105" width="90" height="35" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  <text x="60" y="122" fill="#0f172a" fontSize="7.5" fontWeight="bold" textAnchor="middle">③ CaCO3 (石灰石) 熱分解</text>
                  <text x="60" y="132" fill="#64748b" fontSize="6.5" textAnchor="middle">➔ CaO + CO2 (①へ供給)</text>

                  <line x1="105" y1="122" x2="135" y2="122" stroke="#475569" strokeWidth="1.5" />
                  <polygon points="135,122 130,119 130,125" fill="#475569" />
                  <text x="120" y="116" fill="#475569" fontSize="7" textAnchor="middle">水と反応</text>

                  <rect x="135" y="105" width="85" height="35" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  <text x="177.5" y="122" fill="#0f172a" fontSize="7.5" fontWeight="bold" textAnchor="middle">④ Ca(OH)2 (消石灰)</text>
                  <text x="177.5" y="132" fill="#64748b" fontSize="6.5" textAnchor="middle">生石灰に加水</text>

                  <line x1="220" y1="122" x2="245" y2="122" stroke="#475569" strokeWidth="1.5" />
                  <line x1="245" y1="122" x2="245" y2="90" stroke="#475569" strokeWidth="1.5" />
                  <polygon points="245,90 242,95 248,95" fill="#475569" />

                  {/* アンモニア回収反応 */}
                  <rect x="200" y="55" width="90" height="35" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
                  <text x="245" y="72" fill="#1e40af" fontSize="7.5" fontWeight="bold" textAnchor="middle">⑤ NH4Cl + Ca(OH)2</text>
                  <text x="245" y="82" fill="#2563eb" fontSize="6.5" textAnchor="middle">➔ NH3回収 ＆ CaCl2放出</text>

                  {/* アンモニア循環リサイクル */}
                  <path d="M 245 55 L 245 10 L 60 10 L 60 25" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="152.5" y="6" fill="#2563eb" fontSize="7" textAnchor="middle">アンモニア NH3 を100%回収・循環利用</text>
                </g>
              )}

            </svg>
          </div>

          <div className="w-full border-t border-gray-200 pt-4 text-center">
            <span className="text-[10px] text-gray-500 font-mono">
              ※工業的製法では、中間体や触媒、副生物の回収プロセス（循環サイクル）がコストカットに直結するため非常によく設計されています。
            </span>
          </div>

        </div>

        {/* 右側：詳細解説と物性データ (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 反応条件カード */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 製造プロセスの要件
            </h3>

            <table className="classic-table text-[10px]">
              <tbody>
                <tr>
                  <td className="bg-gray-50 font-bold w-20">実質反応式</td>
                  <td className="font-bold text-slate-800 font-mono break-all">{proc.overallReaction}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">主な触媒</td>
                  <td className="font-bold text-red-600 font-sans">{proc.catalyst}</td>
                </tr>
                <tr>
                  <td className="bg-gray-50 font-bold">原料</td>
                  <td className="text-slate-700">{proc.rawMaterials}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 各段階の反応式リスト */}
          <div className="retro-box space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 各ステップの化学反応式
            </h3>
            
            <div className="space-y-3 font-mono text-[9px] leading-normal text-slate-700">
              {proc.stages.map((st, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-1.5 last:border-b-0">
                  <div className="font-sans font-bold text-slate-600 mb-0.5">{st.name}</div>
                  <div className="bg-slate-50 p-1 border border-slate-200">{st.reaction}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 解説メモ */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed text-[11px] text-slate-600">
            {proc.explain}
          </div>

        </div>

      </div>

    </div>
  );
}
