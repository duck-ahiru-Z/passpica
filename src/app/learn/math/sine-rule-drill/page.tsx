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

function simplifyTerm(num: number, root: number, den: number): TermVal {
  let g = gcd(num, den);
  return { num: num / g, root, den: den / g };
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  A: number; B: number; C: number;
  R: number;
  a: TermVal; b: TermVal; c: TermVal;
  ratioStr?: string;
  ansTerm?: TermVal;
  ansAngle?: number;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  if (p_type === 'pattern4') {
    let sets = [
      { angles: [30, 60, 90], ratio: "1 : \\sqrt{3} : 2" },
      { angles: [45, 45, 90], ratio: "1 : 1 : \\sqrt{2}" },
      { angles: [30, 30, 120], ratio: "1 : 1 : \\sqrt{3}" }
    ];
    let set = sets[Math.floor(Math.random() * sets.length)];
    let angles = [...set.angles];
    // shuffle
    for (let i = angles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [angles[i], angles[j]] = [angles[j], angles[i]];
    }
    let maxAngle = Math.max(...angles);
    
    // ratio corresponds to sides a:b:c which is sinA:sinB:sinC
    // we just use the set ratio, assuming it matches the sorted angles.
    // actually, let's build the ratio dynamically to match A, B, C!
    let sinA = getSinVal(angles[0]);
    let sinB = getSinVal(angles[1]);
    let sinC = getSinVal(angles[2]);
    // To format ratio properly, we just multiply by 2.
    const getRatioPart = (s: TermVal) => s.root === 1 ? `${s.num * 2 / s.den}` : `${s.num * 2 / s.den === 1 ? '' : s.num * 2 / s.den}\\sqrt{${s.root}}`;
    let ratioStr = `${getRatioPart(sinA)} : ${getRatioPart(sinB)} : ${getRatioPart(sinC)}`;

    return {
      pattern: p_type,
      A: angles[0], B: angles[1], C: angles[2],
      R: 1, a: {num:1,root:1,den:1}, b: {num:1,root:1,den:1}, c: {num:1,root:1,den:1},
      ratioStr, ansAngle: maxAngle
    };
  }

  // Common for 1, 2, 3
  let angles = [30, 45, 60, 90, 120, 135, 150];
  let A = 0, B = 0, C = 0;
  while (true) {
    A = angles[Math.floor(Math.random() * angles.length)];
    B = angles[Math.floor(Math.random() * angles.length)];
    if (A + B < 180) {
      C = 180 - A - B;
      break;
    }
  }

  let R = Math.floor(Math.random() * 5) + 2; // 2 to 6

  let sinA = getSinVal(A);
  let sinB = getSinVal(B);
  let sinC = getSinVal(C);

  let a = simplifyTerm(2 * R * sinA.num, sinA.root, sinA.den);
  let b = simplifyTerm(2 * R * sinB.num, sinB.root, sinB.den);
  let c = simplifyTerm(2 * R * sinC.num, sinC.root, sinC.den);

  return {
    pattern: p_type, A, B, C, R, a, b, c,
    ansTerm: p_type === 'pattern1' ? {num: R, root: 1, den: 1} : b,
    ansAngle: B
  };
}

export default function SineRuleDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal, setAnsVal] = useState<FractionRootValue>(defaultFractionRoot);
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
    let cy = H / 2;
    let radius = 60;

    // Outer circle
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Center point
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Angles
    let A_rad = problem.A * Math.PI / 180;
    let B_rad = problem.B * Math.PI / 180;
    let C_rad = problem.C * Math.PI / 180;

    // A at top
    let angA = -Math.PI / 2;
    let angB = angA - 2 * C_rad;
    let angC = angA + 2 * B_rad;

    let ax = cx + radius * Math.cos(angA); let ay = cy + radius * Math.sin(angA);
    let bx = cx + radius * Math.cos(angB); let by = cy + radius * Math.sin(angB);
    let c_x = cx + radius * Math.cos(angC); let cy_pt = cy + radius * Math.sin(angC);

    // Triangle
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(c_x, cy_pt);
    ctx.closePath();
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', ax, ay - 8);
    ctx.fillText('B', bx - 10, by + 12);
    ctx.fillText('C', c_x + 10, cy_pt + 12);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('O', cx, cy + 15);

    if (hasChecked) {
      // Draw R
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ax, ay);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.fillText(`R = ${problem.R}`, cx + 20, cy - 20);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal(defaultFractionRoot);
    setAnsDeg('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let isOk = false;
    if (problem.pattern === 'pattern1' || problem.pattern === 'pattern2') {
      if (problem.ansTerm) {
        isOk = checkFractionRoot(ansVal, 1, problem.ansTerm.num, problem.ansTerm.root, problem.ansTerm.den);
      }
    } else {
      isOk = parseInt(ansDeg) === problem.ansAngle;
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
          正弦定理と外接円ドリル
        </h1>
        <p className="text-gray-500">
          正弦定理 <MathEq math="\frac{a}{\sin A} = \frac{b}{\sin B} = 2R" /> を活用して、三角形の辺・角・外接円の半径を瞬時に求める反復練習です。
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
                <option value="pattern1">パターン1 (外接円の半径 R)</option>
                <option value="pattern2">パターン2 (未知の辺の長さ)</option>
                <option value="pattern3">パターン3 (未知の角度)</option>
                <option value="pattern4">パターン4 (最大角の判定)</option>
              </select>
            </div>

            <div className="bg-white p-4 border border-gray-300 rounded shadow-sm mb-6 flex flex-col items-center gap-3 text-lg font-bold text-slate-700">
              {problem.pattern === 'pattern1' && (
                <>
                  <p><MathEq math={`A = ${problem.A}^\\circ, \\quad a = ${formatTerm(problem.a)}`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、外接円の半径 <MathEq math="R" /> を求めよ。</p>
                </>
              )}
              {problem.pattern === 'pattern2' && (
                <>
                  <p><MathEq math={`A = ${problem.A}^\\circ, \\quad B = ${problem.B}^\\circ, \\quad a = ${formatTerm(problem.a)}`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、辺 <MathEq math="b" /> の長さを求めよ。</p>
                </>
              )}
              {problem.pattern === 'pattern3' && (
                <>
                  <p><MathEq math={`a = ${formatTerm(problem.a)}, \\quad b = ${formatTerm(problem.b)}, \\quad A = ${problem.A}^\\circ`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、角 <MathEq math="B" /> を求めよ。（<MathEq math="B" /> は鋭角とする）</p>
                </>
              )}
              {problem.pattern === 'pattern4' && (
                <>
                  <p><MathEq math={`\\sin A : \\sin B : \\sin C = ${problem.ratioStr}`} /></p>
                  <p className="text-base font-normal text-blue-700">このとき、最大の角の大きさを求めよ。</p>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-6 text-lg font-bold">
                {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') ? (
                  <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                    <MathEq math={problem.pattern === 'pattern1' ? 'R =' : 'b ='} />
                    <FractionRootInput value={ansVal} onChange={setAnsVal} hideSign />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                    <MathEq math={problem.pattern === 'pattern3' ? 'B =' : '\\text{最大の角 } ='} />
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
                {isCorrect ? '正解！正弦定理を使いこなせています。' : '不正解... 正弦定理の公式を確認しよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・外接円グラフ
              </h2>
            </div>

            <div className="flex justify-center mb-4">
              <canvas 
                ref={canvasRef} 
                width={200} 
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
                  正解: {problem.pattern === 'pattern1' || problem.pattern === 'pattern2' 
                    ? <MathEq math={formatTerm(problem.ansTerm!)} /> 
                    : <MathEq math={`${problem.ansAngle}^\\circ`} />
                  }
                </div>

                <div className="bg-gray-50 p-2 border">
                  <p className="font-bold border-b pb-1 mb-1">正弦定理の適用</p>
                  <p>正弦定理 <MathEq math="\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R" /> を利用します。</p>
                  
                  {problem.pattern === 'pattern1' && (
                    <div className="mt-2">
                      <MathEq math={`2R = \\frac{a}{\\sin A} = \\frac{${formatTerm(problem.a)}}{\\sin ${problem.A}^\\circ}`} /><br/>
                      <MathEq math={`2R = ${formatTerm(problem.a)} \\div \\frac{${getSinVal(problem.A).num === 1 && getSinVal(problem.A).root === 1 ? '1' : `\\sqrt{${getSinVal(problem.A).root}}`}}{${getSinVal(problem.A).den}}`} /><br/>
                      <MathEq math={`R = ${formatTerm(problem.ansTerm!)}`} />
                    </div>
                  )}

                  {problem.pattern === 'pattern2' && (
                    <div className="mt-2">
                      <MathEq math={`\\frac{b}{\\sin B} = \\frac{a}{\\sin A}`} /><br/>
                      <MathEq math={`b = \\frac{a \\sin B}{\\sin A} = \\frac{${formatTerm(problem.a)} \\times \\sin ${problem.B}^\\circ}{\\sin ${problem.A}^\\circ}`} /><br/>
                      これを計算して、<MathEq math={`b = ${formatTerm(problem.ansTerm!)}`} />
                    </div>
                  )}

                  {problem.pattern === 'pattern3' && (
                    <div className="mt-2">
                      <MathEq math={`\\frac{a}{\\sin A} = \\frac{b}{\\sin B}`} /><br/>
                      <MathEq math={`\\sin B = \\frac{b \\sin A}{a} = \\frac{${formatTerm(problem.b)} \\times \\sin ${problem.A}^\\circ}{${formatTerm(problem.a)}}`} /><br/>
                      計算すると <MathEq math={`\\sin B = ${formatTerm(getSinVal(problem.B))}`} /> となります。<br/>
                      <MathEq math="B" /> は鋭角なので、<MathEq math={`B = ${problem.ansAngle}^\\circ`} />
                    </div>
                  )}

                  {problem.pattern === 'pattern4' && (
                    <div className="mt-2">
                      <p>正弦定理より、辺の比と sin の比は一致します。</p>
                      <MathEq math={`a : b : c = \\sin A : \\sin B : \\sin C = ${problem.ratioStr}`} /><br/>
                      <p>三角形において、「最大の角は最大の辺の向かいにある」という性質があります。</p>
                      <p>比の中で最も大きいのは <MathEq math={problem.ansAngle === problem.A ? 'a' : problem.ansAngle === problem.B ? 'b' : 'c'} /> なので、最大の角は <MathEq math={`${problem.ansAngle}^\\circ`} /> となります。</p>
                      <p className="text-gray-500 text-[10px] mt-1">※ 実際の辺の長さがこの比率になるのは、角度が {problem.A}°, {problem.B}°, {problem.C}° の三角形です。</p>
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