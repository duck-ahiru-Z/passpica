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
  a: number;
  b: number;
  c: number;
  ansNum: number;
  ansDen: number;
  questionText: string;
}

function getRand(min: number, max: number, nonZero = true) {
  let v = 0;
  while (true) {
    v = Math.floor(Math.random() * (max - min + 1)) + min;
    if (nonZero && v === 0) continue;
    break;
  }
  return v;
}

function formatPoly(a: number, b: number, c: number) {
  let s = "";
  if (a === 1) s += "x^2";
  else if (a === -1) s += "-x^2";
  else s += `${a}x^2`;

  if (b === 1) s += "+x";
  else if (b === -1) s += "-x";
  else if (b > 0) s += `+${b}x`;
  else if (b < 0) s += `${b}x`;

  if (c > 0) s += `+${c}`;
  else if (c < 0) s += `${c}`;

  return s + "=0";
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let a = getRand(-4, 4);
    let b = getRand(-5, 5, false);
    let c = getRand(-5, 5);

    if (p === 'pattern2') {
      a = 1; // 3乗は大きくなるのでa=1に固定
    }
    if (p === 'pattern3') {
      // 1/a + 1/b requires c != 0
      if (c === 0) continue;
    }

    let num = 0;
    let den = 1;
    let text = "";

    if (p === 'pattern1') {
      // a^2 + b^2 = (b^2 - 2ac)/a^2
      num = b * b - 2 * a * c;
      den = a * a;
      text = "\\alpha^2 + \\beta^2";
    } else if (p === 'pattern2') {
      // a^3 + b^3 = (-b^3 + 3abc)/a^3
      num = -b * b * b + 3 * a * b * c;
      den = a * a * a;
      text = "\\alpha^3 + \\beta^3";
    } else if (p === 'pattern3') {
      // 1/a + 1/b = -b/c
      // OR b/a + a/b = (a^2+b^2)/ab = (b^2-2ac)/(ac)
      if (Math.random() > 0.5) {
        num = -b;
        den = c;
        text = "\\frac{1}{\\alpha} + \\frac{1}{\\beta}";
      } else {
        num = b * b - 2 * a * c;
        den = a * c;
        text = "\\frac{\\beta}{\\alpha} + \\frac{\\alpha}{\\beta}";
      }
    } else if (p === 'pattern4') {
      // (a-b)^2 = (b^2 - 4ac)/a^2
      num = b * b - 4 * a * c;
      den = a * a;
      text = "(\\alpha - \\beta)^2";
    }

    // reduce fraction
    let g = gcd(num, den);
    num /= g;
    den /= g;
    if (den < 0) {
      num = -num;
      den = -den;
    }

    return { pattern: p, a, b, c, ansNum: num, ansDen: den, questionText: text };
  }
}

export default function RootsCoefficientsDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansSign, setAnsSign] = useState<'+' | '-'>('+');
  const [ansNumStr, setAnsNumStr] = useState<string>('');
  const [ansDenStr, setAnsDenStr] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsSign('+');
    setAnsNumStr('');
    setAnsDenStr('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let uNum = parseInt(ansNumStr) || 0;
    let uDen = parseInt(ansDenStr) || 1;
    if (ansSign === '-') uNum = -uNum;
    
    // cross multiply check for fraction equality
    if (uNum * problem.ansDen === problem.ansNum * uDen) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return null;

  let eqStr = formatPoly(problem.a, problem.b, problem.c);

  // Math components for explanation
  let sumVal = `\\frac{${-problem.b}}{${problem.a}}`;
  if (problem.b % problem.a === 0) sumVal = `${-problem.b / problem.a}`;
  let prodVal = `\\frac{${problem.c}}{${problem.a}}`;
  if (problem.c % problem.a === 0) prodVal = `${problem.c / problem.a}`;

  let explanationEl = <></>;
  if (hasChecked) {
    if (problem.pattern === 'pattern1') {
      explanationEl = (
        <>
          <MathEq math={`\\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta`} block />
          <MathEq math={`= \\left(${sumVal}\\right)^2 - 2\\left(${prodVal}\\right)`} block />
        </>
      );
    } else if (problem.pattern === 'pattern2') {
      explanationEl = (
        <>
          <MathEq math={`\\alpha^3 + \\beta^3 = (\\alpha+\\beta)^3 - 3\\alpha\\beta(\\alpha+\\beta)`} block />
          <MathEq math={`= \\left(${sumVal}\\right)^3 - 3\\left(${prodVal}\\right)\\left(${sumVal}\\right)`} block />
        </>
      );
    } else if (problem.pattern === 'pattern3') {
      if (problem.questionText.includes('1')) {
        explanationEl = (
          <>
            <MathEq math={`\\frac{1}{\\alpha} + \\frac{1}{\\beta} = \\frac{\\alpha+\\beta}{\\alpha\\beta}`} block />
            <MathEq math={`= \\frac{${sumVal}}{${prodVal}}`} block />
          </>
        );
      } else {
        explanationEl = (
          <>
            <MathEq math={`\\frac{\\beta}{\\alpha} + \\frac{\\alpha}{\\beta} = \\frac{\\alpha^2+\\beta^2}{\\alpha\\beta}`} block />
            <MathEq math={`= \\frac{(\\alpha+\\beta)^2 - 2\\alpha\\beta}{\\alpha\\beta}`} block />
          </>
        );
      }
    } else if (problem.pattern === 'pattern4') {
      explanationEl = (
        <>
          <MathEq math={`(\\alpha - \\beta)^2 = (\\alpha+\\beta)^2 - 4\\alpha\\beta`} block />
          <MathEq math={`= \\left(${sumVal}\\right)^2 - 4\\left(${prodVal}\\right)`} block />
          <div className="mt-4 p-2 bg-yellow-50 text-yellow-800 border rounded">
            ※ 補足：これは解の公式のルートの中身である「判別式 <MathEq math="D = b^2 - 4ac" /> 」を <MathEq math="a^2" /> で割った値（<MathEq math="\\frac{D}{a^2}" />）と一致します！
          </div>
        </>
      );
    }
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
          解と係数の関係ドリル
        </h1>
        <p className="text-gray-500">
          2次方程式の解を直接求めず、和と積の対称性を利用して式の値を瞬時に導き出す演習です。
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
                <option value="pattern1">パターン1 (2乗の和)</option>
                <option value="pattern2">パターン2 (3乗の和)</option>
                <option value="pattern3">パターン3 (分数の対称式)</option>
                <option value="pattern4">パターン4 (解の差の2乗)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center gap-4 text-base font-bold text-slate-700 text-center">
              2次方程式 <MathEq math={eqStr} /> の2つの解を <MathEq math="\\alpha, \\beta" /> とするとき、次の式の値を求めよ。<br/>
              <span className="text-2xl text-blue-700 my-2"><MathEq math={problem.questionText} /></span>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-gray-500 font-bold mb-2">整数になる場合は分母を空欄または1にしてください</div>
                <div className="flex items-center gap-2">
                  <select 
                    className="border-b-2 bg-transparent outline-none text-2xl font-bold focus:border-blue-500 pb-1"
                    value={ansSign}
                    onChange={(e) => setAnsSign(e.target.value as '+' | '-')}
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                  
                  <div className="flex flex-col gap-1 items-center">
                    <input 
                      type="number" 
                      className="w-16 bg-transparent outline-none text-center font-bold text-xl text-slate-800" 
                      value={ansNumStr} 
                      onChange={e => setAnsNumStr(e.target.value)} 
                      placeholder="分子"
                    />
                    <div className="w-full h-0.5 bg-slate-800"></div>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent outline-none text-center font-bold text-xl text-slate-800" 
                      value={ansDenStr} 
                      onChange={e => setAnsDenStr(e.target.value)} 
                      placeholder="分母"
                    />
                  </div>
                </div>
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
                {isCorrect ? '正解！見事な式変形です。' : '不正解... 解と係数の関係式を確認しましょう。'}
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
                  <p className="font-bold border-b pb-1 mb-2">解と係数の関係の確認</p>
                  <p><MathEq math={`ax^2+bx+c=0`} /> の解について、</p>
                  <div className="text-center pb-2">
                    <MathEq math={`\\alpha+\\beta = -\\frac{b}{a} = ${sumVal}`} block />
                    <MathEq math={`\\alpha\\beta = \\frac{c}{a} = ${prodVal}`} block />
                  </div>
                </div>

                <div className="bg-gray-50 p-3 border space-y-2">
                  <p className="font-bold border-b pb-1 mb-2">対称式の変形</p>
                  {explanationEl}
                  <p className="text-center mt-2 text-lg font-bold text-emerald-700">
                    <MathEq math={`= ${ansDisplay}`} />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
