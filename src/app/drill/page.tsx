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

  {
    slug: 'cross-multiply-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（因数分解）',
    title: 'たすき掛け因数分解ドリル',
    description: '係数が入り組んだ2次式を「たすき掛け」を使ってスピーディに因数分解する反復練習です。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/cross-multiply-drill'
  },
  {
    slug: 'symmetric-polynomial-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（式の値）',
    title: '対称式の値ドリル',
    description: '基本対称式（和と積）を用いて、与えられた対称式の値をスピーディに計算する反復練習です。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/symmetric-polynomial-drill'
  },
  {
    slug: 'double-radical-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（実数）',
    title: '二重根号の外し方ドリル',
    description: 'ルートの中のルート（二重根号）を外す計算を、基本から応用までパターン別に反復練習します。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/double-radical-drill'
  },
  {
    slug: 'absolute-value-eq-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（方程式）',
    title: '絶対値を含む方程式ドリル',
    description: '絶対値記号の意味を方程式とグラフの交点として視覚的に捉え、素早く解を導く反復練習です。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/absolute-value-eq-drill'
  },
  {
    slug: 'rationalization-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '数と式（実数）',
    title: '有理化の計算ドリル',
    description: '分母にルートの足し算・引き算が含まれる分数を、共役な無理数を掛けて有理化する反復練習です。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/rationalization-drill'
  },
  {
    slug: 'calculus-drill',
    subject: 'math',
    subjectJp: '数学II',
    field: '微積分（面積公式）',
    title: '微積分・面積公式（無限計算ドリル）',
    description: '1/6公式、1/12公式など定積分のショートカット面積公式を無限に反復演習できるドリル。自動生成される問題とグラフ・詳細な解説付き。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/calculus-drill'
  },
  {
    slug: 'vector-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: 'ベクトル',
    title: 'ベクトル・交点位置ベクトルドリル',
    description: '内分比から2直線の交点の位置ベクトルをメネラウスの定理等を用いて求める反復ドリル。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/vector-drill'
  },
  {
    slug: 'complex-drill',
    subject: 'math',
    subjectJp: '数学C',
    field: '複素数平面',
    title: '複素数平面・ド・モアブルの定理ドリル',
    description: '極形式とド・モアブルの定理を用いて、複素数の累乗が実数となる最小の自然数を求める演習。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/complex-drill'
  },
  {
    slug: 'sequence-drill',
    subject: 'math',
    subjectJp: '数学B',
    field: '数列',
    title: '数列・隣接2項間の漸化式ドリル',
    description: '特性方程式を用いて一般項を求める反復演習と、コブウェブプロットによる収束・発散の視覚化ツール。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/sequence-drill'
  },
  {
    slug: 'circle-tangent-drill',
    subject: 'math',
    subjectJp: '数学II',
    field: '図形と方程式',
    title: '図形と方程式・円の接線ドリル',
    description: '円の外部の点から引いた2本の接線の方程式を正確に求めるための幾何学＆計算演習。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/circle-tangent-drill'
  },

  {
    slug: 'completing-square-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '平方完成の特訓ドリル',
    description: '2次関数の式を平方完成して、頂点の座標を正確に求める反復練習です。分数や文字係数にも対応。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/completing-square-drill'
  },
  {
    slug: 'quadratic-inequality-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '2次不等式の解ドリル',
    description: '放物線とx軸の位置関係をイメージして、2次不等式を素早く正確に解く反復練習です。D=0の特殊解も網羅。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/quadratic-inequality-drill'
  },
  {
    slug: 'discriminant-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '判別式と共有点の個数ドリル',
    description: '定数kを含む方程式の判別式を利用して、グラフとx軸の位置関係を調べる演習です。スライダーを使った視覚的理解が可能です。',
    difficulty: '応用',
    type: '無限計算ドリル',
    link: '/learn/math/discriminant-drill'
  },
  {
    slug: 'quadratic-max-min-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '2次関数',
    title: '2次関数の最大・最小ドリル',
    description: '定義域と軸の位置関係をグラフから視覚的に判断し、最大値・最小値を求める演習です。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/quadratic-max-min-drill'
  },
  {
    slug: 'trig-identity-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '三角比の相互関係ドリル',
    description: '単位円上の直角三角形をイメージして、三角比の相互関係を瞬時に導く反復練習です。',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/trig-identity-drill'
  },
  {
    slug: 'sine-rule-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '正弦定理と外接円ドリル',
    description: '正弦定理を活用して、三角形の辺・角・外接円の半径を瞬時に求める反復練習です。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/sine-rule-drill'
  },
  {
    slug: 'cosine-rule-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '余弦定理ドリル',
    description: '余弦定理を活用して、三角形の辺や角を瞬時に求める反復練習です。2次方程式を利用する応用パターンも収録。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/cosine-rule-drill'
  },
  {
    slug: 'triangle-area-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '三角形の面積ドリル',
    description: '面積公式やヘロンの公式を利用して、三角形の面積や辺の長さをスピーディに求める反復練習です。',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/triangle-area-drill'
  },
  {
    slug: 'inscribed-circle-drill',
    subject: 'math',
    subjectJp: '数学I',
    field: '図形と計量（三角比）',
    title: '内接円・傍接円の半径ドリル',
    description: '三角形の面積公式などを利用して、内接円・外接円・傍接円の半径を求める総合演習です。',
    difficulty: '応用',
    type: '無限計算ドリル',
    link: '/learn/math/inscribed-circle-drill'
  },
  {
    slug: 'permutation-combination-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '場合の数',
    title: 'P と C の単純計算',
    description: '順列・組合せ・円順列などの値をスピーディに求める演習',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/permutation-combination-drill'
  },
  {
    slug: 'binomial-probability-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '確率',
    title: '反復試行の確率',
    description: '公式や余事象を用いた確率計算の演習',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/binomial-probability-drill'
  },
  {
    slug: 'euclidean-algorithm-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '整数の性質',
    title: 'ユークリッドの互除法',
    description: '割り算の繰り返しで最大公約数を求める演習',
    difficulty: '基礎',
    type: '無限計算ドリル',
    link: '/learn/math/euclidean-algorithm-drill'
  },
  {
    slug: 'linear-diophantine-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '整数の性質',
    title: '1次不定方程式の特殊解',
    description: 'ax+by=c の整数解を一つ見つける演習',
    difficulty: '標準',
    type: '無限計算ドリル',
    link: '/learn/math/linear-diophantine-drill'
  },
  {
    title: 'n進法の変換',
    description: '10進数との相互変換、小数の変換など、位取り記数法の仕組みを理解するドリル。',
    link: '/learn/math/base-n-conversion-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '整数の性質',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'base-n-conversion-drill',
  },
  {
    title: 'メネラウス・チェバの定理',
    description: '三角形と直線の交点による線分比・面積比を求めるドリル。図形ルートのアニメーション付き。',
    link: '/learn/math/menelaus-ceva-drill',
    subject: 'math',
    subjectJp: '数学A',
    field: '図形の性質',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'menelaus-ceva-drill',
  },
  {
    title: '解と係数の関係',
    description: '2次方程式の和と積の対称性を利用して式の値を瞬時に導く演習ドリル。',
    link: '/learn/math/roots-coefficients-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '方程式・式と証明',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'roots-coefficients-drill',
  },
  {
    title: '点と直線の距離',
    description: '公式を用いて点と直線の距離をスピーディに求めるドリル。ピタゴラス数を用いた逆算ロジック。',
    link: '/learn/math/point-line-distance-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '図形と方程式',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'point-line-distance-drill',
  },
  {
    title: '三角関数の合成',
    description: 'a sin θ + b cos θ を座標平面上の点のイメージと結びつけて素早く合成するドリル。',
    link: '/learn/math/trig-synthesis-drill',
    subject: 'math',
    subjectJp: '数学Ⅱ',
    field: '三角関数',
    difficulty: '標準',
    type: '無限計算ドリル',
    slug: 'trig-synthesis-drill',
  }
];

export default function DrillPortalPage() {
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
          無限演習ポータル
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          綺麗な数値になるよう逆算で自動生成された無限計算ドリルで、圧倒的な計算力と解法パターンを身につけます。
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
                  該当するドリルがありません。
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
            該当するドリルがありません。
          </div>
        )}
      </div>

    </div>
  );
}