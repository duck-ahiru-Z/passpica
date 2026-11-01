"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { checkSymmetricPolynomialAnswer, generateSymmetricPolynomialProblem, parseSymmetricPolynomialAnswer, type SymmetricPolynomialMode } from '@/src/lib/symmetricPolynomial';

// --- 数学ユーティリティ ---
function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// --- 問題生成 ---
export default function SymmetricPolynomialDrillPage() {
  const [mode, setMode] = useState<SymmetricPolynomialMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateSymmetricPolynomialProblem('mix'));
  const [ansStr, setAnsStr] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  const handleNext = (nextMode: SymmetricPolynomialMode = mode) => {
    setProblem(generateSymmetricPolynomialProblem(nextMode));
    setAnsStr('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleModeChange = (nextMode: SymmetricPolynomialMode) => {
    setMode(nextMode);
    handleNext(nextMode);
  };

  const handleCheck = () => {
    if (!problem) return;
    const ua = parseSymmetricPolynomialAnswer(ansStr);
    if (ua === null) {
      alert('整数を入力してください。');
      return;
    }
    
    if (checkSymmetricPolynomialAnswer(problem, ua)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  let questionMath = '';
  if (problem.pattern === 'x2+y2') questionMath = 'x^2 + y^2';
  else if (problem.pattern === 'x3+y3') questionMath = 'x^3 + y^3';
  else if (problem.pattern === 'x2y+xy2') questionMath = 'x^2y + xy^2';

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
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">演習モード：</span>
          <select
            aria-label="対称式の演習モード"
            value={mode}
            onChange={e => handleModeChange(e.target.value as SymmetricPolynomialMode)}
            className="border border-slate-300 rounded px-2 py-1 bg-white"
          >
            <option value="mix">実戦練習：対称式 全パターンランダム</option>
            <option value="x2+y2">基礎練習：x²＋y²だけ</option>
            <option value="x3+y3">基礎練習：x³＋y³だけ</option>
            <option value="x2y+xy2">基礎練習：x²y＋xy²だけ</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box">
            <h2 className="text-sm font-bold border-b border-gray-300 pb-1.5 mb-4">
              ■ 問題
            </h2>
            <div className="text-center my-6 text-lg font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={`x + y = ${problem.sum}, \\quad xy = ${problem.product}`} />
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
                  aria-label="対称式の値の答え"
                  className="w-24 border p-2 text-center font-bold" 
                  value={ansStr} 
                  onChange={e => { setAnsStr(e.target.value); setHasChecked(false); setIsCorrect(false); }}
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
                onClick={() => handleNext()}
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
                    {problem.pattern === 'x2+y2' && (
                      <MathEq math={`x^2+y^2 = (x+y)^2 - 2xy = (${problem.sum})^2 - 2(${problem.product}) = ${problem.answer}`} block />
                    )}
                    {problem.pattern === 'x3+y3' && (
                      <MathEq math={`x^3+y^3 = (x+y)^3 - 3xy(x+y) = (${problem.sum})^3 - 3(${problem.product})(${problem.sum}) = ${problem.answer}`} block />
                    )}
                    {problem.pattern === 'x2y+xy2' && (
                      <MathEq math={`x^2y+xy^2 = xy(x+y) = (${problem.product})(${problem.sum}) = ${problem.answer}`} block />
                    )}
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    基本対称式 <MathEq math={`x+y = ${problem.sum}`} /> と <MathEq math={`xy = ${problem.product}`} /> を用いて式を変形します。<br/><br/>
                    {problem.pattern === 'x2+y2' && (
                      <div>
                        <MathEq math={`x^2+y^2`} /> は、<MathEq math={`(x+y)^2`} /> を展開したときに出現します。<br/>
                        <MathEq math={`(x+y)^2 = x^2 + 2xy + y^2`} /> より、余分な <MathEq math={`2xy`} /> を引くことで：<br/>
                        <MathEq math={`x^2+y^2 = (x+y)^2 - 2xy`} /> と変形できます。<br/>
                        数値を代入すると：<br/>
                        <MathEq math={`= (${problem.sum})^2 - 2 \\times (${problem.product})`} /><br/>
                        <MathEq math={`= ${problem.sum * problem.sum} ${problem.product * -2 > 0 ? '+' : ''} ${-2 * problem.product}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}
                    {problem.pattern === 'x3+y3' && (
                      <div>
                        <MathEq math={`x^3+y^3`} /> は、<MathEq math={`(x+y)^3`} /> を展開したときに出現します。<br/>
                        <MathEq math={`(x+y)^3 = x^3 + 3x^2y + 3xy^2 + y^3`} /> より、真ん中の2項を移行してくくります。<br/>
                        <MathEq math={`x^3+y^3 = (x+y)^3 - 3xy(x+y)`} /> と変形できます。<br/>
                        数値を代入すると：<br/>
                        <MathEq math={`= (${problem.sum})^3 - 3 \\times (${problem.product}) \\times (${problem.sum})`} /><br/>
                        <MathEq math={`= ${Math.pow(problem.sum, 3)} ${-3 * problem.product * problem.sum > 0 ? '+' : ''} ${-3 * problem.product * problem.sum}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}
                    {problem.pattern === 'x2y+xy2' && (
                      <div>
                        <MathEq math={`x^2y+xy^2`} /> は、各項に共通因数 <MathEq math={`xy`} /> が含まれています。<br/>
                        共通因数 <MathEq math={`xy`} /> でくくると：<br/>
                        <MathEq math={`x^2y+xy^2 = xy(x+y)`} /> と変形できます。<br/>
                        数値を代入すると：<br/>
                        <MathEq math={`= (${problem.product}) \\times (${problem.sum})`} /><br/>
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

                    {problem.pattern === 'x2+y2' && (
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
                        <MathEq math={`= (${problem.sum})^2 - 2 \\times (${problem.product})`} /><br/>
                        <MathEq math={`= ${problem.sum * problem.sum} ${problem.product * -2 > 0 ? '+' : ''} ${-2 * problem.product}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}

                    {problem.pattern === 'x3+y3' && (
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
                        <MathEq math={`= (${problem.sum})^3 - 3 \\times (${problem.product}) \\times (${problem.sum})`} /><br/>
                        <MathEq math={`= ${Math.pow(problem.sum, 3)} ${-3 * problem.product * problem.sum > 0 ? '+' : ''} ${-3 * problem.product * problem.sum}`} /><br/>
                        <MathEq math={`= ${problem.answer}`} />
                      </div>
                    )}

                    {problem.pattern === 'x2y+xy2' && (
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
                        <MathEq math={`= (${problem.product}) \\times (${problem.sum})`} /><br/>
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
