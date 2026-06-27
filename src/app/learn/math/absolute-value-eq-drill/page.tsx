"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- 数学ユーティリティ ---
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
  a: number;
  b: number;
  c?: number;
  d?: number;
  roots: Root[];
  invalidRoot?: Root;
  v1?: boolean; // pattern3でどちらの場合分けが有効だったか
  eqStr: string; // 左辺と右辺を結合した数式文字列
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  if (p === 'pattern1') {
    let a = Math.floor(Math.random() * 19) - 9; // -9 to 9
    let b = Math.floor(Math.random() * 9) + 1;  // 1 to 9 (b > 0)
    let roots = [
      simplifyFraction(a + b, 1),
      simplifyFraction(a - b, 1)
    ];
    let eqStr = `|x ${a < 0 ? '+' : '-'} ${Math.abs(a)}| = ${b}`;
    if (a === 0) eqStr = `|x| = ${b}`;
    return { pattern: p, a, b, roots, eqStr };
  }
  
  if (p === 'pattern2') {
    let a = Math.floor(Math.random() * 8) + 2; // 2 to 9
    let b = Math.floor(Math.random() * 19) - 9;
    let c = Math.floor(Math.random() * 9) + 1; // 1 to 9
    let roots = [
      simplifyFraction(b + c, a),
      simplifyFraction(b - c, a)
    ];
    let eqStr = `|${a}x ${b < 0 ? '+' : '-'} ${Math.abs(b)}| = ${c}`;
    if (b === 0) eqStr = `|${a}x| = ${c}`;
    return { pattern: p, a, b, c, roots, eqStr };
  }
  
  if (p === 'pattern3') {
    while (true) {
      let a = Math.floor(Math.random() * 8) + 2;
      let b = Math.floor(Math.random() * 19) - 9;
      let c = Math.floor(Math.random() * 19) - 9;
      let d = Math.floor(Math.random() * 19) - 9;
      
      if (a === c || a === -c) continue;
      
      let x1 = simplifyFraction(b + d, a - c); // ax-b >= 0 の場合: (a-c)x = b+d
      let x2 = simplifyFraction(b - d, a + c); // ax-b < 0 の場合: (a+c)x = b-d
      
      let v1 = (a * x1.num / x1.den - b) >= 0;
      let v2 = (a * x2.num / x2.den - b) < 0;
      
      // 無縁根が確実に1つ出る（解が1つになる）組み合わせを探す
      if ((v1 && !v2) || (!v1 && v2)) {
        let validRoot = v1 ? x1 : x2;
        let invalidRoot = v1 ? x2 : x1;
        
        let eqLeft = `|${a}x ${b < 0 ? '+' : '-'} ${Math.abs(b)}|`;
        if (b === 0) eqLeft = `|${a}x|`;
        
        let eqRight = '';
        if (c === 1) eqRight += 'x';
        else if (c === -1) eqRight += '-x';
        else if (c !== 0) eqRight += `${c}x`;
        
        if (d > 0 && c !== 0) eqRight += ` + ${d}`;
        else if (d < 0 && c !== 0) eqRight += ` - ${Math.abs(d)}`;
        else if (c === 0) eqRight = `${d}`;
        else if (d > 0 && c === 0) eqRight = `${d}`;
        
        let eqStr = `${eqLeft} = ${eqRight}`;
        
        return { pattern: p, a, b, c, d, roots: [validRoot], invalidRoot, v1, eqStr };
      }
    }
  }
  
  if (p === 'pattern4') {
    while (true) {
      let a = Math.floor(Math.random() * 19) - 9;
      let b = Math.floor(Math.random() * 19) - 9;
      if (a >= b) continue;
      let c = Math.floor(Math.random() * 15) + 1;
      if (c <= b - a) continue; // 解が存在する条件
      
      let roots = [
        simplifyFraction(a + b + c, 2),
        simplifyFraction(a + b - c, 2)
      ];
      
      let left1 = a < 0 ? `+ ${Math.abs(a)}` : `- ${a}`;
      let left2 = b < 0 ? `+ ${Math.abs(b)}` : `- ${b}`;
      if (a === 0) left1 = '';
      if (b === 0) left2 = '';
      
      let eqStr = `|x ${left1}| + |x ${left2}| = ${c}`;
      return { pattern: p, a, b, c, roots, eqStr };
    }
  }
  
  throw new Error("Invalid pattern");
}

export default function AbsoluteValueEqDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // ユーザー入力 (分数対応のため分子・分母で管理)
  const [ans1Num, setAns1Num] = useState<string>('');
  const [ans1Den, setAns1Den] = useState<string>('');
  const [ans2Num, setAns2Num] = useState<string>('');
  const [ans2Den, setAns2Den] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const drawGraph = () => {
    if (!problem || !canvasRef.current || !showGraph) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    let funcL: (x: number) => number = () => 0;
    let funcR: (x: number) => number = () => 0;
    let turnPoints: number[] = [];

    if (problem.pattern === 'pattern1') {
      funcL = (x) => Math.abs(x - problem.a);
      funcR = (x) => problem.b;
      turnPoints = [problem.a];
    } else if (problem.pattern === 'pattern2') {
      funcL = (x) => Math.abs(problem.a * x - problem.b);
      funcR = (x) => problem.c!;
      turnPoints = [problem.b / problem.a];
    } else if (problem.pattern === 'pattern3') {
      funcL = (x) => Math.abs(problem.a * x - problem.b);
      funcR = (x) => problem.c! * x + problem.d!;
      turnPoints = [problem.b / problem.a];
    } else if (problem.pattern === 'pattern4') {
      funcL = (x) => Math.abs(x - problem.a) + Math.abs(x - problem.b);
      funcR = (x) => problem.c!;
      turnPoints = [problem.a, problem.b];
    }

    const rootsX = problem.roots.map(r => r.num / r.den);
    let minX = Math.min(...rootsX, ...turnPoints) - 3;
    let maxX = Math.max(...rootsX, ...turnPoints) + 3;

    if (problem.pattern === 'pattern3' && problem.invalidRoot) {
      const invX = problem.invalidRoot.num / problem.invalidRoot.den;
      minX = Math.min(minX, invX - 1);
      maxX = Math.max(maxX, invX + 1);
    }

    const rangeX = maxX - minX;
    
    // Y range calculation
    let minY = -2;
    let maxY = 2;
    // Sample points to find max Y
    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let yL = funcL(x);
      let yR = funcR(x);
      maxY = Math.max(maxY, yL, yR);
      minY = Math.min(minY, yL, yR);
    }
    maxY += 2;
    minY = Math.min(-1, minY - 1);
    const rangeY = maxY - minY;

    const mapX = (x: number) => ((x - minX) / rangeX) * W;
    const mapY = (y: number) => H - ((y - minY) / rangeY) * H;

    // 軸
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0));
    ctx.lineTo(W, mapY(0));
    ctx.stroke();
    if (minX <= 0 && 0 <= maxX) {
      ctx.beginPath();
      ctx.moveTo(mapX(0), 0);
      ctx.lineTo(mapX(0), H);
      ctx.stroke();
    }

    // funcL (青)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      let x = minX + (rangeX * i) / 200;
      if (i === 0) ctx.moveTo(mapX(x), mapY(funcL(x)));
      else ctx.lineTo(mapX(x), mapY(funcL(x)));
    }
    ctx.stroke();

    // funcR (赤)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      let x = minX + (rangeX * i) / 200;
      if (i === 0) ctx.moveTo(mapX(x), mapY(funcR(x)));
      else ctx.lineTo(mapX(x), mapY(funcR(x)));
    }
    ctx.stroke();

    if (hasChecked) {
      // 交点プロット (有効な解)
      ctx.fillStyle = '#10b981';
      problem.roots.forEach(r => {
        let x = r.num / r.den;
        let y = funcL(x);
        ctx.beginPath();
        ctx.arc(mapX(x), mapY(y), 5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#10b981';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(mapX(x), mapY(y));
        ctx.lineTo(mapX(x), mapY(0));
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#065f46';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`x = ${r.num}${r.den !== 1 ? '/' + r.den : ''}`, mapX(x), mapY(-0.5));
      });

      // 無縁根プロット (パターン3)
      if (problem.pattern === 'pattern3' && problem.invalidRoot) {
        let x = problem.invalidRoot.num / problem.invalidRoot.den;
        let yL = funcL(x);
        let yR = funcR(x);
        
        // 偽の交点 (赤い直線上の点)
        ctx.fillStyle = '#f59e0b'; // amber-500
        ctx.beginPath();
        ctx.arc(mapX(x), mapY(yR), 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(mapX(x), mapY(yR));
        ctx.lineTo(mapX(x), mapY(0));
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#b45309';
        ctx.fillText(`無縁根`, mapX(x), mapY(-0.5));
      }
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked, showGraph]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAns1Num(''); setAns1Den('');
    setAns2Num(''); setAns2Den('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    // 入力をパース
    const parseInput = (nStr: string, dStr: string) => {
      if (!nStr) return null;
      let num = parseInt(nStr);
      let den = dStr ? parseInt(dStr) : 1;
      if (isNaN(num) || isNaN(den) || den === 0) return null;
      return simplifyFraction(num, den);
    };

    let userRoots = [parseInput(ans1Num, ans1Den), parseInput(ans2Num, ans2Den)].filter(r => r !== null) as Root[];
    
    if (userRoots.length !== problem.roots.length) {
      setIsCorrect(false);
      setHasChecked(true);
      return;
    }

    // 一致確認
    let matchCount = 0;
    let matchedIndices = new Set();
    for (let ur of userRoots) {
      for (let i = 0; i < problem.roots.length; i++) {
        if (matchedIndices.has(i)) continue;
        let pr = problem.roots[i];
        if (ur.num === pr.num && ur.den === pr.den) {
          matchCount++;
          matchedIndices.add(i);
          break;
        }
      }
    }

    setIsCorrect(matchCount === problem.roots.length);
    setHasChecked(true);
  };

  if (!problem) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          絶対値を含む方程式ドリル
        </h1>
        <p className="text-gray-500">
          絶対値記号の意味を方程式とグラフの交点として視覚的に捉え、素早く解を導く反復練習です。
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
                <option value="pattern1">パターン1 (基本)</option>
                <option value="pattern2">パターン2 (係数あり・分数解)</option>
                <option value="pattern3">パターン3 (場合分け必須・無縁根)</option>
                <option value="pattern4">パターン4 (絶対値が2つ)</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eqStr} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">
                次の方程式を解きなさい。
              </div>
              <div className="flex items-center justify-center gap-6">
                
                <div className="flex items-center gap-2">
                  <div className="font-bold text-lg">x = </div>
                  <div className="flex flex-col items-center">
                    <input type="text" className="w-12 border border-gray-400 p-1 text-center font-bold" value={ans1Num} onChange={e => setAns1Num(e.target.value)} placeholder="分子" />
                    <div className="w-full border-b-2 border-slate-800 my-0.5"></div>
                    <input type="text" className="w-12 border border-gray-400 p-1 text-center font-bold" value={ans1Den} onChange={e => setAns1Den(e.target.value)} placeholder="分母" />
                  </div>
                </div>

                <div className="font-bold text-lg">,</div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <input type="text" className="w-12 border border-gray-400 p-1 text-center font-bold" value={ans2Num} onChange={e => setAns2Num(e.target.value)} placeholder="分子" />
                    <div className="w-full border-b-2 border-slate-800 my-0.5"></div>
                    <input type="text" className="w-12 border border-gray-400 p-1 text-center font-bold" value={ans2Den} onChange={e => setAns2Den(e.target.value)} placeholder="分母" />
                  </div>
                </div>

              </div>
              <div className="text-[10px] text-gray-500 text-center">
                ※ 順不同です。解が1つしかない場合は、2つ目の枠を完全に空欄にしてください。<br/>
                ※ 答えが整数の場合は、分母を「1」にするか空欄のままにしてください。<br/>
                ※ マイナス記号は分子に付けてください（例: -3/2）。
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
                {isCorrect ? '正解！素晴らしい！' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説 */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・グラフの交点
              </h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={showGraph} onChange={e => setShowGraph(e.target.checked)} />
                  <span className="font-bold">グラフ表示</span>
                </label>
                {hasChecked && (
                  <div className="flex gap-1 text-[10px]">
                    <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                    <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                  </div>
                )}
              </div>
            </div>

            {showGraph && (
              <div className="flex justify-center mb-4">
                <canvas 
                  ref={canvasRef} 
                  width={300} 
                  height={200} 
                  className="border border-gray-300 bg-white shadow-sm w-full max-w-full h-auto"
                />
              </div>
            )}

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm">
                  <MathEq math={`x = ${problem.roots.map(r => r.den === 1 ? r.num : `\\frac{${r.num}}{${r.den}}`).join(', \\quad ')}`} />
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    {problem.pattern === 'pattern3' && problem.invalidRoot ? (
                      <p>
                        絶対値の中身の正負で場合分けをします。<br/>
                        ①そのまま外した場合と、②マイナスをつけて外した場合の2つの解候補が出ます。<br/>
                        候補 <MathEq math={`x = ${problem.invalidRoot.den === 1 ? problem.invalidRoot.num : `\\frac{${problem.invalidRoot.num}}{${problem.invalidRoot.den}}`}`} /> は、場合分けの条件を満たさないため<b>無縁根（不適）</b>となります。
                      </p>
                    ) : problem.pattern === 'pattern4' ? (
                      <p>
                        3つの区間に場合分けして解きます。<br/>
                        <MathEq math={`x < ${Math.min(problem.a, problem.b)}`} /> の区間と <MathEq math={`x \\ge ${Math.max(problem.a, problem.b)}`} /> の区間でそれぞれ1つずつ解が得られます。
                      </p>
                    ) : (
                      <p>絶対値の中身がプラス・マイナスの両パターンで方程式を解きます。</p>
                    )}
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    {problem.pattern === 'pattern3' && problem.invalidRoot ? (
                      <div className="space-y-2">
                        <p className="font-bold text-red-600">※ この問題は右辺に $x$ があるため、必ず場合分けをして「解が条件を満たすか」を確認する必要があります。</p>
                        <div className="bg-gray-50 p-2 border">
                          <p className="font-bold border-b pb-1 mb-1">【場合分け1】 <MathEq math={`${problem.a}x ${problem.b < 0 ? '+' : '-'} ${Math.abs(problem.b)} \\ge 0`} /> のとき</p>
                          <p>そのまま絶対値を外します。<br/>
                          <MathEq math={`${problem.a}x ${problem.b < 0 ? '+' : '-'} ${Math.abs(problem.b)} = ${problem.c === 1 ? '' : problem.c === -1 ? '-' : problem.c}x ${problem.d! > 0 ? '+' : ''} ${problem.d === 0 ? '' : problem.d!}`} /><br/>
                          これを解くと、<MathEq math={`x = ${problem.v1 ? problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}` : problem.invalidRoot!.den === 1 ? problem.invalidRoot!.num : `\\frac{${problem.invalidRoot!.num}}{${problem.invalidRoot!.den}}`}`} /> となります。<br/>
                          この解を条件式 <MathEq math={`${problem.a}x ${problem.b < 0 ? '+' : '-'} ${Math.abs(problem.b)} \\ge 0`} /> に代入すると、<br/>
                          {problem.v1 ? (
                            <span className="text-emerald-600 font-bold">条件を満たすため、これは正しい解です。</span>
                          ) : (
                            <span className="text-red-600 font-bold">条件を満たさないため、これは不適（無縁根）です。</span>
                          )}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 border">
                          <p className="font-bold border-b pb-1 mb-1">【場合分け2】 <MathEq math={`${problem.a}x ${problem.b < 0 ? '+' : '-'} ${Math.abs(problem.b)} < 0`} /> のとき</p>
                          <p>マイナスをつけて絶対値を外します。<br/>
                          <MathEq math={`-(${problem.a}x ${problem.b < 0 ? '+' : '-'} ${Math.abs(problem.b)}) = ${problem.c === 1 ? '' : problem.c === -1 ? '-' : problem.c}x ${problem.d! > 0 ? '+' : ''} ${problem.d === 0 ? '' : problem.d!}`} /><br/>
                          これを解くと、<MathEq math={`x = ${!problem.v1 ? problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}` : problem.invalidRoot!.den === 1 ? problem.invalidRoot!.num : `\\frac{${problem.invalidRoot!.num}}{${problem.invalidRoot!.den}}`}`} /> となります。<br/>
                          この解を条件式 <MathEq math={`${problem.a}x ${problem.b < 0 ? '+' : '-'} ${Math.abs(problem.b)} < 0`} /> に代入すると、<br/>
                          {!problem.v1 ? (
                            <span className="text-emerald-600 font-bold">条件を満たすため、これは正しい解です。</span>
                          ) : (
                            <span className="text-red-600 font-bold">条件を満たさないため、これは不適（無縁根）です。</span>
                          )}
                          </p>
                        </div>
                      </div>
                    ) : problem.pattern === 'pattern4' ? (
                      <div className="space-y-2">
                        <p>絶対値の中が <MathEq math="0" /> になる境界点 <MathEq math={`x = ${problem.a}`} /> と <MathEq math={`x = ${problem.b}`} /> を基準に、数直線を3つの区間に分けて解きます。</p>
                        <div className="bg-gray-50 p-2 border">
                          <MathEq math={`x < ${Math.min(problem.a, problem.b)}`} /> のとき、両方ともマイナスで外れます。解くと1つの解が出ます。
                        </div>
                        <div className="bg-gray-50 p-2 border">
                          <MathEq math={`${Math.min(problem.a, problem.b)} \\le x < ${Math.max(problem.a, problem.b)}`} /> のとき、片方がプラス、片方がマイナスで外れます。<MathEq math="x" /> が消滅し、解なしとなります。
                        </div>
                        <div className="bg-gray-50 p-2 border">
                          <MathEq math={`x \\ge ${Math.max(problem.a, problem.b)}`} /> のとき、両方ともプラスで外れます。解くと1つの解が出ます。
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>絶対値の基本性質を利用して、方程式を2つに分けます。</p>
                        <div className="bg-gray-50 p-2 border">
                          <MathEq math={`${problem.eqStr.split('=')[0]} = ${problem.eqStr.split('=')[1]}`} /><br/>
                          これを解いて、<MathEq math={`x = ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}`} />。
                        </div>
                        <div className="bg-gray-50 p-2 border">
                          <MathEq math={`${problem.eqStr.split('=')[0]} = -(${problem.eqStr.split('=')[1]})`} /><br/>
                          これを解いて、<MathEq math={`x = ${problem.roots[1].den === 1 ? problem.roots[1].num : `\\frac{${problem.roots[1].num}}{${problem.roots[1].den}}`}`} />。
                        </div>
                      </div>
                    )}
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
