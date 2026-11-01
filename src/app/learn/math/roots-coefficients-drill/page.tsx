"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { parseRationalParts, rationalEquals } from '@/src/lib/rationalInput';
import { generateRootsCoefficientsProblem, type RootsCoefficientsMode, type RootsCoefficientsProblem } from '@/src/lib/rootsCoefficients';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

type Pattern = RootsCoefficientsMode;
type ProblemData = RootsCoefficientsProblem;

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

export default function RootsCoefficientsDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useClientGeneratedState<ProblemData>(() => generateRootsCoefficientsProblem('mix'));
  
  const [ansSign, setAnsSign] = useState<'+' | '-'>('+');
  const [ansNumStr, setAnsNumStr] = useState<string>('');
  const [ansDenStr, setAnsDenStr] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleNext = () => {
    setProblem(generateRootsCoefficientsProblem(selectedPattern));
    setAnsSign('+');
    setAnsNumStr('');
    setAnsDenStr('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const parsedAnswer = parseRationalParts(ansNumStr.trim() === '' ? '0' : ansNumStr, ansDenStr);
    const signedAnswer = parsedAnswer && {
      numerator: ansSign === '-' ? -parsedAnswer.numerator : parsedAnswer.numerator,
      denominator: parsedAnswer.denominator,
    };
    setIsCorrect(rationalEquals(signedAnswer, { numerator: problem.ansNum, denominator: problem.ansDen }));
    setHasChecked(true);
  };

  if (!problem) return <main className="max-w-5xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  const eqStr = formatPoly(problem.a, problem.b, problem.c);

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
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 問題
              </h2>
              <select 
                aria-label="練習する解と係数のパターン"
                value={selectedPattern}
                onChange={e => { const pattern = e.target.value as Pattern; setSelectedPattern(pattern); setProblem(generateRootsCoefficientsProblem(pattern)); setAnsSign('+'); setAnsNumStr(''); setAnsDenStr(''); setHasChecked(false); setIsCorrect(false); }}
                className="border p-1 text-xs"
              >
                <option value="mix">ミックスモード (ランダム)</option>
                <option value="pattern1">パターン1 (2乗の和)</option>
                <option value="pattern2">パターン2 (3乗の和)</option>
                <option value="pattern3">パターン3 (分数の対称式)</option>
                <option value="pattern4">パターン4 (解の差の2乗)</option>
              </select>
            </div>

            <div className="bg-white p-5 sm:p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center gap-4 text-base font-bold text-slate-700 text-center">
              <p>2次方程式 <MathEq math={eqStr} /> の2つの解を <MathEq math="\alpha, \beta" /> とするとき、</p>
              <p>次の式の値を求めよ。</p>
              <div className="text-2xl text-blue-700 py-2 overflow-x-auto"><MathEq math={problem.questionText} /></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-gray-500 font-bold mb-2">整数になる場合は分母を空欄または1にしてください</div>
                <div className="flex items-center gap-2">
                  <select 
                    aria-label="答えの符号"
                    className="border-b-2 bg-transparent outline-none text-2xl font-bold focus:border-blue-500 pb-1"
                    value={ansSign}
                    onChange={(e) => { setAnsSign(e.target.value as '+' | '-'); setHasChecked(false); setIsCorrect(false); }}
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                  
                  <div className="flex flex-col gap-1 items-center">
                    <input 
                      type="number" 
                      aria-label="答えの分子"
                      className="w-16 bg-transparent outline-none text-center font-bold text-xl text-slate-800" 
                      value={ansNumStr} 
                      onChange={e => { setAnsNumStr(e.target.value); setHasChecked(false); setIsCorrect(false); }}
                      placeholder="分子"
                    />
                    <div className="w-full h-0.5 bg-slate-800"></div>
                    <input 
                      type="number" 
                      aria-label="答えの分母"
                      className="w-16 bg-transparent outline-none text-center font-bold text-xl text-slate-800" 
                      value={ansDenStr} 
                      onChange={e => { setAnsDenStr(e.target.value); setHasChecked(false); setIsCorrect(false); }}
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
              <div role="status" aria-live="polite" className={`mt-4 p-3 border font-bold text-center ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
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
