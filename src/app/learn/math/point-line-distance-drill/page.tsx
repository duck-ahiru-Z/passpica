"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  a: number;
  b: number;
  c: number;
  px: number;
  py: number;
  ans1: number | string; // distance or k1
  ans2?: number | string; // k2 for pattern 4
  questionText: string;
}

const triples = [
  { a: 3, b: 4 }, { a: 4, b: 3 },
  { a: 5, b: 12 }, { a: 12, b: 5 },
  { a: 8, b: 15 }, { a: 15, b: 8 }
];

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let t = triples[Math.floor(Math.random() * triples.length)];
    let a = t.a * (Math.random() > 0.5 ? 1 : -1);
    let b = t.b * (Math.random() > 0.5 ? 1 : -1);
    let dist = Math.sqrt(a*a + b*b);
    let px = 0, py = 0, c = 0;
    
    if (p === 'pattern1') {
      c = Math.floor(Math.random() * 50) - 25;
      if (c === 0) continue;
      let dStr = `${Math.abs(c)}/${dist}`;
      if (c % dist === 0) dStr = `${Math.abs(c) / dist}`;
      
      let signC = c > 0 ? `+${c}` : `${c}`;
      return { 
        pattern: p, a, b, c, px: 0, py: 0, 
        ans1: dStr, 
        questionText: `原点 $(0,0)$ と 直線 $${a}x ${b>0?'+':''}${b}y ${signC} = 0$ の距離 $d$ を求めよ。`
      };
    } 
    else if (p === 'pattern2') {
      px = Math.floor(Math.random() * 10) - 5;
      py = Math.floor(Math.random() * 10) - 5;
      c = Math.floor(Math.random() * 50) - 25;
      let num = Math.abs(a * px + b * py + c);
      if (num === 0) continue; // point on line
      
      let dStr = `${num}/${dist}`;
      if (num % dist === 0) dStr = `${num / dist}`;
      
      let signC = c > 0 ? `+${c}` : (c < 0 ? `${c}` : '');
      return { 
        pattern: p, a, b, c, px, py, 
        ans1: dStr, 
        questionText: `点 $(${px}, ${py})$ と 直線 $${a}x ${b>0?'+':''}${b}y ${signC} = 0$ の距離 $d$ を求めよ。`
      };
    }
    else if (p === 'pattern3') {
      // y = mx + n form
      px = Math.floor(Math.random() * 10) - 5;
      py = Math.floor(Math.random() * 10) - 5;
      c = Math.floor(Math.random() * 30) - 15;
      
      // ax + by + c = 0 => by = -ax - c => y = (-a/b)x - c/b
      // To make it look like a nice y = mx + n, let's just write the string
      let num = Math.abs(a * px + b * py + c);
      if (num === 0) continue;
      
      let dStr = `${num}/${dist}`;
      if (num % dist === 0) dStr = `${num / dist}`;
      
      let mStr = "";
      if (-a % b === 0) mStr = `${-a/b}`;
      else if (b * -a > 0) mStr = `\\frac{${Math.abs(a)}}{${Math.abs(b)}}`;
      else mStr = `-\\frac{${Math.abs(a)}}{${Math.abs(b)}}`;
      if (mStr === "1") mStr = "";
      if (mStr === "-1") mStr = "-";
      
      let nStr = "";
      if (-c % b === 0) nStr = `${-c/b}`;
      else if (b * -c > 0) nStr = `+\\frac{${Math.abs(c)}}{${Math.abs(b)}}`;
      else nStr = `-\\frac{${Math.abs(c)}}{${Math.abs(b)}}`;
      if (-c % b === 0 && -c/b > 0 && nStr[0] !== '+') nStr = "+" + nStr;
      
      return { 
        pattern: p, a, b, c, px, py, 
        ans1: dStr, 
        questionText: `点 $(${px}, ${py})$ と 直線 $y = ${mStr}x ${nStr}$ の距離 $d$ を求めよ。`
      };
    }
    else if (p === 'pattern4') {
      // distance from (px, py) to ax+by+k=0 is distVal
      px = Math.floor(Math.random() * 10) - 5;
      py = Math.floor(Math.random() * 10) - 5;
      let distVal = Math.floor(Math.random() * 4) + 1; // distance 1..4
      // |a*px + b*py + k| / dist = distVal
      // |a*px + b*py + k| = distVal * dist
      let C_val = distVal * dist;
      let base = a * px + b * py;
      // base + k = C_val => k = C_val - base
      // base + k = -C_val => k = -C_val - base
      let k1 = C_val - base;
      let k2 = -C_val - base;
      // return smaller as ans1, larger as ans2
      if (k1 > k2) { let t=k1; k1=k2; k2=t; }
      
      return { 
        pattern: p, a, b, c: k1, px, py, // c is arbitrary here, we'll just store k1 for drawing if needed
        ans1: k1.toString(), ans2: k2.toString(),
        questionText: `点 $(${px}, ${py})$ と 直線 $${a}x ${b>0?'+':''}${b}y + k = 0$ の距離が $${distVal}$ のとき、定数 $k$ の値を求めよ。（カンマ区切りで2つ入力）`
      };
    }
  }
}

export default function PointLineDistanceDrill() {
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
    
    let uStr = ansVal.trim().replace(/\s+/g, '');
    let isOk = false;
    if (problem.pattern === 'pattern4') {
      // expect "k1,k2"
      let parts = uStr.split(',');
      if (parts.length === 2) {
        let p1 = parts[0];
        let p2 = parts[1];
        if ((p1 === String(problem.ans1) && p2 === String(problem.ans2)) ||
            (p1 === String(problem.ans2) && p2 === String(problem.ans1))) {
          isOk = true;
        }
      }
    } else {
      if (uStr === String(problem.ans1)) isOk = true;
      // Evaluate fraction if they entered 6/5 and ans is 6/5
    }
    
    setIsCorrect(isOk);
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

    let { a, b, px, py } = problem;
    let c = problem.pattern === 'pattern4' ? (Number(problem.ans1) || 0) : problem.c;
    // draw line ax+by+c=0
    // find foot of perpendicular from (px, py)
    let dist2 = a*a + b*b;
    let base = a*px + b*py + c;
    let hx = px - (a * base) / dist2;
    let hy = py - (b * base) / dist2;

    // determine scale
    let minX = Math.min(0, px, hx);
    let maxX = Math.max(0, px, hx);
    let minY = Math.min(0, py, hy);
    let maxY = Math.max(0, py, hy);
    
    // add intercepts if possible
    if (a !== 0) {
      let xInt = -c / a;
      if (xInt > minX - 10 && xInt < maxX + 10) { minX = Math.min(minX, xInt); maxX = Math.max(maxX, xInt); }
    }
    if (b !== 0) {
      let yInt = -c / b;
      if (yInt > minY - 10 && yInt < maxY + 10) { minY = Math.min(minY, yInt); maxY = Math.max(maxY, yInt); }
    }

    let margin = 3;
    let spanX = Math.max(maxX - minX + margin*2, 10);
    let spanY = Math.max(maxY - minY + margin*2, 10);
    let scale = Math.min(W / spanX, H / spanY);
    
    let cx = (minX + maxX) / 2;
    let cy = (minY + maxY) / 2;

    const toScr = (x: number, y: number) => ({
      x: W/2 + (x - cx) * scale,
      y: H/2 - (y - cy) * scale
    });

    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    let origin = toScr(0, 0);
    ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(W, origin.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, H); ctx.stroke();

    // Draw line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    // two points far away
    let p1x = cx - 20; let p1y = b !== 0 ? (-a*p1x - c)/b : 0;
    if (b === 0) p1y = cy - 20;
    let p2x = cx + 20; let p2y = b !== 0 ? (-a*p2x - c)/b : 0;
    if (b === 0) p2y = cy + 20;
    let sp1 = toScr(p1x, p1y);
    let sp2 = toScr(p2x, p2y);
    ctx.beginPath(); ctx.moveTo(sp1.x, sp1.y); ctx.lineTo(sp2.x, sp2.y); ctx.stroke();

    // Draw dashed perpendicular
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([4, 4]);
    let sP = toScr(px, py);
    let sH = toScr(hx, hy);
    ctx.beginPath(); ctx.moveTo(sP.x, sP.y); ctx.lineTo(sH.x, sH.y); ctx.stroke();
    ctx.setLineDash([]);

    // Draw points
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(sP.x, sP.y, 4, 0, Math.PI*2); ctx.fill();
    ctx.font = '12px sans-serif';
    ctx.fillText(`P(${px}, ${py})`, sP.x + 8, sP.y - 8);

    ctx.fillStyle = '#0f766e';
    ctx.beginPath(); ctx.arc(sH.x, sH.y, 3, 0, Math.PI*2); ctx.fill();
    
    // Pattern 4 disclaimer
    if (problem.pattern === 'pattern4') {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`※図は k=${problem.ans1} の場合の直線です`, 10, 20);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  if (!problem) return null;

  let explanationEl = <></>;
  if (hasChecked) {
    let rootPart = `\\sqrt{${problem.a}^2 + ${problem.b}^2}`;
    let numPart = `|${problem.a} \\cdot (${problem.px}) + ${problem.b} \\cdot (${problem.py}) + ${problem.pattern==='pattern4'?'k':problem.c}|`;
    let distInt = Math.sqrt(problem.a*problem.a + problem.b*problem.b);

    if (problem.pattern === 'pattern4') {
      let distVal = Math.abs(problem.a*problem.px + problem.b*problem.py + Number(problem.ans1)) / distInt;
      let baseVal = problem.a*problem.px + problem.b*problem.py;
      explanationEl = (
        <div className="space-y-4">
          <p>点 <MathEq math={`(${problem.px}, ${problem.py})`} /> と直線 <MathEq math={`${problem.a}x + ${problem.b}y + k = 0`} /> の距離が <MathEq math={`${distVal}`} /> なので、点と直線の距離の公式より：</p>
          <div className="bg-white p-3 border rounded text-center">
            <MathEq math={`\\frac{${numPart}}{${rootPart}} = ${distVal}`} block />
            <MathEq math={`\\frac{|${baseVal} + k|}{${distInt}} = ${distVal}`} block />
            <MathEq math={`|k ${baseVal >= 0 ? '+' : ''} ${baseVal}| = ${distVal * distInt}`} block />
            <MathEq math={`k ${baseVal >= 0 ? '+' : ''} ${baseVal} = \\pm ${distVal * distInt}`} block />
            <MathEq math={`k = ${problem.ans1}, \\quad ${problem.ans2}`} block />
          </div>
        </div>
      );
    } else if (problem.pattern === 'pattern3') {
      explanationEl = (
        <div className="space-y-4">
          <p>まず、直線の式を <MathEq math="ax+by+c=0" /> の形に変形します。</p>
          <div className="bg-white p-3 border rounded text-center mb-4">
            <MathEq math={`${problem.a}x ${problem.b>0?'+':''}${problem.b}y ${problem.c>0?'+':''}${problem.c===0?'':problem.c} = 0`} block />
          </div>
          <p>これと点 <MathEq math={`(${problem.px}, ${problem.py})`} /> との距離 <MathEq math="d" /> は、公式より：</p>
          <div className="bg-white p-3 border rounded text-center">
            <MathEq math={`d = \\frac{${numPart}}{${rootPart}}`} block />
            <MathEq math={`d = \\frac{|${problem.a * problem.px + problem.b * problem.py + problem.c}|}{${distInt}}`} block />
            <MathEq math={`d = ${problem.ans1}`} block />
          </div>
        </div>
      );
    } else {
      explanationEl = (
        <div className="space-y-4">
          <p>点と直線の距離の公式より：</p>
          <div className="bg-white p-3 border rounded text-center">
            <MathEq math={`d = \\frac{${numPart}}{${rootPart}}`} block />
            <MathEq math={`d = \\frac{|${problem.a * problem.px + problem.b * problem.py + problem.c}|}{${distInt}}`} block />
            <MathEq math={`d = ${problem.ans1}`} block />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          点と直線の距離ドリル
        </h1>
        <p className="text-gray-500">
          公式を用いて、点と直線の距離をスピーディに求める演習です。分母のルートが外れる美しいパターンを出題します。
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
                <option value="pattern1">パターン1 (原点との距離)</option>
                <option value="pattern2">パターン2 (一般の点との距離)</option>
                <option value="pattern3">パターン3 (y=mx+n の形)</option>
                <option value="pattern4">パターン4 (距離からの逆算)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[100px] gap-2 text-base font-bold text-slate-700 leading-relaxed">
              <MathEq math={problem.questionText} />
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 font-bold">
                <div className="text-gray-500 text-xs mb-1">
                  {problem.pattern === 'pattern4' 
                    ? "2つの解をカンマ区切りで入力 (例: -1, 21)" 
                    : "分数になる場合は 3/5 のようにスラッシュで入力"}
                </div>
                <input 
                  type="text" 
                  className="w-48 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => setAnsVal(e.target.value)} 
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
                {isCorrect ? '正解！素晴らしい計算力です。' : '不正解... 公式をもう一度確認しましょう。'}
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
              <canvas ref={canvasRef} width={360} height={200} className="w-full max-w-full h-auto" />
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="text-xs leading-relaxed">
                {explanationEl}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
