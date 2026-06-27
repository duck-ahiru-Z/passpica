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

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  p: number;
  q: number;
  r: number;
  s: number;
  k: number;
  A: number;
  B: number;
  C: number;
  eq: string;
  hasY: boolean;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let p = Math.floor(Math.random() * 5) + 1; // 1 to 5
    let r = Math.floor(Math.random() * 5) + 1;
    let q = 1, s = 1, k = 1;
    
    if (p_type === 'pattern1') {
      q = Math.floor(Math.random() * 5) + 1;
      s = Math.floor(Math.random() * 5) + 1;
    } else if (p_type === 'pattern2' || p_type === 'pattern4') {
      q = Math.floor(Math.random() * 11) - 5; // -5 to 5
      s = Math.floor(Math.random() * 11) - 5;
      if (q === 0 || s === 0) continue;
      if (q > 0 && s > 0) continue; // 少なくとも1つはマイナス
    } else if (p_type === 'pattern3') {
      q = Math.floor(Math.random() * 11) - 5;
      s = Math.floor(Math.random() * 11) - 5;
      if (q === 0 || s === 0) continue;
    }
    
    // (px+q)と(rx+s)の内部で共通因数を持たないようにする
    if (gcd(p, q) !== 1) continue;
    if (gcd(r, s) !== 1) continue;
    
    let A = p * r;
    let B = p * s + q * r;
    let C = q * s;
    
    // 展開後の式に共通因数がないかチェック
    if (gcd3(Math.abs(A), Math.abs(B), Math.abs(C)) !== 1) continue;
    
    if (p_type === 'pattern4') {
      k = Math.floor(Math.random() * 2) + 2; // 2 or 3
      A *= k;
      B *= k;
      C *= k;
    }
    
    let hasY = p_type === 'pattern3';
    let eq = '';
    
    if (A === 1) eq += 'x^2';
    else if (A === -1) eq += '-x^2';
    else eq += `${A}x^2`;
    
    if (B !== 0) {
      let B_abs = Math.abs(B);
      let sign = B > 0 ? ' + ' : ' - ';
      let term = B_abs === 1 ? (hasY ? 'xy' : 'x') : `${B_abs}${hasY ? 'xy' : 'x'}`;
      eq += sign + term;
    }
    
    if (C !== 0) {
      let C_abs = Math.abs(C);
      let sign = C > 0 ? ' + ' : ' - ';
      let term = C_abs === 1 && hasY ? 'y^2' : `${C_abs}${hasY ? 'y^2' : ''}`;
      eq += sign + term;
    }
    
    return { pattern: p_type, p, q, r, s, k, A, B, C, eq, hasY };
  }
}

export default function CrossMultiplyDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // ユーザー入力
  const [ansK, setAnsK] = useState<string>('');
  const [ansP, setAnsP] = useState<string>('');
  const [ansQ, setAnsQ] = useState<string>('');
  const [ansR, setAnsR] = useState<string>('');
  const [ansS, setAnsS] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsK(''); setAnsP(''); setAnsQ(''); setAnsR(''); setAnsS('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let uk = ansK.trim() === '' ? 1 : parseInt(ansK);
    let up = parseInt(ansP);
    let uq = parseInt(ansQ);
    let ur = parseInt(ansR);
    let us = parseInt(ansS);
    
    if (isNaN(uk) || isNaN(up) || isNaN(uq) || isNaN(ur) || isNaN(us)) {
      alert('枠に整数を入力してください。（先頭の括り出しがない場合は空欄または1）');
      return;
    }
    
    // 代数的に一致するか確認
    let matchA = uk * up * ur === problem.A;
    let matchB = uk * (up * us + uq * ur) === problem.B;
    let matchC = uk * uq * us === problem.C;
    
    // 完全に括り出されているか（カッコ内に共通因数がないか）確認
    let fullyFactored = gcd(up, uq) === 1 && gcd(ur, us) === 1;
    
    if (matchA && matchB && matchC && fullyFactored) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    
    setHasChecked(true);
  };

  if (!problem) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
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
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 問題
              </h2>
              <select 
                value={selectedPattern}
                onChange={e => setSelectedPattern(e.target.value as Pattern | 'mix')}
                className="border p-1 text-xs"
              >
                <option value="mix">ミックスモード (ランダム)</option>
                <option value="pattern1">パターン1 (全てプラス)</option>
                <option value="pattern2">パターン2 (マイナス混入)</option>
                <option value="pattern3">パターン3 (2変数 yあり)</option>
                <option value="pattern4">パターン4 (共通因数でくくる罠)</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">
                以下の形に因数分解しなさい。
              </div>
              <div className="flex items-center justify-center gap-1 text-lg">
                <input type="number" className="w-10 border p-1 text-center font-bold bg-yellow-50" value={ansK} onChange={e => setAnsK(e.target.value)} placeholder="k" />
                (
                <input type="number" className="w-10 border p-1 text-center font-bold" value={ansP} onChange={e => setAnsP(e.target.value)} placeholder="p" />
                <MathEq math="x +" />
                <input type="number" className="w-12 border p-1 text-center font-bold" value={ansQ} onChange={e => setAnsQ(e.target.value)} placeholder="q" />
                {problem.hasY && <MathEq math="y" />}
                ) (
                <input type="number" className="w-10 border p-1 text-center font-bold" value={ansR} onChange={e => setAnsR(e.target.value)} placeholder="r" />
                <MathEq math="x +" />
                <input type="number" className="w-12 border p-1 text-center font-bold" value={ansS} onChange={e => setAnsS(e.target.value)} placeholder="s" />
                {problem.hasY && <MathEq math="y" />}
                )
              </div>
              <div className="text-[10px] text-gray-500 text-center">
                ※ 共通因数がない場合は先頭の黄色の枠を空欄にしてください。<br/>
                ※ 引き算の場合は負の数を入力してください（例: -3）。<br/>
                ※ 係数が1の場合も、省略せずに「1」と入力してください。
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
                  <MathEq math={`${problem.eq} = ${problem.k !== 1 ? problem.k : ''}(${problem.p === 1 ? '' : problem.p}x ${problem.q > 0 ? '+' : ''} ${problem.q}${problem.hasY ? 'y' : ''})(${problem.r === 1 ? '' : problem.r}x ${problem.s > 0 ? '+' : ''} ${problem.s}${problem.hasY ? 'y' : ''})`} />
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    {problem.k !== 1 && (
                      <div className="text-red-600 font-bold mb-2">
                        ※ まず共通因数 {problem.k} でくくります。<br/>
                        <MathEq math={`${problem.eq} = ${problem.k}(${problem.A / problem.k}x^2 ${problem.B > 0 ? '+' : ''} ${problem.B / problem.k}x ${problem.C > 0 ? '+' : ''} ${problem.C / problem.k})`} />
                      </div>
                    )}
                    たすき掛けにより、<br/>
                    <div className="flex justify-center my-2 font-mono text-sm">
                      <div className="grid grid-cols-4 gap-2 text-center items-center">
                        <div>{problem.p}</div><div className="text-gray-400">×</div><div>{problem.q}</div><div>→ {problem.p * problem.s}</div>
                        <div>{problem.r}</div><div className="text-gray-400">×</div><div>{problem.s}</div><div>→ {problem.q * problem.r}</div>
                      </div>
                    </div>
                    和が <MathEq math={`${problem.B / problem.k}`} /> となるため成立。
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    {problem.k !== 1 && (
                      <div className="bg-red-50 border border-red-200 p-2 mb-4">
                        <p className="font-bold text-red-600">【重要】最初に共通因数でくくる！</p>
                        すべての項が <MathEq math={`${problem.k}`} /> の倍数なので、まずは <MathEq math={`${problem.k}`} /> でくくります。<br/>
                        <MathEq math={`${problem.eq} = ${problem.k}(${problem.A / problem.k}x^2 ${problem.B > 0 ? '+' : ''} ${problem.B / problem.k}x ${problem.C > 0 ? '+' : ''} ${problem.C / problem.k})`} />
                      </div>
                    )}
                    カッコの中の式に着目し、たすき掛けを行います。<br/>
                    かけて <MathEq math={`${problem.A / problem.k}`} /> になる2数と、かけて <MathEq math={`${problem.C / problem.k}`} /> になる2数を探し、斜めにかけて足した和が <MathEq math={`${problem.B / problem.k}`} /> になるペアを見つけます。<br/>
                    <br/>
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-50 border p-4 inline-block">
                        <table className="w-32 text-center text-lg font-bold">
                          <tbody>
                            <tr>
                              <td className="w-10 border-b pb-2">{problem.p}</td>
                              <td className="w-6 border-b pb-2 text-gray-400 font-normal">\</td>
                              <td className="w-10 border-b pb-2">{problem.q}</td>
                              <td className="w-16 border-b pb-2 text-sm">→ {problem.p * problem.s}</td>
                            </tr>
                            <tr>
                              <td className="w-10 pt-2">{problem.r}</td>
                              <td className="w-6 pt-2 text-gray-400 font-normal">/</td>
                              <td className="w-10 pt-2">{problem.s}</td>
                              <td className="w-16 pt-2 text-sm">→ {problem.q * problem.r}</td>
                            </tr>
                            <tr>
                              <td className="pt-2 border-t mt-2" colSpan={3}>和</td>
                              <td className="pt-2 border-t mt-2 text-red-600 font-black">{problem.B / problem.k}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    よって、<MathEq math={`(${problem.p === 1 ? '' : problem.p}x ${problem.q > 0 ? '+' : ''} ${problem.q}${problem.hasY ? 'y' : ''})(${problem.r === 1 ? '' : problem.r}x ${problem.s > 0 ? '+' : ''} ${problem.s}${problem.hasY ? 'y' : ''})`} /> となります。
                  </div>
                )}

                {detailLevel === 'detailed' && (
                  <div className="space-y-3">
                    <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded">
                      ■ たすき掛けの思考プロセス
                    </p>
                    {problem.k !== 1 && (
                      <div className="bg-red-50 p-2 border-l-4 border-red-500 mb-2">
                        <strong>ステップ0：共通因数でくくる</strong><br/>
                        数字が大きくてたすき掛けが難しそうなときは、必ず「共通因数」を疑いましょう。全体を <MathEq math={`${problem.k}`} /> でくくると計算が劇的に楽になります。<br/>
                        <MathEq math={`${problem.k}(${problem.A / problem.k}x^2 ${problem.B > 0 ? '+' : ''} ${problem.B / problem.k}x ${problem.C > 0 ? '+' : ''} ${problem.C / problem.k})`} />
                      </div>
                    )}
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        <strong><MathEq math={`x^2`} /> の係数に着目</strong><br/>
                        かけて <MathEq math={`${problem.A / problem.k}`} /> になる正の数のペアを考えます。<br/>
                        今回は <MathEq math={`${problem.A / problem.k} = ${problem.p} \\times ${problem.r}`} /> を試します。
                      </li>
                      <li>
                        <strong>{problem.hasY ? <MathEq math={`y^2`} /> : '定数項'} に着目</strong><br/>
                        かけて <MathEq math={`${problem.C / problem.k}`} /> になるペアを考えます。符号も考慮します。
                      </li>
                      <li>
                        <strong>クロスして足す（たすき掛け）</strong><br/>
                        斜めに掛け算をして、その和が真ん中の係数 <MathEq math={`${problem.B / problem.k}`} /> になるか確認します。<br/>
                        <div className="flex justify-center my-4">
                          <div className="bg-white border p-4 shadow-sm inline-block">
                            <table className="text-center text-lg font-bold">
                              <tbody>
                                <tr>
                                  <td className="w-12 border-b pb-2 text-blue-600">{problem.p}</td>
                                  <td className="w-8 border-b pb-2 text-gray-400 font-normal">↘</td>
                                  <td className="w-12 border-b pb-2 text-green-600">{problem.q}</td>
                                  <td className="w-24 border-b pb-2 text-sm text-gray-600">
                                    <MathEq math={`${problem.p} \\times ${problem.s} = ${problem.p * problem.s}`} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="w-12 pt-2 text-blue-600">{problem.r}</td>
                                  <td className="w-8 pt-2 text-gray-400 font-normal">↗</td>
                                  <td className="w-12 pt-2 text-green-600">{problem.s}</td>
                                  <td className="w-24 pt-2 text-sm text-gray-600">
                                    <MathEq math={`${problem.q} \\times ${problem.r} = ${problem.q * problem.r}`} />
                                  </td>
                                </tr>
                                <tr>
                                  <td className="pt-2 border-t mt-2" colSpan={3}>和</td>
                                  <td className="pt-2 border-t mt-2 text-red-600 font-black">
                                    {problem.B / problem.k}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <MathEq math={`${problem.p * problem.s} + (${problem.q * problem.r}) = ${problem.B / problem.k}`} /> となり、見事に一致しました！
                      </li>
                      <li>
                        <strong>横に読んで完成</strong><br/>
                        上の段を読んで <MathEq math={`(${problem.p === 1 ? '' : problem.p}x ${problem.q > 0 ? '+' : ''} ${problem.q}${problem.hasY ? 'y' : ''})`} />。<br/>
                        下の段を読んで <MathEq math={`(${problem.r === 1 ? '' : problem.r}x ${problem.s > 0 ? '+' : ''} ${problem.s}${problem.hasY ? 'y' : ''})`} />。<br/>
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
