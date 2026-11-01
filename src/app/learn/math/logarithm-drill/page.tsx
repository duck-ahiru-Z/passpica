"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { generateLogarithmProblem, type LogarithmPattern } from '@/src/lib/logarithmDrill';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { parseRationalAnswer, rationalEquals } from '@/src/lib/rationalInput';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function ExplanationLine({ value }: { value: string }) {
  const parts: Array<{ value: string; text: boolean }> = [];
  const textPattern = /\\text\{([^{}]*)\}/g;
  let lastIndex = 0;

  for (const match of value.matchAll(textPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push({ value: value.slice(lastIndex, index), text: false });
    parts.push({ value: match[1], text: true });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < value.length) parts.push({ value: value.slice(lastIndex), text: false });

  return <>
    {parts.map((part, index) => {
      if (part.text || /[^\x00-\x7F]/.test(part.value)) {
        return <span key={index}>{part.value}</span>;
      }
      return part.value.trim() ? <MathEq key={index} math={part.value} /> : <span key={index}>{part.value}</span>;
    })}
  </>;
}

type Pattern = LogarithmPattern;
const strategyOptions: Array<{ pattern: Pattern; label: string }> = [
  { pattern: 'pattern1', label: '底の変換公式で底をそろえる' },
  { pattern: 'pattern2', label: '連鎖する対数の積を整理する' },
  { pattern: 'pattern3', label: '逆数の関係を使う' },
  { pattern: 'pattern4', label: '指数と対数の逆関係を使う' },
];

export default function LogarithmDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateLogarithmProblem('mix'));
  const [selectedStrategy, setSelectedStrategy] = useState<Pattern | ''>('');
  
  const [ansVal, setAnsVal] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleNext = (pattern: Pattern | 'mix' = selectedPattern) => {
    setProblem(generateLogarithmProblem(pattern));
    setSelectedStrategy('');
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const answer = parseRationalAnswer(ansVal);
    if (rationalEquals(answer, { numerator: problem.ansNum, denominator: problem.ansDen })
      && (selectedPattern !== 'mix' || selectedStrategy === problem.pattern)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  let explanationEl = <></>;
  if (hasChecked) {
    explanationEl = (
      <div className="space-y-4">
        {problem.expLines.map((line, idx) => {
          if (line.includes('\\text{')) {
            return <div key={idx} className="text-gray-600 mb-1 mt-4"><ExplanationLine value={line} /></div>;
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
                aria-label="対数計算の演習パターン"
                value={selectedPattern}
                onChange={e => { const pattern = e.target.value as Pattern | 'mix'; setSelectedPattern(pattern); handleNext(pattern); }}
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

            {selectedPattern === 'mix' && (
              <fieldset className="mb-6 border border-gray-300 rounded p-3">
                <legend className="px-1 font-bold text-slate-700">使う解法を選んでください</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {strategyOptions.map(({ pattern, label }) => (
                    <label key={pattern} className="flex items-center gap-2 rounded border border-gray-200 bg-white p-2 cursor-pointer">
                      <input
                        type="radio"
                        name="logarithm-strategy"
                        aria-label={label}
                        value={pattern}
                        checked={selectedStrategy === pattern}
                        onChange={() => { setSelectedStrategy(pattern); setHasChecked(false); setIsCorrect(false); }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 font-bold">
                <div className="text-gray-500 text-xs mb-1">
                  分数になる場合は 3/2 のようにスラッシュで入力
                </div>
                <input 
                  type="text" 
                  aria-label="対数計算の答え"
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => { setAnsVal(e.target.value); setHasChecked(false); setIsCorrect(false); }}
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
                onClick={() => handleNext()}
                className="retro-btn-classic"
              >
                次の問題へ ➔
              </button>
            </div>

            {hasChecked && (
              <div className={`mt-4 p-3 border font-bold text-center ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
                {isCorrect
                  ? '正解！対数の性質を見事に使いこなしています。'
                  : selectedPattern === 'mix' && selectedStrategy !== problem.pattern
                    ? '解法の選択を確認しましょう。問題に合う性質を見直してください。'
                    : '不正解... 解説を見て計算のステップを確認しましょう。'}
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
