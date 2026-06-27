"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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

function extGCD(a: number, b: number): { g: number, x: number, y: number } {
  let x0 = 1, y0 = 0, x1 = 0, y1 = 1;
  let r0 = a, r1 = b;
  while (r1 !== 0) {
    let q = Math.floor(r0 / r1);
    let r2 = r0 % r1;
    let x2 = x0 - q * x1;
    let y2 = y0 - q * y1;
    r0 = r1; r1 = r2;
    x0 = x1; x1 = x2;
    y0 = y1; y1 = y2;
  }
  return { g: r0, x: x0, y: y0 };
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  A: number;
  B: number;
  C: number;
  x0: number; // A reference solution
  y0: number; // A reference solution
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let a = 0, b = 0, c = 1;
    if (p === 'pattern1') {
      a = Math.floor(Math.random() * 8) + 2; // 2-9
      b = Math.floor(Math.random() * 8) + 2; // 2-9
    } else if (p === 'pattern2') {
      a = Math.floor(Math.random() * 89) + 11; // 11-99
      b = Math.floor(Math.random() * 89) + 11; // 11-99
    } else if (p === 'pattern3') {
      a = Math.floor(Math.random() * 20) + 5; 
      b = Math.floor(Math.random() * 20) + 5;
      c = Math.floor(Math.random() * 5) + 2; // 2-6
    } else if (p === 'pattern4') {
      a = Math.floor(Math.random() * 20) + 5;
      b = -(Math.floor(Math.random() * 20) + 5); // negative B
    }

    if (gcd(a, b) === 1) {
      // Find a solution
      let { x, y } = extGCD(Math.abs(a), Math.abs(b));
      
      // adjust signs
      if (a < 0) x = -x;
      if (b < 0) y = -y;
      
      // scale for C
      x *= c;
      y *= c;

      return { pattern: p, A: a, B: b, C: c, x0: x, y0: y };
    }
  }
}

export default function LinearDiophantineDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansX, setAnsX] = useState<string>('');
  const [ansY, setAnsY] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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

    let { A, B, C, x0, y0 } = problem;
    
    // Determine a reasonable scale to show a few lattice points around (x0, y0)
    let cx = x0;
    let cy = y0;
    
    // We want to show the line passing through (x0, y0) and (x0 + B, y0 - A)
    // Step size for lattice points
    let dx = B;
    let dy = -A;
    
    // Scale so that dx, dy is visible
    let margin = 2.5; // see 2.5 steps in each direction
    let maxDistX = Math.max(Math.abs(dx), 1) * margin;
    let maxDistY = Math.max(Math.abs(dy), 1) * margin;
    
    let scaleX = (W / 2) / maxDistX;
    let scaleY = (H / 2) / maxDistY;
    let scale = Math.min(scaleX, scaleY);
    
    // Center at (cx, cy) -> Screen (W/2, H/2)
    const toScreen = (lx: number, ly: number) => {
      return {
        x: W/2 + (lx - cx) * scale,
        y: H/2 - (ly - cy) * scale // Y axis points up in math
      };
    };

    // Draw grid axes if they are in view
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    // We can just draw a light grid
    for (let i = -10; i <= 10; i++) {
      let p1 = toScreen(cx - maxDistX, cy + i * Math.abs(dy) / 2);
      let p2 = toScreen(cx + maxDistX, cy + i * Math.abs(dy) / 2);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      
      let p3 = toScreen(cx + i * Math.abs(dx) / 2, cy - maxDistY);
      let p4 = toScreen(cx + i * Math.abs(dx) / 2, cy + maxDistY);
      ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.stroke();
    }

    // Draw the line Ax + By = C
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    let pStart = toScreen(cx - dx * 10, cy - dy * 10);
    let pEnd = toScreen(cx + dx * 10, cy + dy * 10);
    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();

    // Draw lattice points
    for (let k = -5; k <= 5; k++) {
      let px = x0 + k * dx;
      let py = y0 + k * dy;
      let sp = toScreen(px, py);
      
      // Draw point
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4, 0, 2*Math.PI);
      ctx.fillStyle = k === 0 ? '#ef4444' : '#10b981'; // Red for our ref point, Green for others
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Label
      if (sp.x > 10 && sp.x < W - 10 && sp.y > 10 && sp.y < H - 10) {
        ctx.fillStyle = '#1e293b';
        ctx.font = '10px sans-serif';
        ctx.fillText(`(${px}, ${py})`, sp.x + 10, sp.y - 10);
      }
    }
    
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';
    ctx.fillText(`${A}x ${B > 0 ? '+' : ''}${B}y = ${C} 上の格子点`, 10, 20);
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsX('');
    setAnsY('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let ux = parseInt(ansX);
    let uy = parseInt(ansY);
    
    if (isNaN(ux) || isNaN(uy)) {
      alert("整数を入力してください");
      return;
    }
    
    // Any valid solution is accepted!
    if (problem.A * ux + problem.B * uy === problem.C) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return null;

  let eqStr = `${problem.A}x `;
  if (problem.B > 0) {
    eqStr += `+ ${problem.B}y`;
  } else {
    eqStr += `- ${Math.abs(problem.B)}y`;
  }
  eqStr += ` = ${problem.C}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          1次不定方程式の特殊解ドリル
        </h1>
        <p className="text-gray-500">
          方程式 <MathEq math="ax+by=c" /> を満たす整数解（特殊解）を一つ見つける演習です。無数にある正解のうち、どれを入力しても正解になります！
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
                <option value="pattern1">パターン1 (係数が1桁)</option>
                <option value="pattern2">パターン2 (係数が2桁)</option>
                <option value="pattern3">パターン3 (右辺が1ではない)</option>
                <option value="pattern4">パターン4 (引き算の形)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-3 text-lg font-bold text-slate-700 text-center">
              次の方程式を満たす整数 <MathEq math="x, y" /> の組を一つ求めよ。<br/>
              <span className="text-3xl text-blue-700 my-4 tracking-wider"><MathEq math={eqStr} /></span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 text-xl font-bold">
                <MathEq math="x =" />
                <input 
                  type="number" 
                  className="w-20 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansX} 
                  onChange={e => setAnsX(e.target.value)} 
                />
                <span className="w-8"></span>
                <MathEq math="y =" />
                <input 
                  type="number" 
                  className="w-20 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansY} 
                  onChange={e => setAnsY(e.target.value)} 
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
                {isCorrect ? '正解！見事に見つけ出しました。' : '不正解... 代入して方程式が成り立つか確認してみましょう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・図解
              </h2>
            </div>

            <div className="flex justify-center mb-4">
              <canvas 
                ref={canvasRef} 
                width={360} 
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
                
                <div className="bg-white p-3 border text-center font-bold text-lg mb-2 text-emerald-700 shadow-sm flex flex-col gap-2">
                  解答例の一つ: <MathEq math={`(x, y) = (${problem.x0}, ${problem.y0})`} />
                </div>

                <div className="bg-gray-50 p-3 border space-y-2">
                  <p className="font-bold border-b pb-1 mb-2">合同式（mod）を用いた求め方（おすすめ）</p>
                  
                  <p>
                    <MathEq math={eqStr} /> において、係数が小さい方の文字に着目し、その係数を法（mod）として考えます。<br/>
                    今回は <MathEq math={Math.min(Math.abs(problem.A), Math.abs(problem.B)).toString()} /> を法とすると計算が楽です。
                  </p>
                  
                  <p className="font-bold border-b pb-1 mt-4 mb-2">ユークリッドの互除法を逆算する求め方（基本）</p>
                  <p>
                    <MathEq math={`${Math.abs(problem.A)}`} /> と <MathEq math={`${Math.abs(problem.B)}`} /> で互除法を行い、余りが <MathEq math="1" /> になる式を作ります。その式を逆にたどって代入を繰り返すことで、<MathEq math={`(x, y)`} /> の特殊解を求めることができます。
                  </p>

                  {problem.C !== 1 && (
                    <div className="mt-4 p-2 bg-yellow-50 border border-yellow-300 rounded">
                      <p className="text-yellow-800 font-bold">※ 右辺が {problem.C} の場合</p>
                      <p>
                        まずは右辺が <MathEq math="1" /> の場合（<MathEq math={`${problem.A}x ${problem.B > 0 ? '+' : '-'} ${Math.abs(problem.B)}y = 1`} />）の解を見つけます。<br/>
                        その後、その解の <MathEq math="x" /> と <MathEq math="y" /> の両方を <MathEq math={problem.C.toString()} /> 倍することで、右辺が <MathEq math={problem.C.toString()} /> の方程式の解が得られます！
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-bold text-blue-800 mb-1">無限にある解（一般解）</p>
                    <p>
                      特殊解を <MathEq math={`(x_0, y_0)`} /> とすると、すべての整数解は整数 <MathEq math="k" /> を用いて次のように表せます（上図のすべての点が該当します）。
                    </p>
                    <MathEq math={`x = x_0 + ${problem.B}k, \\quad y = y_0 - ${problem.A}k`} block />
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
