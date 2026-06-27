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

type Pattern = 'basic_plus' | 'basic_minus' | 'bring_in' | 'multiply_two';

interface ProblemData {
  pattern: Pattern;
  a: number;
  b: number;
  eq: string;
  sign: '+' | '-';
  sum: number;
  prod: number;
  k?: number; // for bring_in
  inner?: number; // for bring_in
  X?: number; // for multiply_two
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['basic_plus', 'basic_minus', 'bring_in', 'multiply_two'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let a = Math.floor(Math.random() * 15) + 2;
    let b = Math.floor(Math.random() * 15) + 1;
    if (a <= b) continue;
    
    // 平方因数を持たない（ルートがこれ以上簡単にならない）ようにする
    if (getSquareFactors(a).length > 0 || getSquareFactors(b).length > 0) continue;
    
    let sum = a + b;
    let prod = a * b;
    
    if (p === 'basic_plus' || p === 'basic_minus') {
      let sign: '+' | '-' = p === 'basic_plus' ? '+' : '-';
      let eq = `\\sqrt{${sum} ${sign} 2\\sqrt{${prod}}}`;
      return { pattern: p, a, b, eq, sign, sum, prod };
    }
    
    if (p === 'bring_in') {
      let kFactors = getSquareFactors(prod);
      if (kFactors.length === 0) continue;
      let k = kFactors[kFactors.length - 1]; // 最大の平方因数のルート
      let inner = prod / (k * k);
      let sign: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
      let coef = 2 * k;
      let eq = `\\sqrt{${sum} ${sign} ${coef}\\sqrt{${inner}}}`;
      return { pattern: p, a, b, eq, sign, sum, prod, k, inner };
    }
    
    if (p === 'multiply_two') {
      if (sum % 2 !== 0) continue; // a+b は偶数である必要がある
      let X = sum / 2;
      // prodが4で割り切れると 2\sqrt{Y} の形になりbasicと被るため除外
      if (prod % 4 === 0) continue;
      let sign: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
      let eq = `\\sqrt{${X} ${sign} \\sqrt{${prod}}}`;
      return { pattern: p, a, b, eq, sign, sum, prod, X };
    }
  }
}

export default function DoubleRadicalDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // ユーザー入力
  const [ansA, setAnsA] = useState<string>('');
  const [ansB, setAnsB] = useState<string>('');
  
  // 判定状態
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // 解説レベル
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsA('');
    setAnsB('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const ua = parseInt(ansA);
    const ub = parseInt(ansB);
    
    if (isNaN(ua) || isNaN(ub)) {
      alert('枠に整数を入力してください。');
      return;
    }
    
    // a > b であるため、そのまま一致するかチェック
    if (ua === problem.a && ub === problem.b) {
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
          二重根号の外し方ドリル
        </h1>
        <p className="text-gray-500">
          ルートの中のルート（二重根号）を外す計算を、基本から応用までパターン別に反復練習します。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 問題
              </h2>
              <select 
                value={selectedPattern}
                onChange={e => setSelectedPattern(e.target.value as Pattern | 'mix')}
                className="border p-1 text-xs"
              >
                <option value="mix">MIX (全パターンランダム)</option>
                <option value="basic_plus">基本1 (足し算)</option>
                <option value="basic_minus">基本2 (引き算)</option>
                <option value="bring_in">応用1 (係数をルートの中へ)</option>
                <option value="multiply_two">応用2 (2をかけて割る)</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">
                二重根号を外しなさい。
              </div>
              <div className="flex items-center justify-center gap-2 text-xl">
                <MathEq math="=" />
                {problem.pattern === 'multiply_two' ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-1 px-2">
                      <MathEq math="\sqrt{" />
                      <input type="number" className="w-12 border p-1 text-center font-bold" value={ansA} onChange={e => setAnsA(e.target.value)} placeholder="大" />
                      <MathEq math={`} ${problem.sign} \\sqrt{`} />
                      <input type="number" className="w-12 border p-1 text-center font-bold" value={ansB} onChange={e => setAnsB(e.target.value)} placeholder="小" />
                      <MathEq math="}" />
                    </div>
                    <div className="pt-1">
                      <MathEq math="\sqrt{2}" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MathEq math="\sqrt{" />
                    <input type="number" className="w-12 border p-1 text-center font-bold" value={ansA} onChange={e => setAnsA(e.target.value)} placeholder="大" />
                    <MathEq math={`} ${problem.sign} \\sqrt{`} />
                    <input type="number" className="w-12 border p-1 text-center font-bold" value={ansB} onChange={e => setAnsB(e.target.value)} placeholder="小" />
                    <MathEq math="}" />
                  </div>
                )}
              </div>
              <div className="text-[10px] text-gray-500 text-center">
                ※ 引き算の場合、必ず大きい数字を左側（大）に入力してください。<br/>
                ※ 答えが整数になる場合（例：3）も、ルートのまま（例：\(\sqrt{9}\)）入力してください。<br/>
                ※ このドリルでは、外側のルートの中が最も簡単になる（素因数分解できない）数値を生成しています。
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
                ■ 解説・解法プロセス
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
                  {problem.pattern === 'multiply_two' ? (
                    <MathEq math={`${problem.eq} = \\frac{\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}}{\\sqrt{2}}`} />
                  ) : (
                    <MathEq math={`${problem.eq} = \\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} />
                  )}
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    {problem.pattern === 'bring_in' && (
                      <div className="mb-2">
                        <MathEq math={`${problem.eq} = \\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.k} \\times ${problem.k} \\times ${problem.inner}}}`} block />
                        <MathEq math={`= \\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}`} block />
                      </div>
                    )}
                    {problem.pattern === 'multiply_two' && (
                      <div className="mb-2">
                        <MathEq math={`${problem.eq} = \\sqrt{\\frac{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}{2}}`} block />
                      </div>
                    )}
                    足して <MathEq math={`${problem.sum}`} />、かけて <MathEq math={`${problem.prod}`} /> になる2数は <MathEq math={`${problem.a}`} /> と <MathEq math={`${problem.b}`} />。<br/>
                    よって、解答の通りになります。
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    {problem.pattern === 'bring_in' && (
                      <div className="mb-4">
                        二重根号を外すには、内側のルートの前の係数を「<MathEq math="2" />」にする必要があります。<br/>
                        今回は係数が <MathEq math={`${2 * problem.k!}`} /> なので、<MathEq math={`${problem.k!}`} /> をルートの中に戻します。<br/>
                        <MathEq math={`${2 * problem.k!}\\sqrt{${problem.inner}} = 2 \\times \\sqrt{${problem.k!}^2 \\times ${problem.inner}} = 2\\sqrt{${problem.prod}}`} /><br/>
                        これにより、式は <MathEq math={`\\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}`} /> となります。
                      </div>
                    )}
                    {problem.pattern === 'multiply_two' && (
                      <div className="mb-4">
                        二重根号を外すには、内側のルートの前の係数を「<MathEq math="2" />」にする必要があります。<br/>
                        しかし今回は係数がありません。そこで、無理やりルートの中身の分母・分子に2を掛けます。<br/>
                        <MathEq math={`${problem.eq} = \\sqrt{\\frac{2(${problem.X} ${problem.sign} \\sqrt{${problem.prod}})}{2}} = \\sqrt{\\frac{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}{2}}`} />
                      </div>
                    )}
                    
                    基本形 <MathEq math={`\\sqrt{A \\pm 2\\sqrt{B}}`} /> になったら、「足して<MathEq math="A" />」「かけて<MathEq math="B" />」になる2数を見つけます。<br/>
                    今回は、<br/>
                    ・足して <MathEq math={`${problem.sum}`} /><br/>
                    ・かけて <MathEq math={`${problem.prod}`} /><br/>
                    になる2数を探すと、<MathEq math={`${problem.a}`} /> と <MathEq math={`${problem.b}`} /> が見つかります。<br/>
                    <br/>
                    {problem.sign === '-' && (
                      <div className="text-red-600 font-bold mb-2">
                        ※引き算の場合は、必ず大きい数を先に書くルールを忘れないようにしましょう。
                      </div>
                    )}
                    したがって、答えは上の通りに外れます。
                  </div>
                )}

                {detailLevel === 'detailed' && (
                  <div className="space-y-4">
                    <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded">
                      ■ 二重根号を外すための基本原理
                    </p>
                    <p>
                      <MathEq math={`(\\sqrt{x} \\pm \\sqrt{y})^2 = (x+y) \\pm 2\\sqrt{xy}`} /> という展開公式を使います。<br/>
                      この両辺にルートを被せると、<br/>
                      <MathEq math={`\\sqrt{(x+y) \\pm 2\\sqrt{xy}} = \\sqrt{x} \\pm \\sqrt{y}`} /> （※ただし <MathEq math={`x > y`} />）<br/>
                      となります。これが二重根号を外す公式です。
                    </p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">1. 式の形を整える</p>
                    {problem.pattern === 'basic_plus' || problem.pattern === 'basic_minus' ? (
                      <p>今回はすでに <MathEq math={`\\sqrt{A \\pm 2\\sqrt{B}}`} /> の形（内側のルートの前に2がある）になっているので、そのまま次へ進めます。</p>
                    ) : problem.pattern === 'bring_in' ? (
                      <div className="bg-gray-50 p-2 border">
                        公式を使うためには、内側のルートの前を必ず「<MathEq math="2" />」にする必要があります。<br/>
                        式は <MathEq math={`${problem.eq}`} /> です。<br/>
                        <MathEq math={`${2 * problem.k!}`} /> のうち、<MathEq math={`${problem.k!}`} /> をルートの中に入れます（2乗して入れます）。<br/>
                        <MathEq math={`${problem.k!}\\sqrt{${problem.inner}} = \\sqrt{${problem.k!}^2 \\times ${problem.inner}} = \\sqrt{${problem.prod}}`} /><br/>
                        これで、式は <MathEq math={`\\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}`} /> という基本形に変形できました。
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-2 border">
                        公式を使うためには、内側のルートの前を必ず「<MathEq math="2" />」にする必要があります。<br/>
                        しかし <MathEq math={`${problem.eq}`} /> には2がありませんし、ルートの中から無理やり2を出す（4で割る）こともできません。<br/>
                        そこで、分数にして分母と分子に2を掛けます。<br/>
                        <MathEq math={`\\sqrt{\\frac{${problem.X} ${problem.sign} \\sqrt{${problem.prod}}}{1}} = \\sqrt{\\frac{2 \\times (${problem.X} ${problem.sign} \\sqrt{${problem.prod}})}{2 \\times 1}} = \\sqrt{\\frac{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}{2}}`} /><br/>
                        これで、分子が基本形になりました！
                      </div>
                    )}

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">2. 和と積から2数を見つける</p>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-white border p-3 text-center">
                        <div className="text-gray-500 mb-1">和 (x+y)</div>
                        <div className="font-bold text-xl text-blue-600">{problem.sum}</div>
                      </div>
                      <div className="flex-1 bg-white border p-3 text-center">
                        <div className="text-gray-500 mb-1">積 (xy)</div>
                        <div className="font-bold text-xl text-green-600">{problem.prod}</div>
                      </div>
                    </div>
                    <p>
                      掛けて <MathEq math={`${problem.prod}`} /> になるペアを考え、その中で足して <MathEq math={`${problem.sum}`} /> になるものを探します。<br/>
                      見つかる2数は <MathEq math={`${problem.a}`} /> と <MathEq math={`${problem.b}`} /> です。
                    </p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">3. 答えの形にする</p>
                    {problem.pattern === 'multiply_two' ? (
                      <p>
                        分子の二重根号が外れて <MathEq math={`\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} /> となります。<br/>
                        分母には <MathEq math={`\\sqrt{2}`} /> が残っているので、最終的な答えは <MathEq math={`\\frac{\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}}{\\sqrt{2}}`} /> です。
                      </p>
                    ) : (
                      <p>
                        そのままルートを被せて <MathEq math={`\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} /> が答えです。<br/>
                        {problem.sign === '-' && "※引き算の場合、ルートの中がマイナスにならないよう、必ず大きい数を左側に置きます。"}
                      </p>
                    )}
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
