"use client";

import { useState } from 'react';
import Link from 'next/link';

interface AlkaliMetalInfo {
  name: string;
  symbol: string;
  atomicNum: number;
  mp: string; // Melting point
  density: string;
  waterReaction: string;
  flameColor: string;
  safetyRule: string;
}

const ATOMIC_MASS = { carbon: 12.011, hydrogen: 1.008, nitrogen: 14.007, oxygen: 15.999 };
function celluloseNitrateNitrogenPercent(degree: 1 | 2 | 3): number {
  const molarMass = 6 * ATOMIC_MASS.carbon + (10 - degree) * ATOMIC_MASS.hydrogen + degree * ATOMIC_MASS.nitrogen + (5 + 2 * degree) * ATOMIC_MASS.oxygen;
  return degree * ATOMIC_MASS.nitrogen / molarMass * 100;
}
function reactionEnergyProfile(activationEnergy: number, heatReleased: number) {
  const reactantY = 180;
  const pixelsPerKilojoule = 0.45;
  return { reactantY, transitionY: reactantY - activationEnergy * pixelsPerKilojoule, productY: reactantY + heatReleased * pixelsPerKilojoule };
}

const ALKALI_METALS: AlkaliMetalInfo[] = [
  {
    name: 'リチウム',
    symbol: 'Li',
    atomicNum: 3,
    mp: '180.5 ℃',
    density: '0.53 g/cm³ (水に浮く最軽金属)',
    waterReaction: '水に浮き、熱を発生しながら比較的穏やかに水素を放出して溶けます（炎は出にくい）。',
    flameColor: '赤色',
    safetyRule: '空気中の窒素とも徐々に反応するため、アルゴン雰囲気またはミネラルオイル（灯油）中に密閉して保管します。'
  },
  {
    name: 'ナトリウム',
    symbol: 'Na',
    atomicNum: 11,
    mp: '97.8 ℃',
    density: '0.97 g/cm³ (水に浮く)',
    waterReaction: '反応熱で融点に達し、球体となって水面を激しく走り回ります。発生した水素が発火することもあります。',
    flameColor: '黄色',
    safetyRule: '皮膚の水分と反応して熱傷を起こすため、絶対に素手で触らずピンセットを使用します。保管は石油（灯油）中。'
  },
  {
    name: 'カリウム',
    symbol: 'K',
    atomicNum: 19,
    mp: '63.5 ℃',
    density: '0.86 g/cm³ (水に浮く)',
    waterReaction: '水と激しく反応し、発生した水素が発火する場合があります。炎色はカリウム由来の赤紫色です。',
    flameColor: '赤紫（紫色）',
    safetyRule: 'ナトリウムよりさらに反応性が高く危険です。保管期間が長いと表面に超酸化物の爆発性皮膜を作るため古すぎるものは注意。'
  }
];

export default function ReactionSafetyPage() {
  // --- 状態管理 ---
  // エネルギー図用
  const [activationEnergy, setActivationEnergy] = useState<number>(120); // 活性化エネルギー Ea
  const [reactionHeat, setReactionHeat] = useState<number>(100);       // 反応熱 ΔH

  // アルカリ金属選択
  const [selectedMetal, setSelectedMetal] = useState<number>(1); // デフォルト Na

  // ニトロセルロースの硝酸エステル化度（エステル化されるOH基の数 1〜3）
  const [nitrationDegree, setNitrationDegree] = useState<number>(2);

  // エネルギー図はEaと放出熱を同一縮尺で示し、全スライダー範囲を図内に収める。
  const rx = 50;
  const { reactantY: ry, transitionY: ty, productY: py } = reactionEnergyProfile(activationEnergy, reactionHeat);
  const tx = 200;
  const px = 350;

  // ベジェ曲線パスの生成
  const energyPath = `M ${rx} ${ry} C 120 ${ry}, 150 ${ty}, ${tx} ${ty} C 250 ${ty}, 280 ${py}, ${px} ${py} L ${px + 50} ${py}`;

  // ニトロセルロースの解説テキスト
  const getNitrationInfo = () => {
    switch (nitrationDegree) {
      case 1:
        return {
          name: 'モノニトロセルロース (低硝化度)',
          nitrogen: `約 ${celluloseNitrateNitrogenPercent(1).toFixed(1)} %`,
          usage: 'セルロイド（プラスチック玩具、ピンポン玉など）の原料。比較的穏やかに燃焼します。',
          speed: '硝化度に応じて性質が変化',
          structure: '[ C₆H₉O₄(ONO₂) ]n'
        };
      case 2:
        return {
          name: 'ジニトロセルロース (中硝化度)',
          nitrogen: `約 ${celluloseNitrateNitrogenPercent(2).toFixed(1)} %`,
          usage: 'コロジオンなどに関連する性質を持ちます。',
          speed: '硝化度に応じて性質が変化',
          structure: '[ C₆H₈O₃(ONO₂)₂ ]n'
        };
      case 3:
      default:
        return {
          name: 'トリ硝酸セルロース（高置換度）',
          nitrogen: `約 ${celluloseNitrateNitrogenPercent(3).toFixed(1)} %`,
          usage: '高エネルギー物質に分類され、厳格な法規制と専門的管理の対象です。',
          speed: '熱分解・燃焼の危険性が高い',
          structure: '[ C₆H₇O₂(ONO₂)₃ ]n'
        };
    }
  };

  const nitroInfo = getNitrationInfo();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 反応の熱力学と安全
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          急激な化学反応と安全対策学習まとめ
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          アルカリ金属や高分子の性質を通じて、反応エネルギーと安全上の注意を学びます。
        </p>
      </div>

      {/* 法的・安全ガイドライン表示 */}
      <div className="border border-amber-300 bg-amber-50/50 p-3 leading-relaxed">
        <span className="font-bold text-amber-800 block mb-0.5">⚠️ 学習上の注意と安全制限</span>
        <p className="text-[10px] text-amber-700">
          当ページは高校化学カリキュラムにおける「無機物質の性質」「有機化学のエステル化」の基礎解説を目的としています。危険物質の製造方法、抽出レシピ、爆薬への精製など、違法および危険を伴う実用的な手順は一切掲載していません。実験は必ず指導教官の指示に従い、適切な保護具を着用して行ってください。
        </p>
      </div>

      {/* メイングリッド：エネルギー図 ＋ アルカリ金属 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 左：反応エネルギー図シミュレーター */}
        <div className="border border-gray-300 bg-white p-5 space-y-4">
          <h2 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800 flex items-center gap-1">
            <span>■</span> 化学反応のエネルギー変化と発熱
          </h2>
          <p className="text-gray-500 text-[10px] leading-relaxed">
            反応が起きるには、分子が一定以上のエネルギー障壁（活性化エネルギー）を乗り越える必要があります。この障壁が低く、反応熱（熱の放出量）が大きいほど、反応は自己加速的に激しく進行します。
          </p>

          {/* SVGプロット */}
          <div className="w-full aspect-[5/3] border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
            <svg role="img" aria-label={`発熱反応の模式図。活性化エネルギー ${activationEnergy} kJ、エンタルピー変化 ΔH −${reactionHeat} kJ`} viewBox="0 0 450 280" className="w-full h-full overflow-visible font-mono">
              {/* x軸・y軸 */}
              <line x1="30" y1="240" x2="420" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="30" y1="20" x2="30" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="400" y="255" fill="#64748b" fontSize="8" fontWeight="bold">反応の進行 ➔</text>
              <text x="35" y="28" fill="#64748b" fontSize="8" fontWeight="bold">エネルギー ➔</text>

              {/* 基準エネルギー線（反応物） */}
              <line x1="30" y1={ry} x2="150" y2={ry} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              {/* 生成物エネルギー線 */}
              <line x1="300" y1={py} x2="420" y2={py} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />

              {/* エネルギー曲線 */}
              <path d={energyPath} fill="none" stroke="#dc2626" strokeWidth="2.5" />

              {/* 活性化エネルギー Ea 矢印 */}
              <g>
                <line x1="120" y1={ry} x2="120" y2={ty} stroke="#2563eb" strokeWidth="1.5" />
                <path d={`M 120 ${ty} L 117 ${ty + 5} L 123 ${ty + 5} Z`} fill="#2563eb" />
                <path d={`M 120 ${ry} L 117 ${ry - 5} L 123 ${ry - 5} Z`} fill="#2563eb" />
                <text x="128" y={(ry + ty) / 2 + 3} fill="#2563eb" fontSize="8" fontWeight="bold">活性化エネルギー Ea</text>
              </g>

              {/* 反応熱 ΔH 矢印 */}
              <g>
                <line x1="390" y1={ry} x2="390" y2={py} stroke="#10b981" strokeWidth="1.5" />
                <path d={`M 390 ${py} L 387 ${py - 5} L 393 ${py - 5} Z`} fill="#10b981" />
                <path d={`M 390 ${ry} L 387 ${ry + 5} L 393 ${ry + 5} Z`} fill="#10b981" />
                <text x="295" y={(ry + py) / 2 + 3} fill="#10b981" fontSize="8" fontWeight="bold">反応熱 ΔH (放出)</text>
              </g>

              {/* ラベル */}
              <text x="52" y={ry - 6} fill="#0f172a" fontSize="8" fontWeight="bold">反応物 (状態A)</text>
              <text x={px + 8} y={py - 6} fill="#0f172a" fontSize="8" fontWeight="bold">生成物 (状態B)</text>
              <text x={tx - 40} y={ty - 8} fill="#d97706" fontSize="8" fontWeight="bold">遷移状態 (活性錯体)</text>

              {/* エネルギー数値メーター */}
              <g transform="translate(260, 20)">
                <rect x="0" y="0" width="160" height="42" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                <text x="10" y="16" fill="#475569" fontSize="8">活性化障壁 Ea : {activationEnergy} kJ</text>
              <text x="10" y="32" fill="#475569" fontSize="8">エンタルピー変化 ΔH : −{reactionHeat} kJ</text>
              </g>
            </svg>
          </div>

          {/* エネルギー調整スライダー */}
          <div className="space-y-3 bg-gray-50 p-3 border border-gray-300">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-700">
                <span>■ 活性化エネルギー Ea（反応の起こりやすさ）：</span>
                <span className="font-mono text-blue-700">{activationEnergy} kJ</span>
              </div>
              <input
                aria-label="活性化エネルギー"
                type="range"
                min="40"
                max="150"
                step="5"
                value={activationEnergy}
                onChange={(e) => setActivationEnergy(parseInt(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
              <span className="text-[9px] text-gray-400 block">※低いほど反応がすぐに始まります（触媒を加えると低下します）。</span>
            </div>

            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-700">
                <span>■ 反応熱 ΔH（熱の放出規模）：</span>
                <span className="font-mono text-emerald-700">ΔH = −{reactionHeat} kJ</span>
              </div>
              <input
                aria-label="放出熱量"
                type="range"
                min="20"
                max="120"
                step="5"
                value={reactionHeat}
                onChange={(e) => setReactionHeat(parseInt(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
              <span className="text-[9px] text-gray-400 block">※大きいほど発熱が激しく、周囲の温度を急上昇させて自己加速を促します。</span>
            </div>
          </div>

        </div>

        {/* 右：アルカリ金属の性質と水との反応対比 */}
        <div className="border border-gray-300 bg-white p-5 space-y-4">
          <h2 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800 flex items-center gap-1">
            <span>■</span> アルカリ金属の反応性と安全
          </h2>
          <p className="text-gray-500 text-[10px] leading-relaxed">
            1族元素（Li, Na, K）は価電子を1個しか持たず、電子を放出して1価の陽イオンになりやすいため、非常に強い還元性と反応性を持ちます。原子番号が大きくなる（族を下る）ほど外殻電子が離れやすくなり、反応性が高まります。
          </p>

          {/* タブ選択 */}
          <div className="grid grid-cols-3 gap-1">
            {ALKALI_METALS.map((m, idx) => (
              <button
                key={m.symbol}
                type="button"
                aria-pressed={selectedMetal === idx}
                onClick={() => setSelectedMetal(idx)}
                className={`retro-btn-classic font-bold text-center ${selectedMetal === idx ? 'bg-[#cbd5e1]' : ''}`}
              >
                {m.name} ({m.symbol})
              </button>
            ))}
          </div>

          {/* 選択した金属の詳細スペック */}
          <div className="border border-gray-200 bg-gray-50 p-3 space-y-2.5">
            <div className="flex justify-between items-center border-b border-gray-300 pb-1 text-[11px]">
              <span className="font-bold text-slate-800">{ALKALI_METALS[selectedMetal].name} Specs</span>
              <span className="font-mono text-gray-500">原子番号: {ALKALI_METALS[selectedMetal].atomicNum}</span>
            </div>
            
            <table className="w-full text-[10px] leading-relaxed border-collapse">
              <tbody>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1 font-bold text-slate-700 w-16">融点 (mp)</td>
                  <td className="py-1 text-gray-600 font-mono">{ALKALI_METALS[selectedMetal].mp}</td>
                </tr>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1 font-bold text-slate-700">密度</td>
                  <td className="py-1 text-gray-600">{ALKALI_METALS[selectedMetal].density}</td>
                </tr>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1 font-bold text-slate-700">水との反応</td>
                  <td className="py-1 text-red-700 font-semibold">{ALKALI_METALS[selectedMetal].waterReaction}</td>
                </tr>
                <tr className="border-b border-dashed border-gray-200">
                  <td className="py-1 font-bold text-slate-700">炎色反応</td>
                  <td className="py-1 text-gray-600 font-bold">{ALKALI_METALS[selectedMetal].flameColor}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-slate-700">実験安全規則</td>
                  <td className="py-1 text-amber-700 italic">{ALKALI_METALS[selectedMetal].safetyRule}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 反応方程式解説 */}
          <div className="bg-slate-100 p-2.5 border border-slate-300 font-mono text-[10px] space-y-1">
            <span className="font-bold text-slate-800 block text-[9px] font-sans">【水との化学反応方程式】</span>
            <div className="text-blue-800 font-bold">
              2{ALKALI_METALS[selectedMetal].symbol} + 2H₂O → 2{ALKALI_METALS[selectedMetal].symbol}OH + H₂↑ (＋ 多大な熱量)
            </div>
            <p className="text-gray-500 text-[9px] font-sans leading-normal pt-1">
              反応熱によって金属自体が球状に溶けて水面に浮かび、発生した水素ガスが空気中の酸素と混ざり火花や炎を上げて激しく反応します。カリウムは融点が低いため一瞬で発火します。
            </p>
          </div>

        </div>

      </div>

      {/* 下：ニトロセルロースのエステル化度と燃焼速度 */}
      <div className="border border-gray-300 bg-white p-5 space-y-4">
        <h2 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800 flex items-center gap-1">
          <span>■</span> 有機化学の視覚化：セルロースの硝酸エステル化度（ニトロセルロース）
        </h2>
        <p className="text-gray-500 text-[10px] leading-relaxed">
          天然高分子であるセルロースのグルコース単位には、3個のヒドロキシ基（-OH 基）があります。硝酸エステル化では、ヒドロキシ基の水素が硝酸エステル基（-O-NO₂）に置き換わります。置換数によって組成や性質が変化し、高置換度のものは熱分解・燃焼の危険性が高まります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 左：エステル化度調整スライダー */}
          <div className="col-span-1 space-y-3 bg-gray-50 p-4 border border-gray-300 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-700 block">硝酸エステル化度 (置換数)</span>
              <div className="flex justify-between items-center font-mono font-bold text-blue-700 bg-white border border-gray-300 px-3 py-1">
                <span>OH基の置換数：</span>
                <span className="text-base">{nitrationDegree} / 3 個</span>
              </div>
              <input
                aria-label="セルロースの硝酸エステル化度"
                type="range"
                min="1"
                max="3"
                step="1"
                value={nitrationDegree}
                onChange={(e) => setNitrationDegree(parseInt(e.target.value))}
                className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
              />
            </div>

            <div className="text-[10px] text-gray-500 leading-normal border-t border-gray-200 pt-2.5">
              分子内のヒドロキシ基が硝酸エステル基に置換されると、燃焼時に外部の空気から酸素を供給されなくても、分子内の窒素・酸素を利用して自己燃焼（無煙燃焼）できるようになります。
            </div>
          </div>

          {/* 中央：構造モデルと解説 */}
          <div className="col-span-1 border border-gray-200 p-4 space-y-3 bg-white">
            <span className="font-bold text-slate-800 block text-[11px] border-b border-gray-200 pb-1">
              {nitroInfo.name}
            </span>
            <table className="w-full text-[10px] leading-relaxed">
              <tbody>
                <tr className="border-b border-dashed border-gray-100">
                  <td className="py-1 font-bold text-slate-600">示性式（単位ユニット）</td>
                  <td className="py-1 font-mono text-blue-800">{nitroInfo.structure}</td>
                </tr>
                <tr className="border-b border-dashed border-gray-100">
                  <td className="py-1 font-bold text-slate-600">窒素含有率 %</td>
                  <td className="py-1 font-mono">{nitroInfo.nitrogen}</td>
                </tr>
                <tr className="border-b border-dashed border-gray-100">
                  <td className="py-1 font-bold text-slate-600">主な用途</td>
                  <td className="py-1 text-gray-600">{nitroInfo.usage}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-slate-600">自己燃焼速度</td>
                  <td className="py-1 text-red-600 font-bold">{nitroInfo.speed}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 右：燃焼の化学原理の模式図（自己供給メカニズム） */}
          <div className="col-span-1 border border-gray-200 p-4 bg-gray-50 space-y-3 leading-relaxed">
            <span className="font-bold text-slate-800 block text-[10px] border-b border-gray-300 pb-1">
              ■ なぜ硝化度が上がると激しく燃えるのか？
            </span>
            <div className="text-[10px] text-gray-600 space-y-2">
              <p>
                一般の有機物（セルロースなど）は、燃えるときに空気中の酸素（O₂）が表面に拡散してくるのを待つ必要があります（拡散燃焼）。そのため、燃焼速度は緩やかです。
              </p>
              <p>
                硝酸セルロースの分子には <strong className="text-red-700">硝酸エステル基（-O-NO₂）</strong>が含まれます。加熱による分解や燃焼は急速に進む危険があり、デフラグレーション（爆燃）は音速未満で伝わる燃焼です。衝撃波を伴い音速を超える爆轟とは異なる現象です。
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
