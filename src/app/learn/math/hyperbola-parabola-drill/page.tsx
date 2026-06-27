"use client";

import { useState, useEffect, useRef } from 'react';
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
  // Common answers
  ans1?: string;
  ans2?: string;
  ans3?: string;
  ans4?: string;
  
  // For rendering
  type: 'hyperbolaH' | 'hyperbolaV' | 'parabolaH' | 'parabolaV';
  a?: number;
  b?: number;
  c?: number;
  p_val?: number;
  cx?: number;
  cy?: number;
  
  expLines: string[];
}

const triples = [
  {a: 3, b: 4, c: 5},
  {a: 4, b: 3, c: 5},
  {a: 5, b: 12, c: 13},
  {a: 12, b: 5, c: 13},
  {a: 8, b: 15, c: 17},
  {a: 15, b: 8, c: 17},
  {a: 7, b: 24, c: 25},
  {a: 24, b: 7, c: 25}
];

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    if (p === 'pattern1' || p === 'pattern2') {
      let isH = p === 'pattern1';
      let tr = triples[Math.floor(Math.random() * triples.length)];
      let a = tr.a, b = tr.b, c = tr.c;
      
      let a2 = a*a;
      let b2 = b*b;
      
      let qStr = `\\frac{x^2}{${a2}} - \\frac{y^2}{${b2}} = ${isH ? '1' : '-1'} \\quad \\text{の焦点の座標と、漸近線の方程式 } y = \\pm mx \\text{ の } m \\text{ を求めよ。}`;
      
      let expLines = [
        `\\text{与えられた方程式は双曲線の標準形であり、} a^2 = ${a2}, b^2 = ${b2} \\text{ です。}`,
        `\\text{右辺が } ${isH ? '1 なので、焦点は x 軸上にあります。' : '-1 なので、焦点は y 軸上にあります。'}`,
        `c^2 = a^2 + b^2 = ${a2} + ${b2} = ${c*c} \\implies c = ${c}`,
        `\\text{よって焦点は } ${isH ? `(\\pm ${c}, 0)` : `(0, \\pm ${c})`} \\text{ です。}`,
        `\\text{また、漸近線は } \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 0 \\text{ より } y = \\pm \\frac{b}{a} x \\text{ となるため、}`,
        `m = \\frac{${b}}{${a}} \\text{ です。}`
      ];
      
      let g = gcd(b, a);
      let mNum = b/g; let mDen = a/g;
      let mStr = mDen === 1 ? mNum.toString() : `${mNum}/${mDen}`;
      
      let ans1 = isH ? c.toString() : "0";
      let ans2 = isH ? "0" : c.toString();
      
      return { pattern: p, qStr, type: isH ? 'hyperbolaH' : 'hyperbolaV', a, b, c, cx: 0, cy: 0, ans1, ans2, ans3: mStr, expLines };
    }
    else if (p === 'pattern3') {
      let isH = Math.random() > 0.5; // y^2 = 4px (Horizontal) or x^2 = 4py (Vertical)
      let p_val = Math.floor(Math.random() * 9) - 4; // -4..4
      if (p_val === 0) p_val = 2;
      
      let qStr = isH ? `y^2 = ${4*p_val}x \\quad \\text{の焦点の座標と、準線の方程式を求めよ。}` : `x^2 = ${4*p_val}y \\quad \\text{の焦点の座標と、準線の方程式を求めよ。}`;
      
      let expLines = [
        `\\text{基本形 } ${isH ? 'y^2 = 4px' : 'x^2 = 4py'} \\text{ と比較します。}`,
        `4p = ${4*p_val} \\implies p = ${p_val}`,
        `\\text{よって焦点は } ${isH ? `(${p_val}, 0)` : `(0, ${p_val})`} \\text{ となります。}`,
        `\\text{準線の方程式は } ${isH ? 'x = -p' : 'y = -p'} \\text{ より、} ${isH ? `x = ${-p_val}` : `y = ${-p_val}`} \\text{ です。}`
      ];
      
      let ans1 = isH ? p_val.toString() : "0";
      let ans2 = isH ? "0" : p_val.toString();
      let ans3 = (-p_val).toString();
      
      return { pattern: p, qStr, type: isH ? 'parabolaH' : 'parabolaV', p_val, cx: 0, cy: 0, ans1, ans2, ans3, expLines };
    }
    else if (p === 'pattern4') {
      // (y-cy)^2 = 4p(x-cx) -> y^2 - 2cy y + cy^2 = 4p x - 4p cx -> y^2 - 2cy y - 4p x + (cy^2 + 4p cx) = 0
      let isH = true; // keep it simple, horizontal only for completing square
      let p_val = Math.floor(Math.random() * 5) - 2; // -2..2
      if (p_val === 0) p_val = 1;
      let cx = Math.floor(Math.random() * 7) - 3; // -3..3
      let cy = Math.floor(Math.random() * 7) - 3;
      
      let A = 1; // y^2
      let B = -2 * cy; // y
      let C = -4 * p_val; // x
      let D = cy*cy + 4*p_val*cx; // const
      
      let strB = B > 0 ? `+${B}y` : (B < 0 ? `${B}y` : "");
      let strC = C > 0 ? `+${C}x` : (C < 0 ? `${C}x` : "");
      let strD = D > 0 ? `+${D}` : (D < 0 ? `${D}` : "");
      
      let qStr = `y^2 ${strB} ${strC} ${strD} = 0 \\quad \\text{の頂点と焦点の座標を求めよ。}`;
      
      let expLines = [
        `\\text{平方完成を行って基本形を変形します。}`,
        `y^2 ${strB} = ${-C}x ${D > 0 ? '-' : '+'}${Math.abs(D)}`,
        `(y ${cy > 0 ? '-' : '+'}${Math.abs(cy)})^2 - ${cy*cy} = ${-C}x ${D > 0 ? '-' : '+'}${Math.abs(D)}`,
        `(y ${cy > 0 ? '-' : '+'}${Math.abs(cy)})^2 = ${-C}x ${4*p_val*cx > 0 ? '-' : '+'}${Math.abs(4*p_val*cx)}`,
        `(y ${cy > 0 ? '-' : '+'}${Math.abs(cy)})^2 = ${4*p_val}(x ${cx > 0 ? '-' : '+'}${Math.abs(cx)})`,
        `\\text{これは } y^2 = ${4*p_val}x \\text{ (焦点 } (${p_val}, 0)\\text{, 頂点 } (0,0) \\text{) を}`,
        `x \\text{ 軸方向に } ${cx}\\text{、} y \\text{ 軸方向に } ${cy} \\text{ 平行移動したものです。}`,
        `\\text{頂点は } (${cx}, ${cy})`,
        `\\text{焦点は } (${p_val + cx}, ${cy}) \\text{ となります。}`
      ];
      
      return { pattern: p, qStr, type: 'parabolaH', p_val, cx, cy, ans1: cx.toString(), ans2: cy.toString(), ans3: (p_val+cx).toString(), ans4: cy.toString(), expLines };
    }
  }
}

export default function HyperbolaParabolaDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ans1, setAns1] = useState<string>('');
  const [ans2, setAns2] = useState<string>('');
  const [ans3, setAns3] = useState<string>('');
  const [ans4, setAns4] = useState<string>('');
  
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
    setAns4('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    let isOk = false;
    
    if (problem.pattern === 'pattern1' || problem.pattern === 'pattern2') {
      let v1 = Math.abs(parseInt(ans1.trim() || '0'));
      let v2 = Math.abs(parseInt(ans2.trim() || '0'));
      let m = ans3.trim().replace(/\s+/g, '');
      if (problem.pattern === 'pattern1' && v1 === parseInt(problem.ans1!) && v2 === 0 && m === problem.ans3) isOk = true;
      if (problem.pattern === 'pattern2' && v1 === 0 && v2 === parseInt(problem.ans2!) && m === problem.ans3) isOk = true;
    } else if (problem.pattern === 'pattern3') {
      let v1 = parseInt(ans1.trim());
      let v2 = parseInt(ans2.trim());
      let dir = parseInt(ans3.trim());
      if (v1 === parseInt(problem.ans1!) && v2 === parseInt(problem.ans2!) && dir === parseInt(problem.ans3!)) isOk = true;
    } else if (problem.pattern === 'pattern4') {
      let vx = parseInt(ans1.trim());
      let vy = parseInt(ans2.trim());
      let fx = parseInt(ans3.trim());
      let fy = parseInt(ans4.trim());
      if (vx === parseInt(problem.ans1!) && vy === parseInt(problem.ans2!) && fx === parseInt(problem.ans3!) && fy === parseInt(problem.ans4!)) isOk = true;
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

    let maxR = 10;
    if (problem.type.startsWith('hyperbola')) {
      maxR = problem.c! + 2;
    } else {
      maxR = Math.max(Math.abs(problem.cx!), Math.abs(problem.cy!)) + Math.abs(problem.p_val!) + 4;
    }

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

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6';

    if (problem.type.startsWith('hyperbola')) {
      let a = problem.a!;
      let b = problem.b!;
      let isH = problem.type === 'hyperbolaH';
      
      // Draw asymptotes if checked
      if (hasChecked) {
        ctx.strokeStyle = '#94a3b8';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        let p1 = toScr(maxR, maxR * b / a);
        let p2 = toScr(-maxR, -maxR * b / a);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        
        let p3 = toScr(maxR, -maxR * b / a);
        let p4 = toScr(-maxR, maxR * b / a);
        ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw hyperbola
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let y = -maxR; y <= maxR; y += 0.5) {
        if (isH) {
          let x = a * Math.sqrt(1 + (y*y)/(b*b));
          let s1 = toScr(x, y);
          if (y === -maxR) ctx.moveTo(s1.x, s1.y); else ctx.lineTo(s1.x, s1.y);
        } else {
          let x = y; // swap role for looping
          let yy = b * Math.sqrt(1 + (x*x)/(a*a));
          let s1 = toScr(x, yy);
          if (x === -maxR) ctx.moveTo(s1.x, s1.y); else ctx.lineTo(s1.x, s1.y);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      for (let y = -maxR; y <= maxR; y += 0.5) {
        if (isH) {
          let x = -a * Math.sqrt(1 + (y*y)/(b*b));
          let s1 = toScr(x, y);
          if (y === -maxR) ctx.moveTo(s1.x, s1.y); else ctx.lineTo(s1.x, s1.y);
        } else {
          let x = y; 
          let yy = -b * Math.sqrt(1 + (x*x)/(a*a));
          let s1 = toScr(x, yy);
          if (x === -maxR) ctx.moveTo(s1.x, s1.y); else ctx.lineTo(s1.x, s1.y);
        }
      }
      ctx.stroke();

      // Foci
      let c = problem.c!;
      let sf1 = isH ? toScr(c, 0) : toScr(0, c);
      let sf2 = isH ? toScr(-c, 0) : toScr(0, -c);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(sf1.x, sf1.y, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sf2.x, sf2.y, 4, 0, Math.PI*2); ctx.fill();

    } else {
      // Parabola
      let cx = problem.cx!;
      let cy = problem.cy!;
      let p_val = problem.p_val!;
      let isH = problem.type === 'parabolaH';
      
      ctx.beginPath();
      for (let t = -maxR; t <= maxR; t += 0.5) {
        if (isH) {
          let y = cy + t;
          let x = cx + (t*t) / (4*p_val);
          let s1 = toScr(x, y);
          if (t === -maxR) ctx.moveTo(s1.x, s1.y); else ctx.lineTo(s1.x, s1.y);
        } else {
          let x = cx + t;
          let y = cy + (t*t) / (4*p_val);
          let s1 = toScr(x, y);
          if (t === -maxR) ctx.moveTo(s1.x, s1.y); else ctx.lineTo(s1.x, s1.y);
        }
      }
      ctx.stroke();

      // Focus
      let fx = cx + (isH ? p_val : 0);
      let fy = cy + (isH ? 0 : p_val);
      let sf = toScr(fx, fy);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(sf.x, sf.y, 4, 0, Math.PI*2); ctx.fill();

      // Vertex
      let sv = toScr(cx, cy);
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(sv.x, sv.y, 4, 0, Math.PI*2); ctx.fill();

      if (hasChecked) {
        // Directrix
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (isH) {
          let dirX = cx - p_val;
          let p1 = toScr(dirX, maxR);
          let p2 = toScr(dirX, -maxR);
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        } else {
          let dirY = cy - p_val;
          let p1 = toScr(maxR, dirY);
          let p2 = toScr(-maxR, dirY);
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
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
          2次曲線の焦点と方程式（双曲線・放物線）ドリル
        </h1>
        <p className="text-gray-500">
          双曲線の漸近線と焦点、放物線の準線と焦点など、それぞれの曲線の特徴的な要素を正確に計算する力を養います。
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
                <option value="pattern1">パターン1 (横開き双曲線)</option>
                <option value="pattern2">パターン2 (縦開き双曲線)</option>
                <option value="pattern3">パターン3 (放物線の基本形)</option>
                <option value="pattern4">パターン4 (平行移動した放物線)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[120px] gap-4 text-base font-bold text-slate-700 text-center leading-relaxed">
              <MathEq math={problem.qStr} />
            </div>
            
            <div className="space-y-4">
              {(problem.pattern === 'pattern1' || problem.pattern === 'pattern2') && (
                <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                  <span className="text-sm text-gray-500">焦点の座標</span>
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
                  <span className="text-sm text-gray-500 mt-2">漸近線の傾き <MathEq math="m" /></span>
                  <input 
                    type="text" 
                    className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500 text-xl" 
                    value={ans3} 
                    onChange={e => setAns3(e.target.value)} 
                    placeholder="4/3"
                  />
                </div>
              )}
              {problem.pattern === 'pattern3' && (
                <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                  <span className="text-sm text-gray-500">焦点の座標</span>
                  <div className="flex items-center gap-2 text-xl">
                    <span>(</span>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans1} 
                      onChange={e => setAns1(e.target.value)} 
                    />
                    <span>,</span>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans2} 
                      onChange={e => setAns2(e.target.value)} 
                    />
                    <span>)</span>
                  </div>
                  <span className="text-sm text-gray-500 mt-2">準線の方程式の定数部分（例：<MathEq math={problem.type === 'parabolaH' ? 'x=' : 'y='} /> 〇〇）</span>
                  <input 
                    type="number" 
                    className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500 text-xl" 
                    value={ans3} 
                    onChange={e => setAns3(e.target.value)} 
                  />
                </div>
              )}
              {problem.pattern === 'pattern4' && (
                <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                  <span className="text-sm text-gray-500">頂点の座標</span>
                  <div className="flex items-center gap-2 text-xl">
                    <span>(</span>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans1} 
                      onChange={e => setAns1(e.target.value)} 
                    />
                    <span>,</span>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans2} 
                      onChange={e => setAns2(e.target.value)} 
                    />
                    <span>)</span>
                  </div>
                  <span className="text-sm text-gray-500 mt-2">焦点の座標</span>
                  <div className="flex items-center gap-2 text-xl">
                    <span>(</span>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans3} 
                      onChange={e => setAns3(e.target.value)} 
                    />
                    <span>,</span>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ans4} 
                      onChange={e => setAns4(e.target.value)} 
                    />
                    <span>)</span>
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
                {isCorrect ? '正解！2次曲線の性質を正確に捉えています。' : '不正解... 解説を見て各パラメータの求め方を確認しましょう。'}
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
