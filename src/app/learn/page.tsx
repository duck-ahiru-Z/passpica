"use client";

import { useState } from 'react';
import Link from 'next/link';

interface LearningContent {
  slug: string;
  subject: 'math' | 'chemistry' | 'information' | 'english' | 'physics';
  subjectJp: string;
  field: string;
  title: string;
  description: string;
  difficulty: '基礎' | '標準' | '応用';
  type: 'ビジュアル図解' | '実験シミュレータ' | '製法フロー' | '系統分析' | '無限計算ドリル';
  link: string;
}

const CONTENTS: LearningContent[] = [
  // 数学
  {
    slug: 'trigonometry',
    subject: 'math',
    subjectJp: '数学I・A',
    field: '図形と計量（三角比）',
    title: '三角比（単位円）ビジュアル図解装置',
    description: '角度θの変化に応じて、sin・cos・tan の長さが円の上でリアルタイムに伸び縮みする動的グラフ。',
    difficulty: '基礎',
    type: 'ビジュアル図解',
    link: '/learn/math/trigonometry'
  },
  {
    slug: 'trigonometry-graph',
    subject: 'math',
    subjectJp: '数学II',
    field: '三角関数（グラフの移動）',
    title: '三角関数の平行移動・拡大縮小シミュレーター',
    description: '振幅、周期、平行移動のパラメータを自由に動かし、sin/cos/tanのグラフがどのように変形するかを基本形と重ねて比較学習します。',
    difficulty: '標準',
    type: '実験シミュレータ',
    link: '/learn/math/trigonometry-graph'
  },
  {
    slug: 'unit-circle-complex',
    subject: 'math',
    subjectJp: '数学III',
    field: '複素数平面・極形式',
    title: '単位円と複素数平面の回転・極形式ビジュアル装置',
    description: '単位円上の複素数 z1, z2 を回してその積 z1*z2 をプロットし、複素数の掛け算が「回転と伸縮」を表す幾何学的イメージを定着させます。',
    difficulty: '応用',
    type: 'ビジュアル図解',
    link: '/learn/math/unit-circle-complex'
  },

  // 化学基礎・化学（新設含む）
  {
    slug: 'inorganic-colors',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '無機化学（物質の色）',
    title: '無機物質の色と沈殿・イオン反応シミュレーター',
    description: '金属イオンの水溶液に各種試薬（過剰添加を含む）を加えた際の、沈殿生成や錯イオン形成に伴う試験管内の色変化を再現します。',
    difficulty: '基礎',
    type: '実験シミュレータ',
    link: '/learn/chemistry/inorganic-colors'
  },
  {
    slug: 'reaction-safety',
    subject: 'chemistry',
    subjectJp: '化学基礎・化学',
    field: '化学反応と熱（安全学習）',
    title: '急激な化学反応と安全対策学習まとめ',
    description: 'アルカリ金属の水との反応エネルギー図や、ニトロセルロースの硝酸エステル化度と燃焼速度の違いなど、反応の危険性と取扱安全を体系的に整理。',
    difficulty: '標準',
    type: 'ビジュアル図解',
    link: '/learn/chemistry/reaction-safety'
  },
  {
    slug: 'organic-3d',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '有機化学（立体構造）',
    title: '有機・高分子3D立体モデルビューア（シクロヘキサン立体配座）',
    description: 'メタンなどの基本有機物、シクロヘキサンの「椅子型」「舟型」配座、高分子（天然ゴム）のシス型折れ曲がり構造を3次元で自在に回転・観察できます。',
    difficulty: '標準',
    type: 'ビジュアル図解',
    link: '/learn/chemistry/organic-3d'
  },
  // 化学基礎・化学（新設含む）
  {
    slug: 'flame-reaction',
    subject: 'chemistry',
    subjectJp: '化学基礎',
    field: '無機化学（元素の確認）',
    title: '炎色反応ビジュアルシミュレーター',
    description: '試薬をバーナーへ投入して、炎色の変化を視覚的に観察。有名なゴロ合わせと要点の解説メモ。',
    difficulty: '基礎',
    type: '実験シミュレータ',
    link: '/learn/chemistry/flame-reaction'
  },
  {
    slug: 'gas-collection',
    subject: 'chemistry',
    subjectJp: '化学基礎',
    field: '無機化学（気体の性質）',
    title: '気体の発生装置と捕集法図解',
    description: '水上置換・上方置換・下方置換の集気ビンの向きや発生装置の形を、気体ごとの特性と共に対比学習します。',
    difficulty: '基礎',
    type: 'ビジュアル図解',
    link: '/learn/chemistry/gas-collection'
  },
  {
    slug: 'crystal-lattice',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '物質の構造（結晶）',
    title: '固体の結晶格子モデルと計算法',
    description: '体心立方格子・面心立方格子の原子の配置と、格子定数a・原子半径rの関係式を断面図から視覚的に理解します。',
    difficulty: '基礎',
    type: 'ビジュアル図解',
    link: '/learn/chemistry/crystal-lattice'
  },
  {
    slug: 'acid-base',
    subject: 'chemistry',
    subjectJp: '化学基礎',
    field: '酸と塩基（中和反応）',
    title: '指示薬・pH中和滴定シミュレーター',
    description: 'pHスライダーを動かし、フェノールフタレインなどの指示薬の色の変化と、中和点の特性を理解します。',
    difficulty: '基礎',
    type: '実験シミュレータ',
    link: '/learn/chemistry/acid-base'
  },
  {
    slug: 'metal-ion',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '無機化学（金属イオン）',
    title: '金属イオンの系統分析・沈殿分離フロー',
    description: '金属イオンを含む混合水溶液に各試薬を加えた際の、沈殿物の析出フローと沈殿色をシミュレートします。',
    difficulty: '標準',
    type: '系統分析',
    link: '/learn/chemistry/metal-ion'
  },
  {
    slug: 'organic-separation',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '有機化学（芳香族の分離）',
    title: '有機化合物の系統分離シミュレーター',
    description: 'アニリン・安息香酸・フェノール等の混合物を、分液漏斗での水層・エーテル層への移動変化で視覚化します。',
    difficulty: '標準',
    type: '系統分析',
    link: '/learn/chemistry/organic-separation'
  },
  {
    slug: 'industrial-process',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '無機工業化学（製法）',
    title: '無機工業化学の製造プロセス流程図',
    description: '接触法・オストワルト法・アンモニアソーダ法の製造ラインの流れと、必要な化学反応式・触媒を整理します。',
    difficulty: '標準',
    type: '製法フロー',
    link: '/learn/chemistry/industrial-process'
  },
  {
    slug: 'phase-diagram',
    subject: 'chemistry',
    subjectJp: '化学',
    field: '物質の状態（状態変化）',
    title: '水と二酸化炭素の状態図対比',
    description: '温度・圧力の変化による気体・液体・固体の状態境界グラフ。三重点や超臨界流体などの重要ワード解説。',
    difficulty: '応用',
    type: 'ビジュアル図解',
    link: '/learn/chemistry/phase-diagram'
  },
  // 物理
  {
    slug: 'ac-circuit',
    subject: 'physics',
    subjectJp: '物理',
    field: '電磁気（交流回路）',
    title: '交流回路とインピーダンス位相ずれシミュレーター',
    description: 'RLC直列回路のパラメータを変更し、電圧と電流の位相の「遅れ・進み」を回転ベクトル図（フェーザ）と合成波形グラフで動的に検証します。',
    difficulty: '応用',
    type: '実験シミュレータ',
    link: '/learn/physics/ac-circuit'
  },
  // 情報
  {
    slug: 'pseudo-lang',
    subject: 'information',
    subjectJp: '情報I',
    field: 'プログラミング（擬似言語）',
    title: '共通テスト擬似言語コードエディタ',
    description: '共通テスト「情報I」で採用されている擬似言語（新DNCL）コードをブラウザ上で実行しデバッグできます。',
    difficulty: '応用',
    type: '実験シミュレータ',
    link: '/learn/information/pseudo-lang'
  }
];

export default function LearnPortalPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredContents = CONTENTS.filter(c => {
    const matchSubject = selectedSubject === 'all' || c.subject === selectedSubject;
    const matchDifficulty = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;
    return matchSubject && matchDifficulty;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページタイトル */}
      <div className="border-b border-gray-300 pb-2">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          学習教材の一覧ポータル
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          受験に必要な公式や理科の実験現象を、Webブラウザ上でシミュレーションして学習します。
        </p>
      </div>

      {/* 検索・フィルターエリア */}
      <div className="border border-gray-300 bg-gray-50 p-4 flex flex-col md:flex-row gap-6 text-xs">
        
        {/* 科目フィルター */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 block">■ 科目で絞り込む</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', name: 'すべての科目' },
              { id: 'math', name: '数学' },
              { id: 'chemistry', name: '化学' },
              { id: 'physics', name: '物理' },
              { id: 'information', name: '情報I' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`retro-btn-classic ${selectedSubject === sub.id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        {/* 難易度フィルター */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 block">■ 難易度で絞り込む</span>
          <div className="flex gap-1.5">
            {[
              { id: 'all', name: 'すべて' },
              { id: '基礎', name: '基礎' },
              { id: '標準', name: '標準' },
              { id: '応用', name: '応用' }
            ].map(diff => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`retro-btn-classic ${selectedDifficulty === diff.id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {diff.name}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 教材一覧 (デスクトップ版テーブル) */}
      <div className="hidden md:block border border-gray-300 overflow-x-auto">
        <table className="classic-table text-xs">
          <thead>
            <tr>
              <th className="w-24">科目</th>
              <th className="w-36">分野</th>
              <th className="w-24">タイプ</th>
              <th className="w-16">難易度</th>
              <th>教材タイトル・内容説明</th>
              <th className="w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredContents.map(c => (
              <tr key={c.slug} className="hover:bg-gray-50/50">
                <td className="text-center font-bold text-slate-700">{c.subjectJp}</td>
                <td className="text-slate-600">{c.field}</td>
                <td className="text-center text-gray-500">{c.type}</td>
                <td className="text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.difficulty === '基礎' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : c.difficulty === '標準' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    {c.difficulty}
                  </span>
                </td>
                <td className="text-left space-y-1">
                  <div className="font-bold text-slate-800">{c.title}</div>
                  <div className="text-gray-500 text-[11px] leading-relaxed">{c.description}</div>
                </td>
                <td className="text-center">
                  <Link 
                    href={c.link}
                    className="retro-btn-classic font-bold"
                  >
                    開く ➔
                  </Link>
                </td>
              </tr>
            ))}
            {filteredContents.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 italic">
                  該当する学習教材がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 教材一覧 (スマホ版カード) */}
      <div className="md:hidden space-y-4">
        {filteredContents.map(c => (
          <div key={c.slug} className="retro-box p-4 bg-white space-y-3 relative">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-bold text-slate-700 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-300">
                {c.subjectJp}
              </span>
              <span className="text-xs text-slate-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {c.field}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.difficulty === '基礎' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : c.difficulty === '標準' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                {c.difficulty}
              </span>
              <span className="text-[10px] text-gray-500 font-bold border px-1.5 py-0.5 rounded">
                {c.type}
              </span>
            </div>
            
            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">{c.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{c.description}</div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <Link 
                href={c.link}
                className="retro-btn-classic font-bold text-xs px-4"
              >
                開く ➔
              </Link>
            </div>
          </div>
        ))}
        {filteredContents.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic bg-gray-50 border border-gray-200 rounded">
            該当する学習教材がありません。
          </div>
        )}
      </div>

    </div>
  );
}