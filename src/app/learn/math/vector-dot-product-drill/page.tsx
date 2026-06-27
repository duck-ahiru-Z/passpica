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

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface Vector2D {
  xStr: string;
  yStr: string;
  xVal: number;
  yVal: number;
}

interface ProblemData {
  pattern: Pattern;
  a: Vector2D;
  b: Vector2D;
  qStr: string;
  ansNum: number;
  ansDen: number;
  expLines: string[];
}

const anglePairs = [
  { a: {xStr:"1", yStr:"\\sqrt{3}", xVal:1, yVal:Math.sqrt(3)}, b: {xStr:"\\sqrt{3}", yStr:"1", xVal:Math.sqrt(3), yVal:1}, deg: 30, cos: "\\frac{\\sqrt{3}}{2}" },
  { a: {xStr:"1", yStr:"\\sqrt{3}", xVal:1, yVal:Math.sqrt(3)}, b: {xStr:"-1", yStr:"\\sqrt{3}", xVal:-1, yVal:Math.sqrt(3)}, deg: 60, cos: "\\frac{1}{2}" },
  { a: {xStr:"1", yStr:"1", xVal:1, yVal:1}, b: {xStr:"0", yStr:"1", xVal:0, yVal:1}, deg: 45, cos: "\\frac{1}{\\sqrt{2}}" },
  { a: {xStr:"1", yStr:"1", xVal:1, yVal:1}, b: {xStr:"-1", yStr:"1", xVal:-1, yVal:1}, deg: 90, cos: "0" },
  { a: {xStr:"\\sqrt{3}", yStr:"1", xVal:Math.sqrt(3), yVal:1}, b: {xStr:"-\\sqrt{3}", yStr:"1", xVal:-Math.sqrt(3), yVal:1}, deg: 120, cos: "-\\frac{1}{2}" },
  { a: {xStr:"1", yStr:"-1", xVal:1, yVal:-1}, b: {xStr:"-1", yStr:"0", xVal:-1, yVal:0}, deg: 135, cos: "-\\frac{1}{\\sqrt{2}}" },
  { a: {xStr:"1", yStr:"\\sqrt{3}", xVal:1, yVal:Math.sqrt(3)}, b: {xStr:"-\\sqrt{3}", yStr:"-1", xVal:-Math.sqrt(3), yVal:-1}, deg: 150, cos: "-\\frac{\\sqrt{3}}{2}" }
];

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      let ax = Math.floor(Math.random() * 11) - 5;
      let ay = Math.floor(Math.random() * 11) - 5;
      let bx = Math.floor(Math.random() * 11) - 5;
      let by = Math.floor(Math.random() * 11) - 5;
      if (ax===0 && ay===0) continue;
      if (bx===0 && by===0) continue;
      
      let dot = ax*bx + ay*by;
      
      let a: Vector2D = { xStr: ax.toString(), yStr: ay.toString(), xVal: ax, yVal: ay };
      let b: Vector2D = { xStr: bx.toString(), yStr: by.toString(), xVal: bx, yVal: by };
      
      let qStr = `\\vec{a} = (${ax}, ${ay}), \\quad \\vec{b} = (${bx}, ${by}) \\quad \\text{のとき、内積 } \\vec{a} \\cdot \\vec{b} \\text{ を求めよ。}`;
      
      let expLines = [
        `\\text{成分による内積の定義より：}`,
        `\\vec{a} \\cdot \\vec{b} = x_1 x_2 + y_1 y_2`,
        `= (${ax}) \\times (${bx}) + (${ay}) \\times (${by})`,
        `= ${ax*bx} + ${ay*by}`,
        `= ${dot}`
      ];
      
      return { pattern: p, a, b, qStr, ansNum: dot, ansDen: 1, expLines };
    } 
    else if (p === 'pattern2') {
      let pair = anglePairs[Math.floor(Math.random() * anglePairs.length)];
      // Maybe swap a and b
      let a = pair.a;
      let b = pair.b;
      if (Math.random() > 0.5) { a = pair.b; b = pair.a; }
      
      let qStr = `\\vec{a} = (${a.xStr}, ${a.yStr}), \\quad \\vec{b} = (${b.xStr}, ${b.yStr}) \\quad \\text{のなす角 } \\theta \\, (0^\\circ \\le \\theta \\le 180^\\circ) \\text{ を求めよ。}`;
      
      let expLines = [
        `\\text{なす角を求める公式 } \\cos\\theta = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|} \\text{ を用います。}`,
        `\\cos\\theta = ${pair.cos}`,
        `0^\\circ \\le \\theta \\le 180^\\circ \\text{ の範囲でこれを満たす } \\theta \\text{ は } ${pair.deg}^\\circ \\text{ です。}`
      ];
      
      return { pattern: p, a, b, qStr, ansNum: pair.deg, ansDen: 1, expLines };
    }
    else if (p === 'pattern3') {
      let ax = Math.floor(Math.random() * 9) - 4; // -4..4 non-zero
      if (ax === 0) ax = 1;
      let ay = Math.floor(Math.random() * 9) - 4;
      if (ay === 0) ay = 2;
      let by = Math.floor(Math.random() * 9) - 4;
      if (by === 0) by = -1;
      
      let a: Vector2D = { xStr: ax.toString(), yStr: ay.toString(), xVal: ax, yVal: ay };
      let b: Vector2D = { xStr: "x", yStr: by.toString(), xVal: 0, yVal: by }; // xVal unused here
      
      // ax * x + ay * by = 0  => ax * x = -ay * by
      let num = -ay * by;
      let den = ax;
      let g = gcd(num, den);
      num /= g; den /= g;
      if (den < 0) { num = -num; den = -den; }
      
      let qStr = `\\vec{a} = (${ax}, ${ay}), \\quad \\vec{b} = (x, ${by}) \\quad \\text{が垂直であるとき、} x \\text{ の値を求めよ。}`;
      
      let expLines = [
        `\\text{2つのベクトルが垂直である条件は、内積が } 0 \\text{ となることです。}`,
        `\\vec{a} \\cdot \\vec{b} = 0`,
        `(${ax}) \\times x + (${ay}) \\times (${by}) = 0`,
        `${ax}x + ${ay*by} = 0`,
        `${ax}x = ${-ay*by}`
      ];
      if (den === 1) expLines.push(`x = ${num}`);
      else expLines.push(`x = \\frac{${num}}{${den}}`);
      
      // for drawing, use the actual solved x
      let solvedB: Vector2D = { xStr: (num/den).toString(), yStr: by.toString(), xVal: num/den, yVal: by };
      
      return { pattern: p, a, b: solvedB, qStr, ansNum: num, ansDen: den, expLines };
    }
    else if (p === 'pattern4') {
      let ax = Math.floor(Math.random() * 9) - 4;
      let ay = Math.floor(Math.random() * 9) - 4;
      let bx = Math.floor(Math.random() * 9) - 4;
      let by = Math.floor(Math.random() * 9) - 4;
      
      let a: Vector2D = { xStr: ax.toString(), yStr: ay.toString(), xVal: ax, yVal: ay };
      let b: Vector2D = { xStr: bx.toString(), yStr: by.toString(), xVal: bx, yVal: by };
      
      let sq = (ax+bx)*(ax+bx) + (ay+by)*(ay+by);
      
      let qStr = `\\vec{a} = (${ax}, ${ay}), \\quad \\vec{b} = (${bx}, ${by}) \\quad \\text{のとき、} |\\vec{a} + \\vec{b}|^2 \\text{ の値を求めよ。}`;
      
      let expLines = [
        `\\text{成分同士を足してから大きさを求めます。}`,
        `\\vec{a} + \\vec{b} = (${ax} + ${bx}, \\quad ${ay} + ${by})`,
        `= (${ax+bx}, \\quad ${ay+by})`,
        `|\\vec{a} + \\vec{b}|^2 = (${ax+bx})^2 + (${ay+by})^2`,
        `= ${Math.pow(ax+bx, 2)} + ${Math.pow(ay+by, 2)}`,
        `= ${sq}`
      ];
      
      return { pattern: p, a, b, qStr, ansNum: sq, ansDen: 1, expLines };
    }
  }
}

export default function VectorDotProductDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal, setAnsVal] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let uNum = 0, uDen = 1;
    let uStr = ansVal.trim().replace(/\s+/g, '');
    if (uStr.includes('/')) {
      let parts = uStr.split('/');
      uNum = parseInt(parts[0]);
      uDen = parseInt(parts[1]);
    } else {
      uNum = parseInt(uStr);
      uDen = 1;
    }
    
    if (!isNaN(uNum) && !isNaN(uDen) && uNum * problem.ansDen === problem.ansNum * uDen) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  const drawGraph = () => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    let { a, b } = problem;
    
    let minX = Math.min(0, a.xVal, b.xVal);
    let maxX = Math.max(0, a.xVal, b.xVal);
    let minY = Math.min(0, a.yVal, b.yVal);
    let maxY = Math.max(0, a.yVal, b.yVal);
    
    if (problem.pattern === 'pattern4') {
      minX = Math.min(minX, a.xVal + b.xVal);
      maxX = Math.max(maxX, a.xVal + b.xVal);
      minY = Math.min(minY, a.yVal + b.yVal);
      maxY = Math.max(maxY, a.yVal + b.yVal);
    }

    let margin = 2;
    let spanX = Math.max(maxX - minX + margin*2, 4);
    let spanY = Math.max(maxY - minY + margin*2, 4);
    let scale = Math.min(W / spanX, H / spanY);
    
    let cx = (minX + maxX) / 2;
    let cy = (minY + maxY) / 2;

    const toScr = (x: number, y: number) => ({
      x: W/2 + (x - cx) * scale,
      y: H/2 - (y - cy) * scale
    });

    let origin = toScr(0, 0);

    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(W, origin.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, H); ctx.stroke();

    // Helper for arrows
    const drawArrow = (from: any, to: any, color: string, label: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      
      let angle = Math.atan2(to.y - from.y, to.x - from.x);
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - 10 * Math.cos(angle - Math.PI/6), to.y - 10 * Math.sin(angle - Math.PI/6));
      ctx.lineTo(to.x - 10 * Math.cos(angle + Math.PI/6), to.y - 10 * Math.sin(angle + Math.PI/6));
      ctx.fill();

      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(label, to.x + (to.x>from.x?5:-15), to.y + (to.y>from.y?15:-5));
    };

    let sa = toScr(a.xVal, a.yVal);
    let sb = toScr(b.xVal, b.yVal);

    if (problem.pattern === 'pattern4' && hasChecked) {
      let sc = toScr(a.xVal + b.xVal, a.yVal + b.yVal);
      // parallelogram
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sc.x, sc.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sb.x, sb.y); ctx.lineTo(sc.x, sc.y); ctx.stroke();
      ctx.setLineDash([]);
      
      drawArrow(origin, sa, '#3b82f6', 'a');
      drawArrow(origin, sb, '#ef4444', 'b');
      drawArrow(origin, sc, '#10b981', 'a+b');
    } else {
      drawArrow(origin, sa, '#3b82f6', 'a');
      drawArrow(origin, sb, '#ef4444', 'b');

      if (problem.pattern === 'pattern2' && hasChecked) {
        // Draw angle arc
        let angA = Math.atan2(sa.y - origin.y, sa.x - origin.x);
        let angB = Math.atan2(sb.y - origin.y, sb.x - origin.x);
        
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = '#fef3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.arc(origin.x, origin.y, 25, Math.min(angA, angB), Math.max(angA, angB));
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#b45309';
        let mid = (angA + angB) / 2;
        if (Math.abs(angA - angB) > Math.PI) mid += Math.PI; // wrap around
        ctx.fillText('θ', origin.x + 35*Math.cos(mid), origin.y + 35*Math.sin(mid));
      }
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  if (!problem) return null;

  let explanationEl = <></>;
  if (hasChecked) {
    explanationEl = (
      <div className="space-y-4">
        {problem.expLines.map((line, idx) => {
          if (line.includes('\\text{')) {
            return <div key={idx} className="text-gray-600 mb-1 mt-4"><MathEq math={line} /></div>;
          }
          return (
            <div key={idx} className="bg-white p-2 border rounded text-center">
              <MathEq math={line} block />
            </div>
          );
        })}
      </div>
    );
  }

  let ansDisplay = '';
  if (problem.ansDen === 1) ansDisplay = `${problem.ansNum}`;
  else ansDisplay = `\\frac{${Math.abs(problem.ansNum)}}{${problem.ansDen}}`;
  if (problem.ansNum < 0 && problem.ansDen !== 1) ansDisplay = `-\\frac{${Math.abs(problem.ansNum)}}{${problem.ansDen}}`;

  if (problem.pattern === 'pattern2') {
    ansDisplay += '^\\circ';
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          ベクトルの内積・なす角ドリル
        </h1>
        <p className="text-gray-500">
          成分表示されたベクトルの内積計算、なす角、垂直条件、大きさの平方など、ベクトルの基本操作をマスターします。
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
                <option value="pattern1">パターン1 (内積の基本計算)</option>
                <option value="pattern2">パターン2 (なす角を求める)</option>
                <option value="pattern3">パターン3 (垂直条件)</option>
                <option value="pattern4">パターン4 (大きさの平方)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center leading-relaxed">
              <MathEq math={problem.qStr} />
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 font-bold">
                <div className="text-gray-500 text-xs mb-1">
                  分数になる場合は 1/2 のようにスラッシュで入力
                  {problem.pattern === 'pattern2' && "（単位の°は不要）"}
                </div>
                <input 
                  type="text" 
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => setAnsVal(e.target.value)} 
                  placeholder="解答"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
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
                {isCorrect ? '正解！ベクトルの成分計算が完璧です。' : '不正解... 解説を見て計算手順を確認しましょう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 図解・解説
              </h2>
            </div>

            <div className="flex justify-center mb-4 bg-white border border-gray-300 shadow-sm relative">
              <canvas ref={canvasRef} width={260} height={200} className="w-full max-w-full h-auto" />
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="text-xs leading-relaxed">
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm">
                  正解: <MathEq math={ansDisplay} />
                </div>
                
                <div className="bg-gray-50 p-3 border space-y-2">
                  <p className="font-bold border-b pb-1 mb-2">計算ステップ</p>
                  {explanationEl}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
