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
  eq: string;
  conditionText: string;
  ansType: 'values' | 'value' | 'ineq' | 'between';
  params: any;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  if (p_type === 'pattern1') {
    let a, c;
    while (true) {
      a = Math.floor(Math.random() * 4) + 1;
      c = Math.floor(Math.random() * 9) + 1;
      let sqrt = Math.sqrt(4 * a * c);
      if (Number.isInteger(sqrt)) {
        let k1 = sqrt;
        let k2 = -sqrt;
        let eq = `y = ${a === 1 ? '' : a}x^2 + kx + ${c}`;
        return { 
          pattern: p_type, eq, ansType: 'values', conditionText: "x軸と接する（共有点が1つ）",
          params: { a, c, k_ans: [k1, k2] }
        };
      }
    }
  }
  
  if (p_type === 'pattern2') {
    let a = Math.floor(Math.random() * 5) + 1;
    if (Math.random() < 0.5) a = -a;
    let b = Math.floor(Math.random() * 11) - 5;
    if (b === 0) b = 1;
    let eq = `y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x + k`;
    let boundary = simplifyFraction(b * b, 4 * a);
    let sign = a > 0 ? '<' : '>';
    return { 
      pattern: p_type, eq, ansType: 'ineq', conditionText: "x軸と異なる2点で交わる",
      params: { a, b, k_boundary: boundary, k_ineq_sign: sign }
    };
  }
  
  if (p_type === 'pattern3') {
    let r1 = Math.floor(Math.random() * 9) - 4;
    let r2 = Math.floor(Math.random() * 9) - 4;
    if (r1 >= r2) { r1--; r2++; }
    let sum = r1 + r2;
    let mProd = - (r1 * r2);
    let cStr = '';
    if (sum !== 0) cStr += `${sum === 1 ? '' : sum === -1 ? '-' : sum}k`;
    if (mProd !== 0) {
      if (cStr) cStr += mProd > 0 ? ` + ${mProd}` : ` - ${-mProd}`;
      else cStr += `${mProd}`;
    }
    if (cStr === '') cStr = '0';
    let hasParens = sum !== 0 && mProd !== 0;
    let eq = `y = x^2 + 2kx + ${hasParens ? `(${cStr})` : cStr}`;
    return { 
      pattern: p_type, eq, ansType: 'between', conditionText: "x軸と共有点をもたない",
      params: { sum, mProd, k_r1: r1, k_r2: r2, cStr }
    };
  }
  
  if (p_type === 'pattern4') {
    let b = Math.floor(Math.random() * 8) + 2;
    let c = Math.floor(Math.random() * 4) + 1;
    if (Math.random() < 0.5) c = -c;
    let eq = `y = kx^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
    let k_ans = simplifyFraction(b * b, 4 * c);
    return { 
      pattern: p_type, eq, ansType: 'value', conditionText: "x軸と接する（共有点が1つ）",
      params: { b, c, k_ans }
    };
  }

  throw new Error("Invalid pattern");
}

function evaluateFunction(p: ProblemData, k: number, x: number): number {
  if (p.pattern === 'pattern1') {
    return p.params.a * x * x + k * x + p.params.c;
  }
  if (p.pattern === 'pattern2') {
    return p.params.a * x * x + p.params.b * x + k;
  }
  if (p.pattern === 'pattern3') {
    return x * x + 2 * k * x + (p.params.sum * k + p.params.mProd);
  }
  if (p.pattern === 'pattern4') {
    return k * x * x + p.params.b * x + p.params.c;
  }
  return 0;
}

export default function DiscriminantDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // Graph Slider State
  const [kVal, setKVal] = useState<number>(0);
  
  // Answers
  const [ans1Num, setAns1Num] = useState(''); const [ans1Den, setAns1Den] = useState('');
  const [ans2Num, setAns2Num] = useState(''); const [ans2Den, setAns2Den] = useState('');
  const [ansIneqSign, setAnsIneqSign] = useState<'<' | '>'>('<');
  
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

    // Calculate dynamic range based on current k
    let minX = -6; let maxX = 6;
    let rangeX = maxX - minX;
    
    // Y range fixed to prevent jumpy graphs, or slightly dynamic
    let minY = -15; let maxY = 15;
    let rangeY = maxY - minY;

    const mapX = (x: number) => ((x - minX) / rangeX) * W;
    const mapY = (y: number) => H - ((y - minY) / rangeY) * H;

    // x-axis and y-axis
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0)); ctx.lineTo(W, mapY(0));
    ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), H);
    ctx.stroke();

    // draw parabola
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    // For pattern4, if k=0 it's a line
    if (problem.pattern === 'pattern4' && kVal === 0) {
      ctx.strokeStyle = '#ef4444';
    }

    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let y = evaluateFunction(problem, kVal, x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();
    
    // Current k text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`k = ${kVal.toFixed(1)}`, 10, 20);
  };

  useEffect(() => {
    drawGraph();
  }, [problem, kVal]);

  const handleNext = () => {
    let p = generateProblem(selectedPattern);
    setProblem(p);
    setAns1Num(''); setAns1Den('');
    setAns2Num(''); setAns2Den('');
    setAnsIneqSign('<');
    
    // default kVal nicely
    if (p.ansType === 'values') setKVal(0);
    if (p.ansType === 'value') setKVal(p.params.k_ans.num / p.params.k_ans.den + 2);
    if (p.ansType === 'ineq') setKVal(p.params.k_boundary.num / p.params.k_boundary.den);
    if (p.ansType === 'between') setKVal(0);
    
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const parse = (nStr: string, dStr: string) => {
      let num = parseInt(nStr);
      let den = dStr.trim() === '' ? 1 : parseInt(dStr);
      if (isNaN(num)) return null;
      if (isNaN(den) || den === 0) den = 1;
      return simplifyFraction(num, den);
    };

    let u1 = parse(ans1Num, ans1Den);
    let u2 = parse(ans2Num, ans2Den);

    let correct = false;

    if (problem.ansType === 'values') {
      if (u1 && u2) {
        let v1 = u1.num / u1.den;
        let v2 = u2.num / u2.den;
        let ans = problem.params.k_ans;
        if ((v1 === ans[0] && v2 === ans[1]) || (v1 === ans[1] && v2 === ans[0])) correct = true;
      }
    } else if (problem.ansType === 'value') {
      if (u1) {
        let ans = problem.params.k_ans;
        if (u1.num === ans.num && u1.den === ans.den) correct = true;
      }
    } else if (problem.ansType === 'ineq') {
      if (u1) {
        let ans = problem.params.k_boundary;
        if (u1.num === ans.num && u1.den === ans.den && ansIneqSign === problem.params.k_ineq_sign) correct = true;
      }
    } else if (problem.ansType === 'between') {
      if (u1 && u2) {
        let v1 = u1.num / u1.den;
        let v2 = u2.num / u2.den;
        let ans1 = problem.params.k_r1;
        let ans2 = problem.params.k_r2;
        if (v1 === ans1 && v2 === ans2) correct = true; // since r1 < r2
      }
    }

    setIsCorrect(correct);
    setHasChecked(true);
  };

  if (!problem) return null;

  const renderInputBox = (numState: string, setNum: (s:string)=>void, denState: string, setDen: (s:string)=>void) => (
    <div className="flex flex-col items-center justify-center inline-flex align-middle">
      <input type="text" className="w-10 border border-gray-400 p-1 text-center font-bold" value={numState} onChange={e => setNum(e.target.value)} />
      <div className="w-full border-b-2 border-slate-800 my-0.5"></div>
      <input type="text" className="w-10 border border-gray-400 p-1 text-center font-bold bg-gray-50" value={denState} onChange={e => setDen(e.target.value)} placeholder="1" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          判別式と共有点の個数ドリル
        </h1>
        <p className="text-gray-500">
          定数 <MathEq math="k" /> を含む方程式の判別式を利用して、グラフとx軸の位置関係を調べる演習です。
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
                <option value="pattern1">パターン1 (接する条件・2つ)</option>
                <option value="pattern2">パターン2 (共有点の範囲)</option>
                <option value="pattern3">パターン3 (D/4の利用)</option>
                <option value="pattern4">パターン4 (2次の係数に文字)</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700 mb-4 bg-yellow-50 py-2 border border-yellow-200">
                このグラフが <span className="text-red-600">{problem.conditionText}</span> ように定数 <MathEq math="k" /> の値（または範囲）を求めよ。
              </div>
              
              <div className="flex items-center justify-center h-16 text-lg font-bold">
                {problem.ansType === 'values' && (
                  <>k = <span className="ml-2">{renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)}</span> <span className="mx-2">,</span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den)}</>
                )}
                {problem.ansType === 'value' && (
                  <>k = <span className="ml-2">{renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)}</span></>
                )}
                {problem.ansType === 'ineq' && (
                  <>k <select value={ansIneqSign} onChange={e => setAnsIneqSign(e.target.value as '<'|'>')} className="mx-2 border p-1"><option value="<">&lt;</option><option value=">">&gt;</option></select> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)}</>
                )}
                {problem.ansType === 'between' && (
                  <>{renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)} <span className="mx-2"><MathEq math="< k <" /></span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den)}</>
                )}
              </div>

              <div className="text-[10px] text-gray-500 text-center mt-4">
                ※ 答えが整数の場合、分母は空欄（または1）にしてください。<br/>
                ※ 順不同です（2つ値がある場合や範囲の場合）。
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
                {isCorrect ? '正解！グラフのスライダーを動かして確認してみよう。' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・シミュレーター
              </h2>
              {hasChecked && (
                <div className="flex gap-1 text-[10px]">
                  <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                  <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center items-center mb-6">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={200} 
                className="border border-gray-300 bg-white shadow-sm mb-2"
              />
              <div className="w-[300px] flex items-center gap-2 text-[10px] font-bold text-gray-600">
                <span>kを動かす:</span>
                <input 
                  type="range" 
                  min="-15" max="15" step="0.5" 
                  value={kVal} 
                  onChange={e => setKVal(parseFloat(e.target.value))}
                  className="flex-1"
                />
              </div>
              <div className="text-[9px] text-gray-400 mt-1">スライダーを動かしてグラフの変化とx軸の交点を確認してください。</div>
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                {problem.pattern === 'pattern4' && (
                  <div className="bg-red-50 border border-red-200 p-2 mb-2">
                    <p className="font-bold text-red-600 mb-1">【重要】「2次関数」という隠れた条件</p>
                    <p>問題文に「2次関数」とあるため、<MathEq math="x^2" /> の係数である <MathEq math="k" /> は絶対に <MathEq math="0" /> にはなりません。<MathEq math="k \neq 0" /> の前提を忘れないようにしましょう。</p>
                  </div>
                )}

                <div className="bg-gray-50 p-2 border">
                  <p className="font-bold border-b pb-1 mb-1">判別式 <MathEq math="D" /> による条件の立式</p>
                  <p>{problem.conditionText}ので、方程式を <MathEq math="= 0" /> とおいたときの判別式 <MathEq math="D" /> は、</p>
                  <div className="text-center font-bold text-blue-700 my-2">
                    {problem.ansType === 'values' || problem.ansType === 'value' ? <MathEq math="D = 0" /> : problem.ansType === 'ineq' ? <MathEq math="D > 0" /> : <MathEq math="D < 0" />}
                  </div>
                  <p>となります。</p>
                </div>

                <div className="bg-gray-50 p-2 border">
                  <p className="font-bold border-b pb-1 mb-1">計算の実行</p>
                  {problem.pattern === 'pattern1' && (
                    <>
                      <MathEq math={`D = k^2 - 4 \\cdot ${problem.params.a} \\cdot ${problem.params.c} = k^2 - ${4 * problem.params.a * problem.params.c} = 0`} /><br/>
                      これを解いて、<MathEq math={`k = \\pm ${problem.params.k_ans[0]}`} />。
                    </>
                  )}
                  {problem.pattern === 'pattern2' && (
                    <>
                      <MathEq math={`D = (${problem.params.b})^2 - 4 \\cdot (${problem.params.a}) \\cdot k > 0`} /><br/>
                      <MathEq math={`${problem.params.b * problem.params.b} - ${4 * problem.params.a}k > 0`} /><br/>
                      <MathEq math={`${-4 * problem.params.a}k > -${problem.params.b * problem.params.b}`} /><br/>
                      <p className="text-red-600 font-bold mt-1">※ 負の数で割る場合は不等号の向きが反転します！</p>
                      これを解いて、<MathEq math={`k ${problem.params.k_ineq_sign} ${problem.params.k_boundary.den === 1 ? problem.params.k_boundary.num : `\\frac{${problem.params.k_boundary.num}}{${problem.params.k_boundary.den}}`}`} />。
                    </>
                  )}
                  {problem.pattern === 'pattern3' && (
                    <>
                      <p className="text-emerald-700 font-bold mb-1">※ xの係数が2の倍数なので、<MathEq math="D/4" /> の公式を使うと計算量が減ります！</p>
                      <MathEq math={`D/4 = k^2 - 1 \\cdot (${problem.params.cStr}) < 0`} /><br/>
                      <MathEq math={`k^2 ${problem.params.sum !== 0 ? problem.params.sum > 0 ? '-' : '+' : ''} ${Math.abs(problem.params.sum)===1?'':Math.abs(problem.params.sum)}k ${problem.params.mProd !== 0 ? problem.params.mProd > 0 ? '-' : '+' : ''} ${Math.abs(problem.params.mProd)} < 0`} /><br/>
                      <MathEq math={`(k ${problem.params.k_r1 > 0 ? '-' : '+'} ${Math.abs(problem.params.k_r1)})(k ${problem.params.k_r2 > 0 ? '-' : '+'} ${Math.abs(problem.params.k_r2)}) < 0`} /><br/>
                      これを解いて、<MathEq math={`${problem.params.k_r1} < k < ${problem.params.k_r2}`} />。
                    </>
                  )}
                  {problem.pattern === 'pattern4' && (
                    <>
                      <MathEq math={`D = (${problem.params.b})^2 - 4 \\cdot k \\cdot (${problem.params.c}) = 0`} /><br/>
                      <MathEq math={`${problem.params.b * problem.params.b} ${-4 * problem.params.c > 0 ? '+' : ''} ${-4 * problem.params.c}k = 0`} /><br/>
                      これを解いて、<MathEq math={`k = ${problem.params.k_ans.den === 1 ? problem.params.k_ans.num : `\\frac{${problem.params.k_ans.num}}{${problem.params.k_ans.den}}`}`} />。<br/>
                      これは <MathEq math="k \neq 0" /> を満たすため適する。
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
