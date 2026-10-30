"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { generateBaseNProblem, type BaseNPattern } from '@/src/lib/baseNConversion';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

type Pattern = BaseNPattern;
const generateProblem = generateBaseNProblem;
const strategyOptions: Array<{ pattern: Pattern; label: string }> = [
  { pattern: 'pattern1', label: '10進数の整数をn進数へ変換する' },
  { pattern: 'pattern2', label: 'n進数の各桁を位取りで10進数へ直す' },
  { pattern: 'pattern3', label: 'n進数から10進数を経由してm進数へ直す' },
  { pattern: 'pattern4', label: '小数部分にnを掛けてn進数へ変換する' },
];

export default function BaseNConversionDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateProblem('mix'));
  const [selectedStrategy, setSelectedStrategy] = useState<Pattern | ''>('');
  
  const [ansVal, setAnsVal] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleNext = (pattern: Pattern | 'mix' = selectedPattern) => {
    setProblem(generateProblem(pattern));
    setSelectedStrategy('');
    setAnsVal('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    if (ansVal.trim() === problem.a_val && (selectedPattern !== 'mix' || selectedStrategy === problem.pattern)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  // Render question text
  let questionEl = <></>;
  if (problem.pattern === 'pattern1') {
    questionEl = <>10進数 <MathEq math={problem.q_val.toString()} /> を <MathEq math={problem.n.toString()} />進法で表せ。</>;
  } else if (problem.pattern === 'pattern2') {
    questionEl = <><MathEq math={problem.n.toString()} />進数 <MathEq math={`${problem.q_val}_{(${problem.n})}`} /> を 10進法で表せ。</>;
  } else if (problem.pattern === 'pattern3') {
    questionEl = <><MathEq math={problem.n.toString()} />進数 <MathEq math={`${problem.q_val}_{(${problem.n})}`} /> を <MathEq math={problem.m!.toString()} />進法で表せ。</>;
  } else if (problem.pattern === 'pattern4') {
    questionEl = <>10進数の小数 <MathEq math={problem.q_val.toString()} /> を <MathEq math={problem.n.toString()} />進法で表せ。</>;
  }

  // Explanation rendering
  let explanationEl = <></>;
  if (hasChecked) {
    if (problem.pattern === 'pattern1') {
      let v = problem.dec_val;
      const lines = [];
      const remainders = [];
      while (v >= problem.n) {
        const q = Math.floor(v / problem.n);
        const r = v % problem.n;
        lines.push({ div: problem.n, val: v, rem: r });
        remainders.push(r);
        v = q;
      }
      lines.push({ div: '', val: v, rem: '' });
      remainders.push(v);
      
      let tex = "\\begin{array}{r|rr}\n";
      for (let i = 0; i < lines.length - 1; i++) {
        tex += `${lines[i].div} & ${lines[i].val} & \\cdots ${lines[i].rem} \\\\\n`;
      }
      tex += `  & ${lines[lines.length-1].val} & \\\\\n`;
      tex += "\\end{array}";

      explanationEl = (
        <div className="space-y-4">
          <p>10進数から <MathEq math={problem.n.toString()} />進数への変換は、商が <MathEq math={problem.n.toString()} /> より小さくなるまで <MathEq math={problem.n.toString()} /> で割り続けます。</p>
          <div className="flex justify-center bg-white p-4 border rounded">
            <MathEq math={tex} block />
          </div>
          <p>出てきた余りを<strong>下から上へ</strong>順に並べると答えになります。</p>
          <p className="text-center font-bold text-lg text-emerald-700 bg-emerald-50 p-2 rounded">
            よって、 <MathEq math={`${problem.a_val}_{(${problem.n})}`} />
          </p>
        </div>
      );
    } 
    else if (problem.pattern === 'pattern2') {
      const s = problem.q_val.toString();
      const n = problem.n;
      const terms = [];
      for (let i = 0; i < s.length; i++) {
        const p = s.length - 1 - i;
        terms.push(`${s[i]} \\times ${n}^${p}`);
      }
      const sumTex = terms.join(' + ');
      
      explanationEl = (
        <div className="space-y-4">
          <p><MathEq math={n.toString()} />進数から10進数へ戻すには、各桁の数に位の重み（<MathEq math={`\\dots, ${n}^2, ${n}^1, ${n}^0`} />）を掛けて足し合わせます。</p>
          <div className="bg-white p-4 border rounded text-center">
            <MathEq math={`\\begin{aligned} & ${sumTex} \\\\ &= ${problem.a_val} \\end{aligned}`} block />
          </div>
        </div>
      );
    }
    else if (problem.pattern === 'pattern3') {
      const s = problem.q_val.toString();
      const n = problem.n;
      const m = problem.m!;
      const terms = [];
      for (let i = 0; i < s.length; i++) {
        const p = s.length - 1 - i;
        terms.push(`${s[i]} \\times ${n}^${p}`);
      }
      
      let v = problem.dec_val;
      const lines = [];
      const remainders = [];
      while (v >= m) {
        const q = Math.floor(v / m);
        const r = v % m;
        lines.push({ div: m, val: v, rem: r });
        remainders.push(r);
        v = q;
      }
      lines.push({ div: '', val: v, rem: '' });
      remainders.push(v);
      
      let tex = "\\begin{array}{r|rr}\n";
      for (let i = 0; i < lines.length - 1; i++) {
        tex += `${lines[i].div} & ${lines[i].val} & \\cdots ${lines[i].rem} \\\\\n`;
      }
      tex += `  & ${lines[lines.length-1].val} & \\\\\n`;
      tex += "\\end{array}";

      explanationEl = (
        <div className="space-y-4">
          <p><strong>ステップ1：まず10進数に直す</strong></p>
          <div className="bg-white p-2 border rounded text-center">
            <MathEq math={`${s}_{(${n})} = ${terms.join(' + ')} = ${problem.dec_val}`} block />
          </div>
          <p><strong>ステップ2：10進数を{m}進数に変換する</strong></p>
          <div className="flex justify-center bg-white p-4 border rounded">
            <MathEq math={tex} block />
          </div>
          <p className="text-center font-bold text-lg text-emerald-700 bg-emerald-50 p-2 rounded">
            よって、 <MathEq math={`${problem.a_val}_{(${m})}`} />
          </p>
        </div>
      );
    }
    else if (problem.pattern === 'pattern4') {
      const n = problem.n;
      const q = problem.q_val as number;
      const ansParts = problem.a_val.split('.')[1].split('');
      
      const mulSteps = [];
      let cur = q;
      for (let i = 0; i < ansParts.length; i++) {
        const next = cur * n;
        const intPart = Math.floor(next);
        const fracPart = next - intPart;
        mulSteps.push(`${cur} \\times ${n} = \\mathbf{${intPart}} + ${fracPart.toFixed(3).replace(/0+$/, '').replace(/\\.$/, '')}`);
        cur = fracPart;
      }

      explanationEl = (
        <div className="space-y-4">
          <p>10進数の小数を <MathEq math={n.toString()} />進数にするには、小数部分に <MathEq math={n.toString()} /> を掛け続け、出てきた<strong>整数部分</strong>を上から順に取り出します。</p>
          <div className="bg-white p-4 border rounded flex justify-center text-sm">
            <MathEq math={`\\begin{aligned} ${mulSteps.map(s => '&' + s).join('\\\\')} \\end{aligned}`} block />
          </div>
          <p className="text-center font-bold text-lg text-emerald-700 bg-emerald-50 p-2 rounded">
            よって、 <MathEq math={`${problem.a_val}_{(${n})}`} />
          </p>
        </div>
      );
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          n進法の変換ドリル
        </h1>
        <p className="text-gray-500">
          10進法からn進法へ、n進法から10進法へ。筆算や展開のメカニズムを定着させるドリルです。
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
                aria-label="n進法変換の演習パターン"
                value={selectedPattern}
                onChange={e => { const pattern = e.target.value as Pattern | 'mix'; setSelectedPattern(pattern); handleNext(pattern); }}
                className="border p-1 text-xs"
              >
                <option value="mix">ミックスモード (ランダム)</option>
                <option value="pattern1">パターン1 (10進→n進)</option>
                <option value="pattern2">パターン2 (n進→10進)</option>
                <option value="pattern3">パターン3 (n進→m進)</option>
                <option value="pattern4">パターン4 (小数の変換)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 min-h-[120px] text-lg font-bold text-slate-700 text-center leading-relaxed">
              {questionEl}
            </div>

            {selectedPattern === 'mix' && (
              <fieldset className="mb-6 border border-gray-300 rounded p-3">
                <legend className="px-1 font-bold text-slate-700">使う変換方法を選んでください</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {strategyOptions.map(({ pattern, label }) => (
                    <label key={pattern} className="flex items-center gap-2 rounded border border-gray-200 bg-white p-2 cursor-pointer">
                      <input
                        type="radio"
                        name="base-n-conversion-strategy"
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
              <div className="flex items-center justify-center gap-2 text-xl font-bold">
                <input 
                  type="text" 
                  aria-label="変換した数値の答え"
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => { setAnsVal(e.target.value); setHasChecked(false); setIsCorrect(false); }}
                  placeholder="解答"
                />
                {(problem.pattern === 'pattern1' || problem.pattern === 'pattern3' || problem.pattern === 'pattern4') && (
                  <span className="text-sm text-gray-500 mt-2">
                    <MathEq math={`_{(${problem.pattern === 'pattern3' ? problem.m : problem.n})}`} />
                  </span>
                )}
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
                  ? '正解！素晴らしい計算力です。'
                  : selectedPattern === 'mix' && selectedStrategy !== problem.pattern
                    ? '変換方法の選択を確認しましょう。問題に合う手順を見直してください。'
                    : '不正解... 解説を確認して仕組みを復習しましょう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
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
              <div className="text-xs leading-relaxed">
                {explanationEl}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
