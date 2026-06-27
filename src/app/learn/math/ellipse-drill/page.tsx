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
  // Answer components depending on pattern
  ans1?: string;
  ans2?: string;
  ans3?: string;
  ans4?: string;
  
  // For canvas
  a: number;
  b: number;
  cx: number;
  cy: number;
  c: number; // focus distance from center
  isHorizontal: boolean;

  expLines: string[];
}

const triples = [
  {c: 3, b: 4, a: 5},
  {c: 5, b: 12, a: 13},
  {c: 8, b: 15, a: 17},
  {c: 7, b: 24, a: 25},
  {c: 9, b: 40, a: 41},
  {c: 6, b: 8, a: 10},
  {c: 12, b: 16, a: 20},
  {c: 15, b: 20, a: 25}
];

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1') {
      let tr = triples[Math.floor(Math.random() * triples.length)];
      let a = tr.a, b = tr.b, c = tr.c;
      // swap b and c randomly to get different shapes
      if (Math.random() > 0.5) { b = tr.c; c = tr.b; }
      
      let a2 = a*a;
      let b2 = b*b;
      
      let qStr = `\\frac{x^2}{${a2}} + \\frac{y^2}{${b2}} = 1 \\quad \\text{の焦点の座標を求めよ。}`;
      
      let expLines = [
        `\\text{与えられた方程式は } \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\text{ の形であり、} a^2 = ${a2}, b^2 = ${b2} \\text{ です。}`,
        `a^2 > b^2 \\text{ より、これは横長の楕円です。}`,
        `\\text{焦点は } x \\text{ 軸上にあり、その座標を } (\\pm c, 0) \\text{ とすると、}`,
        `c^2 = a^2 - b^2 = ${a2} - ${b2} = ${c*c}`,
        `\\text{よって } c = ${c} \\text{ となり、焦点は } (\\pm ${c}, 0) \\text{ です。}`
      ];
      
      return { pattern: p, qStr, ans1: c.toString(), ans2: "0", a, b, cx: 0, cy: 0, c, isHorizontal: true, expLines };
    } 
    else if (p === 'pattern2') {
      let tr = triples[Math.floor(Math.random() * triples.length)];
      let a = tr.b, b = tr.a, c = tr.c;
      if (Math.random() > 0.5) { a = tr.c; c = tr.b; }
      
      let a2 = a*a;
      let b2 = b*b;
      
      let qStr = `\\frac{x^2}{${a2}} + \\frac{y^2}{${b2}} = 1 \\quad \\text{の焦点の座標を求めよ。}`;
      
      let expLines = [
        `\\text{与えられた方程式は } \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\text{ の形であり、} a^2 = ${a2}, b^2 = ${b2} \\text{ です。}`,
        `b^2 > a^2 \\text{ より、これは縦長の楕円です。}`,
        `\\text{焦点は } y \\text{ 軸上にあり、その座標を } (0, \\pm c) \\text{ とすると、}`,
        `c^2 = b^2 - a^2 = ${b2} - ${a2} = ${c*c}`,
        `\\text{よって } c = ${c} \\text{ となり、焦点は } (0, \\pm ${c}) \\text{ です。}`
      ];
      
      return { pattern: p, qStr, ans1: "0", ans2: c.toString(), a, b, cx: 0, cy: 0, c, isHorizontal: false, expLines };
    }
    else if (p === 'pattern3') {
      // Small ones to keep A, B small
      let sm = [{c:3,b:4,a:5}, {c:4,b:3,a:5}];
      let tr = sm[Math.floor(Math.random() * sm.length)];
      let a = tr.a, b = tr.b;
      
      let a2 = a*a, b2 = b*b;
      let cx = Math.floor(Math.random() * 7) - 3; // -3..3
      let cy = Math.floor(Math.random() * 7) - 3;
      
      // b^2 (x-cx)^2 + a^2 (y-cy)^2 = a^2 b^2
      let A = b2;
      let B = a2;
      let C = -2 * b2 * cx;
      let D = -2 * a2 * cy;
      let E = b2 * cx * cx + a2 * cy * cy - a2 * b2;
      
      let strA = A === 1 ? "" : A;
      let strB = B === 1 ? "+y^2" : `+${B}y^2`;
      let strC = C > 0 ? `+${C}x` : (C < 0 ? `${C}x` : "");
      let strD = D > 0 ? `+${D}y` : (D < 0 ? `${D}y` : "");
      let strE = E > 0 ? `+${E}` : (E < 0 ? `${E}` : "");
      
      let qStr = `$${strA}x^2 ${strB} ${strC} ${strD} ${strE} = 0$ の中心の座標 $(p, q)$ を求めよ。`;
      
      let expLines = [
        `\\text{平方完成を行って基本形に変形します。}`,
        `${A}(x^2 ${C !== 0 ? (C > 0 ? '+' : '-') + Math.abs(C/A) + 'x' : ''}) + ${B}(y^2 ${D !== 0 ? (D > 0 ? '+' : '-') + Math.abs(D/B) + 'y' : ''}) = ${-E}`,
        `${A}(x ${cx > 0 ? '-' : '+'} ${Math.abs(cx)})^2 - ${A * cx * cx} + ${B}(y ${cy > 0 ? '-' : '+'} ${Math.abs(cy)})^2 - ${B * cy * cy} = ${-E}`,
        `${A}(x ${cx > 0 ? '-' : '+'} ${Math.abs(cx)})^2 + ${B}(y ${cy > 0 ? '-' : '+'} ${Math.abs(cy)})^2 = ${-E + A * cx * cx + B * cy * cy}`,
        `\\text{両辺を } ${a2*b2} \\text{ で割ると、}`,
        `\\frac{(x ${cx > 0 ? '-' : '+'} ${Math.abs(cx)})^2}{${a2}} + \\frac{(y ${cy > 0 ? '-' : '+'} ${Math.abs(cy)})^2}{${b2}} = 1`,
        `\\text{よって中心の座標は } (${cx}, ${cy}) \\text{ となります。}`
      ];
      
      return { pattern: p, qStr, ans1: cx.toString(), ans2: cy.toString(), a, b, cx, cy, c: tr.c, isHorizontal: a > b, expLines };
    }
    else if (p === 'pattern4') {
      let tr = triples[Math.floor(Math.random() * triples.length)];
      let a = tr.a, b = tr.b, c = tr.c;
      if (Math.random() > 0.5) { b = tr.c; c = tr.b; }
      
      let a2 = a*a;
      let b2 = b*b;
      
      let qStr = `2点 $(${c}, 0), (-${c}, 0)$ からの距離の和が $${2*a}$ である楕円の方程式を $\\frac{x^2}{A} + \\frac{y^2}{B} = 1$ とするとき、$A, B$ の値を求めよ。`;
      
      let expLines = [
        `\\text{焦点が } x \\text{ 軸上にあり、中心が原点であるため、求める楕円の方程式は}`,
        `\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\quad (a > b > 0)`,
        `\\text{とおけます。距離の和が } ${2*a} \\text{ なので } 2a = ${2*a} \\implies a = ${a}`,
        `\\text{焦点の座標が } (\\pm ${c}, 0) \\text{ なので } c = ${c}`,
        `c^2 = a^2 - b^2 \\text{ より } ${c*c} = ${a2} - b^2 \\implies b^2 = ${b2}`,
        `\\text{よって方程式は } \\frac{x^2}{${a2}} + \\frac{y^2}{${b2}} = 1 \\text{ となり、}`,
        `A = ${a2}, B = ${b2} \\text{ です。}`
      ];
      
      return { pattern: p, qStr, ans1: a2.toString(), ans2: b2.toString(), a, b, cx: 0, cy: 0, c, isHorizontal: true, expLines };
    }
  }
}

export default function EllipseDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ans1, setAns1] = useState<string>('');
  const [ans2, setAns2] = useState<string>('');
  
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
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    let isOk = (ans1.trim() === problem.ans1) && (ans2.trim() === problem.ans2);
    
    // For pattern 1, 2: ans1 and ans2 are coordinates. User might swap or enter +-c?
    // Actually we ask for (+-c, 0) maybe?
    // In Pattern 1: ans1 is c, ans2 is 0.
    // If they type -c, we should accept it.
    if (problem.pattern === 'pattern1') {
      let v1 = Math.abs(parseInt(ans1.trim()));
      let v2 = parseInt(ans2.trim());
      if (v1 === parseInt(problem.ans1!) && v2 === 0) isOk = true;
    }
    if (problem.pattern === 'pattern2') {
      let v1 = parseInt(ans1.trim());
      let v2 = Math.abs(parseInt(ans2.trim()));
      if (v1 === 0 && v2 === parseInt(problem.ans2!)) isOk = true;
    }
    
    setIsCorrect(isOk);
    setHasChecked(true);
  };

  const drawGraph = () => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    let maxR = Math.max(problem.a, problem.b) + Math.max(Math.abs(problem.cx), Math.abs(problem.cy)) + 2;

    let scale = Math.min(W/2 - 20, H/2 - 20) / maxR;
    let originX = W/2;
    let originY = H/2;

    const toScr = (x: number, y: number) => ({
      x: originX + x * scale,
      y: originY - y * scale
    });

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(W, originY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, H); ctx.stroke();

    // Center
    let cc = toScr(problem.cx, problem.cy);

    // Draw ellipse
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cc.x, cc.y, problem.a * scale, problem.b * scale, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Foci
    let f1x = problem.cx + (problem.isHorizontal ? problem.c : 0);
    let f1y = problem.cy + (problem.isHorizontal ? 0 : problem.c);
    let f2x = problem.cx - (problem.isHorizontal ? problem.c : 0);
    let f2y = problem.cy - (problem.isHorizontal ? 0 : problem.c);
    
    let sf1 = toScr(f1x, f1y);
    let sf2 = toScr(f2x, f2y);
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(sf1.x, sf1.y, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sf2.x, sf2.y, 4, 0, Math.PI*2); ctx.fill();
    
    if (hasChecked) {
      ctx.font = '10px sans-serif';
      ctx.fillText('F', sf1.x + 5, sf1.y - 5);
      ctx.fillText("F'", sf2.x + 5, sf2.y - 5);
      
      // Draw long/short axis
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      let top = toScr(problem.cx, problem.cy + problem.b);
      let bottom = toScr(problem.cx, problem.cy - problem.b);
      let right = toScr(problem.cx + problem.a, problem.cy);
      let left = toScr(problem.cx - problem.a, problem.cy);
      
      ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bottom.x, bottom.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(left.x, left.y); ctx.lineTo(right.x, right.y); ctx.stroke();
      ctx.setLineDash([]);
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
          2次曲線の焦点と方程式（楕円）ドリル
        </h1>
        <p className="text-gray-500">
          楕円の方程式と焦点座標、長軸・短軸の関係 $a^2 = b^2 + c^2$ などを視覚的に結びつけ、定義に基づく計算力を養います。
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
                <option value="pattern1">パターン1 (横長楕円の焦点)</option>
                <option value="pattern2">パターン2 (縦長楕円の焦点)</option>
                <option value="pattern3">パターン3 (平方完成による中心)</option>
                <option value="pattern4">パターン4 (定義からの逆算)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center leading-relaxed">
              <div>
                {problem.qStr.split('$').map((part, i) => 
                  i % 2 === 1 ? <MathEq key={i} math={part} /> : <span key={i}>{part}</span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {problem.pattern === 'pattern4' ? (
                <div className="flex flex-col items-center justify-center gap-2 font-bold border-t pt-4">
                  <div className="flex items-center gap-4 text-xl">
                    <span><MathEq math="A =" /></span>
                    <input 
                      type="number" 
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans1} 
                      onChange={e => setAns1(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xl">
                    <span><MathEq math="B =" /></span>
                    <input 
                      type="number" 
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans2} 
                      onChange={e => setAns2(e.target.value)} 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 font-bold border-t pt-4">
                  <span className="text-sm text-gray-500 mb-2">座標を入力</span>
                  <div className="flex items-center gap-2 text-xl">
                    <span>(</span>
                    <input 
                      type="text" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans1} 
                      onChange={e => setAns1(e.target.value)} 
                      placeholder="x"
                    />
                    <span>,</span>
                    <input 
                      type="text" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans2} 
                      onChange={e => setAns2(e.target.value)} 
                      placeholder="y"
                    />
                    <span>)</span>
                  </div>
                  {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') && (
                    <span className="text-[10px] text-gray-400 mt-1">※焦点が複数ある場合は正の座標のみ（例: 3, 0）</span>
                  )}
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
                {isCorrect ? '正解！楕円の性質を正しく理解しています。' : '不正解... 解説とグラフを見て形や長軸・短軸を確認しましょう。'}
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

            <div className="flex justify-center mb-4 bg-white border border-gray-300 shadow-sm relative">
              <canvas ref={canvasRef} width={260} height={200} className="w-full max-w-full h-auto" />
            </div>

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
