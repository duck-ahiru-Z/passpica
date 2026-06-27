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

// --- 問題生成 ---
interface ProblemData {
  S: number; // x + y
  P: number; // xy
  type: 'x2+y2' | 'x3+y3' | 'x2y+xy2';
  answer: number;
}

function generateProblem(): ProblemData {
  let S = 1, P = 1;
  while (true) {
    S = Math.floor(Math.random() * 11) - 5; // -5 to 5
    P = Math.floor(Math.random() * 11) - 5; // -5 to 5
    if (S === 0 || P === 0) continue;
    // 実数解を持つように S^2 - 4P >= 0 を満たす（高校数学Iの標準的な設定に寄せるため）
    if (S * S - 4 * P < 0) continue;
    break;
  }
  
  const types: Array<'x2+y2' | 'x3+y3' | 'x2y+xy2'> = ['x2+y2', 'x3+y3', 'x2y+xy2'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let answer = 0;
  if (type === 'x2+y2') {
    answer = S * S - 2 * P;
  } else if (type === 'x3+y3') {
    answer = S * S * S - 3 * S * P;
  } else if (type === 'x2y+xy2') {
    answer = S * P;
  }
  
  return { S, P, type, answer };
}

export default function SymmetricPolynomialDrillPage() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [ansStr, setAnsStr] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  useEffect(() => {
    handleNext();
  }, []);

  const handleNext = () => {
    setProblem(generateProblem());
    setAnsStr('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    const ua = parseInt(ansStr);
    if (isNaN(ua)) {
      alert('整数を入力してください。');
      return;
    }
    
    if (ua === problem.answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return null;

  let questionMath = '';
  if (problem.type === 'x2+y2') questionMath = 'x^2 + y^2';
  else if (problem.type === 'x3+y3') questionMath = 'x^3 + y^3';
  else if (problem.type === 'x2y+xy2') questionMath = 'x^2y + xy^2';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      {/* ページタイトルとナビゲーション */}
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          対称式の値ドリル
        </h1>
        <p className="text-gray-500">
          基本対称式（和と積）を用いて、与えられた対称式の値をスピーディに計算する反復練習です。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box">
            <h2 className="text-sm font-bold border-b border-gray-300 pb-1.5 mb-4">
              ■ 問題
            </h2>
            <div className="text-center my-6 text-lg font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={`x + y = ${problem.S}, \\quad xy = ${problem.P}`} />
              <div className="mt-2 text-sm font-normal">のとき、次の式の値を求めよ。</div>
              <div className="mt-4 text-2xl">
                <MathEq math={questionMath} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 text-lg">
                <MathEq math="=" />
                <input 
                  type="number" 
                  className="w-24 border p-2 text-center font-bold" 
                  value={ansStr} 
                  onChange={e => setAnsStr(e.target.value)} 
                  placeholder="答え" 
                />
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
                ■ 解説・対称式の変形
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
                <div className="bg-white p-3 border text-center font-bold text-xl mb-4 text-emerald-700 shadow-sm">
                  <MathEq math={`${questionMath} = ${problem.answer}`} />
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    {problem.type === 'x2+y2' && (
                      <MathEq math={`x^2+y^2 = (x+y)^2 - 2xy = (${problem.S})^2 - 2(${problem.P}) = ${problem.answer}`} block />
                    )}
                    {problem.type === 'x3+y3' && (
                      <MathEq math={`x^3+y^3 = (x+y)^3 - 3xy(x+y) = (${problem.S})^3 - 3(${problem.P})(${problem.S}) = ${problem.answer}`} block />
                    )}
                    {problem.type === 'x2y+xy2' && (
                      <MathEq math={`x^2y+xy^2 = xy(x+y) = (${problem.P})(${problem.S}) = ${problem.answer}`} block />
                    )}
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    基本対称式 <MathEq math={`x+y = ${problem.S}`} /> と <MathEq math={`xy = ${problem.P}`} /> を用いて式を変形します。<br/><br/>
                    {problem.type === 'x2+y2' && (
                      <div>
                        <MathEq math={`x^2+y^2`} /> は、<MathEq math={`(x+y)^2`} /> を展開したときに出現します。<br/>
                        <MathEq math={`(x+y)^2 = x^2 + 2xy + y^2`} /> より、余分な <MathEq math={`2xy`} /> を引くことで：<br/>
                        <MathEq math={`x^2+y^2 = (x+y)^2 - 2xy`} /> と変形できます。<br/>
                        数値を代入すると：<br/>
                        <MathEq math={`= (${problem.S})^2 - 2 \\times (${problem.P})`} /><br/>
                        <MathEq math={`= ${problem.S * problem.S} ${problem.P * -2 > 0 ? '+' : ''} ${-2 * problem.P}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}
                    {problem.type === 'x3+y3' && (
                      <div>
                        <MathEq math={`x^3+y^3`} /> は、<MathEq math={`(x+y)^3`} /> を展開したときに出現します。<br/>
                        <MathEq math={`(x+y)^3 = x^3 + 3x^2y + 3xy^2 + y^3`} /> より、真ん中の2項を移行してくくります。<br/>
                        <MathEq math={`x^3+y^3 = (x+y)^3 - 3xy(x+y)`} /> と変形できます。<br/>
                        数値を代入すると：<br/>
                        <MathEq math={`= (${problem.S})^3 - 3 \\times (${problem.P}) \\times (${problem.S})`} /><br/>
                        <MathEq math={`= ${Math.pow(problem.S, 3)} ${-3 * problem.P * problem.S > 0 ? '+' : ''} ${-3 * problem.P * problem.S}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}
                    {problem.type === 'x2y+xy2' && (
                      <div>
                        <MathEq math={`x^2y+xy^2`} /> は、各項に共通因数 <MathEq math={`xy`} /> が含まれています。<br/>
                        共通因数 <MathEq math={`xy`} /> でくくると：<br/>
                        <MathEq math={`x^2y+xy^2 = xy(x+y)`} /> と変形できます。<br/>
                        数値を代入すると：<br/>
                        <MathEq math={`= (${problem.P}) \\times (${problem.S})`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}
                  </div>
                )}

                {detailLevel === 'detailed' && (
                  <div className="space-y-4">
                    <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded">
                      ■ どんな対称式も「和と積」で表せる！
                    </p>
                    <p>
                      <MathEq math={`x`} /> と <MathEq math={`y`} /> を入れ替えても元の式と同じになる式を「対称式」と呼びます。<br/>
                      すべての対称式は、基本対称式 <MathEq math={`x+y`} /> (和) と <MathEq math={`xy`} /> (積) だけで表すことができます！
                    </p>

                    {problem.type === 'x2+y2' && (
                      <div>
                        <p className="font-bold border-b border-gray-300 pb-1 mb-2">1. 図で理解する <MathEq math={`x^2+y^2`} /></p>
                        <p className="mb-2">
                          1辺が <MathEq math={`x+y`} /> の大きな正方形の面積 <MathEq math={`(x+y)^2`} /> を考えます。<br/>
                          この中には、面積 <MathEq math={`x^2`} /> の正方形、面積 <MathEq math={`y^2`} /> の正方形、そして面積 <MathEq math={`xy`} /> の長方形が2つ入っています。
                        </p>
                        <div className="flex justify-center my-4">
                          <div className="relative w-32 h-32 border-2 border-slate-800 flex flex-col">
                            <div className="flex flex-1">
                              <div className="flex-1 bg-red-100 border-r-2 border-b-2 border-slate-800 flex items-center justify-center font-bold text-red-600"><MathEq math={`x^2`} /></div>
                              <div className="w-10 bg-blue-100 border-b-2 border-slate-800 flex items-center justify-center text-[10px] text-blue-600"><MathEq math={`xy`} /></div>
                            </div>
                            <div className="flex h-10">
                              <div className="flex-1 bg-blue-100 border-r-2 border-slate-800 flex items-center justify-center text-[10px] text-blue-600"><MathEq math={`xy`} /></div>
                              <div className="w-10 bg-green-100 flex items-center justify-center font-bold text-green-600"><MathEq math={`y^2`} /></div>
                            </div>
                          </div>
                        </div>
                        <p>
                          図から明らかなように、<MathEq math={`x^2+y^2`} /> を求めるには、全体の <MathEq math={`(x+y)^2`} /> から、青い長方形 <MathEq math={`xy`} /> を2つ引けばよいですね！<br/>
                          <MathEq math={`x^2+y^2 = (x+y)^2 - 2xy`} />
                        </p>
                        <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">2. 計算する</p>
                        <MathEq math={`= (${problem.S})^2 - 2 \\times (${problem.P})`} /><br/>
                        <MathEq math={`= ${problem.S * problem.S} ${problem.P * -2 > 0 ? '+' : ''} ${-2 * problem.P}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}

                    {problem.type === 'x3+y3' && (
                      <div>
                        <p className="font-bold border-b border-gray-300 pb-1 mb-2">1. 公式を作る</p>
                        <p>
                          <MathEq math={`(x+y)^3 = x^3 + 3x^2y + 3xy^2 + y^3`} /> の展開公式を思い出しましょう。<br/>
                          欲しいのは <MathEq math={`x^3+y^3`} /> なので、それ以外を左辺に移動（移項）させます。
                        </p>
                        <div className="bg-gray-50 p-2 border my-2">
                          <MathEq math={`x^3+y^3 = (x+y)^3 - 3x^2y - 3xy^2`} />
                        </div>
                        <p>
                          引く部分の <MathEq math={`-3x^2y - 3xy^2`} /> は、どちらも <MathEq math={`-3xy`} /> を共通因数として持っているので、くくり出します。<br/>
                          <MathEq math={`-3xy(x+y)`} />
                        </p>
                        <div className="bg-emerald-50 p-2 border border-emerald-300 my-2 font-bold text-emerald-800 text-center">
                          <MathEq math={`x^3+y^3 = (x+y)^3 - 3xy(x+y)`} />
                        </div>
                        <p className="text-gray-500">※ この公式は丸暗記するよりも、上記のように展開式からサッと作れるようにしておくと忘れません。</p>

                        <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">2. 計算する</p>
                        <MathEq math={`= (${problem.S})^3 - 3 \\times (${problem.P}) \\times (${problem.S})`} /><br/>
                        <MathEq math={`= ${Math.pow(problem.S, 3)} ${-3 * problem.P * problem.S > 0 ? '+' : ''} ${-3 * problem.P * problem.S}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}

                    {problem.type === 'x2y+xy2' && (
                      <div>
                        <p className="font-bold border-b border-gray-300 pb-1 mb-2">1. 共通因数でくくる</p>
                        <p>
                          式をよく見ると、どちらの項にも <MathEq math={`x`} /> と <MathEq math={`y`} /> が掛けられています。<br/>
                          共通因数である <MathEq math={`xy`} /> で全体をくくってあげましょう。
                        </p>
                        <div className="bg-emerald-50 p-2 border border-emerald-300 my-2 font-bold text-emerald-800 text-center">
                          <MathEq math={`x^2y+xy^2 = xy(x+y)`} />
                        </div>

                        <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">2. 計算する</p>
                        <p>すでに「和 <MathEq math={`x+y`} />」と「積 <MathEq math={`xy`} />」の形になったので、数値を代入するだけです。</p>
                        <MathEq math={`= (${problem.P}) \\times (${problem.S})`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
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
