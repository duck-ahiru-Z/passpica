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
  expLines: string[];
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      let a = Math.floor(Math.random() * 21) - 10;
      let d = Math.floor(Math.random() * 21) - 10;
      let n = Math.floor(Math.random() * 16) + 5; // 5..20
      if (d === 0) continue;
      
      let sum = (n * (2 * a + (n - 1) * d)) / 2;
      let qStr = `初項 ${a} 、公差 ${d} の等差数列の初項から第 ${n} 項までの和 S_{${n}} を求めよ。`;
      
      let expLines = [
        `\\text{等差数列の和の公式 } S_n = \\frac{n}{2}\\{2a + (n-1)d\\} \\text{ に代入します。}`,
        `S_{${n}} = \\frac{${n}}{2} \\{ 2 \\cdot (${a}) + (${n}-1) \\cdot (${d}) \\}`,
        `= \\frac{${n}}{2} \\{ ${2*a} + ${n-1} \\cdot (${d}) \\}`,
        `= \\frac{${n}}{2} \\{ ${2*a + (n-1)*d} \\}`,
        `= ${sum}`
      ];
      
      return { pattern: p, qStr, ansNum: sum, ansDen: 1, expLines };
    } 
    else if (p === 'pattern2') {
      let a = Math.floor(Math.random() * 21) - 10;
      let l = Math.floor(Math.random() * 41) - 20;
      let n = Math.floor(Math.random() * 16) + 5; // 5..20
      if (a === l) continue;
      
      let sumNum = n * (a + l);
      let sumDen = 2;
      let g = gcd(sumNum, sumDen);
      sumNum /= g; sumDen /= g;
      if (sumDen < 0) { sumNum = -sumNum; sumDen = -sumDen; }
      
      let qStr = `初項 ${a} 、末項 ${l} 、項数 ${n} の等差数列の和 S_{${n}} を求めよ。`;
      
      let expLines = [
        `\\text{末項がわかっている場合の公式 } S_n = \\frac{n}{2}(a+l) \\text{ を用います。}`,
        `S_{${n}} = \\frac{${n}}{2} ( ${a} + (${l}) )`,
        `= \\frac{${n}}{2} \\cdot (${a+l})`
      ];
      if (sumDen === 1) {
        expLines.push(`= ${sumNum}`);
      } else {
        expLines.push(`= \\frac{${sumNum}}{${sumDen}}`);
      }
      
      return { pattern: p, qStr, ansNum: sumNum, ansDen: sumDen, expLines };
    }
    else if (p === 'pattern3') {
      let a = Math.floor(Math.random() * 5) + 1; // 1..5
      let r = Math.floor(Math.random() * 3) + 2; // 2..4
      let n = Math.floor(Math.random() * 4) + 4; // 4..7
      
      let sum = a * (Math.pow(r, n) - 1) / (r - 1);
      
      let qStr = `初項 ${a} 、公比 ${r} の等比数列の初項から第 ${n} 項までの和 S_{${n}} を求めよ。`;
      
      let expLines = [
        `\\text{等比数列の和の公式 } S_n = \\frac{a(r^n - 1)}{r - 1} \\text{ に代入します。}`,
        `S_{${n}} = \\frac{${a} \\cdot (${r}^{${n}} - 1)}{${r} - 1}`,
        `= \\frac{${a} \\cdot (${Math.pow(r, n)} - 1)}{${r - 1}}`,
        `= \\frac{${a} \\cdot ${Math.pow(r, n) - 1}}{${r - 1}}`,
        `= ${sum}`
      ];
      
      return { pattern: p, qStr, ansNum: sum, ansDen: 1, expLines };
    }
    else if (p === 'pattern4') {
      // r = -2 or 1/2 or -1/2
      let choices = [-2, 0.5, -0.5];
      let r_val = choices[Math.floor(Math.random() * choices.length)];
      let a = 0, n = 0;
      let rStr = "";
      
      if (r_val === -2) {
        a = Math.floor(Math.random() * 5) + 1;
        n = Math.floor(Math.random() * 4) + 5; // 5..8
        rStr = "-2";
      } else if (r_val === 0.5) {
        let powers = [8, 16, 32, 64];
        a = powers[Math.floor(Math.random() * powers.length)];
        n = Math.floor(Math.random() * 4) + 4; // 4..7
        rStr = "\\frac{1}{2}";
      } else if (r_val === -0.5) {
        let powers = [8, 16, 32];
        a = powers[Math.floor(Math.random() * powers.length)];
        n = Math.floor(Math.random() * 3) + 4; // 4..6
        rStr = "-\\frac{1}{2}";
      }
      
      let qStr = `初項 ${a} 、公比 $${rStr}$ の等比数列の初項から第 ${n} 項までの和 S_{${n}} を求めよ。`;
      
      let rPowN = 0;
      let rNum = 0, rDen = 1;
      let powNum = 0, powDen = 1;

      if (r_val === -2) {
        rNum = -2; rDen = 1;
        powNum = Math.pow(-2, n); powDen = 1;
      } else if (r_val === 0.5) {
        rNum = 1; rDen = 2;
        powNum = 1; powDen = Math.pow(2, n);
      } else if (r_val === -0.5) {
        rNum = -1; rDen = 2;
        powNum = n % 2 === 0 ? 1 : -1;
        powDen = Math.pow(2, n);
      }

      // sum = a * (1 - r^n) / (1 - r)
      // num = a * (1 - powNum/powDen) = a * (powDen - powNum) / powDen
      // den = 1 - rNum/rDen = (rDen - rNum) / rDen
      // sum = [ a * (powDen - powNum) * rDen ] / [ powDen * (rDen - rNum) ]
      
      let num = a * (powDen - powNum) * rDen;
      let den = powDen * (rDen - rNum);
      let g = gcd(num, den);
      num /= g; den /= g;
      if (den < 0) { num = -num; den = -den; }

      let expLines = [];
      if (r_val === -2) {
        expLines = [
          `\\text{公比が負の場合は } S_n = \\frac{a(1 - r^n)}{1 - r} \\text{ の形が安全です。}`,
          `S_{${n}} = \\frac{${a} \\{ 1 - (-2)^{${n}} \\}}{1 - (-2)}`,
          `= \\frac{${a} \\{ 1 - (${Math.pow(-2, n)}) \\}}{3}`,
          `= \\frac{${a} \\cdot (${1 - Math.pow(-2, n)})}{3}`,
          `= ${num}` // den must be 1 for r=-2 ? Not necessarily, if a not div by 3. But usually we just show final fraction.
        ];
        if (den !== 1) expLines[4] = `= \\frac{${num}}{${den}}`;
      } else {
        expLines = [
          `\\text{公比が分数の場合は } S_n = \\frac{a(1 - r^n)}{1 - r} \\text{ を用います。}`,
          `S_{${n}} = \\frac{${a} \\left\\{ 1 - \\left(${rStr}\\right)^{${n}} \\right\\}}{1 - \\left(${rStr}\\right)}`,
          `= \\frac{${a} \\left( 1 - \\frac{${powNum}}{${powDen}} \\right)}{\\frac{${rDen - rNum}}{${rDen}}}`,
          `= ${a} \\left( \\frac{${powDen - powNum}}{${powDen}} \\right) \\times \\frac{${rDen}}{${rDen - rNum}}`
        ];
        if (den === 1) {
          expLines.push(`= ${num}`);
        } else {
          expLines.push(`= \\frac{${num}}{${den}}`);
        }
      }
      
      return { pattern: p, qStr, ansNum: num, ansDen: den, expLines };
    }
  }
}

export default function SequenceSumDrill() {
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
          等差・等比数列の和ドリル
        </h1>
        <p className="text-gray-500">
          数列の和の公式を正確に適用し、符号や分数の処理をミスなく行うための反復演習です。
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
                <option value="pattern1">パターン1 (等差数列の和・基本)</option>
                <option value="pattern2">パターン2 (等差数列の和・末項指定)</option>
                <option value="pattern3">パターン3 (等比数列の和・正の公比)</option>
                <option value="pattern4">パターン4 (等比数列の和・負/分数公比)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center leading-relaxed">
              <MathEq math={problem.qStr} />
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 font-bold">
                <div className="text-gray-500 text-xs mb-1">
                  分数になる場合は 15/2 のようにスラッシュで入力
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
                {isCorrect ? '正解！公式の適用と計算が完璧です。' : '不正解... 公式への代入や符号の処理を確認しましょう。'}
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
