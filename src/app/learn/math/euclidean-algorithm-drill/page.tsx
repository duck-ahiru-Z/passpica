"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

interface Step {
  a: number;
  b: number;
  q: number;
  r: number;
}

function getSteps(a: number, b: number): Step[] {
  let steps = [];
  let _a = a;
  let _b = b;
  while (_b > 0) {
    let q = Math.floor(_a / _b);
    let r = _a % _b;
    steps.push({ a: _a, b: _b, q, r });
    _a = _b;
    _b = r;
  }
  return steps;
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  A: number;
  B: number;
  steps: Step[];
  ans: number;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let a = 0;
    let b = 0;
    if (p === 'pattern1') {
      a = Math.floor(Math.random() * 80) + 20; // 20-99
      b = Math.floor(Math.random() * (a - 10)) + 10;
    } else if (p === 'pattern2') {
      a = Math.floor(Math.random() * 800) + 150; // 150-949
      b = Math.floor(Math.random() * 80) + 20; // 20-99
    } else if (p === 'pattern3') {
      a = Math.floor(Math.random() * 800) + 150; // 150-949
      b = Math.floor(Math.random() * (a - 100)) + 100;
    } else {
      a = Math.floor(Math.random() * 8000) + 1500; // 1500-9499
      b = Math.floor(Math.random() * (a - 500)) + 500;
    }

    let steps = getSteps(a, b);
    let gcd = steps[steps.length - 1]?.a || 1; // wait, if r=0, last step a is the last divisor (which was b in previous step)
    // Actually the last step in getSteps has r=0, so the GCD is the 'b' of the last step
    gcd = steps[steps.length - 1].b;

    if (p === 'pattern1' && steps.length <= 2) {
      return { pattern: p, A: a, B: b, steps, ans: gcd };
    }
    if (p === 'pattern2' && steps.length >= 3) {
      return { pattern: p, A: a, B: b, steps, ans: gcd };
    }
    if (p === 'pattern3' && gcd === 1 && steps.length >= 2) {
      return { pattern: p, A: a, B: b, steps, ans: gcd };
    }
    if (p === 'pattern4' && steps.length >= 4) {
      return { pattern: p, A: a, B: b, steps, ans: gcd };
    }
  }
}

export default function EuclideanAlgorithmDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal, setAnsVal] = useState<string>('');
  
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

    let A = problem.A;
    let B = problem.B;
    
    // Scale A and B to fit inside 90% of Canvas
    const padding = 20;
    const availW = W - padding * 2;
    const availH = H - padding * 2;
    
    // Always map larger number to width
    let scale = Math.min(availW / A, availH / B);
    let drawW = A * scale;
    let drawH = B * scale;
    
    let offsetX = (W - drawW) / 2;
    let offsetY = (H - drawH) / 2;

    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '10px sans-serif';
    
    ctx.fillText(`${A} × ${B} の長方形を正方形で埋め尽くす（互除法の図解）`, W/2, 10);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;

    let colors = ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa'];
    
    // Recursive drawing
    const drawEuclid = (x: number, y: number, w: number, h: number, a: number, b: number, isHorizontal: boolean, depth: number) => {
      if (b === 0 || a === 0 || w < 0.5 || h < 0.5) return;
      
      let q = Math.floor(a / b);
      let r = a % b;
      
      let stepSize = isHorizontal ? h : w; // pixel size of square
      
      ctx.fillStyle = colors[Math.min(depth, colors.length - 1)];
      
      for (let i = 0; i < q; i++) {
        let sx = x + (isHorizontal ? i * stepSize : 0);
        let sy = y + (isHorizontal ? 0 : i * stepSize);
        ctx.fillRect(sx, sy, stepSize, stepSize);
        ctx.strokeRect(sx, sy, stepSize, stepSize);
        
        // Draw label if square is big enough
        if (stepSize > 15) {
          ctx.fillStyle = '#1e293b';
          // only draw b value if it fits nicely
          let fontSize = Math.max(8, Math.min(12, stepSize * 0.4));
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillText(`${b}`, sx + stepSize/2, sy + stepSize/2);
          ctx.fillStyle = colors[Math.min(depth, colors.length - 1)]; // reset
        }
      }
      
      if (r > 0) {
        let nextX = x + (isHorizontal ? q * stepSize : 0);
        let nextY = y + (isHorizontal ? 0 : q * stepSize);
        let nextW = isHorizontal ? w - q * stepSize : w;
        let nextH = isHorizontal ? h : h - q * stepSize;
        drawEuclid(nextX, nextY, nextW, nextH, b, r, !isHorizontal, depth + 1);
      }
    };
    
    drawEuclid(offsetX, offsetY, drawW, drawH, A, B, true, 0);
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    if (parseInt(ansVal) === problem.ans) {
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
          ユークリッドの互除法ドリル
        </h1>
        <p className="text-gray-500">
          大きな数の最大公約数を、割り算の繰り返し（ユークリッドの互除法）を用いて確実かつスピーディに求める演習です。
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
                <option value="pattern1">パターン1 (2桁と2桁・基本)</option>
                <option value="pattern2">パターン2 (3桁と2桁)</option>
                <option value="pattern3">パターン3 (互いに素・最大公約数1)</option>
                <option value="pattern4">パターン4 (4桁を含む重量級)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-3 text-lg font-bold text-slate-700 text-center">
              次の2つの数の最大公約数を求めよ。<br/>
              <span className="text-2xl text-blue-700 my-2">{problem.A} と {problem.B}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 text-xl">
                <input 
                  type="number" 
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => setAnsVal(e.target.value)} 
                  placeholder="最大公約数" 
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
                {isCorrect ? '正解！互除法のマスターですね。' : '不正解... 解説を見て割り算のステップを確認しましょう。'}
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
                  正解: {problem.ans}
                </div>

                <div className="bg-gray-50 p-3 border space-y-2 overflow-x-auto">
                  <p className="font-bold border-b pb-1 mb-3">割り算のステップ（<MathEq math="A = B \times Q + R" />）</p>
                  
                  {/* KaTeX aligned environment string construction */}
                  <div className="text-sm text-center">
                    <MathEq 
                      block 
                      math={`\\begin{aligned}
${problem.steps.map(s => `${s.a} &= ${s.b} \\times ${s.q} + ${s.r}`).join(' \\\\ ')}
\\end{aligned}`} 
                    />
                  </div>
                  
                  <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p>
                      余りが <MathEq math="0" /> になったときの割る数（最後の行の <MathEq math={problem.steps[problem.steps.length-1].b.toString()} />）が、求める最大公約数になります。
                    </p>
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
