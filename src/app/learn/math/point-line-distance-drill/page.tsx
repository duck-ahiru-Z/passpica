"use client";

import { useCallback, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { generatePointLineDistanceProblem, type PointLinePattern, type PointLineProblem } from '@/src/lib/pointLineDistance';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathText({ text }: { text: string }) {
  return (
    <>
      {text.split('$').map((part, index) =>
        index % 2 === 1 ? <MathEq key={index} math={part} /> : <span key={index}>{part}</span>,
      )}
    </>
  );
}

type Pattern = PointLinePattern;
type ProblemData = PointLineProblem;

function formatSignedProduct(coefficient: number, value: number, first = false) {
  const product = coefficient * value;
  // A zero coordinate hides the coefficient's sign in the product; keep it visible
  // so the worked substitution still matches the signed line equation.
  const sign = product < 0 || (product === 0 && coefficient < 0) ? '−' : '+';
  const term = `${Math.abs(coefficient)} \\cdot ${Math.abs(value)}`;
  return first ? `${sign === '−' ? '−' : ''}${term}` : ` ${sign} ${term}`;
}

function formatSignedConstant(value: number) {
  return ` ${value < 0 ? '−' : '+'} ${Math.abs(value)}`;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  return generatePointLineDistanceProblem(selectedPattern);
}

export default function PointLineDistanceDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useClientGeneratedState<ProblemData>(() => generateProblem('mix'));
  
  const [ansVal, setAnsVal] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handlePatternChange = (pattern: Pattern | 'mix') => {
    setSelectedPattern(pattern);
    setProblem(generateProblem(pattern));
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const uStr = ansVal.trim().replace(/\s+/g, '');
    let isOk = false;
    if (problem.pattern === 'pattern4') {
      // expect "k1,k2"
      const parts = uStr.split(',');
      if (parts.length === 2) {
        const p1 = parts[0];
        const p2 = parts[1];
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

  const drawGraph = useCallback(() => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { a, b, px, py } = problem;
    const c = problem.pattern === 'pattern4' ? (Number(problem.ans1) || 0) : problem.c;
    // draw line ax+by+c=0
    // find foot of perpendicular from (px, py)
    const dist2 = a*a + b*b;
    const base = a*px + b*py + c;
    const hx = px - (a * base) / dist2;
    const hy = py - (b * base) / dist2;

    // determine scale
    let minX = Math.min(0, px, hx);
    let maxX = Math.max(0, px, hx);
    let minY = Math.min(0, py, hy);
    let maxY = Math.max(0, py, hy);
    
    // add intercepts if possible
    if (a !== 0) {
      const xInt = -c / a;
      if (xInt > minX - 10 && xInt < maxX + 10) { minX = Math.min(minX, xInt); maxX = Math.max(maxX, xInt); }
    }
    if (b !== 0) {
      const yInt = -c / b;
      if (yInt > minY - 10 && yInt < maxY + 10) { minY = Math.min(minY, yInt); maxY = Math.max(maxY, yInt); }
    }

    const margin = 3;
    const spanX = Math.max(maxX - minX + margin*2, 10);
    const spanY = Math.max(maxY - minY + margin*2, 10);
    const scale = Math.min(W / spanX, H / spanY);
    
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const toScr = (x: number, y: number) => ({
      x: W/2 + (x - cx) * scale,
      y: H/2 - (y - cy) * scale
    });

    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const origin = toScr(0, 0);
    ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(W, origin.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, H); ctx.stroke();

    // Draw line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    // two points far away
    const p1x = cx - 20; let p1y = b !== 0 ? (-a*p1x - c)/b : 0;
    if (b === 0) p1y = cy - 20;
    const p2x = cx + 20; let p2y = b !== 0 ? (-a*p2x - c)/b : 0;
    if (b === 0) p2y = cy + 20;
    const sp1 = toScr(p1x, p1y);
    const sp2 = toScr(p2x, p2y);
    ctx.beginPath(); ctx.moveTo(sp1.x, sp1.y); ctx.lineTo(sp2.x, sp2.y); ctx.stroke();

    // Draw dashed perpendicular
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([4, 4]);
    const sP = toScr(px, py);
    const sH = toScr(hx, hy);
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
  }, [problem]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph, hasChecked]);

  if (!problem) return null;

  let explanationEl = <></>;
  if (hasChecked) {
    const rootPart = `\\sqrt{(${problem.a})^2 + (${problem.b})^2}`;
    const baseVal = problem.a * problem.px + problem.b * problem.py;
    const numPart = problem.pattern === 'pattern4'
      ? `|${baseVal} + k|`
      : `|${formatSignedProduct(problem.a, problem.px, true)}${formatSignedProduct(problem.b, problem.py)}${formatSignedConstant(problem.c)}|`;
    const distInt = Math.sqrt(problem.a*problem.a + problem.b*problem.b);

    if (problem.pattern === 'pattern4') {
      const distVal = Math.abs(problem.a*problem.px + problem.b*problem.py + Number(problem.ans1)) / distInt;
      const lineA = `${problem.a < 0 ? '−' : ''}${Math.abs(problem.a)}x`;
      const lineB = `${problem.b < 0 ? '−' : '+'} ${Math.abs(problem.b)}y`;
      explanationEl = (
        <div className="space-y-4">
          <p>点 <MathEq math={`(${problem.px}, ${problem.py})`} /> と直線 <MathEq math={`${lineA} ${lineB} + k = 0`} /> の距離が <MathEq math={`${distVal}`} /> なので、点と直線の距離の公式より：</p>
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
                onChange={e => handlePatternChange(e.target.value as Pattern | 'mix')}
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
              <MathText text={problem.questionText} />
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
                  onChange={e => { setAnsVal(e.target.value); setHasChecked(false); setIsCorrect(false); }}
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
