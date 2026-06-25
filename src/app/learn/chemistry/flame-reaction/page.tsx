"use client";

import { useState } from 'react';
import Link from 'next/link';

interface MetalSalt {
  formula: string;
  name: string;
  jpName: string;
  colorName: string;
  colorHex: string;
  mnemonic: string;
  explain: string;
}

const METALS: MetalSalt[] = [
  { formula: 'LiCl', name: 'Lithium', jpName: 'リチウム', colorName: '赤色', colorHex: '#ef4444', mnemonic: 'リアカー（Li:赤）', explain: '炎色反応は赤色。スマートフォンやPC等のリチウムイオン二次電池として多用されます。' },
  { formula: 'NaCl', name: 'Sodium', jpName: 'ナトリウム', colorName: '黄色', colorHex: '#eab308', mnemonic: '無き（Na:黄）', explain: '炎色反応は黄色。食塩（塩化ナトリウム）や、かつてトンネル照明に使用されたナトリウムランプでおなじみです。' },
  { formula: 'KCl', name: 'Potassium', jpName: 'カリウム', colorName: '赤紫色', colorHex: '#c084fc', mnemonic: 'Kの村（K:紫）', explain: '炎色反応は赤紫色。植物の生長を支える「肥料の三要素」の主成分であり、細胞液の浸透圧調節に重要です。' },
  { formula: 'CuCl2', name: 'Copper', jpName: '銅', colorName: '青緑色', colorHex: '#0d9488', mnemonic: '動力（Cu:緑）', explain: '炎色反応は青緑色。花火の着色剤として配合されます。電気の良導体であり、電線や配線に大量に使用されます。' },
  { formula: 'CaCl2', name: 'Calcium', jpName: 'カルシウム', colorName: '橙赤色', colorHex: '#f97316', mnemonic: '借りるとう（Ca:橙）', explain: '炎色反応は橙赤色。融雪剤（塩化カルシウム）として道路に散布されるほか、骨や歯を構成する必須元素です。' },
  { formula: 'BaCl2', name: 'Barium', jpName: 'バリウム', colorName: '黄緑色', colorHex: '#84cc16', mnemonic: '馬力（Ba:緑）', explain: '炎色反応は黄緑色。消化管（胃）のレントゲン検査で用いられる造影剤（硫酸バリウム）として有名です。' }
];

export default function FlameReactionPage() {
  const [selectedMetal, setSelectedMetal] = useState<MetalSalt | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 化学・炎色反応
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          炎色反応ビジュアルシミュレーター
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          金属溶液をバーナーの炎に近づけたときの発色反応を確認できます。共通テスト頻出の暗記項目です。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左側：SVGガスバーナー (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[400px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700">
            実験装置：ガスバーナー燃焼試験
          </div>

          {/* フラットな線画SVGガスバーナーと炎 */}
          <div className="flex items-center justify-center flex-grow py-6">
            <svg width="180" height="240" viewBox="0 0 120 160" className="overflow-visible">
              {/* 炎（選択されたイオンの発色） */}
              <path 
                d="M 60 20 C 35 55 45 100 60 100 C 75 100 85 55 60 20 Z" 
                fill={selectedMetal ? selectedMetal.colorHex : '#2563eb'}
                stroke="#0f172a"
                strokeWidth="1.5"
                opacity={selectedMetal ? 0.9 : 0.4}
                className="transition-colors duration-300"
              />
              
              {/* バーナー筒 */}
              <rect x="54" y="96" width="12" height="44" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
              
              {/* バーナー台座 */}
              <polygon points="35,148 85,148 75,140 45,140" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
              <rect x="50" y="140" width="20" height="8" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
            </svg>
          </div>

          {/* 操作バー */}
          <div className="w-full border-t border-gray-200 pt-4 text-center">
            <span className="text-xs font-bold block mb-2 text-slate-700">
              {selectedMetal ? `現在、${selectedMetal.jpName} (${selectedMetal.formula}) の炎色反応を観察中` : '下の試薬瓶をクリックすると炎に投入されます。'}
            </span>
            {selectedMetal && (
              <button 
                onClick={() => setSelectedMetal(null)} 
                className="retro-btn-classic font-bold"
              >
                消火してバーナーを元に戻す
              </button>
            )}
          </div>

        </div>

        {/* 右側：試薬瓶と語呂合わせ (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 試薬棚 */}
          <div className="retro-box space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800">
              ■ 試薬棚（金属塩類溶液）
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {METALS.map((m) => (
                <button
                  key={m.formula}
                  onClick={() => setSelectedMetal(m)}
                  className={`border border-gray-400 p-2 text-center text-xs font-bold transition-all bg-slate-50 hover:bg-slate-100 ${selectedMetal?.formula === m.formula ? 'bg-amber-100 border-amber-600' : ''}`}
                >
                  <div className="text-[10px] text-slate-500 font-mono">{m.formula}</div>
                  <div className="text-xs text-slate-800 mt-0.5">{m.jpName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 語呂合わせ暗記板 */}
          <div className="border border-gray-300 bg-gray-50 p-4 leading-relaxed space-y-4">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 炎色反応の覚え方（語呂合わせ）
            </h3>
            
            {selectedMetal ? (
              <div className="space-y-2.5">
                <div className="border border-gray-300 bg-white p-2 text-center">
                  <span className="text-[10px] text-gray-400 block font-mono">対象語呂部分</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedMetal.mnemonic}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">【元素解説】</span>
                  <p className="text-gray-600 text-[11px] leading-relaxed mt-0.5">{selectedMetal.explain}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-[11px] leading-relaxed">
                試薬を選択すると、その金属塩に対応した炎色反応の語呂合わせフレーズと、基本情報がここに表示されます。
              </p>
            )}

            <div className="border-t border-gray-200 pt-2 text-[10px] text-gray-400 leading-normal">
              <strong>全体の語呂合わせ：</strong><br/>
              リアカー無き（Li:赤 / Na:黄）Kの村（K:紫）動力（Cu:緑）借りるとう（Ca:橙）馬力（Ba:緑）
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
