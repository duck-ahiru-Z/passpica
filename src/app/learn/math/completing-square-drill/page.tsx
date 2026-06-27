"use client";

import { useState, useEffect, useRef } from 'react';
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

interface Root {
  num: number;
  den: number;
}

function simplifyFraction(n: number, d: number): Root {
  if (d === 0) return { num: 0, den: 1 };
  let g = gcd(n, d);
  let num = n / g;
  let den = d / g;
  if (den < 0) {
    num *= -1;
    den *= -1;
  }
  return { num, den };
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  a: number;
  b: number;
  c: number;
  P: Root;
  Q: Root;
  eq: string;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let a = 1, b = 0, c = 0;
    
    if (p_type === 'pattern1') {
      a = 1;
      b = (Math.floor(Math.random() * 9) + 1) * 2; // 2 to 18 (even)
      if (Math.random() < 0.5) b = -b;
      c = Math.floor(Math.random() * 19) - 9;
    } else if (p_type === 'pattern2') {
      a = Math.floor(Math.random() * 9) - 4; // -4 to 4
      if (a === 0 || a === 1) continue;
      let p_int = Math.floor(Math.random() * 9) - 4;
      if (p_int === 0) continue;
      b = -2 * a * p_int;
      c = Math.floor(Math.random() * 19) - 9;
    } else if (p_type === 'pattern3') {
      a = 1;
      b = Math.floor(Math.random() * 9) * 2 + 1; // 1 to 17 (odd)
      if (Math.random() < 0.5) b = -b;
      c = Math.floor(Math.random() * 19) - 9;
    } else if (p_type === 'pattern4') {
      a = Math.floor(Math.random() * 9) - 4;
      if (a === 0 || a === 1) continue;
      b = Math.floor(Math.random() * 19) - 9;
      if (b === 0) continue;
      if (b % (2 * a) === 0) continue; // Must result in a fraction
      c = Math.floor(Math.random() * 19) - 9;
    }

    let P = simplifyFraction(b, 2 * a);
    let Q = simplifyFraction(4 * a * c - b * b, 4 * a);
    
    let eq = 'y = ';
    if (a === 1) eq += 'x^2';
    else if (a === -1) eq += '-x^2';
    else eq += `${a}x^2`;
    
    if (b > 0) eq += ` + ${b === 1 ? '' : b}x`;
    else if (b < 0) eq += ` - ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
    
    if (c > 0) eq += ` + ${c}`;
    else if (c < 0) eq += ` - ${Math.abs(c)}`;
    
    return { pattern: p_type, a, b, c, P, Q, eq };
  }
}

export default function CompletingSquareDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // User input states: y = [A] (x [pSign] [pNum]/[pDen])^2 [qSign] [qNum]/[qDen]
  const [ansA, setAnsA] = useState<string>('');
  const [ansPSign, setAnsPSign] = useState<'+' | '-'>('+');
  const [ansPNum, setAnsPNum] = useState<string>('');
  const [ansPDen, setAnsPDen] = useState<string>('');
  const [ansQSign, setAnsQSign] = useState<'+' | '-'>('+');
  const [ansQNum, setAnsQNum] = useState<string>('');
  const [ansQDen, setAnsQDen] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const drawGraph = () => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // vertex coordinates
    let vx = -problem.P.num / problem.P.den;
    let vy = problem.Q.num / problem.Q.den;

    // determine range
    let rangeX = Math.max(8, Math.abs(vx) * 3);
    let minX = vx - rangeX / 2;
    let maxX = vx + rangeX / 2;
    
    let func = (x: number) => problem.a * x * x + problem.b * x + problem.c;
    
    let minY = vy;
    let maxY = vy;
    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let y = func(x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    // Add margin
    let rangeY = maxY - minY;
    if (rangeY === 0) rangeY = 10;
    minY -= rangeY * 0.2;
    maxY += rangeY * 0.2;
    rangeY = maxY - minY;

    const mapX = (x: number) => ((x - minX) / rangeX) * W;
    const mapY = (y: number) => H - ((y - minY) / rangeY) * H;

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0));
    ctx.lineTo(W, mapY(0)); // X axis
    ctx.stroke();
    if (minX <= 0 && 0 <= maxX) {
      ctx.beginPath();
      ctx.moveTo(mapX(0), 0);
      ctx.lineTo(mapX(0), H); // Y axis
      ctx.stroke();
    }

    // Draw parabola
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let y = func(x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

    if (hasChecked) {
      // Draw axis of symmetry
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(mapX(vx), 0);
      ctx.lineTo(mapX(vx), H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vertex point
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(mapX(vx), mapY(vy), 4, 0, 2 * Math.PI);
      ctx.fill();

      // Vertex text
      ctx.fillStyle = '#9f1239';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      
      let pStr = problem.P.den === 1 ? `${-problem.P.num}` : `${-problem.P.num}/${problem.P.den}`;
      let qStr = problem.Q.den === 1 ? `${problem.Q.num}` : `${problem.Q.num}/${problem.Q.den}`;
      
      let textY = problem.a > 0 ? mapY(vy) + 16 : mapY(vy) - 8;
      ctx.fillText(`頂点 (${pStr}, ${qStr})`, mapX(vx), textY);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsA('');
    setAnsPSign('+'); setAnsPNum(''); setAnsPDen('');
    setAnsQSign('+'); setAnsQNum(''); setAnsQDen('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let aVal = ansA.trim() === '' ? 1 : ansA.trim() === '-' ? -1 : parseInt(ansA);
    
    let pNum = parseInt(ansPNum);
    let pDen = ansPDen.trim() === '' ? 1 : parseInt(ansPDen);
    if (isNaN(pNum)) pNum = 0; // if empty, treat as 0
    let userP = simplifyFraction((ansPSign === '+' ? 1 : -1) * pNum, pDen);
    
    let qNum = parseInt(ansQNum);
    let qDen = ansQDen.trim() === '' ? 1 : parseInt(ansQDen);
    if (isNaN(qNum)) qNum = 0;
    let userQ = simplifyFraction((ansQSign === '+' ? 1 : -1) * qNum, qDen);
    
    if (isNaN(aVal) || isNaN(userP.num) || isNaN(userQ.num)) {
      alert('正しく数値を入力してください。');
      return;
    }
    
    if (aVal === problem.a && userP.num === problem.P.num && userP.den === problem.P.den && userQ.num === problem.Q.num && userQ.den === problem.Q.den) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    
    setHasChecked(true);
  };

  if (!problem) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          平方完成の特訓ドリル
        </h1>
        <p className="text-gray-500">
          2次関数の式を平方完成して、頂点の座標を正確に求める反復練習です。
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
                <option value="pattern1">パターン1 (基本・係数1)</option>
                <option value="pattern2">パターン2 (係数あり)</option>
                <option value="pattern3">パターン3 (頂点が分数)</option>
                <option value="pattern4">パターン4 (係数あり＋分数)</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">
                次の方程式を平方完成しなさい。
              </div>
              
              <div className="flex items-center justify-center gap-1 text-base md:text-xl font-bold mt-4">
                <span className="mr-2">y =</span>
                <input type="text" className="w-10 border p-1 text-center bg-yellow-50" value={ansA} onChange={e => setAnsA(e.target.value)} placeholder="a" />
                <span className="mx-1">(</span>
                <span>x</span>
                <select value={ansPSign} onChange={e => setAnsPSign(e.target.value as '+'|'-')} className="mx-1 border p-1 bg-white">
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
                <div className="flex flex-col items-center justify-center">
                  <input type="number" className="w-10 border p-1 text-center" value={ansPNum} onChange={e => setAnsPNum(e.target.value)} />
                  <div className="w-full border-b-2 border-slate-800 my-0.5"></div>
                  <input type="number" className="w-10 border p-1 text-center bg-gray-50" value={ansPDen} onChange={e => setAnsPDen(e.target.value)} placeholder="1" />
                </div>
                <span className="mx-1">)<sup>2</sup></span>
                <select value={ansQSign} onChange={e => setAnsQSign(e.target.value as '+'|'-')} className="mx-1 border p-1 bg-white">
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
                <div className="flex flex-col items-center justify-center">
                  <input type="number" className="w-10 border p-1 text-center" value={ansQNum} onChange={e => setAnsQNum(e.target.value)} />
                  <div className="w-full border-b-2 border-slate-800 my-0.5"></div>
                  <input type="number" className="w-10 border p-1 text-center bg-gray-50" value={ansQDen} onChange={e => setAnsQDen(e.target.value)} placeholder="1" />
                </div>
              </div>

              <div className="text-[10px] text-gray-500 text-center mt-6">
                ※ 先頭の係数 <MathEq math="a=1" /> の場合は空欄で構いません。マイナスの場合は <code>-</code> または <code>-1</code> と入力してください。<br/>
                ※ 答えが整数の場合、分母は空欄（または1）にしてください。<br/>
                ※ 分数の分子にはマイナス記号を入れず、手前の＋/－プルダウンで符号を選択してください。
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
                {isCorrect ? '正解！グラフで頂点を確認しよう。' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・グラフ
              </h2>
              {hasChecked && (
                <div className="flex gap-1 text-[10px]">
                  <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                  <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                </div>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={200} 
                className="border border-gray-300 bg-white shadow-sm w-full max-w-full h-auto"
              />
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                
                {/* 最終解答の美しい表示 */}
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm">
                  <MathEq math={`y = ${problem.a === 1 ? '' : problem.a === -1 ? '-' : problem.a}\\left(x ${problem.P.num === 0 ? '' : problem.P.num > 0 ? '+' : '-'} ${problem.P.num === 0 ? '0' : problem.P.den === 1 ? Math.abs(problem.P.num) : `\\frac{${Math.abs(problem.P.num)}}{${problem.P.den}}`}\\right)^2 ${problem.Q.num === 0 ? '' : problem.Q.num > 0 ? '+' : '-'} ${problem.Q.num === 0 ? '0' : problem.Q.den === 1 ? Math.abs(problem.Q.num) : `\\frac{${Math.abs(problem.Q.num)}}{${problem.Q.den}}`}`} />
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    <p>頂点の座標: <MathEq math={`\\left(${problem.P.num === 0 ? '0' : problem.P.num > 0 ? '-' : ''}${problem.P.den === 1 ? Math.abs(problem.P.num) : `\\frac{${Math.abs(problem.P.num)}}{${problem.P.den}}`}, \\quad ${problem.Q.num === 0 ? '0' : problem.Q.num > 0 ? '' : '-'}${problem.Q.den === 1 ? Math.abs(problem.Q.num) : `\\frac{${Math.abs(problem.Q.num)}}{${problem.Q.den}}`}\\right)`} /></p>
                    <p>軸の方程式: <MathEq math={`x = ${problem.P.num === 0 ? '0' : problem.P.num > 0 ? '-' : ''}${problem.P.den === 1 ? Math.abs(problem.P.num) : `\\frac{${Math.abs(problem.P.num)}}{${problem.P.den}}`}`} /></p>
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div className="space-y-3">
                    {problem.a !== 1 && (
                      <div className="bg-gray-50 p-2 border">
                        <p className="font-bold border-b pb-1 mb-1">1. <MathEq math="x^2" /> の係数でくくる</p>
                        <p>まず <MathEq math="x" /> を含む項を <MathEq math={`${problem.a}`} /> でくくります。</p>
                        <MathEq math={`y = ${problem.a === -1 ? '-' : problem.a}\\left(x^2 ${problem.b/problem.a > 0 ? '+' : '-'} ${Math.abs(problem.b/problem.a)}x\\right) ${problem.c > 0 ? '+' : '-'} ${Math.abs(problem.c)}`} />
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-2 border">
                      <p className="font-bold border-b pb-1 mb-1">2. カッコの中を無理やり2乗の形にする</p>
                      <p><MathEq math="x" /> の係数（<MathEq math={`${problem.b/problem.a}`} />）の<strong>半分</strong>の2乗を足して引きます。</p>
                      <MathEq math={`y = ${problem.a === 1 ? '' : problem.a === -1 ? '-' : problem.a}\\left( \\left(x ${problem.b/problem.a > 0 ? '+' : '-'} ${Math.abs(problem.b/(2*problem.a))} \\right)^2 - \\left(${Math.abs(problem.b/(2*problem.a))}\\right)^2 \\right) ${problem.c > 0 ? '+' : '-'} ${Math.abs(problem.c)}`} />
                    </div>

                    <div className="bg-gray-50 p-2 border">
                      <p className="font-bold border-b pb-1 mb-1">3. 展開して整理する</p>
                      <p>引いた分をカッコの外に出して、定数項とまとめます。</p>
                      {problem.a !== 1 && (
                        <p className="text-red-600 font-bold text-[10px] mb-1">※ 外に出すときに先頭の {problem.a} を掛けるのを忘れないように！</p>
                      )}
                      <MathEq math={`y = ${problem.a === 1 ? '' : problem.a === -1 ? '-' : problem.a}\\left(x ${problem.b/problem.a > 0 ? '+' : '-'} ${Math.abs(problem.b/(2*problem.a))} \\right)^2 - ${problem.a} \\times \\left(${Math.abs(problem.b/(2*problem.a))}\\right)^2 ${problem.c > 0 ? '+' : '-'} ${Math.abs(problem.c)}`} /><br/>
                      <MathEq math={`y = ${problem.a === 1 ? '' : problem.a === -1 ? '-' : problem.a}\\left(x ${problem.P.num > 0 ? '+' : '-'} ${problem.P.den === 1 ? Math.abs(problem.P.num) : `\\frac{${Math.abs(problem.P.num)}}{${problem.P.den}}`} \\right)^2 ${problem.Q.num > 0 ? '+' : '-'} ${problem.Q.den === 1 ? Math.abs(problem.Q.num) : `\\frac{${Math.abs(problem.Q.num)}}{${problem.Q.den}}`}`} />
                    </div>
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
