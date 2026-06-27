"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// 階乗計算
function fact(n: number): number {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}

// 階乗の展開文字列 "5 \times 4 \times 3 \times 2 \times 1"
function factStr(n: number, downTo: number = 1): string {
  if (n < downTo) return "1";
  let arr = [];
  for (let i = n; i >= downTo; i--) arr.push(i);
  return arr.join(" \\times ");
}

// nPr = n * (n-1) * ... * (n-r+1)
function permStr(n: number, r: number): string {
  if (r === 0) return "1";
  return factStr(n, n - r + 1);
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  n: number;
  r: number;
  subType?: 'same' | 'circle'; // For pattern4
  items?: { name: string, count: number }[]; // For same-element perm
  ans: number;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  if (p === 'pattern1') {
    let n = Math.floor(Math.random() * 8) + 3; // 3 to 10
    let r = Math.floor(Math.random() * Math.min(4, n)) + 1; // 1 to min(4, n)
    let ans = fact(n) / fact(n - r);
    return { pattern: p, n, r, ans };
  } else if (p === 'pattern2') {
    let n = Math.floor(Math.random() * 8) + 3; // 3 to 10
    let r = Math.floor(Math.random() * Math.min(4, n)) + 1; // 1 to min(4, n)
    let ans = fact(n) / (fact(r) * fact(n - r));
    return { pattern: p, n, r, ans };
  } else if (p === 'pattern3') {
    let n = Math.floor(Math.random() * 9) + 7; // 7 to 15
    let diff = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    let r = n - diff;
    let ans = fact(n) / (fact(diff) * fact(n - diff));
    return { pattern: p, n, r, ans };
  } else {
    // pattern4: Same elements or Circular
    let subType = Math.random() < 0.5 ? 'same' : 'circle';
    if (subType === 'same') {
      let types = [
        {names: ['A', 'B'], max: 4},
        {names: ['赤玉', '白玉'], max: 4},
        {names: ['1', '2', '3'], max: 3}
      ];
      let t = types[Math.floor(Math.random() * types.length)];
      let items = [];
      let total = 0;
      let div = 1;
      for (let name of t.names) {
        let count = Math.floor(Math.random() * t.max) + 1;
        items.push({ name, count });
        total += count;
        div *= fact(count);
      }
      let ans = fact(total) / div;
      return { pattern: p, n: total, r: 0, subType: 'same', items, ans };
    } else {
      let n = Math.floor(Math.random() * 5) + 4; // 4 to 8
      let ans = fact(n - 1);
      return { pattern: p, n, r: 0, subType: 'circle', ans };
    }
  }
}

export default function PermutationCombinationDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal, setAnsVal] = useState<string>('');
  
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

    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (problem.pattern === 'pattern1' || problem.pattern === 'pattern2' || problem.pattern === 'pattern3') {
      // 順列 P または 組合せ C の図解
      let n = problem.n;
      let r = problem.pattern === 'pattern3' ? problem.n - problem.r : problem.r; // For pattern3, visualize the smaller symmetric C
      if (problem.pattern === 'pattern3') {
        r = problem.n - problem.r;
      }
      
      let itemRadius = 12;
      let spacing = 35;
      
      // Draw pool of N items
      ctx.font = '12px sans-serif';
      ctx.fillText(`全体 ${n} 個`, W/2, 20);
      
      // We can only draw up to 15 items nicely
      let drawN = Math.min(n, 15);
      let startX = W/2 - (drawN-1) * spacing / 2;
      
      for (let i = 0; i < drawN; i++) {
        ctx.beginPath();
        ctx.arc(startX + i * spacing, 50, itemRadius, 0, 2 * Math.PI);
        ctx.fillStyle = i < r ? '#3b82f6' : '#cbd5e1'; // Selected items in blue
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
      }
      
      // Draw slots
      ctx.fillStyle = '#1e293b';
      if (problem.pattern === 'pattern1') {
        ctx.fillText(`取り出して並べる (順列 P): ${r} 枠`, W/2, 100);
        let slotW = 30;
        let slotStartX = W/2 - (r * (slotW + 10) - 10) / 2;
        for (let i = 0; i < r; i++) {
          ctx.strokeStyle = '#3b82f6';
          ctx.strokeRect(slotStartX + i * (slotW + 10), 120, slotW, 30);
          ctx.fillStyle = '#3b82f6';
          ctx.fillText(`第${i+1}`, slotStartX + i * (slotW + 10) + slotW/2, 135);
        }
      } else {
        ctx.fillText(`取り出してグループ化 (組合せ C): ${r} 個`, W/2, 100);
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([5, 5]);
        let grpW = r * 30;
        let grpX = W/2 - grpW/2;
        ctx.strokeRect(grpX, 115, grpW, 40);
        ctx.setLineDash([]);
        for (let i = 0; i < r; i++) {
          ctx.beginPath();
          ctx.arc(grpX + 15 + i * 30, 135, itemRadius, 0, 2 * Math.PI);
          ctx.fillStyle = '#93c5fd';
          ctx.fill();
        }
      }

    } else if (problem.pattern === 'pattern4') {
      if (problem.subType === 'circle') {
        // 円順列の図解
        let n = problem.n;
        ctx.fillText(`${n} 人の円順列`, W/2, 20);
        
        let cx = W/2;
        let cy = H/2 + 10;
        let R = 60;
        
        ctx.beginPath();
        ctx.arc(cx, cy, R - 20, 0, 2 * Math.PI);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        for (let i = 0; i < n; i++) {
          let angle = i * 2 * Math.PI / n - Math.PI / 2;
          let x = cx + R * Math.cos(angle);
          let y = cy + R * Math.sin(angle);
          
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, 2 * Math.PI);
          ctx.fillStyle = i === 0 ? '#ef4444' : '#3b82f6'; // 1人を固定して赤くする
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.fillText(i === 0 ? '固定' : `${i}`, x, y);
        }
        
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`1人を固定すると、残りは ${n-1}! 通り`, W/2, H - 15);

      } else {
        // 同じものを含む順列
        ctx.fillText(`同じものを含む順列`, W/2, 20);
        
        let startY = 60;
        let total = problem.n;
        let drawn = 0;
        let colors = ['#ef4444', '#3b82f6', '#10b981'];
        
        let spacing = 35;
        let startX = W/2 - (total-1) * spacing / 2;
        
        problem.items?.forEach((item, idx) => {
          for (let i = 0; i < item.count; i++) {
            ctx.beginPath();
            ctx.arc(startX + drawn * spacing, startY, 15, 0, 2 * Math.PI);
            ctx.fillStyle = colors[idx % colors.length];
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.fillText(item.name[0], startX + drawn * spacing, startY);
            drawn++;
          }
        });
        
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`全 ${total} 個`, W/2, 100);
        
        let textY = 130;
        problem.items?.forEach((item, idx) => {
          ctx.fillStyle = colors[idx % colors.length];
          ctx.fillText(`${item.name}: ${item.count}個 (重複 ${item.count}! 通りを割る)`, W/2, textY);
          textY += 20;
        });
      }
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    if (parseInt(ansVal) === problem.ans) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
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
          P と C の単純計算ドリル
        </h1>
        <p className="text-gray-500">
          順列(P)、組合せ(C)、円順列などの基本的な計算を反復し、スピーディかつ正確に値を求める力を養います。
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
                <option value="pattern1">パターン1 (順列 P の基本)</option>
                <option value="pattern2">パターン2 (組合せ C の基本)</option>
                <option value="pattern3">パターン3 (C の対称性)</option>
                <option value="pattern4">パターン4 (同じものを含む・円順列)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col items-center justify-center min-h-[120px] gap-3 text-lg font-bold text-slate-700">
              {problem.pattern === 'pattern1' && (
                <p>次の値を求めよ。<br/><MathEq math={`_{${problem.n}}\\mathrm{P}_{${problem.r}}`} block /></p>
              )}
              {problem.pattern === 'pattern2' && (
                <p>次の値を求めよ。<br/><MathEq math={`_{${problem.n}}\\mathrm{C}_{${problem.r}}`} block /></p>
              )}
              {problem.pattern === 'pattern3' && (
                <p>次の値を求めよ。<br/><MathEq math={`_{${problem.n}}\\mathrm{C}_{${problem.r}}`} block /></p>
              )}
              {problem.pattern === 'pattern4' && problem.subType === 'circle' && (
                <p>{problem.n} 人が円卓に座る座り方は何通りあるか。</p>
              )}
              {problem.pattern === 'pattern4' && problem.subType === 'same' && (
                <p>
                  {problem.items?.map(i => `${i.name} が ${i.count}個`).join('、')} の<br/>
                  合計 {problem.n} 個のものをすべて1列に並べる並べ方は何通りあるか。
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 text-xl">
                <input 
                  type="number" 
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => setAnsVal(e.target.value)} 
                  placeholder="答え" 
                />
                <span className="font-bold">通り (値)</span>
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
                {isCorrect ? '正解！素晴らしい計算スピードです。' : '不正解... 約分や公式を確認しよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・図解
              </h2>
            </div>

            <div className="flex justify-center mb-4">
              <canvas 
                ref={canvasRef} 
                width={300} 
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
                  正解: {problem.ans} 通り
                </div>

                <div className="bg-gray-50 p-3 border space-y-2">
                  
                  {problem.pattern === 'pattern1' && (
                    <>
                      <p className="font-bold border-b pb-1">順列 <MathEq math="_{n}\mathrm{P}_{r}" /> の計算</p>
                      <MathEq math={`_{${problem.n}}\\mathrm{P}_{${problem.r}} = ${permStr(problem.n, problem.r)}`} block />
                      <MathEq math={`= ${problem.ans}`} block />
                    </>
                  )}

                  {problem.pattern === 'pattern2' && (
                    <>
                      <p className="font-bold border-b pb-1">組合せ <MathEq math="_{n}\mathrm{C}_{r}" /> の計算</p>
                      <p>分子は順列 <MathEq math="P" /> と同じく <MathEq math={problem.r.toString()} /> 個掛け合わせ、分母は <MathEq math={`${problem.r}!`} /> で割ります。</p>
                      <MathEq math={`_{${problem.n}}\\mathrm{C}_{${problem.r}} = \\frac{${permStr(problem.n, problem.r)}}{${factStr(problem.r)}}`} block />
                      <MathEq math={`= ${problem.ans}`} block />
                    </>
                  )}

                  {problem.pattern === 'pattern3' && (
                    <>
                      <p className="font-bold border-b pb-1">組合せ <MathEq math="C" /> の対称性の利用</p>
                      <p className="text-blue-700 font-bold bg-blue-50 p-2 border border-blue-200">
                        【鉄則】 <MathEq math="_{n}\mathrm{C}_{r} = _{n}\mathrm{C}_{n-r}" /> を使うと計算が楽になる！
                      </p>
                      <p>
                        今回は <MathEq math={`_{${problem.n}}\\mathrm{C}_{${problem.r}}`} /> なので、<MathEq math="r" /> が大きいですね。<br/>
                        <MathEq math={`${problem.n} - ${problem.r} = ${problem.n - problem.r}`} /> より、<MathEq math={`_{${problem.n}}\\mathrm{C}_{${problem.n - problem.r}}`} /> を計算すればOKです。
                      </p>
                      <MathEq math={`_{${problem.n}}\\mathrm{C}_{${problem.r}} = _{${problem.n}}\\mathrm{C}_{${problem.n - problem.r}}`} block />
                      <MathEq math={`= \\frac{${permStr(problem.n, problem.n - problem.r)}}{${factStr(problem.n - problem.r)}}`} block />
                      <MathEq math={`= ${problem.ans}`} block />
                    </>
                  )}

                  {problem.pattern === 'pattern4' && problem.subType === 'circle' && (
                    <>
                      <p className="font-bold border-b pb-1">円順列の計算</p>
                      <p>
                        <MathEq math={problem.n.toString()} /> 人が円卓に座る場合、回転して同じになる並び方を省くため、「1人を固定」して考えます。<br/>
                        残りの <MathEq math={`${problem.n} - 1 = ${problem.n - 1}`} /> 人を一列に並べる順列と同じになります。
                      </p>
                      <MathEq math={`(${problem.n} - 1)! = ${problem.n - 1}!`} block />
                      <MathEq math={`= ${factStr(problem.n - 1)}`} block />
                      <MathEq math={`= ${problem.ans}`} block />
                    </>
                  )}

                  {problem.pattern === 'pattern4' && problem.subType === 'same' && (
                    <>
                      <p className="font-bold border-b pb-1">同じものを含む順列の計算</p>
                      <p>
                        すべてのものを区別して一列に並べた後、同じものの重複分で割ります。
                      </p>
                      <MathEq math={`\\frac{${problem.n}!}{${problem.items?.map(i => `${i.count}!`).join('')}}`} block />
                      <MathEq math={`= \\frac{${factStr(problem.n)}}{${problem.items?.map(i => factStr(i.count)).join(' \\times ')}}`} block />
                      <MathEq math={`= ${problem.ans}`} block />
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
