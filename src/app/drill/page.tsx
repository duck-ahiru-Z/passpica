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

      {/* 教材テーブル */}
      <div className="border border-gray-300 overflow-x-auto">
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

    </div>
  );
}