"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import FractionRootInput, { FractionRootValue, defaultFractionRoot, checkFractionRoot } from '@/src/components/math/FractionRootInput';

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

interface TermVal {
  num: number;
  root: number;
  den: number;
}

function getSinVal(angle: number): TermVal {
  if (angle === 30 || angle === 150) return { num: 1, root: 1, den: 2 };
  if (angle === 45 || angle === 135) return { num: 1, root: 2, den: 2 };
  if (angle === 60 || angle === 120) return { num: 1, root: 3, den: 2 };
  if (angle === 90) return { num: 1, root: 1, den: 1 };
  return { num: 0, root: 1, den: 1 };
}

function formatTerm(v: TermVal): string {
  if (v.num === 0) return '0';
  let numStr = '';
  if (v.root === 1) {
    numStr = `${v.num}`;
  } else {
    numStr = `${v.num === 1 ? '' : v.num}\\sqrt{${v.root}}`;
  }
  if (v.den === 1) return numStr;
  return `\\frac{${numStr}}{${v.den}}`;
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  A: number;
  A_rad: number;
  a: TermVal; b: TermVal; c: TermVal;
  S: TermVal;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  if (p_type === 'pattern3') {
    let db = [
      [3,4,5], [5,12,13], [13,14,15], [4,13,15], 
      [7,24,25], [9,10,17], [5,5,6], [5,5,8], [10,13,13]
    ];
    let t = db[Math.floor(Math.random() * db.length)];
    let sides = [...t];
    for (let i = sides.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sides[i], sides[j]] = [sides[j], sides[i]];
    }
    let [a, b, c] = sides;
    let s = (a+b+c)/2;
    let S_val = Math.sqrt(s*(s-a)*(s-b)*(s-c));
    let cosA = (b*b + c*c - a*a) / (2*b*c);
    let A_rad = Math.acos(cosA);
    let A_deg = Math.round(A_rad * 180 / Math.PI); // approx for display only
    
    return { 
      pattern: p_type, 
      a: {num: a, root: 1, den: 1}, 
      b: {num: b, root: 1, den: 1}, 
      c: {num: c, root: 1, den: 1}, 
      A: A_deg, A_rad, 
      S: {num: S_val, root: 1, den: 1} 
    };
  }

  let A = 0;
  if (p_type === 'pattern1') {
    A = [30, 150][Math.floor(Math.random() * 2)];
  } else {
    A = [45, 60, 120, 135][Math.floor(Math.random() * 4)];
  }

  let b = 0, c = 0;
  if (A === 30 || A === 150) {
    b = Math.floor(Math.random() * 6) + 2;
    c = Math.floor(Math.random() * 6) + 2;
    while ((b * c) % 4 !== 0) c++;
  } else {
    b = Math.floor(Math.random() * 8) + 2;
    c = Math.floor(Math.random() * 8) + 2;
    while ((b * c) % 2 !== 0) c++;
  }

  let sinVal = getSinVal(A);
  let S_num_raw = b * c * sinVal.num;
  let S_den_raw = 2 * sinVal.den; 
  let g = gcd(S_num_raw, S_den_raw);
  let S = { num: S_num_raw / g, root: sinVal.root, den: S_den_raw / g };

  let a2 = b*b + c*c - 2*b*c*Math.cos(A * Math.PI / 180);
  let a_val = Math.sqrt(a2);

  return { 
    pattern: p_type, 
    a: {num: a_val, root:1, den:1}, 
    b: {num: b, root:1, den:1}, 
    c: {num: c, root:1, den:1}, 
    A, A_rad: A * Math.PI / 180, 
    S 
  };
}

export default function TriangleAreaDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal, setAnsVal] = useState<FractionRootValue>(defaultFractionRoot);
  
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

    let cx = W / 2;
    let cy = H / 2 + 20;
    
    let c_val = problem.c.num; // integer
    let b_val = problem.b.num;
    let A_rad = problem.A_rad;

    let max_x = Math.max(c_val, b_val * Math.cos(A_rad));
    let min_x = Math.min(0, b_val * Math.cos(A_rad));
    let max_y = b_val * Math.sin(A_rad);
    
    let scale = Math.min(W * 0.8 / (max_x - min_x || 1), H * 0.7 / max_y);
    
    let ptA = { x: cx - (max_x + min_x)/2 * scale, y: cy + (max_y)/2 * scale };
    let ptC = { x: ptA.x + b_val * Math.cos(A_rad) * scale, y: ptA.y - b_val * Math.sin(A_rad) * scale };
    let ptB = { x: ptA.x + c_val * scale, y: ptA.y };

    // Draw Triangle Area
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // semi-transparent blue
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.lineTo(ptB.x, ptB.y);
    ctx.lineTo(ptC.x, ptC.y);
    ctx.closePath();
    ctx.fill();

    // Draw Triangle Borders
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pattern 4: Draw altitude
    if (problem.pattern === 'pattern4' && hasChecked) {
      let ptH = { x: ptC.x, y: ptA.y };
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ptC.x, ptC.y);
      ctx.lineTo(ptH.x, ptH.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Right angle
      ctx.strokeStyle = '#ef4444';
      let dir = ptH.x > ptA.x ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(ptH.x + 8*dir, ptH.y);
      ctx.lineTo(ptH.x + 8*dir, ptH.y - 8);
      ctx.lineTo(ptH.x, ptH.y - 8);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.fillText(`h = b \\sin A`, ptC.x + 35, ptH.y - (ptH.y - ptC.y)/2);
    }

    // Labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', ptA.x - 10, ptA.y + 12);
    ctx.fillText('B', ptB.x + 10, ptB.y + 12);
    ctx.fillText('C', ptC.x, ptC.y - 8);

    if (hasChecked) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`S = ${formatTerm(problem.S).replace(/\\/g, '').replace(/frac{([^}]*)}{([^}]*)}/g, '$1/$2')}`, cx, cy - max_y*scale/2);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal(defaultFractionRoot);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let isOk = false;
    if (problem.pattern === 'pattern4') {
      isOk = checkFractionRoot(ansVal, 1, problem.c.num, problem.c.root, problem.c.den);
    } else {
      isOk = checkFractionRoot(ansVal, 1, problem.S.num, problem.S.root, problem.S.den);
    }

    setIsCorrect(isOk);
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
          三角形の面積ドリル
        </h1>
        <p className="text-gray-500">
          面積公式 <MathEq math="S = \frac{1}{2}bc\sin A" /> やヘロンの公式を利用して、三角形の面積や辺の長さをスピーディに求める反復練習です。
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
                <option value="pattern1">パターン1 (基本・sin利用・整数)</option>
                <option value="pattern2">パターン2 (基本・ルートあり)</option>
                <option value="pattern3">パターン3 (3辺からヘロンの公式)</option>
                <option value="pattern4">パターン4 (面積からの逆算)</option>
              </select>
            </div>

            <div className="bg-white p-4 border border-gray-300 rounded shadow-sm mb-6 flex flex-col items-center gap-3 text-lg font-bold text-slate-700">
              {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') && (
                <>
                  <p><MathEq math={`b = ${formatTerm(problem.b)}, \\quad c = ${formatTerm(problem.c)}, \\quad A = ${problem.A}^\\circ`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、三角形の面積 <MathEq math="S" /> を求めよ。</p>
                </>
              )}
              {problem.pattern === 'pattern3' && (
                <>
                  <p><MathEq math={`a = ${formatTerm(problem.a)}, \\quad b = ${formatTerm(problem.b)}, \\quad c = ${formatTerm(problem.c)}`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、三角形の面積 <MathEq math="S" /> を求めよ。</p>
                </>
              )}
              {problem.pattern === 'pattern4' && (
                <>
                  <p><MathEq math={`S = ${formatTerm(problem.S)}, \\quad b = ${formatTerm(problem.b)}, \\quad A = ${problem.A}^\\circ`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、辺 <MathEq math="c" /> の長さを求めよ。</p>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-6 text-lg font-bold">
                <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                  <MathEq math={problem.pattern === 'pattern4' ? 'c =' : 'S ='} />
                  <FractionRootInput value={ansVal} onChange={setAnsVal} hideSign />
                </div>
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
                {isCorrect ? '正解！面積の計算が完璧です。' : '不正解... 公式をもう一度確認しよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・図形
              </h2>
            </div>

            <div className="flex justify-center mb-4">
              <canvas 
                ref={canvasRef} 
                width={250} 
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
                  正解: <MathEq math={problem.pattern === 'pattern4' ? formatTerm(problem.c) : formatTerm(problem.S)} />
                </div>

                <div className="bg-gray-50 p-2 border">
                  
                  {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') && (
                    <>
                      <p className="font-bold border-b pb-1 mb-1">面積公式 <MathEq math="S = \frac{1}{2}bc\sin A" /> の適用</p>
                      <div className="mt-2">
                        <MathEq math={`S = \\frac{1}{2} \\times ${formatTerm(problem.b)} \\times ${formatTerm(problem.c)} \\times \\sin ${problem.A}^\\circ`} /><br/>
                        <MathEq math={`S = \\frac{1}{2} \\times ${problem.b.num * problem.c.num} \\times \\frac{${getSinVal(problem.A).num === 1 && getSinVal(problem.A).root === 1 ? '1' : `\\sqrt{${getSinVal(problem.A).root}}`}}{${getSinVal(problem.A).den}}`} /><br/>
                        <p>これを計算して、</p>
                        <MathEq math={`S = ${formatTerm(problem.S)}`} />
                      </div>
                    </>
                  )}

                  {problem.pattern === 'pattern3' && (
                    <>
                      <p className="font-bold border-b pb-1 mb-1">ヘロンの公式の適用</p>
                      <div className="mt-2">
                        <p>まず、<MathEq math="s = \frac{a+b+c}{2}" /> を求めます。</p>
                        <MathEq math={`s = \\frac{${formatTerm(problem.a)} + ${formatTerm(problem.b)} + ${formatTerm(problem.c)}}{2} = \\frac{${problem.a.num + problem.b.num + problem.c.num}}{2} = ${(problem.a.num + problem.b.num + problem.c.num)/2}`} /><br/>
                        <p>次に、<MathEq math="S = \sqrt{s(s-a)(s-b)(s-c)}" /> に代入します。</p>
                        <MathEq math={`S = \\sqrt{${(problem.a.num + problem.b.num + problem.c.num)/2} \\times ${((problem.a.num + problem.b.num + problem.c.num)/2) - problem.a.num} \\times ${((problem.a.num + problem.b.num + problem.c.num)/2) - problem.b.num} \\times ${((problem.a.num + problem.b.num + problem.c.num)/2) - problem.c.num}}`} /><br/>
                        <p>計算すると、</p>
                        <MathEq math={`S = ${formatTerm(problem.S)}`} />
                      </div>
                    </>
                  )}

                  {problem.pattern === 'pattern4' && (
                    <>
                      <p className="font-bold border-b pb-1 mb-1">面積公式からの逆算方程式</p>
                      <div className="mt-2">
                        <MathEq math={`S = \\frac{1}{2}bc\\sin A`} /><br/>
                        <MathEq math={`${formatTerm(problem.S)} = \\frac{1}{2} \\times ${formatTerm(problem.b)} \\times c \\times \\sin ${problem.A}^\\circ`} /><br/>
                        <MathEq math={`${formatTerm(problem.S)} = \\frac{1}{2} \\times ${formatTerm(problem.b)} \\times c \\times \\frac{${getSinVal(problem.A).num === 1 && getSinVal(problem.A).root === 1 ? '1' : `\\sqrt{${getSinVal(problem.A).root}}`}}{${getSinVal(problem.A).den}}`} /><br/>
                        <p>これを <MathEq math="c" /> について解くと、</p>
                        <MathEq math={`c = ${formatTerm(problem.c)}`} />
                      </div>
                    </>
                  )}

                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}