"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- 数学ユーティリティ ---
function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function getSquareFactors(n: number): number[] {
  let factors = [];
  for (let k = 2; k * k <= n; k++) {
    if (n % (k * k) === 0) factors.push(k);
  }
  return factors;
}

interface ProblemData {
  a: number;
  b: number;
  C: number;
  k: number;
  sign: '+' | '-';
  ansSign: '+' | '-';
}

function generateProblem(): ProblemData {
  while (true) {
    let a = Math.floor(Math.random() * 15) + 2; // 2 to 16
    let b = Math.floor(Math.random() * 15) + 1; // 1 to 15
    if (a <= b) continue;
    
    // a, b がこれ以上簡単にならないようにする
    if (getSquareFactors(a).length > 0 || getSquareFactors(b).length > 0) continue;
    
    let diff = a - b;
    let k = Math.floor(Math.random() * 3) + 1; // 1 to 3
    let C = k * diff;
    
    let sign: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
    let ansSign: '+' | '-' = sign === '+' ? '-' : '+';
    
    return { a, b, C, k, sign, ansSign };
  }
}

export default function RationalizationDrillPage() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // ユーザー入力
  const [ansA, setAnsA] = useState<string>('');
  const [ans_a, setAns_a] = useState<string>('');
  const [ansB, setAnsB] = useState<string>('');
  const [ans_b, setAns_b] = useState<string>('');
  
  // 判定状態
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // 解説レベル
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  useEffect(() => {
    handleNext();
  }, []);

  const handleNext = () => {
    setProblem(generateProblem());
    setAnsA('');
    setAns_a('');
    setAnsB('');
    setAns_b('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const uA = parseInt(ansA);
    const u_a = parseInt(ans_a);
    const uB = parseInt(ansB);
    const u_b = parseInt(ans_b);
    
    if (isNaN(uA) || isNaN(u_a) || isNaN(uB) || isNaN(u_b)) {
      alert('すべての枠に整数を入力してください。');
      return;
    }
    
    // 正解は k\sqrt{a} \pm k\sqrt{b}
    if (uA === problem.k && u_a === problem.a && uB === problem.k && u_b === problem.b) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    
    setHasChecked(true);
  };

  if (!problem) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      {/* ページタイトルとナビゲーション */}
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          有理化の計算ドリル
        </h1>
        <p className="text-gray-500">
          分母にルートの足し算・引き算が含まれる分数を、共役な無理数を掛けて有理化する反復練習です。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box">
            <h2 className="text-sm font-bold border-b border-gray-300 pb-1.5 mb-4">
              ■ 問題
            </h2>
            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={`\\frac{${problem.C}}{\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}}`} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">
                分母を有理化しなさい。
              </div>
              <div className="flex items-center justify-center gap-2 text-xl">
                <MathEq math="=" />
                <input type="number" className="w-10 border p-1 text-center font-bold" value={ansA} onChange={e => setAnsA(e.target.value)} placeholder="A" />
                <MathEq math="\sqrt{" />
                <input type="number" className="w-10 border p-1 text-center font-bold" value={ans_a} onChange={e => setAns_a(e.target.value)} placeholder="a" />
                <MathEq math={`} ${problem.ansSign}`} />
                <input type="number" className="w-10 border p-1 text-center font-bold" value={ansB} onChange={e => setAnsB(e.target.value)} placeholder="B" />
                <MathEq math="\sqrt{" />
                <input type="number" className="w-10 border p-1 text-center font-bold" value={ans_b} onChange={e => setAns_b(e.target.value)} placeholder="b" />
                <MathEq math="}" />
              </div>
              <div className="text-[10px] text-gray-500 text-center">
                ※ 係数(A, B)が1の場合も省略せずに「1」と入力してください。<br/>
                ※ ルートの中身が1になる場合も「\(\sqrt{1}\)」として入力してください。
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <button 
                onClick={handleCheck}
                className="retro-btn-classic bg-blue-100 border-blue-400 text-blue-800 font-bold px-6"
              >
                解答する
              </button>
              <button 
                onClick={handleNext}
                className="retro-btn-classic"
              >
                次の問題へ ➔
              </button>
            </div>

            {hasChecked && (
              <div className={`mt-4 p-3 border font-bold text-center ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
                {isCorrect ? '正解！素晴らしい！' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説 */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・有理化プロセス
              </h2>
              {hasChecked && (
                <div className="flex gap-1 text-[10px]">
                  <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                  <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                  <button type="button" onClick={() => setDetailLevel('detailed')} className={`px-2 py-1 border ${detailLevel === 'detailed' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>丁寧</button>
                </div>
              )}
            </div>

            {!hasChecked ? (
              <div className="flex h-full items-center justify-center text-gray-400 italic mt-20">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm">
                  <MathEq math={`= ${problem.k === 1 ? '' : problem.k}\\sqrt{${problem.a}} ${problem.ansSign} ${problem.k === 1 ? '' : problem.k}\\sqrt{${problem.b}}`} />
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    分母と分子に共役な数 <MathEq math={`\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}}`} /> を掛けます。<br/>
                    分母は <MathEq math={`(${problem.a}) - (${problem.b}) = ${problem.a - problem.b}`} /> となります。<br/>
                    よって、<br/>
                    <MathEq math={`\\frac{${problem.C}(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}{${problem.a - problem.b}}`} block />
                    <MathEq math={`= ${problem.k === 1 ? '' : problem.k}(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})`} block />
                    となります。
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    分母のルートを消すために、<MathEq math={`(x+y)(x-y) = x^2-y^2`} /> の公式を利用します。<br/>
                    分母が <MathEq math={`\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} /> なので、符号を逆にした <MathEq math={`\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}}`} /> を分母と分子の両方に掛けます。<br/>
                    <br/>
                    <div className="overflow-x-auto pb-2">
                      <MathEq math={`= \\frac{${problem.C} \\times (\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}{(\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}})(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}`} block />
                    </div>
                    分母を展開すると、ルートが外れて整数の引き算になります。<br/>
                    <MathEq math={`= \\frac{${problem.C}(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}{${problem.a} - ${problem.b}}`} block />
                    <MathEq math={`= \\frac{${problem.C}(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}{${problem.a - problem.b}}`} block />
                    {problem.k !== 1 && (
                      <div className="mt-2">
                        分子の <MathEq math={`${problem.C}`} /> と分母の <MathEq math={`${problem.a - problem.b}`} /> を約分して、<MathEq math={`${problem.k}`} /> が残ります。<br/>
                      </div>
                    )}
                    <MathEq math={`= ${problem.k === 1 ? '' : problem.k}(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})`} block />
                    展開して、答えは上のようになります。
                  </div>
                )}

                {detailLevel === 'detailed' && (
                  <div className="space-y-4">
                    <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded">
                      ■ 有理化（ルート消し）の極意
                    </p>
                    <p>
                      分母にルートがある状態は、数学では「美しくない」とされ、ルートを消す操作（有理化）を行います。<br/>
                      足し算・引き算が含まれるルートを消すには、魔法の公式 <MathEq math={`(x+y)(x-y) = x^2-y^2`} /> を使います！<br/>
                      2乗されることでルートが必ず外れるからです。
                    </p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">1. 逆符号のペアを掛ける</p>
                    <p>
                      今回の分母は <MathEq math={`\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} /> です。<br/>
                      これの真ん中の符号を逆にした <strong><span className="text-red-600"><MathEq math={`\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}}`} /></span></strong> を分母と分子の両方に掛けます。（※両方に同じものを掛ければ分数の大きさは変わりません）
                    </p>

                    <div className="bg-gray-50 p-3 border overflow-x-auto text-center">
                      <MathEq math={`= \\frac{${problem.C} \\times \\textcolor{red}{(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}}{(\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}) \\times \\textcolor{red}{(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}}`} />
                    </div>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">2. 分母を計算する</p>
                    <p>
                      分母は <MathEq math={`(x+y)(x-y)`} /> の形になったので、それぞれを2乗して引きます。
                    </p>
                    <div className="flex justify-center mb-2">
                      <div className="border border-blue-300 bg-blue-50 px-4 py-2 inline-block">
                        <MathEq math={`(\\sqrt{${problem.a}})^2 - (\\sqrt{${problem.b}})^2 = ${problem.a} - ${problem.b} = ${problem.a - problem.b}`} />
                      </div>
                    </div>
                    <p>見事にルートが消滅し、ただの整数 <MathEq math={`${problem.a - problem.b}`} /> になりました！</p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">3. 全体を整理する</p>
                    <div className="bg-gray-50 p-3 border overflow-x-auto text-center">
                      <MathEq math={`= \\frac{${problem.C}(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})}{${problem.a - problem.b}}`} />
                    </div>
                    <p>
                      {problem.C === problem.a - problem.b ? (
                        <span>分母と分子の <MathEq math={`${problem.C}`} /> が綺麗に約分されて消えます。</span>
                      ) : (
                        <span>分子の <MathEq math={`${problem.C}`} /> と分母の <MathEq math={`${problem.a - problem.b}`} /> を約分すると <MathEq math={`${problem.k}`} /> になります。</span>
                      )}
                    </p>
                    <div className="flex justify-center mt-2">
                      <MathEq math={`= ${problem.k === 1 ? '' : problem.k}(\\sqrt{${problem.a}} ${problem.ansSign} \\sqrt{${problem.b}})`} />
                    </div>
                    <p>これを展開したものが最終的な答えです。</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
