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

function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let res = 1;
  for (let i = 1; i <= r; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  n: number;
  r: number;
  p_num: number;
  p_den: number;
  ans_num: number;
  ans_den: number;
  req_wins?: number;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  if (p === 'pattern1') {
    let n = Math.floor(Math.random() * 4) + 3; // 3 to 6
    let r = Math.floor(Math.random() * (n - 1)) + 1; // 1 to n-1
    let p_num = 1;
    let p_den = 2;
    let ans_num = nCr(n, r);
    let ans_den = Math.pow(2, n);
    let g = gcd(ans_num, ans_den);
    return { pattern: p, n, r, p_num, p_den, ans_num: ans_num/g, ans_den: ans_den/g };
  } else if (p === 'pattern2') {
    let probs = [{n:1, d:6}, {n:1, d:3}, {n:2, d:3}, {n:1, d:4}]; 
    let prob = probs[Math.floor(Math.random() * probs.length)];
    let n = Math.floor(Math.random() * 3) + 3; // 3 to 5
    let r = Math.floor(Math.random() * (n - 1)) + 1;
    let p_num = prob.n;
    let p_den = prob.d;
    let ans_num = nCr(n, r) * Math.pow(p_num, r) * Math.pow(p_den - p_num, n - r);
    let ans_den = Math.pow(p_den, n);
    let g = gcd(ans_num, ans_den);
    return { pattern: p, n, r, p_num, p_den, ans_num: ans_num/g, ans_den: ans_den/g };
  } else if (p === 'pattern3') {
    let probs = [{n:1, d:6}, {n:1, d:3}, {n:1, d:4}];
    let prob = probs[Math.floor(Math.random() * probs.length)];
    let n = Math.floor(Math.random() * 3) + 3; // 3 to 5
    let p_num = prob.n;
    let p_den = prob.d;
    let fail_num = p_den - p_num;
    let ans_num = Math.pow(p_den, n) - Math.pow(fail_num, n);
    let ans_den = Math.pow(p_den, n);
    let g = gcd(ans_num, ans_den);
    return { pattern: p, n, r: 0, p_num, p_den, ans_num: ans_num/g, ans_den: ans_den/g };
  } else {
    // pattern4: conditional
    let req_wins = Math.floor(Math.random() * 2) + 3; // 3 or 4 wins to win match
    let n = Math.floor(Math.random() * (req_wins)) + req_wins; // n=3,4,5
    if (n === req_wins) n++; // ensure it's not a straight sweep for more interesting calculation
    let r = req_wins; 
    let p_num = 1;
    let p_den = 2; // keep it simple 1/2 for matches
    let ans_num = nCr(n - 1, r - 1);
    let ans_den = Math.pow(2, n);
    let g = gcd(ans_num, ans_den);
    return { pattern: p, n, r, p_num, p_den, ans_num: ans_num/g, ans_den: ans_den/g, req_wins };
  }
}

export default function BinomialProbabilityDrill() {
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

    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (problem.pattern === 'pattern4') {
      ctx.fillText(`${problem.req_wins}勝で優勝 (現在 ${problem.n}戦目)`, W/2, 20);
      
      let boxW = 20;
      let startX = W/2 - (problem.n * (boxW + 5)) / 2;
      let startY = 60;
      
      ctx.font = '10px sans-serif';
      
      for (let i = 0; i < problem.n; i++) {
        let isLast = i === problem.n - 1;
        ctx.fillStyle = isLast ? '#ef4444' : '#cbd5e1';
        ctx.fillRect(startX + i * (boxW + 5), startY, boxW, boxW);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(startX + i * (boxW + 5), startY, boxW, boxW);
        
        ctx.fillStyle = isLast ? 'white' : '#1e293b';
        if (isLast) {
          ctx.fillText('勝', startX + i * (boxW + 5) + boxW/2, startY + boxW/2);
        } else {
          ctx.fillText('?', startX + i * (boxW + 5) + boxW/2, startY + boxW/2);
        }
        
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${i+1}戦`, startX + i * (boxW + 5) + boxW/2, startY - 10);
      }
      
      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px sans-serif';
      ctx.fillText(`↑ ここまでに ${problem.req_wins! - 1} 勝`, W/2 - (boxW + 5)/2, startY + boxW + 20);
      
    } else if (problem.pattern === 'pattern1' || problem.pattern === 'pattern2') {
      ctx.fillText(`${problem.n} 回中、ちょうど ${problem.r} 回成功`, W/2, 20);
      
      let boxW = 15;
      let startX = W/2 - (problem.n * (boxW + 4)) / 2;
      let startY = 60;
      
      for (let i = 0; i < problem.n; i++) {
        let isSuccess = i < problem.r;
        ctx.fillStyle = isSuccess ? '#3b82f6' : '#ef4444';
        ctx.beginPath();
        ctx.arc(startX + i * (boxW + 4) + boxW/2, startY + boxW/2, boxW/2, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.fillText(isSuccess ? '〇' : '✕', startX + i * (boxW + 4) + boxW/2, startY + boxW/2 + 1);
      }
      
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`この並び方が \\( _{${problem.n}}\\mathrm{C}_{${problem.r}} \\) 通りある`, W/2, startY + boxW + 20);
      
    } else if (problem.pattern === 'pattern3') {
      ctx.fillText(`少なくとも 1 回成功する確率`, W/2, 20);
      
      // Draw 100% bar and subtract failure
      let barW = 200;
      let barH = 20;
      let barX = W/2 - barW/2;
      let barY = 80;
      
      ctx.fillStyle = '#3b82f6'; // Success part
      ctx.fillRect(barX, barY, barW * 0.8, barH);
      
      ctx.fillStyle = '#ef4444'; // Fail part
      ctx.fillRect(barX + barW * 0.8, barY, barW * 0.2, barH);
      
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(barX, barY, barW, barH);
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.fillText(`全事象 (確率 1)`, W/2, barY - 15);
      
      ctx.fillStyle = 'white';
      ctx.fillText(`求める確率 (余事象を引く)`, barX + barW * 0.4, barY + barH/2);
      ctx.fillText(`全部失敗`, barX + barW * 0.9, barY + barH/2);
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
    
    // Check if the answer matches exactly
    // since root is 1, checkFractionRoot handles it.
    let isOk = checkFractionRoot(ansVal, 1, problem.ans_num, 1, problem.ans_den);
    
    setIsCorrect(isOk);
    setHasChecked(true);
  };

  if (!problem) return null;

  const eventName = problem.pattern === 'pattern2' 
    ? (problem.p_num === 1 && problem.p_den === 6 ? '「1の目」' : problem.p_num === 1 && problem.p_den === 3 ? '「3の倍数の目」' : '「2以下の目」')
    : (problem.pattern === 'pattern3' ? '「アタリ」' : '「表」');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          反復試行の確率ドリル
        </h1>
        <p className="text-gray-500">
          独立な試行を繰り返す際の確率を、公式 <MathEq math="_{n}\mathrm{C}_{r}p^r(1-p)^{n-r}" /> や余事象を用いて正確に求める演習です。
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
                <option value="pattern1">パターン1 (コイン投げ・確率1/2)</option>
                <option value="pattern2">パターン2 (サイコロ・確率p)</option>
                <option value="pattern3">パターン3 (余事象・少なくとも1回)</option>
                <option value="pattern4">パターン4 (条件付き・n戦目で優勝)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-3 text-lg font-bold text-slate-700">
              {problem.pattern === 'pattern1' && (
                <p>
                  1枚のコインを {problem.n} 回投げるとき、<br/>
                  表がちょうど {problem.r} 回出る確率を求めよ。
                </p>
              )}
              {problem.pattern === 'pattern2' && (
                <p>
                  1個のサイコロを {problem.n} 回投げるとき、<br/>
                  {eventName} がちょうど {problem.r} 回出る確率を求めよ。
                </p>
              )}
              {problem.pattern === 'pattern3' && (
                <p>
                  確率 <MathEq math={`\\frac{${problem.p_num}}{${problem.p_den}}`} /> で当たるくじを {problem.n} 回引くとき、<br/>
                  少なくとも1回は当たる確率を求めよ。（※引いたくじは戻す）
                </p>
              )}
              {problem.pattern === 'pattern4' && (
                <p>
                  AとBが試合を行い、先に {problem.req_wins} 勝した方が優勝とする。<br/>
                  AとBの勝つ確率がいずれも <MathEq math="\frac{1}{2}" /> であるとき、<br/>
                  Aが {problem.n} 戦目で優勝する確率を求めよ。（※引き分けはないものとする）
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-gray-500 font-bold mb-2">確率を分数で入力（※ルートは空欄または1のままでOK）</div>
                <FractionRootInput value={ansVal} onChange={setAnsVal} hideSign />
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
                {isCorrect ? '正解！素晴らしい計算スピードです。' : '不正解... 解説を見て約分や立式を確認しよう。'}
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
                height={160} 
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
                  正解: <MathEq math={`\\frac{${problem.ans_num}}{${problem.ans_den}}`} />
                </div>

                <div className="bg-gray-50 p-3 border space-y-2">
                  
                  {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') && (
                    <>
                      <p className="font-bold border-b pb-1">反復試行の確率の公式</p>
                      <p>
                        事象が起こる確率を <MathEq math="p" /> とすると、<MathEq math="n" /> 回中 <MathEq math="r" /> 回起こる確率は <MathEq math="_{n}\mathrm{C}_{r}p^r(1-p)^{n-r}" /> です。<br/>
                        今回は <MathEq math={`p = \\frac{${problem.p_num}}{${problem.p_den}}`} /> です。
                      </p>
                      <MathEq math={`P = _{${problem.n}}\\mathrm{C}_{${problem.r}} \\left(\\frac{${problem.p_num}}{${problem.p_den}}\\right)^{${problem.r}} \\left(1 - \\frac{${problem.p_num}}{${problem.p_den}}\\right)^{${problem.n - problem.r}}`} block />
                      <MathEq math={`= _{${problem.n}}\\mathrm{C}_{${problem.r}} \\times \\left(\\frac{${problem.p_num}}{${problem.p_den}}\\right)^{${problem.r}} \\times \\left(\\frac{${problem.p_den - problem.p_num}}{${problem.p_den}}\\right)^{${problem.n - problem.r}}`} block />
                      <p>計算して約分すると、</p>
                      <MathEq math={`= \\frac{${problem.ans_num}}{${problem.ans_den}}`} block />
                    </>
                  )}

                  {problem.pattern === 'pattern3' && (
                    <>
                      <p className="font-bold border-b pb-1">余事象の利用</p>
                      <p className="text-blue-700 font-bold bg-blue-50 p-2 border border-blue-200">
                        【鉄則】 「少なくとも1回」を見たら「1 - (1回も起こらない確率)」を計算する！
                      </p>
                      <p>
                        1回も当たらない確率は、毎回外れる確率 <MathEq math={`1 - \\frac{${problem.p_num}}{${problem.p_den}} = \\frac{${problem.p_den - problem.p_num}}{${problem.p_den}}`} /> を {problem.n} 回掛けるので、
                      </p>
                      <MathEq math={`\\left(\\frac{${problem.p_den - problem.p_num}}{${problem.p_den}}\\right)^{${problem.n}}`} block />
                      <p>これを 1 から引きます。</p>
                      <MathEq math={`1 - \\left(\\frac{${problem.p_den - problem.p_num}}{${problem.p_den}}\\right)^{${problem.n}} = \\frac{${problem.ans_num}}{${problem.ans_den}}`} block />
                    </>
                  )}

                  {problem.pattern === 'pattern4' && (
                    <>
                      <p className="font-bold border-b pb-1">条件付き反復試行</p>
                      <p>
                        Aが {problem.n} 戦目で優勝（{problem.req_wins}勝目を挙げる）ということは、以下の2つの事象が続けて起こることと同じです。
                      </p>
                      <ol className="list-decimal pl-6 space-y-1 my-2 font-bold">
                        <li>第 <MathEq math={`${problem.n - 1}`} /> 戦までに、Aがちょうど <MathEq math={`${problem.req_wins! - 1}`} /> 勝する</li>
                        <li>第 <MathEq math={`${problem.n}`} /> 戦で、Aが勝つ</li>
                      </ol>
                      <p>これらを掛け合わせて計算します。</p>
                      <MathEq math={`P = \\left[ _{${problem.n - 1}}\\mathrm{C}_{${problem.req_wins! - 1}} \\left(\\frac{1}{2}\\right)^{${problem.req_wins! - 1}} \\left(\\frac{1}{2}\\right)^{${problem.n - 1 - (problem.req_wins! - 1)}} \\right] \\times \\frac{1}{2}`} block />
                      <MathEq math={`= _{${problem.n - 1}}\\mathrm{C}_{${problem.req_wins! - 1}} \\times \\left(\\frac{1}{2}\\right)^{${problem.n - 1}} \\times \\frac{1}{2}`} block />
                      <p>計算して約分すると、</p>
                      <MathEq math={`= \\frac{${problem.ans_num}}{${problem.ans_den}}`} block />
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
