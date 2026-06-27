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

interface DBEntry {
  x: number[];
  y: number[];
  rStr: string;
  rVal: number;
}

const correlationDB: DBEntry[] = [
  { x: [3, 4, 5, 6, 7], y: [4, 3, 5, 7, 6], rStr: "0.8", rVal: 0.8 },
  { x: [12, 13, 14, 15, 16], y: [12, 9, 10, 11, 8], rStr: "-0.6", rVal: -0.6 },
  { x: [1, 2, 3, 4, 5], y: [4, 1, 3, 5, 2], rStr: "0", rVal: 0 },
  { x: [2, 4, 6, 8, 10], y: [3, 5, 7, 9, 11], rStr: "1", rVal: 1 },
  { x: [2, 4, 6, 8, 10], y: [11, 9, 7, 5, 3], rStr: "-1", rVal: -1 },
  { x: [7, 8, 9, 10, 11], y: [8, 11, 9, 7, 10], rStr: "-0.4", rVal: -0.4 }, // devs: -2,-1,0,1,2 (10), Ydevs: -1,2,0,-2,1 (10). Prod: 2 - 2 + 0 - 2 + 2 = 0 -> wait, r=0.
  // let's fix DB entry 6
  // Xdev: -2,-1,0,1,2. Ydev: -1,2,0,-1,-0? No.
  // Ydev: 1, 2, 0, -2, -1 (sq=10). Prod: -2 - 2 + 0 - 2 - 2 = -8. r = -0.8.
];
correlationDB[5] = { x: [7, 8, 9, 10, 11], y: [10, 11, 9, 7, 8], rStr: "-0.8", rVal: -0.8 };

interface ProblemData {
  pattern: Pattern;
  qStr: string;
  dataX?: number[];
  dataY?: number[];
  
  ans1?: string; // Covariance / Correlation / Guess / Cell value
  
  // For scatter
  scatterPoints?: {x: number, y: number}[];
  scatterChoices?: number[];
  
  // For Cross table
  tableData?: {
    a: number; b: number;
    c: number; d: number;
    totA: number; totB: number;
    totC: number; totD: number;
    tot: number;
    targetCell: 'a'|'b'|'c'|'d';
  };

  expLines: string[];
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      // Covariance. Means are integers.
      let meanX = Math.floor(Math.random() * 5) + 10;
      let meanY = Math.floor(Math.random() * 5) + 20;
      
      let devsX = [-2, -1, 0, 1, 2];
      let devsY = [
        [-1, -2, 0, 2, 1],
        [2, -1, 0, 1, -2],
        [1, -2, 0, 2, -1]
      ][Math.floor(Math.random() * 3)];
      
      let dataX = devsX.map(d => meanX + d);
      let dataY = devsY.map(d => meanY + d);
      
      // Shuffle together
      let zipped = dataX.map((x, i) => ({x, y: dataY[i]}));
      zipped.sort(() => Math.random() - 0.5);
      dataX = zipped.map(z => z.x);
      dataY = zipped.map(z => z.y);
      
      let sumProd = 0;
      for (let i = 0; i < 5; i++) sumProd += (dataX[i] - meanX) * (dataY[i] - meanY);
      let cov = sumProd / 5;
      
      let qStr = `次の2つの変量 $x, y$ のデータについて、共分散 $s_{xy}$ を求めよ。\n\n$x$: ${dataX.join(', ')}\n$y$: ${dataY.join(', ')}`;
      
      let expLines = [
        `\\text{平均値 } \\bar{x} = ${meanX}, \\quad \\bar{y} = ${meanY}`,
        `\\text{各データの偏差の積 } (x_i - \\bar{x})(y_i - \\bar{y}) \\text{ は、}`,
        dataX.map((x, i) => `(${x - meanX}) \\times (${dataY[i] - meanY})`).join(' + '),
        `= ${sumProd}`,
        `\\text{よって共分散 } s_{xy} = \\frac{${sumProd}}{5} = ${cov}`
      ];
      
      return { pattern: p, qStr, dataX, dataY, ans1: cov.toString(), expLines, scatterPoints: zipped };
    }
    else if (p === 'pattern2') {
      // Correlation coefficient.
      let db = correlationDB[Math.floor(Math.random() * correlationDB.length)];
      let dataX = [...db.x];
      let dataY = [...db.y];
      
      // Shuffle together
      let zipped = dataX.map((x, i) => ({x, y: dataY[i]}));
      zipped.sort(() => Math.random() - 0.5);
      dataX = zipped.map(z => z.x);
      dataY = zipped.map(z => z.y);
      
      let sumX = dataX.reduce((a,b)=>a+b, 0);
      let sumY = dataY.reduce((a,b)=>a+b, 0);
      let meanX = sumX/5;
      let meanY = sumY/5;
      
      let sumSqX = dataX.reduce((a,b)=>a+Math.pow(b-meanX, 2), 0);
      let sumSqY = dataY.reduce((a,b)=>a+Math.pow(b-meanY, 2), 0);
      let sumProd = dataX.reduce((a,b,i)=>a+(b-meanX)*(dataY[i]-meanY), 0);
      
      let qStr = `次のデータについて、相関係数 $r$ を求めよ。\n\n$x$: ${dataX.join(', ')}\n$y$: ${dataY.join(', ')}`;
      
      let expLines = [
        `\\text{平均値 } \\bar{x} = ${meanX}, \\quad \\bar{y} = ${meanY}`,
        `x \\text{ の偏差の2乗和は } ${sumSqX}`,
        `y \\text{ の偏差の2乗和は } ${sumSqY}`,
        `x, y \\text{ の偏差の積の和は } ${sumProd}`,
        `r = \\frac{${sumProd}}{\\sqrt{${sumSqX}} \\sqrt{${sumSqY}}} = ${db.rStr}`
      ];
      
      return { pattern: p, qStr, dataX, dataY, ans1: db.rStr, expLines, scatterPoints: zipped };
    }
    else if (p === 'pattern3') {
      // Scatter plot correlation guess
      let trueR = (Math.random() * 1.8 - 0.9).toFixed(1); // -0.9 to 0.9
      let rNum = parseFloat(trueR);
      
      // Generate scatter points with approx correlation rNum
      let pts = [];
      for (let i = 0; i < 30; i++) {
        let x = Math.random() * 10;
        let err = (Math.random() - 0.5) * 5 * Math.sqrt(1 - rNum*rNum);
        let y = rNum > 0 ? (x * rNum + err) : ((10 - x) * Math.abs(rNum) + err);
        pts.push({x, y: y + 5});
      }
      
      let choices = [
        rNum,
        parseFloat((Math.random() * 1.8 - 0.9).toFixed(1)),
        parseFloat((Math.random() * 1.8 - 0.9).toFixed(1))
      ];
      // ensure choices are distinct enough
      while (Math.abs(choices[0] - choices[1]) < 0.4) choices[1] = parseFloat((Math.random() * 1.8 - 0.9).toFixed(1));
      while (Math.abs(choices[0] - choices[2]) < 0.4 || Math.abs(choices[1] - choices[2]) < 0.4) choices[2] = parseFloat((Math.random() * 1.8 - 0.9).toFixed(1));
      
      choices.sort((a,b) => a-b);
      
      let qStr = `右の散布図から読み取れる相関係数 $r$ として最も適切なものを、次の選択肢から選べ。\n\n${choices.join('　/　')}`;
      
      let dir = rNum > 0.4 ? '右上がり（正の相関）' : (rNum < -0.4 ? '右下がり（負の相関）' : 'バラバラ（無相関）');
      
      let expLines = [
        `\\text{散布図の点の分布を見ると、全体的に}${dir}\\text{の傾向があります。}`,
        `\\text{したがって、相関係数は } ${trueR} \\text{ 付近であると推定できます。}`
      ];
      
      return { pattern: p, qStr, ans1: trueR, scatterPoints: pts, scatterChoices: choices, expLines };
    }
    else if (p === 'pattern4') {
      // Cross table
      // Let's do a simple 2x2 table
      let a = Math.floor(Math.random() * 30) + 10;
      let b = Math.floor(Math.random() * 30) + 10;
      let c = Math.floor(Math.random() * 30) + 10;
      let d = Math.floor(Math.random() * 30) + 10;
      
      let cells = ['a', 'b', 'c', 'd'] as const;
      let targetCell = cells[Math.floor(Math.random() * 4)];
      
      let totA = a + b;
      let totB = c + d;
      let totC = a + c;
      let totD = b + d;
      let tot = a + b + c + d;
      
      let qStr = `次のクロス集計表において、空欄 [ A ] に入る数値を求めよ。`;
      
      let expLines = [
        `\\text{表の縦と横の合計が一致することを利用します。}`,
        `\\text{例えば、}[A]\\text{ を含む行または列の合計値から、他の数値を引くことで求まります。}`
      ];
      
      let ansStr = "";
      if (targetCell === 'a') ansStr = a.toString();
      if (targetCell === 'b') ansStr = b.toString();
      if (targetCell === 'c') ansStr = c.toString();
      if (targetCell === 'd') ansStr = d.toString();
      
      return { pattern: p, qStr, ans1: ansStr, tableData: { a,b,c,d, totA,totB,totC,totD, tot, targetCell }, expLines };
    }
  }
}

export default function DataAnalysis2DDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ans1, setAns1] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAns1('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    let isOk = false;
    
    if (problem.pattern === 'pattern3') {
      if (parseFloat(ans1.trim() || 'NaN') === parseFloat(problem.ans1!)) isOk = true;
    } else {
      if (ans1.trim() === problem.ans1) isOk = true;
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

    let pts = problem.scatterPoints;
    if (!pts || pts.length === 0) return;

    // Find bounds
    let minX = Math.min(...pts.map(p => p.x));
    let maxX = Math.max(...pts.map(p => p.x));
    let minY = Math.min(...pts.map(p => p.y));
    let maxY = Math.max(...pts.map(p => p.y));

    // Pad
    let padX = (maxX - minX) * 0.2 || 1;
    let padY = (maxY - minY) * 0.2 || 1;
    minX -= padX; maxX += padX;
    minY -= padY; maxY += padY;

    // Axis
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    let bx = 30;
    let by = H - 30;
    ctx.beginPath(); ctx.moveTo(bx, 10); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(W - 10, by); ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('x', W - 20, by - 5);
    ctx.fillText('y', bx + 5, 20);

    const toScr = (x: number, y: number) => {
      let px = bx + ((x - minX) / (maxX - minX)) * (W - bx - 20);
      let py = by - ((y - minY) / (maxY - minY)) * (by - 20);
      return {x: px, y: py};
    };

    ctx.fillStyle = '#3b82f6';
    for (let p of pts) {
      let s = toScr(p.x, p.y);
      ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI*2); ctx.fill();
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
            <div key={idx} className="bg-white p-2 border rounded text-center overflow-x-auto whitespace-nowrap">
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
          データの分析（2変量）ドリル
        </h1>
        <p className="text-gray-500">
          共分散と相関係数の計算、散布図の読み取り、クロス集計表による傾向分析など、2変量の関係性を多角的に学びます。
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
                <option value="pattern1">パターン1 (共分散の計算)</option>
                <option value="pattern2">パターン2 (相関係数の計算)</option>
                <option value="pattern3">パターン3 (相関係数の推定)</option>
                <option value="pattern4">パターン4 (クロス集計表)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center leading-relaxed whitespace-pre-wrap">
              <MathEq math={problem.qStr} />
              
              {problem.pattern === 'pattern4' && problem.tableData && (
                <div className="mt-4 flex justify-center text-sm">
                  <table className="border-collapse border border-gray-400">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 p-2 bg-gray-100"></th>
                        <th className="border border-gray-400 p-2 bg-gray-100">グループX</th>
                        <th className="border border-gray-400 p-2 bg-gray-100">グループY</th>
                        <th className="border border-gray-400 p-2 bg-gray-100">計</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="border border-gray-400 p-2 bg-gray-100">属性1</th>
                        <td className="border border-gray-400 p-2">{problem.tableData.targetCell === 'a' ? '[ A ]' : problem.tableData.a}</td>
                        <td className="border border-gray-400 p-2">{problem.tableData.targetCell === 'b' ? '[ A ]' : problem.tableData.b}</td>
                        <td className="border border-gray-400 p-2">{problem.tableData.totA}</td>
                      </tr>
                      <tr>
                        <th className="border border-gray-400 p-2 bg-gray-100">属性2</th>
                        <td className="border border-gray-400 p-2">{problem.tableData.targetCell === 'c' ? '[ A ]' : problem.tableData.c}</td>
                        <td className="border border-gray-400 p-2">{problem.tableData.targetCell === 'd' ? '[ A ]' : problem.tableData.d}</td>
                        <td className="border border-gray-400 p-2">{problem.tableData.totB}</td>
                      </tr>
                      <tr>
                        <th className="border border-gray-400 p-2 bg-gray-100">計</th>
                        <td className="border border-gray-400 p-2">{problem.tableData.totC}</td>
                        <td className="border border-gray-400 p-2">{problem.tableData.totD}</td>
                        <td className="border border-gray-400 p-2 font-bold">{problem.tableData.tot}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                <div className="flex items-center gap-4 text-xl">
                  <span>解答 =</span>
                  <input 
                    type={problem.pattern === 'pattern3' ? "number" : "text"} step="0.1"
                    className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                    value={ans1} 
                    onChange={e => setAns1(e.target.value)} 
                    placeholder={problem.pattern === 'pattern3' ? "0.8" : ""}
                  />
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
                {isCorrect ? '正解！2変量の分析も完璧です。' : '不正解... 解説やグラフを見て確認しましょう。'}
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
                <canvas ref={canvasRef} width={260} height={200} className="w-full max-w-full h-auto" />
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
