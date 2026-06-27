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

interface TermVal {
  num: number;
  root: number;
  den: number;
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
  a: TermVal; b: TermVal; c: TermVal;
  ansTerms?: TermVal[];
  ansAngle?: number;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  let angles = [30, 45, 60, 90, 120, 135, 150];
  let A = angles[Math.floor(Math.random() * angles.length)];
  
  if (p_type === 'pattern1') A = [60, 120][Math.floor(Math.random() * 2)];
  if (p_type === 'pattern2') A = [45, 135][Math.floor(Math.random() * 2)];
  
  let b = { num: 1, root: 1, den: 1 };
  let c = { num: 1, root: 1, den: 1 };
  let a2 = 0;
  
  while (true) {
    if (A === 60 || A === 120 || A === 90) {
      b.num = Math.floor(Math.random() * 8) + 2;
      c.num = Math.floor(Math.random() * 8) + 2;
      b.root = 1; c.root = 1;
      let cosA = A === 60 ? 1/2 : A === 120 ? -1/2 : 0;
      a2 = b.num*b.num + c.num*c.num - 2*b.num*c.num*cosA;
    } else if (A === 45 || A === 135) {
      b.num = Math.floor(Math.random() * 4) + 1;
      b.root = 2;
      c.num = Math.floor(Math.random() * 8) + 2;
      c.root = 1;
      if (p_type !== 'pattern4' && Math.random() < 0.5) { let t = b; b = c; c = t; }
      let cosA_sign = A === 45 ? 1 : -1;
      let b_is_root2 = b.root === 2;
      let b_coef = b_is_root2 ? b.num : c.num;
      let c_coef = b_is_root2 ? c.num : b.num;
      a2 = b.num*b.num*b.root + c.num*c.num*c.root - 2 * b_coef * c_coef * cosA_sign;
    } else if (A === 30 || A === 150) {
      b.num = Math.floor(Math.random() * 4) + 1;
      b.root = 3;
      c.num = Math.floor(Math.random() * 8) + 2;
      c.root = 1;
      if (p_type !== 'pattern4' && Math.random() < 0.5) { let t = b; b = c; c = t; }
      let cosA_sign = A === 30 ? 1 : -1;
      let b_is_root3 = b.root === 3;
      let b_coef = b_is_root3 ? b.num : c.num;
      let c_coef = b_is_root3 ? c.num : b.num;
      a2 = b.num*b.num*b.root + c.num*c.num*c.root - 3 * b_coef * c_coef * cosA_sign;
    }
    
    if (a2 > 0) break;
  }
  
  let a = { num: 1, root: 1, den: 1 };
  let inside = a2;
  let coeff = 1;
  for (let i = 2; i * i <= inside; i++) {
    while (inside % (i * i) === 0) {
      coeff *= i;
      inside /= (i * i);
    }
  }
  a.num = coeff;
  a.root = inside;

  let ansTerms: TermVal[] = [];
  let ansAngle: number | undefined = undefined;

  if (p_type === 'pattern1' || p_type === 'pattern2') {
    ansTerms = [a];
  } else if (p_type === 'pattern3') {
    ansAngle = A;
  } else if (p_type === 'pattern4') {
    // Solve quadratic for c: c^2 - (2b cos A) c + (b^2 - a^2) = 0
    let two_b_cosA = 0;
    if (A === 60 || A === 120 || A === 90) two_b_cosA = 2 * b.num * (A === 60 ? 0.5 : A === 120 ? -0.5 : 0);
    else if (A === 45 || A === 135) two_b_cosA = 2 * b.num * (A === 45 ? 1 : -1);
    else if (A === 30 || A === 150) two_b_cosA = 3 * b.num * (A === 30 ? 1 : -1);
    
    let c_orig = c.num;
    let c_other = two_b_cosA - c_orig;
    
    ansTerms = [c];
    if (c_other > 0 && c_other !== c_orig) {
      ansTerms.push({ num: c_other, root: 1, den: 1 });
    }
  }

  return { pattern: p_type, A, a, b, c, ansTerms, ansAngle };
}

export default function CosineRuleDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal1, setAnsVal1] = useState<FractionRootValue>(defaultFractionRoot);
  const [ansVal2, setAnsVal2] = useState<FractionRootValue>(defaultFractionRoot);
  const [ansDeg, setAnsDeg] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal'>('normal');

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
    
    let c_val = problem.c.num * Math.sqrt(problem.c.root);
    let b_val = problem.b.num * Math.sqrt(problem.b.root);
    
    // For pattern4 with 2 answers, draw the first one, or draw both if checked
    let c2_val = problem.ansTerms && problem.ansTerms.length > 1 ? problem.ansTerms[1].num * Math.sqrt(problem.ansTerms[1].root) : 0;

    // Scale
    let max_x = Math.max(c_val, b_val * Math.cos(problem.A * Math.PI / 180), c2_val);
    let min_x = Math.min(0, b_val * Math.cos(problem.A * Math.PI / 180));
    let max_y = b_val * Math.sin(problem.A * Math.PI / 180);
    
    let scale = Math.min(W * 0.8 / (max_x - min_x || 1), H * 0.7 / max_y);
    
    let ptA = { x: cx - (max_x + min_x)/2 * scale, y: cy + (max_y)/2 * scale }; // Shift origin to center
    let ptC = { x: ptA.x + b_val * Math.cos(problem.A * Math.PI / 180) * scale, y: ptA.y - b_val * Math.sin(problem.A * Math.PI / 180) * scale };
    let ptB = { x: ptA.x + c_val * scale, y: ptA.y };

    // Triangle 1
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.lineTo(ptB.x, ptB.y);
    ctx.lineTo(ptC.x, ptC.y);
    ctx.closePath();
    ctx.stroke();

    // Triangle 2 (if exists)
    if (hasChecked && c2_val > 0) {
      let ptB2 = { x: ptA.x + c2_val * scale, y: ptA.y };
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB2.x, ptB2.y);
      ctx.lineTo(ptC.x, ptC.y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw arc to show it's the same 'a' length
      ctx.strokeStyle = '#9ca3af';
      ctx.beginPath();
      let r = Math.sqrt((ptB.x - ptC.x)**2 + (ptB.y - ptC.y)**2);
      ctx.arc(ptC.x, ptC.y, r, 0, Math.PI, false);
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444';
      ctx.fillText('B\'', ptB2.x + 10, ptB2.y + 12);
    }

    // Labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', ptA.x - 10, ptA.y + 12);
    ctx.fillText('B', ptB.x + 10, ptB.y + 12);
    ctx.fillText('C', ptC.x, ptC.y - 8);

    if (hasChecked) {
      // Show angle
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(ptA.x, ptA.y, 20, -problem.A * Math.PI / 180, 0);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`${problem.A}°`, ptA.x + 35, ptA.y - 10);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal1(defaultFractionRoot);
    setAnsVal2(defaultFractionRoot);
    setAnsDeg('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let isOk = false;
    if (problem.pattern === 'pattern3') {
      isOk = parseInt(ansDeg) === problem.ansAngle;
    } else {
      let ok1 = false, ok2 = false;
      if (problem.ansTerms && problem.ansTerms.length === 1) {
        isOk = checkFractionRoot(ansVal1, 1, problem.ansTerms[0].num, problem.ansTerms[0].root, problem.ansTerms[0].den);
      } else if (problem.ansTerms && problem.ansTerms.length === 2) {
        let t1 = problem.ansTerms[0]; let t2 = problem.ansTerms[1];
        let c1_is_t1 = checkFractionRoot(ansVal1, 1, t1.num, t1.root, t1.den);
        let c1_is_t2 = checkFractionRoot(ansVal1, 1, t2.num, t2.root, t2.den);
        let c2_is_t1 = checkFractionRoot(ansVal2, 1, t1.num, t1.root, t1.den);
        let c2_is_t2 = checkFractionRoot(ansVal2, 1, t2.num, t2.root, t2.den);
        isOk = (c1_is_t1 && c2_is_t2) || (c1_is_t2 && c2_is_t1);
      }
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
          余弦定理ドリル
        </h1>
        <p className="text-gray-500">
          余弦定理 <MathEq math="a^2 = b^2 + c^2 - 2bc \cos A" /> を活用して、三角形の辺や角を瞬時に求める反復練習です。
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
                <option value="pattern1">パターン1 (対辺の長さ・整数)</option>
                <option value="pattern2">パターン2 (対辺の長さ・ルート)</option>
                <option value="pattern3">パターン3 (角度の逆算)</option>
                <option value="pattern4">パターン4 (2次方程式の利用)</option>
              </select>
            </div>

            <div className="bg-white p-4 border border-gray-300 rounded shadow-sm mb-6 flex flex-col items-center gap-3 text-lg font-bold text-slate-700">
              {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') && (
                <>
                  <p><MathEq math={`b = ${formatTerm(problem.b)}, \\quad c = ${formatTerm(problem.c)}, \\quad A = ${problem.A}^\\circ`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、辺 <MathEq math="a" /> の長さを求めよ。</p>
                </>
              )}
              {problem.pattern === 'pattern3' && (
                <>
                  <p><MathEq math={`a = ${formatTerm(problem.a)}, \\quad b = ${formatTerm(problem.b)}, \\quad c = ${formatTerm(problem.c)}`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、角 <MathEq math="A" /> を求めよ。</p>
                </>
              )}
              {problem.pattern === 'pattern4' && (
                <>
                  <p><MathEq math={`a = ${formatTerm(problem.a)}, \\quad b = ${formatTerm(problem.b)}, \\quad A = ${problem.A}^\\circ`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、辺 <MathEq math="c" /> の長さを求めよ。</p>
                  {problem.ansTerms && problem.ansTerms.length > 1 && (
                    <p className="text-sm font-normal text-red-600">※ 解が複数ある場合は両方入力してください。</p>
                  )}
                </>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-6 text-lg font-bold">
                {problem.pattern !== 'pattern3' ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                      <MathEq math={problem.pattern === 'pattern4' ? 'c =' : 'a ='} />
                      <FractionRootInput value={ansVal1} onChange={setAnsVal1} hideSign />
                    </div>
                    {problem.ansTerms && problem.ansTerms.length > 1 && (
                      <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                        <MathEq math={problem.pattern === 'pattern4' ? 'c =' : 'a ='} />
                        <FractionRootInput value={ansVal2} onChange={setAnsVal2} hideSign />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                    <MathEq math="A =" />
                    <input type="number" className="w-20 border border-gray-400 p-2 text-center" value={ansDeg} onChange={e => setAnsDeg(e.target.value)} />
                    <span className="text-base">度 (°)</span>
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
                {isCorrect ? '正解！余弦定理の計算が完璧です。' : '不正解... 符号や計算ミスに気をつけよう。'}
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
                className="border border-gray-300 bg-white shadow-sm"
              />
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                
                <div className="bg-white p-3 border text-center font-bold text-lg mb-2 text-emerald-700 shadow-sm flex flex-col gap-2">
                  正解: {problem.pattern !== 'pattern3' 
                    ? problem.ansTerms!.map(t => <MathEq key={t.num} math={formatTerm(t)} />).reduce((prev, curr) => <>{prev} , {curr}</>) 
                    : <MathEq math={`${problem.ansAngle}^\\circ`} />
                  }
                </div>

                <div className="bg-gray-50 p-2 border">
                  <p className="font-bold border-b pb-1 mb-1">余弦定理の適用</p>
                  
                  {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') && (
                    <div className="mt-2">
                      <MathEq math={`a^2 = b^2 + c^2 - 2bc \\cos A`} /><br/>
                      <MathEq math={`a^2 = (${formatTerm(problem.b)})^2 + (${formatTerm(problem.c)})^2 - 2(${formatTerm(problem.b)})(${formatTerm(problem.c)}) \\cos ${problem.A}^\\circ`} /><br/>
                      <p>値を代入して計算すると、</p>
                      <MathEq math={`a^2 = ${problem.a.num * problem.a.num * problem.a.root}`} /><br/>
                      <MathEq math={`a > 0`} /> より、<MathEq math={`a = ${formatTerm(problem.a)}`} />
                    </div>
                  )}

                  {problem.pattern === 'pattern3' && (
                    <div className="mt-2">
                      <p>余弦定理を変形した式を利用します。</p>
                      <MathEq math={`\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}`} /><br/>
                      値を代入して計算すると、<MathEq math={`\\cos A = ${problem.A === 60 ? '\\frac{1}{2}' : problem.A === 120 ? '-\\frac{1}{2}' : problem.A === 45 ? '\\frac{1}{\\sqrt{2}}' : problem.A === 135 ? '-\\frac{1}{\\sqrt{2}}' : problem.A === 30 ? '\\frac{\\sqrt{3}}{2}' : problem.A === 150 ? '-\\frac{\\sqrt{3}}{2}' : '0'}`} /> となります。<br/>
                      <MathEq math={`0^\\circ < A < 180^\\circ`} /> なので、<MathEq math={`A = ${problem.ansAngle}^\\circ`} />
                    </div>
                  )}

                  {problem.pattern === 'pattern4' && (
                    <div className="mt-2">
                      <p>辺 <MathEq math="c" /> を求めるため、余弦定理に値を代入して <MathEq math="c" /> の2次方程式を作ります。</p>
                      <MathEq math={`a^2 = b^2 + c^2 - 2bc \\cos A`} /><br/>
                      <MathEq math={`(${formatTerm(problem.a)})^2 = (${formatTerm(problem.b)})^2 + c^2 - 2(${formatTerm(problem.b)})c \\cos ${problem.A}^\\circ`} /><br/>
                      <p>整理すると、</p>
                      <MathEq math={`c^2 - ${problem.ansTerms!.length > 1 ? problem.ansTerms![0].num + problem.ansTerms![1].num : problem.ansTerms![0].num * 2}c + ${problem.ansTerms![0].num * (problem.ansTerms!.length > 1 ? problem.ansTerms![1].num : problem.ansTerms![0].num)} = 0`} /><br/>
                      これを解いて、<MathEq math={`c = ${problem.ansTerms!.map(t => formatTerm(t)).join(', ')}`} />
                      {problem.ansTerms!.length > 1 && (
                        <p className="mt-2 text-red-600 font-bold text-[10px]">※ 解が2つ正になる場合、図のように条件を満たす三角形が2種類存在します（点線の三角形）。</p>
                      )}
                    </div>
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