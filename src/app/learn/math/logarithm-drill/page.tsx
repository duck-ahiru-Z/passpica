"use client";

import { useState, useEffect } from 'react';
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

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  qStr: string;
  ansNum: number;
  ansDen: number;
  expLines: string[]; // Explanation lines to be rendered as block equations
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      let primes = [2, 3, 5];
      let pr = primes[Math.floor(Math.random() * primes.length)];
      let a = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
      let b = Math.floor(Math.random() * 3) + 2;
      if (a === b) continue;
      
      let base = Math.pow(pr, a);
      let arg = Math.pow(pr, b);
      
      let num = b;
      let den = a;
      let g = gcd(num, den);
      num /= g; den /= g;
      
      let qStr = `\\log_{${base}} ${arg}`;
      let expLines = [
        `\\log_{${base}} ${arg} = \\frac{\\log_{${pr}} ${arg}}{\\log_{${pr}} ${base}}`,
        `= \\frac{\\log_{${pr}} ${pr}^${b}}{\\log_{${pr}} ${pr}^${a}}`,
        `= \\frac{${b}}{${a}}`
      ];
      if (g !== 1) expLines.push(`= \\frac{${num}}{${den}}`);
      
      return { pattern: p, qStr, ansNum: num, ansDen: den, expLines };
    } 
    else if (p === 'pattern2') {
      let primes = [2, 3, 5];
      let b1 = primes[Math.floor(Math.random() * primes.length)];
      let k = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
      let a2 = Math.pow(b1, k);
      let b2 = Math.floor(Math.random() * 6) + 2; // 2..7
      if (b2 === b1 || b2 === a2) continue; // avoid trivial
      
      let qStr = `\\log_{${b1}} ${b2} \\cdot \\log_{${b2}} ${a2}`;
      let expLines = [
        `\\text{底の変換公式より、底を } ${b1} \\text{ にそろえると：}`,
        `\\log_{${b1}} ${b2} \\cdot \\log_{${b2}} ${a2} = \\log_{${b1}} ${b2} \\cdot \\frac{\\log_{${b1}} ${a2}}{\\log_{${b1}} ${b2}}`,
        `= \\log_{${b1}} ${a2}`,
        `= \\log_{${b1}} ${b1}^${k} = ${k}`
      ];
      
      return { pattern: p, qStr, ansNum: k, ansDen: 1, expLines };
    }
    else if (p === 'pattern3') {
      let primes = [2, 3, 5];
      let x = primes[Math.floor(Math.random() * primes.length)];
      let i = Math.floor(Math.random() * 2) + 1; // 1, 2
      let j = Math.floor(Math.random() * 2) + 1; // 1, 2
      let k = i + j;
      let a = Math.pow(x, i);
      let b = Math.pow(x, j);
      if (a === x || b === x) continue; // to make it non-trivial, wait if x=2, i=1, a=2. 1/log_2 x is just 1. It's fine but slightly trivial.
      
      let qStr = `\\frac{1}{\\log_{${a}} ${x}} + \\frac{1}{\\log_{${b}} ${x}}`;
      let expLines = [
        `\\text{底の変換公式の逆数の性質 } \\frac{1}{\\log_A B} = \\log_B A \\text{ より：}`,
        `\\frac{1}{\\log_{${a}} ${x}} + \\frac{1}{\\log_{${b}} ${x}} = \\log_{${x}} ${a} + \\log_{${x}} ${b}`,
        `= \\log_{${x}} (${a} \\times ${b})`,
        `= \\log_{${x}} ${a * b}`,
        `= \\log_{${x}} ${x}^${k} = ${k}`
      ];
      
      return { pattern: p, qStr, ansNum: k, ansDen: 1, expLines };
    }
    else if (p === 'pattern4') {
      let primes = [2, 3, 5];
      let y = primes[Math.floor(Math.random() * primes.length)];
      let k = Math.floor(Math.random() * 2) + 1; // 1, 2
      if (y === 5) k = 1; // avoid 25^2 etc if z is large
      let z = Math.floor(Math.random() * 4) + 2; // 2..5
      if (y === z) continue;
      
      let x = Math.pow(y, k);
      let qStr = `${x}^{\\log_{${y}} ${z}}`;
      let ans = Math.pow(z, k);
      
      let expLines = [];
      if (k === 1) {
        expLines = [
          `\\text{対数の定義式 } a^{\\log_a b} = b \\text{ をそのまま利用します。}`,
          `${y}^{\\log_{${y}} ${z}} = ${z}`
        ];
      } else {
        expLines = [
          `\\text{まず底をそろえるために、} ${x} = ${y}^${k} \\text{ と変形します。}`,
          `${x}^{\\log_{${y}} ${z}} = \\left(${y}^${k}\\right)^{\\log_{${y}} ${z}}`,
          `= ${y}^{${k} \\log_{${y}} ${z}}`,
          `\\text{対数の係数を真数の肩に乗せます。}`,
          `= ${y}^{\\log_{${y}} ${z}^${k}} = ${y}^{\\log_{${y}} ${ans}}`,
          `\\text{定義式 } a^{\\log_a b} = b \\text{ より：}`,
          `= ${ans}`
        ];
      }
      
      return { pattern: p, qStr, ansNum: ans, ansDen: 1, expLines };
    }
  }
}

export default function LogarithmDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansVal, setAnsVal] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    // Parse user input as fraction or integer
    let uNum = 0, uDen = 1;
    let uStr = ansVal.trim().replace(/\s+/g, '');
    if (uStr.includes('/')) {
      let parts = uStr.split('/');
      uNum = parseInt(parts[0]);
      uDen = parseInt(parts[1]);
    } else {
      uNum = parseInt(uStr);
      uDen = 1;
    }
    
    if (!isNaN(uNum) && !isNaN(uDen) && uNum * problem.ansDen === problem.ansNum * uDen) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return null;

  let explanationEl = <></>;
  if (hasChecked) {
    explanationEl = (
      <div className="space-y-4">
        {problem.expLines.map((line, idx) => {
          if (line.includes('\\text{')) {
            return <div key={idx} className="text-gray-600 mb-1 mt-4"><MathEq math={line} /></div>;
          }
          return (
            <div key={idx} className="bg-white p-2 border rounded text-center">
              <MathEq math={line} block />
            </div>
          );
        })}
      </div>
    );
  }

  let ansDisplay = '';
  if (problem.ansDen === 1) ansDisplay = `${problem.ansNum}`;
  else ansDisplay = `\\frac{${Math.abs(problem.ansNum)}}{${problem.ansDen}}`;
  if (problem.ansNum < 0 && problem.ansDen !== 1) ansDisplay = `-\\frac{${Math.abs(problem.ansNum)}}{${problem.ansDen}}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          対数の底の変換公式と性質ドリル
        </h1>
        <p className="text-gray-500">
          底の変換公式や、逆数、指数の肩に乗る対数など、対数計算の肝となる変形を瞬時に行えるようにする演習です。
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
                <option value="pattern1">パターン1 (真数が底の累乗でない)</option>
                <option value="pattern2">パターン2 (対数の積・連鎖)</option>
                <option value="pattern3">パターン3 (逆数の関係)</option>
                <option value="pattern4">パターン4 (対数が指数に乗っている)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center">
              次の式の値を求めよ。<br/>
              <span className="text-3xl text-blue-700 my-2"><MathEq math={problem.qStr} /></span>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 font-bold">
                <div className="text-gray-500 text-xs mb-1">
                  分数になる場合は 3/2 のようにスラッシュで入力
                </div>
                <input 
                  type="text" 
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => setAnsVal(e.target.value)} 
                  placeholder="解答"
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
                {isCorrect ? '正解！対数の性質を見事に使いこなしています。' : '不正解... 解説を見て底をそろえるステップを確認しましょう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説 */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説
              </h2>
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic h-48">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm">
                  正解: <MathEq math={ansDisplay} />
                </div>
                
                <div className="bg-gray-50 p-3 border space-y-2">
                  <p className="font-bold border-b pb-1 mb-2">式変形のステップ</p>
                  {explanationEl}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
