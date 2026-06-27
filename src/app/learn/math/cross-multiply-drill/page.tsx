"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- 数学ユーティリティ ---
function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function gcd3(x: number, y: number, z: number): number {
  return gcd(gcd(x, y), z);
}

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// --- 問題生成 ---
interface ProblemData {
  a: number;
  b: number;
  c: number;
  d: number;
  A: number;
  B: number;
  C: number;
}

function generateProblem(): ProblemData {
  let a = 1, b = 1, c = 1, d = 1;
  let A = 1, B = 1, C = 1;
  
  while (true) {
    a = Math.floor(Math.random() * 5) + 1; // 1 to 5
    c = Math.floor(Math.random() * 5) + 1; // 1 to 5
    b = Math.floor(Math.random() * 11) - 5; // -5 to 5
    d = Math.floor(Math.random() * 11) - 5; // -5 to 5
    
    if (b === 0 || d === 0) continue;
    
    // (ax+b)と(cx+d)の内部で共通因数を持たないようにする
    if (gcd(a, b) !== 1) continue;
    if (gcd(c, d) !== 1) continue;
    
    A = a * c;
    B = a * d + b * c;
    C = b * d;
    
    // 全体の共通因数がないかチェック
    if (gcd3(A, B, C) !== 1) continue;
    
    // a=1, c=1 (つまりx^2の係数が1) になるのはたすき掛けとしては簡単すぎるので、
    // 少し確率を下げる（A=1の場合は50%で再抽選）
    if (A === 1 && Math.random() < 0.5) continue;
    
    break;
  }
  
  return { a, b, c, d, A, B, C };
}

export default function CrossMultiplyDrillPage() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // ユーザー入力
  const [ansA, setAnsA] = useState<string>('');
  const [ansB, setAnsB] = useState<string>('');
  const [ansC, setAnsC] = useState<string>('');
  const [ansD, setAnsD] = useState<string>('');
  
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
    setAnsB('');
    setAnsC('');
    setAnsD('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const ua = parseInt(ansA);
    const ub = parseInt(ansB);
    const uc = parseInt(ansC);
    const ud = parseInt(ansD);
    
    if (isNaN(ua) || isNaN(ub) || isNaN(uc) || isNaN(ud)) {
      alert('すべての枠に整数を入力してください。');
      return;
    }
    
    // (ax+b)(cx+d) と (cx+d)(ax+b) はどちらも正解とする
    const correct1 = (ua === problem.a && ub === problem.b && uc === problem.c && ud === problem.d);
    const correct2 = (ua === problem.c && ub === problem.d && uc === problem.a && ud === problem.b);
    // 符号をすべて反転 (-ax-b)(-cx-d) も数学的には正しいが、通常はxの係数を正にするため今回は弾くか許容するか
    const correct3 = (ua === -problem.a && ub === -problem.b && uc === -problem.c && ud === -problem.d);
    const correct4 = (ua === -problem.c && ub === -problem.d && uc === -problem.a && ud === -problem.b);
    
    if (correct1 || correct2 || correct3 || correct4) {
      setIsCorrect(true);
    } else {
      // 展開して一致するかチェック
      if (ua * uc === problem.A && (ua * ud + ub * uc) === problem.B && ub * ud === problem.C) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
    }
    
    setHasChecked(true);
  };

  if (!problem) return null;

  // 問題式の組み立て
  let problemEq = '';
  if (problem.A === 1) problemEq += 'x^2';
  else if (problem.A === -1) problemEq += '-x^2';
  else problemEq += `${problem.A}x^2`;
  
  if (problem.B > 0) problemEq += ` + ${problem.B === 1 ? 'x' : problem.B + 'x'}`;
  else if (problem.B < 0) problemEq += ` - ${Math.abs(problem.B) === 1 ? 'x' : Math.abs(problem.B) + 'x'}`;
  
  if (problem.C > 0) problemEq += ` + ${problem.C}`;
  else if (problem.C < 0) problemEq += ` - ${Math.abs(problem.C)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      {/* ページタイトルとナビゲーション */}
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          たすき掛け因数分解ドリル
        </h1>
        <p className="text-gray-500">
          係数が入り組んだ2次式を「たすき掛け」を使ってスピーディに因数分解する反復練習です。
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
              <MathEq math={problemEq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">
                以下の形に因数分解しなさい。
              </div>
              <div className="flex items-center justify-center gap-2 text-lg">
                (
                <input type="number" className="w-12 border p-1 text-center font-bold" value={ansA} onChange={e => setAnsA(e.target.value)} placeholder="a" />
                <MathEq math="x +" />
                <input type="number" className="w-16 border p-1 text-center font-bold" value={ansB} onChange={e => setAnsB(e.target.value)} placeholder="b" />
                ) (
                <input type="number" className="w-12 border p-1 text-center font-bold" value={ansC} onChange={e => setAnsC(e.target.value)} placeholder="c" />
                <MathEq math="x +" />
                <input type="number" className="w-16 border p-1 text-center font-bold" value={ansD} onChange={e => setAnsD(e.target.value)} placeholder="d" />
                )
              </div>
              <div className="text-[10px] text-gray-500 text-center">
                ※ 引き算の場合は負の数を入力してください（例: -3）。<br/>
                ※ xの係数(a,c)が1の場合も、省略せずに「1」と入力してください。
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
                ■ 解説・たすき掛け図解
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
                  <MathEq math={`${problemEq} = (${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b})(${problem.c === 1 ? '' : problem.c}x ${problem.d > 0 ? '+' : ''} ${problem.d})`} />
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    <MathEq math={`A=${problem.A}, B=${problem.B}, C=${problem.C}`} />。<br/>
                    たすき掛けにより、<br/>
                    <div className="flex justify-center my-2 font-mono text-sm">
                      <div className="grid grid-cols-4 gap-2 text-center items-center">
                        <div>{problem.a}</div><div className="text-gray-400">×</div><div>{problem.b}</div><div>→ {problem.a * problem.d}</div>
                        <div>{problem.c}</div><div className="text-gray-400">×</div><div>{problem.d}</div><div>→ {problem.b * problem.c}</div>
                      </div>
                    </div>
                    和が <MathEq math={`${problem.B}`} /> となるため成立。
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    <MathEq math={`A=${problem.A}, B=${problem.B}, C=${problem.C}`} /> に着目します。<br/>
                    かけて <MathEq math={`${problem.A}`} /> になる2数と、かけて <MathEq math={`${problem.C}`} /> になる2数を探し、斜めにかけて足した和が <MathEq math={`${problem.B}`} /> になるペアを見つけます。<br/>
                    <br/>
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-50 border p-4 inline-block">
                        <table className="w-32 text-center text-lg font-bold">
                          <tbody>
                            <tr>
                              <td className="w-10 border-b pb-2">{problem.a}</td>
                              <td className="w-6 border-b pb-2 text-gray-400 font-normal">\</td>
                              <td className="w-10 border-b pb-2">{problem.b}</td>
                              <td className="w-16 border-b pb-2 text-sm">→ {problem.a * problem.d}</td>
                            </tr>
                            <tr>
                              <td className="w-10 pt-2">{problem.c}</td>
                              <td className="w-6 pt-2 text-gray-400 font-normal">/</td>
                              <td className="w-10 pt-2">{problem.d}</td>
                              <td className="w-16 pt-2 text-sm">→ {problem.b * problem.c}</td>
                            </tr>
                            <tr>
                              <td className="pt-2 border-t mt-2" colSpan={3}>和</td>
                              <td className="pt-2 border-t mt-2 text-red-600 font-black">{problem.B}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    よって、<MathEq math={`(${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b})(${problem.c === 1 ? '' : problem.c}x ${problem.d > 0 ? '+' : ''} ${problem.d})`} /> となります。
                  </div>
                )}

                {detailLevel === 'detailed' && (
                  <div className="space-y-3">
                    <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded">
                      ■ たすき掛けの思考プロセス
                    </p>
                    <p>
                      <MathEq math={`${problem.A}x^2 ${problem.B > 0 ? '+' : ''} ${problem.B}x ${problem.C > 0 ? '+' : ''} ${problem.C}`} /> を因数分解します。<br/>
                      <MathEq math={`(ax+b)(cx+d) = acx^2 + (ad+bc)x + bd`} /> の形を目指します。
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        <strong><MathEq math={`x^2`} /> の係数に着目</strong><br/>
                        かけて <MathEq math={`${problem.A}`} /> になる正の数のペア（<MathEq math="a" /> と <MathEq math="c" />）を考えます。<br/>
                        今回は <MathEq math={`${problem.A} = ${problem.a} \\times ${problem.c}`} /> を試します。
                      </li>
                      <li>
                        <strong>定数項に着目</strong><br/>
                        かけて <MathEq math={`${problem.C}`} /> になるペア（<MathEq math="b" /> と <MathEq math="d" />）を考えます。符号も考慮します。
                      </li>
                      <li>
                        <strong>クロスして足す（たすき掛け）</strong><br/>
                        斜めに掛け算（<MathEq math="a \\times d" /> と <MathEq math="b \\times c" />）をして、その和が <MathEq math="x" /> の係数 <MathEq math={`${problem.B}`} /> になるか確認します。<br/>
                        <div className="flex justify-center my-4">
                          <div className="bg-white border p-4 shadow-sm inline-block">
                            <table className="text-center text-lg font-bold">
                              <tbody>
                                <tr>
                                  <td className="w-12 border-b pb-2 text-blue-600">{problem.a}</td>
                                  <td className="w-8 border-b pb-2 text-gray-400 font-normal">↘</td>
                                  <td className="w-12 border-b pb-2 text-green-600">{problem.b}</td>
                                  <td className="w-24 border-b pb-2 text-sm text-gray-600">
                                    <MathEq math={`${problem.a} \\times ${problem.d} = ${problem.a * problem.d}`} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="w-12 pt-2 text-blue-600">{problem.c}</td>
                                  <td className="w-8 pt-2 text-gray-400 font-normal">↗</td>
                                  <td className="w-12 pt-2 text-green-600">{problem.d}</td>
                                  <td className="w-24 pt-2 text-sm text-gray-600">
                                    <MathEq math={`${problem.b} \\times ${problem.c} = ${problem.b * problem.c}`} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="pt-2 border-t mt-2" colSpan={3}>和</td>
                                  <td className="pt-2 border-t mt-2 text-red-600 font-black">
                                    {problem.B}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <MathEq math={`${problem.a * problem.d} + (${problem.b * problem.c}) = ${problem.B}`} /> となり、見事に真ん中の係数と一致しました！
                      </li>
                      <li>
                        <strong>横に読んで完成</strong><br/>
                        上の段を読んで <MathEq math={`(${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b})`} />、<br/>
                        下の段を読んで <MathEq math={`(${problem.c === 1 ? '' : problem.c}x ${problem.d > 0 ? '+' : ''} ${problem.d})`} />。<br/>
                        これらを掛け合わせたものが答えです。
                      </li>
                    </ol>
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
