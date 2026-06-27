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

type InequalityType = '<' | '>' | '\\le' | '\\ge';
type AnsType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  a: number; b: number; c: number;
  ineqSign: InequalityType;
  roots: Root[]; // 2 roots (sorted) or 1 root (D=0)
  ansType: AnsType;
  eq: string;
}

function getAnsType(a: number, D: number, sign: InequalityType): AnsType {
  if (D > 0) {
    if (a > 0) {
      if (sign === '<') return 1;
      if (sign === '\\le') return 3;
      if (sign === '>') return 2;
      if (sign === '\\ge') return 4;
    } else {
      if (sign === '<') return 2;
      if (sign === '\\le') return 4;
      if (sign === '>') return 1;
      if (sign === '\\ge') return 3;
    }
  } else if (D === 0) {
    if (a > 0) {
      if (sign === '<') return 8; // 解なし
      if (sign === '\\le') return 5; // x = p
      if (sign === '>') return 6; // x != p
      if (sign === '\\ge') return 7; // すべての実数
    } else {
      if (sign === '<') return 6; // x != p
      if (sign === '\\le') return 7; // すべての実数
      if (sign === '>') return 8; // 解なし
      if (sign === '\\ge') return 5; // x = p
    }
  }
  return 8;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  const signs: InequalityType[] = ['<', '>', '\\le', '\\ge'];

  while (true) {
    let sign = signs[Math.floor(Math.random() * signs.length)];
    let p, q, r, s, a, b, c;
    let roots: Root[] = [];

    if (p_type === 'pattern4') {
      let root_val = Math.floor(Math.random() * 19) - 9;
      let sign_a = Math.random() < 0.5 ? 1 : -1;
      a = sign_a;
      b = -2 * sign_a * root_val;
      c = sign_a * root_val * root_val;
      roots = [simplifyFraction(root_val, 1)];
      if (a === 0 || b === 0 || c === 0) continue; // to make it look like a full polynomial
    } else {
      if (p_type === 'pattern1') {
        p = 1; r = 1;
        q = Math.floor(Math.random() * 11) - 5;
        s = Math.floor(Math.random() * 11) - 5;
      } else if (p_type === 'pattern2') {
        p = -1; r = 1;
        q = Math.floor(Math.random() * 11) - 5;
        s = Math.floor(Math.random() * 11) - 5;
      } else {
        // pattern3
        p = Math.floor(Math.random() * 5) + 1;
        r = Math.floor(Math.random() * 5) + 1;
        if (p === 1 && r === 1) r = 2;
        q = Math.floor(Math.random() * 11) - 5;
        s = Math.floor(Math.random() * 11) - 5;
      }
      if (q === 0 || s === 0) continue;
      
      let root1 = simplifyFraction(-q, p);
      let root2 = simplifyFraction(-s, r);
      let v1 = root1.num / root1.den;
      let v2 = root2.num / root2.den;
      if (v1 === v2) continue; // D>0 needs distinct roots
      
      roots = v1 < v2 ? [root1, root2] : [root2, root1];
      a = p * r;
      b = p * s + q * r;
      c = q * s;
    }

    if (a === 0) continue;

    let D = b * b - 4 * a * c;
    let ansType = getAnsType(a, D, sign);

    let eq = '';
    if (a === 1) eq += 'x^2';
    else if (a === -1) eq += '-x^2';
    else eq += `${a}x^2`;
    
    if (b > 0) eq += ` + ${b === 1 ? '' : b}x`;
    else if (b < 0) eq += ` - ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
    
    if (c > 0) eq += ` + ${c}`;
    else if (c < 0) eq += ` - ${Math.abs(c)}`;

    eq += ` ${sign} 0`;
    
    return { pattern: p_type, a, b, c, ineqSign: sign, roots, ansType, eq };
  }
}

export default function QuadraticInequalityDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [userAnsType, setUserAnsType] = useState<AnsType>(1);
  const [ans1Num, setAns1Num] = useState<string>('');
  const [ans1Den, setAns1Den] = useState<string>('');
  const [ans2Num, setAns2Num] = useState<string>('');
  const [ans2Den, setAns2Den] = useState<string>('');
  
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

    const D = problem.b * problem.b - 4 * problem.a * problem.c;
    const vx = -problem.b / (2 * problem.a);
    const vy = -D / (4 * problem.a);

    let minX = vx - 4;
    let maxX = vx + 4;
    
    if (problem.roots.length === 2) {
      let r1 = problem.roots[0].num / problem.roots[0].den;
      let r2 = problem.roots[1].num / problem.roots[1].den;
      minX = r1 - 2;
      maxX = r2 + 2;
    }

    let rangeX = maxX - minX;
    const func = (x: number) => problem.a * x * x + problem.b * x + problem.c;
    
    let minY = vy;
    let maxY = vy;
    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let y = func(x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    if (minY > 0) minY = -1;
    if (maxY < 0) maxY = 1;
    
    let rangeY = maxY - minY;
    minY -= rangeY * 0.1;
    maxY += rangeY * 0.1;
    rangeY = maxY - minY;

    const mapX = (x: number) => ((x - minX) / rangeX) * W;
    const mapY = (y: number) => H - ((y - minY) / rangeY) * H;

    // x-axis
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0));
    ctx.lineTo(W, mapY(0));
    ctx.stroke();
    
    // y-axis
    if (minX <= 0 && 0 <= maxX) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mapX(0), 0);
      ctx.lineTo(mapX(0), H);
      ctx.stroke();
    }

    if (hasChecked) {
      // Fill Region
      ctx.fillStyle = problem.ineqSign === '<' || problem.ineqSign === '\\le' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        let x = minX + (rangeX * i) / 200;
        let y = func(x);
        let condition = false;
        if (problem.ineqSign === '<' || problem.ineqSign === '\\le') condition = y <= 0;
        else condition = y >= 0;
        
        if (condition) {
          if (i === 0 || !((problem.ineqSign === '<' || problem.ineqSign === '\\le') ? func(minX + (rangeX * (i-1))/200) <= 0 : func(minX + (rangeX * (i-1))/200) >= 0)) {
            ctx.moveTo(mapX(x), mapY(y));
          }
          ctx.lineTo(mapX(x), mapY(0));
        }
      }
      ctx.fill();

      // Draw Roots Dots
      ctx.fillStyle = '#000';
      problem.roots.forEach(r => {
        let x = r.num / r.den;
        ctx.beginPath();
        if (problem.ineqSign === '<' || problem.ineqSign === '>') {
          ctx.arc(mapX(x), mapY(0), 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#000';
        } else {
          ctx.arc(mapX(x), mapY(0), 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        let txt = r.den === 1 ? `${r.num}` : `${r.num}/${r.den}`;
        ctx.fillText(txt, mapX(x), mapY(0) + 16);
      });
    }

    // Parabola
    ctx.strokeStyle = problem.a > 0 ? '#3b82f6' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let y = func(x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setUserAnsType(1);
    setAns1Num(''); setAns1Den('');
    setAns2Num(''); setAns2Den('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    if (userAnsType !== problem.ansType) {
      setIsCorrect(false);
      setHasChecked(true);
      return;
    }
    
    // Type 7 and 8 have no inputs
    if (problem.ansType === 7 || problem.ansType === 8) {
      setIsCorrect(true);
      setHasChecked(true);
      return;
    }
    
    const parse = (nStr: string, dStr: string) => {
      let num = parseInt(nStr);
      let den = dStr.trim() === '' ? 1 : parseInt(dStr);
      if (isNaN(num)) num = 0;
      if (isNaN(den) || den === 0) den = 1;
      return simplifyFraction(num, den);
    };

    let u1 = parse(ans1Num, ans1Den);
    let r1 = problem.roots[0];
    
    if (problem.ansType === 5 || problem.ansType === 6) {
      if (u1.num === r1.num && u1.den === r1.den) setIsCorrect(true);
      else setIsCorrect(false);
    } else {
      let u2 = parse(ans2Num, ans2Den);
      let r2 = problem.roots[1];
      if (u1.num === r1.num && u1.den === r1.den && u2.num === r2.num && u2.den === r2.den) setIsCorrect(true);
      else setIsCorrect(false);
    }
    
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
          2次不等式の解ドリル
        </h1>
        <p className="text-gray-500">
          放物線とx軸の位置関係をイメージして、2次不等式を素早く正確に解く反復練習です。
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
                <option value="pattern1">パターン1 (基本・内側/外側)</option>
                <option value="pattern2">パターン2 (マイナス係数)</option>
                <option value="pattern3">パターン3 (解が分数)</option>
                <option value="pattern4">パターン4 (D=0の特殊解)</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700 mb-4">
                解の形を選んでから、数値を入力してください。
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 1} onChange={() => setUserAnsType(1)} />
                  <MathEq math="A < x < B" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 3} onChange={() => setUserAnsType(3)} />
                  <MathEq math="A \le x \le B" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 2} onChange={() => setUserAnsType(2)} />
                  <MathEq math="x < A, \quad B < x" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 4} onChange={() => setUserAnsType(4)} />
                  <MathEq math="x \le A, \quad B \le x" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 5} onChange={() => setUserAnsType(5)} />
                  <MathEq math="x = A" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 6} onChange={() => setUserAnsType(6)} />
                  <MathEq math="x \neq A \text{ のすべての実数}" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 7} onChange={() => setUserAnsType(7)} />
                  すべての実数
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 8} onChange={() => setUserAnsType(8)} />
                  解なし
                </label>
              </div>

              <div className="flex items-center justify-center h-16 text-lg font-bold">
                {userAnsType === 1 && <>{renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)} <span className="mx-2"><MathEq math="< x <" /></span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den)}</>}
                {userAnsType === 3 && <>{renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)} <span className="mx-2"><MathEq math="\le x \le" /></span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den)}</>}
                {userAnsType === 2 && <>x <span className="mx-2"><MathEq math="<" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)} <span className="mx-2">,</span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den)} <span className="mx-2"><MathEq math="<" /></span> x</>}
                {userAnsType === 4 && <>x <span className="mx-2"><MathEq math="\le" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)} <span className="mx-2">,</span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den)} <span className="mx-2"><MathEq math="\le" /></span> x</>}
                {userAnsType === 5 && <>x <span className="mx-2"><MathEq math="=" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)}</>}
                {userAnsType === 6 && <>x <span className="mx-2"><MathEq math="\neq" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den)} <span className="ml-2 text-sm font-normal">のすべての実数</span></>}
                {userAnsType === 7 && <span className="text-blue-600">すべての実数</span>}
                {userAnsType === 8 && <span className="text-red-600">解なし</span>}
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
                {isCorrect ? '正解！グラフで領域を視覚的に確認しよう。' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・領域グラフ
              </h2>
              {hasChecked && (
                <div className="flex gap-1 text-[10px]">
                  <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                  <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                </div>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <canvas 
                ref={canvasRef} 
                width={300} 
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
                
                {problem.a < 0 && (
                  <div className="bg-red-50 p-2 border border-red-200">
                    <p className="font-bold text-red-600 mb-1">【重要】最初に x² の係数をプラスにする！</p>
                    <p>両辺に <MathEq math="-1" /> を掛けます。<strong className="text-red-600 underline">このとき不等号の向きが逆になることに注意！</strong></p>
                    <MathEq math={`${-problem.a === 1 ? '' : -problem.a}x^2 ${-problem.b > 0 ? '+' : ''} ${-problem.b === 1 ? '' : -problem.b === -1 ? '-' : -problem.b}x ${-problem.c > 0 ? '+' : ''} ${-problem.c === 0 ? '' : -problem.c} ${problem.ineqSign === '<' ? '>' : problem.ineqSign === '>' ? '<' : problem.ineqSign === '\\le' ? '\\ge' : '\\le'} 0`} block />
                  </div>
                )}

                {problem.roots.length === 2 && (
                  <div className="bg-gray-50 p-2 border">
                    <p>因数分解すると、左辺は <MathEq math={`= 0`} /> のとき、<MathEq math={`x = ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}, \\quad ${problem.roots[1].den === 1 ? problem.roots[1].num : `\\frac{${problem.roots[1].num}}{${problem.roots[1].den}}`}`} /> となります。</p>
                    <p>グラフを描くと、{problem.a > 0 ? '下に凸' : '上に凸'}の放物線になります。</p>
                    <p className="mt-2">今回は {problem.ineqSign === '<' || problem.ineqSign === '\\le' ? '0より小さい（0以下）なので、x軸より「下」' : '0より大きい（0以上）なので、x軸より「上」'} の部分を探します。</p>
                    <p>グラフの色付き部分に対応する $x$ の範囲が答えです。</p>
                  </div>
                )}

                {problem.roots.length === 1 && (
                  <div className="bg-gray-50 p-2 border">
                    <p>左辺は完全平方式 <MathEq math={`(${problem.a > 0 ? '' : '-'}(x - ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`})^2`} /> になります。</p>
                    <p>判別式 <MathEq math="D=0" /> であり、放物線は x軸と <MathEq math={`x = ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}`} /> で接します。</p>
                    <p className="mt-2">グラフから、{problem.ineqSign === '<' || problem.ineqSign === '\\le' ? '0より小さい（0以下）' : '0より大きい（0以上）'} 条件を満たす $x$ を探します。</p>
                    <ul className="list-disc pl-4 mt-1">
                      {problem.ansType === 5 && <li>接点のみが条件を満たすため、答えは <MathEq math={`x = ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}`} /> となります。</li>}
                      {problem.ansType === 6 && <li>接点以外はすべて条件を満たすため、答えは <MathEq math={`x \\neq ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}`} /> のすべての実数です。</li>}
                      {problem.ansType === 7 && <li>すべての点で条件を満たすため、答えは「すべての実数」です。</li>}
                      {problem.ansType === 8 && <li>条件を満たす点はひとつもないため、答えは「解なし」です。</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
