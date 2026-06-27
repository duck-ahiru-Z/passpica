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
  n: number;
  qStr: string;
  ansNum: number;
  ansDen: number;
  expLines: string[];
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      let a = Math.floor(Math.random() * 11) - 5;
      let b = Math.floor(Math.random() * 11) - 5;
      if (a === 0) continue;
      
      let ns = [10, 15, 20];
      let n = ns[Math.floor(Math.random() * ns.length)];
      
      let val = a * (n * (n + 1) / 2) + b * n;
      
      let inner = `${a === 1 ? '' : (a === -1 ? '-' : a)}k`;
      if (b > 0) inner += `+${b}`;
      else if (b < 0) inner += `${b}`;
      
      let qStr = `\\sum_{k=1}^{n} (${inner}) \\quad \\text{において、} n = ${n} \\text{ のときの値}`;
      
      let expLines = [
        `\\text{まず } n \\text{ のまま公式を展開します。}`,
        `\\sum_{k=1}^{n} (${inner}) = ${a}\\sum_{k=1}^{n} k ${b !== 0 ? (b > 0 ? '+' + b : b) + '\\sum_{k=1}^{n} 1' : ''}`,
        `= ${a} \\cdot \\frac{1}{2}n(n+1) ${b !== 0 ? (b > 0 ? '+' : '-') + Math.abs(b) + 'n' : ''}`,
        `\\text{ここで } n = ${n} \\text{ を代入します。}`,
        `= ${a} \\cdot \\frac{1}{2} \\cdot ${n} \\cdot ${n+1} ${b !== 0 ? (b > 0 ? '+' : '-') + Math.abs(b) + '\\cdot ' + n : ''}`,
        `= ${a} \\cdot ${n*(n+1)/2} ${b !== 0 ? (b > 0 ? '+' : '-') + Math.abs(b)*n : ''}`,
        `= ${val}`
      ];
      
      return { pattern: p, n, qStr, ansNum: val, ansDen: 1, expLines };
    } 
    else if (p === 'pattern2') {
      let a = Math.floor(Math.random() * 5) + 1;
      let b = Math.floor(Math.random() * 11) - 5;
      
      let ns = [10, 12];
      let n = ns[Math.floor(Math.random() * ns.length)];
      
      let sumK2 = n * (n + 1) * (2 * n + 1) / 6;
      let sumK = n * (n + 1) / 2;
      let val = a * sumK2 + b * sumK;
      
      let inner = `${a === 1 ? '' : a}k^2`;
      if (b === 1) inner += `+k`;
      else if (b === -1) inner += `-k`;
      else if (b > 0) inner += `+${b}k`;
      else if (b < 0) inner += `${b}k`;
      
      let qStr = `\\sum_{k=1}^{n} (${inner}) \\quad \\text{において、} n = ${n} \\text{ のときの値}`;
      
      let expLines = [
        `\\text{公式 } \\sum k^2 = \\frac{1}{6}n(n+1)(2n+1) \\text{ 等を利用します。}`,
        `\\sum_{k=1}^{n} (${inner}) = ${a}\\sum_{k=1}^{n} k^2 ${b !== 0 ? (b > 0 ? '+' + (b===1?'':b) : '-' + (b===-1?'':Math.abs(b))) + '\\sum_{k=1}^{n} k' : ''}`,
        `\\text{ここで } n = ${n} \\text{ を代入します。}`,
        `\\sum_{k=1}^{${n}} k^2 = \\frac{1}{6} \\cdot ${n} \\cdot ${n+1} \\cdot ${2*n+1} = ${sumK2}`,
        `\\sum_{k=1}^{${n}} k = \\frac{1}{2} \\cdot ${n} \\cdot ${n+1} = ${sumK}`,
        `\\text{よって、}`,
        `${a} \\cdot ${sumK2} ${b !== 0 ? (b > 0 ? '+' : '-') + Math.abs(b) + ' \\cdot ' + sumK : ''} = ${val}`
      ];
      
      return { pattern: p, n, qStr, ansNum: val, ansDen: 1, expLines };
    }
    else if (p === 'pattern3') {
      let c = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
      let ns = [10, 15, 20];
      let n = ns[Math.floor(Math.random() * ns.length)];
      
      // sum = c * (n / (n+1))
      let num = c * n;
      let den = n + 1;
      let g = gcd(num, den);
      num /= g; den /= g;
      
      let qStr = `\\sum_{k=1}^{n} \\frac{${c}}{k(k+1)} \\quad \\text{において、} n = ${n} \\text{ のときの値}`;
      
      let expLines = [
        `\\text{部分分数分解を行います。}`,
        `\\frac{${c}}{k(k+1)} = ${c} \\left( \\frac{1}{k} - \\frac{1}{k+1} \\right)`,
        `\\text{これに } k=1, 2, \\dots, n \\text{ を代入して足し合わせると、}`,
        `= ${c} \\left\\{ \\left(\\frac{1}{1} - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\dots + \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right) \\right\\}`,
        `\\text{途中がすべて打ち消し合って最初と最後だけが残ります（望遠鏡和）。}`,
        `= ${c} \\left( 1 - \\frac{1}{n+1} \\right) = \\frac{${c}n}{n+1}`,
        `\\text{ここで } n = ${n} \\text{ を代入して、}`,
        `= \\frac{${c * n}}{${n+1}}`
      ];
      if (g !== 1) expLines.push(`= \\frac{${num}}{${den}}`);
      
      return { pattern: p, n, qStr, ansNum: num, ansDen: den, expLines };
    }
    else if (p === 'pattern4') {
      let a = Math.floor(Math.random() * 4) + 2; // 2..5
      let r = Math.floor(Math.random() * 3) + 2; // 2..4
      let n = Math.floor(Math.random() * 3) + 5; // 5..7
      
      let val = a * (Math.pow(r, n) - 1) / (r - 1);
      
      let qStr = `\\sum_{k=1}^{n} ${a} \\cdot ${r}^{k-1} \\quad \\text{において、} n = ${n} \\text{ のときの値}`;
      
      let expLines = [
        `\\text{シグマの中身は、初項 } ${a} \\text{ 、公比 } ${r} \\text{ の等比数列です。}`,
        `\\text{等比数列の和の公式を用います。}`,
        `\\sum_{k=1}^{n} ${a} \\cdot ${r}^{k-1} = \\frac{${a}(${r}^n - 1)}{${r} - 1}`,
        `\\text{ここで } n = ${n} \\text{ を代入して、}`,
        `= \\frac{${a}(${r}^{${n}} - 1)}{${r - 1}}`,
        `= \\frac{${a}(${Math.pow(r, n)} - 1)}{${r - 1}}`,
        `= ${val}`
      ];
      
      return { pattern: p, n, qStr, ansNum: val, ansDen: 1, expLines };
    }
  }
}

export default function SigmaCalculationDrill() {
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
          Σ（シグマ）の計算ドリル
        </h1>
        <p className="text-gray-500">
          Σ記号の扱いに慣れ、公式の展開から具体的な数値の計算までをスムーズに行えるようにする演習です。
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
                <option value="pattern1">パターン1 (1次式の和)</option>
                <option value="pattern2">パターン2 (2次式の和)</option>
                <option value="pattern3">パターン3 (分数型の和・望遠鏡和)</option>
                <option value="pattern4">パターン4 (等比数列のΣ)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center leading-relaxed">
              次の式の値を求めよ。<br/>
              <span className="text-2xl text-blue-700 my-2"><MathEq math={problem.qStr} /></span>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 font-bold">
                <div className="text-gray-500 text-xs mb-1">
                  分数になる場合は 10/11 のようにスラッシュで入力
                </div>
                <input 
                  type="text" 
                  className="w-40 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
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
                {isCorrect ? '正解！Σの扱いと計算がバッチリです。' : '不正解... 解説を見て公式の展開を確認しましょう。'}
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
                  <p className="font-bold border-b pb-1 mb-2">計算ステップ</p>
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
