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

function simplifyTerm(num: number, root: number, den: number): TermVal {
  let g = gcd(num, den);
  return { num: num / g, root, den: den / g };
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
  a: number; b: number; c: number;
  s: number; S: number;
  r: TermVal; r_val: number;
  R: TermVal; R_val: number;
  ra: TermVal; ra_val: number;
  isRight: boolean;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  let a = 0, b = 0, c = 0;
  let isRight = false;

  if (p_type === 'pattern1') {
    let db = [
      [3,4,5], [5,12,13], [8,15,17], [7,24,25], [9,40,41]
    ];
    let t = db[Math.floor(Math.random() * db.length)];
    c = t[2]; a = t[0]; b = t[1];
    if (Math.random() < 0.5) { let temp = a; a = b; b = temp; }
    isRight = true;
  } else {
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
    a = sides[0]; b = sides[1]; c = sides[2];
    if (a*a+b*b===c*c || b*b+c*c===a*a || c*c+a*a===b*b) isRight = true;
  }

  let s_val = (a+b+c)/2;
  let S_val = Math.sqrt(s_val*(s_val-a)*(s_val-b)*(s_val-c));
  
  let r_val = S_val / s_val;
  let r_term = simplifyTerm(S_val * 2, 1, a+b+c);

  let R_val = (a*b*c) / (4*S_val);
  let R_term = simplifyTerm(a*b*c, 1, 4*S_val);

  let ra_val = S_val / (s_val-a);
  let ra_term = simplifyTerm(S_val * 2, 1, b+c-a);

  return {
    pattern: p_type,
    a, b, c, s: s_val, S: S_val,
    r: r_term, r_val,
    R: R_term, R_val,
    ra: ra_term, ra_val,
    isRight
  };
}

export default function InscribedCircleDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal1, setAnsVal1] = useState<FractionRootValue>(defaultFractionRoot);
  const [ansVal2, setAnsVal2] = useState<FractionRootValue>(defaultFractionRoot);
  
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

    let { a, b, c } = problem;
    let cosA = (b*b + c*c - a*a) / (2*b*c);
    let sinA = Math.sqrt(1 - cosA*cosA);
    
    // Use y-up coordinates first, then map to canvas (y-down)
    let ptA = { x: 0, y: 0 };
    let ptB = { x: c, y: 0 };
    let ptC = { x: b*cosA, y: b*sinA };
    
    let I_x = (a*ptA.x + b*ptB.x + c*ptC.x) / (a+b+c);
    let I_y = (a*ptA.y + b*ptB.y + c*ptC.y) / (a+b+c);
    let r = problem.r_val;

    let O_x = c / 2;
    let O_y = (b - c*cosA) / (2*sinA);
    let R = problem.R_val;

    let Ia_x = (-a*ptA.x + b*ptB.x + c*ptC.x) / (-a+b+c);
    let Ia_y = (-a*ptA.y + b*ptB.y + c*ptC.y) / (-a+b+c);
    let ra = problem.ra_val;

    let objects = [ptA, ptB, ptC];
    if (problem.pattern === 'pattern4') {
      objects.push({x: Ia_x, y: Ia_y + ra});
      objects.push({x: Ia_x, y: Ia_y - ra});
      objects.push({x: Ia_x + ra, y: Ia_y});
      objects.push({x: Ia_x - ra, y: Ia_y});
    } else if (problem.pattern === 'pattern3') {
      objects.push({x: O_x, y: O_y + R});
      objects.push({x: O_x, y: O_y - R});
      objects.push({x: O_x + R, y: O_y});
      objects.push({x: O_x - R, y: O_y});
      objects.push({x: I_x, y: I_y + r});
      objects.push({x: I_x, y: I_y - r});
    } else {
      objects.push({x: I_x, y: I_y + r});
      objects.push({x: I_x, y: I_y - r});
    }

    let minX = Math.min(...objects.map(o => o.x));
    let maxX = Math.max(...objects.map(o => o.x));
    let minY = Math.min(...objects.map(o => o.y));
    let maxY = Math.max(...objects.map(o => o.y));

    let cx = (minX + maxX) / 2;
    let cy = (minY + maxY) / 2;
    let scale = Math.min(W * 0.8 / (maxX - minX || 1), H * 0.8 / (maxY - minY || 1));

    const mapPt = (pt: {x: number, y: number}) => ({
      x: W/2 + (pt.x - cx) * scale,
      y: H/2 - (pt.y - cy) * scale // invert y for canvas
    });

    let mA = mapPt(ptA);
    let mB = mapPt(ptB);
    let mC = mapPt(ptC);
    let mI = mapPt({x: I_x, y: I_y});
    let mO = mapPt({x: O_x, y: O_y});
    let mIa = mapPt({x: Ia_x, y: Ia_y});

    // Pattern 4: Extend lines for excircle
    if (problem.pattern === 'pattern4') {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // extend AB
      let extB = mapPt({x: c + 1000, y: 0});
      ctx.moveTo(mB.x, mB.y); ctx.lineTo(extB.x, extB.y);
      // extend AC
      let extC = mapPt({x: b*cosA + 1000*cosA, y: b*sinA + 1000*sinA});
      ctx.moveTo(mC.x, mC.y); ctx.lineTo(extC.x, extC.y);
      ctx.stroke();

      // Excircle
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mIa.x, mIa.y, ra * scale, 0, 2*Math.PI);
      ctx.stroke();

      // Center
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(mIa.x, mIa.y, 3, 0, 2*Math.PI);
      ctx.fill();

      // Radius
      ctx.strokeStyle = '#8b5cf6';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(mIa.x, mIa.y);
      ctx.lineTo(mIa.x, mIa.y + ra * scale); // to extended AB
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Triangle
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mA.x, mA.y);
    ctx.lineTo(mB.x, mB.y);
    ctx.lineTo(mC.x, mC.y);
    ctx.closePath();
    ctx.stroke();

    // Incircle (for 1, 2, 3)
    if (problem.pattern !== 'pattern4') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mI.x, mI.y, r * scale, 0, 2*Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(mI.x, mI.y, 3, 0, 2*Math.PI);
      ctx.fill();

      if (hasChecked) {
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(mI.x, mI.y);
        ctx.lineTo(mI.x, mI.y + r * scale); // drop to AB
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Circumcircle (for 3)
    if (problem.pattern === 'pattern3') {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mO.x, mO.y, R * scale, 0, 2*Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(mO.x, mO.y, 3, 0, 2*Math.PI);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', mA.x - 10, mA.y + 12);
    ctx.fillText('B', mB.x + 10, mB.y + 12);
    ctx.fillText('C', mC.x, mC.y - 8);
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal1(defaultFractionRoot);
    setAnsVal2(defaultFractionRoot);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let isOk = false;
    if (problem.pattern === 'pattern4') {
      isOk = checkFractionRoot(ansVal1, 1, problem.ra.num, problem.ra.root, problem.ra.den);
    } else if (problem.pattern === 'pattern3') {
      let okR = checkFractionRoot(ansVal1, 1, problem.R.num, problem.R.root, problem.R.den);
      let okr = checkFractionRoot(ansVal2, 1, problem.r.num, problem.r.root, problem.r.den);
      isOk = okR && okr;
    } else {
      isOk = checkFractionRoot(ansVal1, 1, problem.r.num, problem.r.root, problem.r.den);
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
          内接円・傍接円の半径ドリル
        </h1>
        <p className="text-gray-500">
          三角形の面積公式 <MathEq math="S = \frac{1}{2}r(a+b+c)" /> などを利用して、内接円・外接円・傍接円の半径を求める総合演習です。
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
                <option value="pattern1">パターン1 (直角三角形の内接円)</option>
                <option value="pattern2">パターン2 (一般の三角形の内接円)</option>
                <option value="pattern3">パターン3 (外接円との複合)</option>
                <option value="pattern4">パターン4 (傍接円の半径・発展)</option>
              </select>
            </div>

            <div className="bg-white p-4 border border-gray-300 rounded shadow-sm mb-6 flex flex-col items-center gap-3 text-lg font-bold text-slate-700">
              <p><MathEq math={`a = ${problem.a}, \\quad b = ${problem.b}, \\quad c = ${problem.c}`} /></p>
              
              {problem.pattern === 'pattern4' ? (
                <p className="text-base font-normal text-blue-700">このとき、角 <MathEq math="A" /> 内の傍接円の半径 <MathEq math="r_A" /> を求めよ。</p>
              ) : problem.pattern === 'pattern3' ? (
                <p className="text-base font-normal text-blue-700">このとき、外接円の半径 <MathEq math="R" /> と内接円の半径 <MathEq math="r" /> を求めよ。</p>
              ) : (
                <p className="text-base font-normal text-blue-700">このとき、内接円の半径 <MathEq math="r" /> を求めよ。</p>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-6 text-lg font-bold">
                {problem.pattern === 'pattern3' ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                      <MathEq math="R =" />
                      <FractionRootInput value={ansVal1} onChange={setAnsVal1} hideSign />
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                      <MathEq math="r =" />
                      <FractionRootInput value={ansVal2} onChange={setAnsVal2} hideSign />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                    <MathEq math={problem.pattern === 'pattern4' ? 'r_A =' : 'r ='} />
                    <FractionRootInput value={ansVal1} onChange={setAnsVal1} hideSign />
                  </div>
                )}
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
                {isCorrect ? '正解！面積を活用した半径の計算が完璧です。' : '不正解... ヘロンの公式や内接円の面積公式を確認しよう。'}
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
                  {problem.pattern === 'pattern3' ? (
                    <>
                      <MathEq math={`R = ${formatTerm(problem.R)}`} />
                      <MathEq math={`r = ${formatTerm(problem.r)}`} />
                    </>
                  ) : problem.pattern === 'pattern4' ? (
                    <MathEq math={`r_A = ${formatTerm(problem.ra)}`} />
                  ) : (
                    <MathEq math={`r = ${formatTerm(problem.r)}`} />
                  )}
                </div>

                <div className="bg-gray-50 p-2 border">
                  
                  <p className="font-bold border-b pb-1 mb-1">面積 <MathEq math="S" /> を求める</p>
                  <div className="mt-2 mb-4">
                    {problem.isRight ? (
                      <p>この三角形は <MathEq math={`${problem.a}^2 + ${problem.b}^2 = ${problem.c}^2`} /> を満たす直角三角形です。面積は、<MathEq math={`S = \\frac{1}{2} \\times ${problem.a} \\times ${problem.b} = ${problem.S}`} /> となります。</p>
                    ) : (
                      <p>ヘロンの公式を利用します。<MathEq math={`s = \\frac{${problem.a} + ${problem.b} + ${problem.c}}{2} = ${problem.s}`} /> とし、<MathEq math={`S = \\sqrt{${problem.s}(${problem.s}-${problem.a})(${problem.s}-${problem.b})(${problem.s}-${problem.c})} = ${problem.S}`} /> となります。</p>
                    )}
                  </div>

                  {(problem.pattern !== 'pattern4') && (
                    <>
                      <p className="font-bold border-b pb-1 mb-1">内接円の半径 <MathEq math="r" /> の計算</p>
                      <div className="mt-2 mb-4">
                        <MathEq math={`S = \\frac{1}{2}r(a+b+c)`} /> より、<br/>
                        <MathEq math={`r = \\frac{2S}{a+b+c} = \\frac{2 \\times ${problem.S}}{${problem.a} + ${problem.b} + ${problem.c}} = \\frac{${2*problem.S}}{${problem.a+problem.b+problem.c}}`} /><br/>
                        <p>計算して、</p>
                        <MathEq math={`r = ${formatTerm(problem.r)}`} />
                      </div>
                    </>
                  )}

                  {problem.pattern === 'pattern3' && (
                    <>
                      <p className="font-bold border-b pb-1 mb-1">外接円の半径 <MathEq math="R" /> の計算</p>
                      <div className="mt-2">
                        <MathEq math={`S = \\frac{abc}{4R}`} /> より、<br/>
                        <MathEq math={`R = \\frac{abc}{4S} = \\frac{${problem.a} \\times ${problem.b} \\times ${problem.c}}{4 \\times ${problem.S}}`} /><br/>
                        <p>計算して、</p>
                        <MathEq math={`R = ${formatTerm(problem.R)}`} />
                      </div>
                    </>
                  )}

                  {problem.pattern === 'pattern4' && (
                    <>
                      <p className="font-bold border-b pb-1 mb-1">傍接円の半径 <MathEq math="r_A" /> の計算</p>
                      <div className="mt-2">
                        <p>角 <MathEq math="A" /> 内の傍接円の半径は、<MathEq math={`S = \\frac{1}{2}r_A(-a+b+c)`} /> で求められます。</p>
                        <MathEq math={`r_A = \\frac{2S}{-a+b+c} = \\frac{2 \\times ${problem.S}}{-${problem.a} + ${problem.b} + ${problem.c}} = \\frac{${2*problem.S}}{${-problem.a+problem.b+problem.c}}`} /><br/>
                        <p>計算して、</p>
                        <MathEq math={`r_A = ${formatTerm(problem.ra)}`} />
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