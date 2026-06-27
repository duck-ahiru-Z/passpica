"use client";

import { useState, useEffect, useRef } from 'react';
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
  qStr: string;
  data: number[];
  ans1?: string; // Mean
  ans2?: string; // Median or Variance
  ans3?: string; // Mode or New Mean
  ans4?: string; // New Variance
  
  a?: number;
  b?: number;
  origMean?: number;
  origVar?: number;

  expLines: string[];
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      // Mean, Median, Mode (5-7 items)
      let n = Math.floor(Math.random() * 3) + 5; // 5, 6, 7
      let data = [];
      let sum = 0;
      let modeVal = Math.floor(Math.random() * 10) + 1; // 1..10
      data.push(modeVal);
      data.push(modeVal);
      sum += modeVal * 2;
      
      for (let i = 2; i < n; i++) {
        let val = Math.floor(Math.random() * 10) + 1;
        while (val === modeVal) val = Math.floor(Math.random() * 10) + 1; // force single mode mostly
        data.push(val);
        sum += val;
      }
      
      // adjust to integer mean
      let rem = sum % n;
      if (rem !== 0) {
        let diff = n - rem;
        // add diff to a non-mode element
        for (let i = 2; i < n; i++) {
          if (data[i] + diff <= 20 && data[i] + diff !== modeVal) {
            data[i] += diff;
            sum += diff;
            break;
          }
        }
      }
      
      if (sum % n !== 0) continue; // retry if fail
      let mean = sum / n;
      
      let sorted = [...data].sort((a,b)=>a-b);
      let median = n % 2 === 1 ? sorted[Math.floor(n/2)] : (sorted[n/2 - 1] + sorted[n/2]) / 2;
      
      // Shuffle data
      data.sort(() => Math.random() - 0.5);
      
      let qStr = `次のデータについて、平均値、中央値、最頻値を求めよ。\n\n$${data.join(', ')}$`;
      
      let expLines = [
        `\\text{データの合計は } ${data.join(' + ')} = ${sum}`,
        `\\text{平均値 } \\bar{x} = \\frac{${sum}}{${n}} = ${mean}`,
        `\\text{データを小さい順に並べると } ${sorted.join(', ')}`,
        `\\text{中央値は } ${n%2===1 ? `中央の値である ${median}` : `中央の2つの値の平均なので \\frac{${sorted[n/2 - 1]} + ${sorted[n/2]}}{2} = ${median}`}`,
        `\\text{最も多く現れる値（最頻値）は } ${modeVal} \\text{ です。}`
      ];
      
      return { pattern: p, qStr, data, ans1: mean.toString(), ans2: median.toString(), ans3: modeVal.toString(), expLines };
    }
    else if (p === 'pattern2') {
      // Variance def. 5 items. Mean int. sum of sq diffs is multiple of 5.
      let mean = Math.floor(Math.random() * 5) + 5; // 5..9
      // We want 5 deviations that sum to 0. And sum of sq is multiple of 5.
      // e.g. dev: [-2, -1, 0, 1, 2] -> sq: 4, 1, 0, 1, 4 -> sum 10. var=2.
      // [-3, -1, 0, 1, 3] -> 9, 1, 0, 1, 9 -> 20. var=4.
      // [-4, -2, 0, 2, 4] -> 16, 4, 0, 4, 16 -> 40. var=8.
      // [-2, -2, 0, 2, 2] -> 4, 4, 0, 4, 4 -> 16. (not mult of 5, wait variance is 16/5=3.2. which is fine but user wants nice values)
      let devsList = [
        [-2, -1, 0, 1, 2],
        [-3, -1, 0, 1, 3],
        [-4, -2, 0, 2, 4],
        [-1, -1, 0, 1, 1], // sum sq 4. var = 0.8
        [-5, -3, 0, 3, 5],
      ];
      let devs = devsList[Math.floor(Math.random() * devsList.length)];
      
      let data = devs.map(d => mean + d);
      data.sort(() => Math.random() - 0.5);
      
      let sumSq = devs.reduce((a, b) => a + b*b, 0);
      let variance = sumSq / 5;
      
      let qStr = `次の5個のデータについて、分散を求めよ。\n\n$${data.join(', ')}$`;
      
      let expLines = [
        `\\text{平均値 } \\bar{x} = \\frac{${data.join(' + ')}}{5} = ${mean}`,
        `\\text{各データの偏差 } (x_i - \\bar{x}) \\text{ は } ${data.map(x => x - mean).join(', ')}`,
        `\\text{偏差の2乗は } ${data.map(x => Math.pow(x - mean, 2)).join(', ')}`,
        `\\text{分散 } s^2 = \\frac{${data.map(x => Math.pow(x - mean, 2)).join(' + ')}}{5} = \\frac{${sumSq}}{5} = ${variance}`
      ];
      
      return { pattern: p, qStr, data, ans1: variance.toString(), expLines };
    }
    else if (p === 'pattern3') {
      // Variance alt formula. Give slightly larger numbers
      let base = Math.floor(Math.random() * 5) * 10 + 20; // 20, 30, 40, 50, 60
      let devsList = [
        [-2, -1, 0, 1, 2],
        [-3, -1, 0, 1, 3]
      ];
      let devs = devsList[Math.floor(Math.random() * devsList.length)];
      let data = devs.map(d => base + d);
      data.sort(() => Math.random() - 0.5);
      
      let sum = data.reduce((a,b)=>a+b, 0);
      let mean = sum/5;
      let sumSq = data.reduce((a,b)=>a+b*b, 0);
      let meanSq = sumSq / 5;
      let variance = meanSq - mean*mean;
      
      let qStr = `次の5個のデータについて、2乗の平均から平均の2乗を引く公式を利用して分散を求めよ。\n\n$${data.join(', ')}$`;
      
      let expLines = [
        `\\text{別公式 } s^2 = \\overline{x^2} - (\\bar{x})^2 \\text{ を用います。}`,
        `\\text{平均値 } \\bar{x} = \\frac{${sum}}{5} = ${mean}`,
        `\\text{2乗の和は } ${data.map(x => x*x).join(' + ')} = ${sumSq}`,
        `\\text{2乗の平均 } \\overline{x^2} = \\frac{${sumSq}}{5} = ${meanSq}`,
        `\\text{分散 } s^2 = ${meanSq} - ${mean}^2 = ${meanSq} - ${mean*mean} = ${variance}`
      ];
      
      return { pattern: p, qStr, data, ans1: variance.toString(), expLines };
    }
    else if (p === 'pattern4') {
      // Data transform
      let origMean = Math.floor(Math.random() * 10) + 10;
      let origVar = Math.floor(Math.random() * 5) + 2;
      
      let a = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
      let b = Math.floor(Math.random() * 10) - 5; // -5 .. 4
      if (b === 0) b = 5;
      
      let qStr = `ある変量 $x$ の平均値が $${origMean}$、分散が $${origVar}$ である。\n新しい変量 $y$ を $y = ${a}x ${b > 0 ? '+' : '-'} ${Math.abs(b)}$ で定めるとき、$y$ の平均値と分散を求めよ。`;
      
      let newMean = a * origMean + b;
      let newVar = a * a * origVar;
      
      let expLines = [
        `\\text{変量の変換公式 } y = ax + b \\text{ に対し、}`,
        `\\bar{y} = a\\bar{x} + b, \\quad s_y^2 = a^2 s_x^2 \\text{ が成り立ちます。}`,
        `\\text{平均値 } \\bar{y} = ${a} \\times ${origMean} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = ${newMean}`,
        `\\text{分散 } s_y^2 = ${a}^2 \\times ${origVar} = ${a*a} \\times ${origVar} = ${newVar}`
      ];
      
      return { pattern: p, qStr, data: [], a, b, origMean, origVar, ans1: newMean.toString(), ans2: newVar.toString(), expLines };
    }
  }
}

export default function DataAnalysis1DDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ans1, setAns1] = useState<string>('');
  const [ans2, setAns2] = useState<string>('');
  const [ans3, setAns3] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAns1('');
    setAns2('');
    setAns3('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    let isOk = false;
    
    let v1 = parseFloat(ans1.trim() || 'NaN');
    let v2 = parseFloat(ans2.trim() || 'NaN');
    let v3 = parseFloat(ans3.trim() || 'NaN');
    
    if (problem.pattern === 'pattern1') {
      if (Math.abs(v1 - parseFloat(problem.ans1!)) < 0.01 && 
          Math.abs(v2 - parseFloat(problem.ans2!)) < 0.01 && 
          Math.abs(v3 - parseFloat(problem.ans3!)) < 0.01) isOk = true;
    } else if (problem.pattern === 'pattern2' || problem.pattern === 'pattern3') {
      if (Math.abs(v1 - parseFloat(problem.ans1!)) < 0.01) isOk = true;
    } else if (problem.pattern === 'pattern4') {
      if (Math.abs(v1 - parseFloat(problem.ans1!)) < 0.01 &&
          Math.abs(v2 - parseFloat(problem.ans2!)) < 0.01) isOk = true;
    }
    
    setIsCorrect(isOk);
    setHasChecked(true);
  };

  const drawGraph = () => {
    if (!problem || !canvasRef.current || problem.pattern === 'pattern4') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw simple dot plot / histogram for the data
    let data = problem.data;
    if (!data || data.length === 0) return;
    
    let minX = Math.min(...data) - 1;
    let maxX = Math.max(...data) + 1;
    
    let padX = 20;
    let plotW = W - 2 * padX;
    
    // Axis
    let baseY = H - 30;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(padX, baseY); ctx.lineTo(W - padX, baseY); ctx.stroke();
    
    // Draw dots
    let counts: Record<number, number> = {};
    for (let x of data) counts[x] = (counts[x] || 0) + 1;
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    for (let x = minX; x <= maxX; x++) {
      let px = padX + ((x - minX) / (maxX - minX)) * plotW;
      
      // tick mark
      ctx.beginPath(); ctx.moveTo(px, baseY); ctx.lineTo(px, baseY + 4); ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.fillText(x.toString(), px, baseY + 14);
      
      let c = counts[x] || 0;
      ctx.fillStyle = '#3b82f6';
      for (let i = 0; i < c; i++) {
        let py = baseY - 10 - i * 16;
        ctx.beginPath(); ctx.arc(px, py, 6, 0, 2*Math.PI); ctx.fill();
      }
    }
    
    if (hasChecked && (problem.pattern === 'pattern1' || problem.pattern === 'pattern2' || problem.pattern === 'pattern3')) {
      // Draw mean line
      let mean = parseFloat(problem.ans1!);
      if (problem.pattern === 'pattern1') mean = parseFloat(problem.ans1!);
      
      let px = padX + ((mean - minX) / (maxX - minX)) * plotW;
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(px, baseY); ctx.lineTo(px, baseY - 60); ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#ef4444';
      ctx.fillText('平均', px, baseY - 65);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          データの分析（1変量）ドリル
        </h1>
        <p className="text-gray-500">
          平均、中央値、分散などの代表値の計算や、公式の使い分け、変量の変換則をマスターします。
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
                <option value="pattern1">パターン1 (平均・中央値・最頻値)</option>
                <option value="pattern2">パターン2 (分散の定義計算)</option>
                <option value="pattern3">パターン3 (分散の別公式)</option>
                <option value="pattern4">パターン4 (データの変換)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center leading-relaxed whitespace-pre-wrap">
              <div>
                {problem.qStr.split('$').map((part, i) => 
                  i % 2 === 1 ? <MathEq key={i} math={part} /> : <span key={i}>{part}</span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {problem.pattern === 'pattern1' && (
                <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                  <div className="flex items-center gap-4 text-xl">
                    <span>平均値 =</span>
                    <input 
                      type="number" step="0.1"
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans1} 
                      onChange={e => setAns1(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xl">
                    <span>中央値 =</span>
                    <input 
                      type="number" step="0.5"
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans2} 
                      onChange={e => setAns2(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xl">
                    <span>最頻値 =</span>
                    <input 
                      type="number" 
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans3} 
                      onChange={e => setAns3(e.target.value)} 
                    />
                  </div>
                </div>
              )}
              {(problem.pattern === 'pattern2' || problem.pattern === 'pattern3') && (
                <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                  <div className="flex items-center gap-4 text-xl">
                    <span>分散 <MathEq math="s^2" /> =</span>
                    <input 
                      type="number" step="0.1"
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans1} 
                      onChange={e => setAns1(e.target.value)} 
                    />
                  </div>
                </div>
              )}
              {problem.pattern === 'pattern4' && (
                <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                  <div className="flex items-center gap-4 text-xl">
                    <span>平均値 <MathEq math="\bar{y}" /> =</span>
                    <input 
                      type="number" step="0.1"
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans1} 
                      onChange={e => setAns1(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xl">
                    <span>分散 <MathEq math="s_y^2" /> =</span>
                    <input 
                      type="number" step="0.1"
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans2} 
                      onChange={e => setAns2(e.target.value)} 
                    />
                  </div>
                </div>
              )}
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
                {isCorrect ? '正解！1変量の分析はバッチリです。' : '不正解... 計算ミスがないか、公式をもう一度確認しましょう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 図解・解説
              </h2>
            </div>

            {problem.pattern !== 'pattern4' && (
              <div className="flex justify-center mb-4 bg-white border border-gray-300 shadow-sm relative pt-4">
                <canvas ref={canvasRef} width={260} height={120} className="w-full max-w-full h-auto" />
              </div>
            )}

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="text-xs leading-relaxed">
                <div className="bg-gray-50 p-3 border space-y-2">
                  <p className="font-bold border-b pb-1 mb-2">解説</p>
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
