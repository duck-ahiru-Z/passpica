"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  n: number;
  m?: number;
  q_val: number | string; // The number shown in the question
  a_val: string; // The correct answer (string to handle bases like '101')
  dec_val: number; // The decimal value internally
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      // 10進数 -> n進数
      let dec = Math.floor(Math.random() * 191) + 10; // 10 - 200
      let n = Math.floor(Math.random() * 8) + 2; // 2 - 9
      return { pattern: p, n, q_val: dec, a_val: dec.toString(n), dec_val: dec };
    } 
    else if (p === 'pattern2') {
      // n進数 -> 10進数
      let n = Math.floor(Math.random() * 8) + 2; // 2 - 9
      // 桁数 3〜4
      let len = Math.floor(Math.random() * 2) + 3;
      let dec = 0;
      let n_str = '';
      for (let i = 0; i < len; i++) {
        let maxDig = i === 0 ? n - 1 : n;
        let minDig = i === 0 ? 1 : 0;
        let d = Math.floor(Math.random() * (maxDig - minDig + 1)) + minDig;
        n_str += d.toString();
      }
      dec = parseInt(n_str, n);
      return { pattern: p, n, q_val: n_str, a_val: dec.toString(), dec_val: dec };
    }
    else if (p === 'pattern3') {
      // n進数 -> m進数
      let n = Math.floor(Math.random() * 8) + 2;
      let m = Math.floor(Math.random() * 8) + 2;
      if (n === m) continue;
      let dec = Math.floor(Math.random() * 40) + 10; // 10 - 50 (小さめ)
      return { pattern: p, n, m, q_val: dec.toString(n), a_val: dec.toString(m), dec_val: dec };
    }
    else if (p === 'pattern4') {
      // 10進数の小数 -> n進数
      let allowedN = [2, 4, 5, 8];
      let n = allowedN[Math.floor(Math.random() * allowedN.length)];
      // 2 digits max in base n for simplicity
      let d1 = Math.floor(Math.random() * n);
      let d2 = Math.floor(Math.random() * n);
      if (d1 === 0 && d2 === 0) continue;
      if (d2 === 0) d2 = 1; // force 2 digits or handle
      
      let val = d1 / n + d2 / (n * n);
      let a_str = `0.${d1}${d2}`;
      // Clean up trailing zeros
      if (d2 === 0) a_str = `0.${d1}`;
      
      return { pattern: p, n, q_val: val, a_val: a_str, dec_val: val };
    }
  }
}

export default function BaseNConversionDrill() {
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
    
    if (ansVal.trim() === problem.a_val) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return null;

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
      let lines = [];
      let remainders = [];
      while (v >= problem.n) {
        let q = Math.floor(v / problem.n);
        let r = v % problem.n;
        lines.push({ div: problem.n, val: v, rem: r });
        remainders.push(r);
        v = q;
      }
      lines.push({ div: '', val: v, rem: '' });
      remainders.push(v);
      
      let tex = "\\begin{array}{r|rr}\n";
      for (let i = 0; i < lines.length - 1; i++) {
        tex += `${lines[i].div} & ${lines[i].val} & \\cdots ${lines[i].rem} \\\\\n`;
        tex += `\\cline{2-2}\n`;
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
      let s = problem.q_val.toString();
      let n = problem.n;
      let terms = [];
      for (let i = 0; i < s.length; i++) {
        let p = s.length - 1 - i;
        terms.push(`${s[i]} \\times ${n}^${p}`);
      }
      let sumTex = terms.join(' + ');
      
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
      let s = problem.q_val.toString();
      let n = problem.n;
      let m = problem.m!;
      let terms = [];
      for (let i = 0; i < s.length; i++) {
        let p = s.length - 1 - i;
        terms.push(`${s[i]} \\times ${n}^${p}`);
      }
      
      let v = problem.dec_val;
      let lines = [];
      let remainders = [];
      while (v >= m) {
        let q = Math.floor(v / m);
        let r = v % m;
        lines.push({ div: m, val: v, rem: r });
        remainders.push(r);
        v = q;
      }
      lines.push({ div: '', val: v, rem: '' });
      remainders.push(v);
      
      let tex = "\\begin{array}{r|rr}\n";
      for (let i = 0; i < lines.length - 1; i++) {
        tex += `${lines[i].div} & ${lines[i].val} & \\cdots ${lines[i].rem} \\\\\n`;
        tex += `\\cline{2-2}\n`;
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
      let n = problem.n;
      let q = problem.q_val as number;
      let ansParts = problem.a_val.split('.')[1].split('');
      
      let mulSteps = [];
      let cur = q;
      for (let i = 0; i < ansParts.length; i++) {
        let next = cur * n;
        let intPart = Math.floor(next);
        let fracPart = next - intPart;
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
                value={selectedPattern}
                onChange={e => setSelectedPattern(e.target.value as Pattern | 'mix')}
                className="border p-1 text-xs"
              >
                <option value="mix">ミックスモード (ランダム)</option>
                <option value="pattern1">パターン1 (10進→n進)</option>
                <option value="pattern2">パターン2 (n進→10進)</option>
                <option value="pattern3">パターン3 (n進→m進)</option>
                <option value="pattern4">パターン4 (小数の変換)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-3 text-lg font-bold text-slate-700 text-center">
              {questionEl}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-xl font-bold">
                <input 
                  type="text" 
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansVal} 
                  onChange={e => setAnsVal(e.target.value)} 
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
                onClick={handleNext}
                className="retro-btn-classic"
              >
                次の問題へ ➔
              </button>
            </div>

            {hasChecked && (
              <div className={`mt-4 p-3 border font-bold text-center ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
                {isCorrect ? '正解！素晴らしい計算力です。' : '不正解... 解説を確認して仕組みを復習しましょう。'}
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
