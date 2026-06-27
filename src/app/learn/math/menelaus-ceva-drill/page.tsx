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
  d: number;
  e: number;
  f: number;
  ansX: number;
  ansY: number;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let a = Math.floor(Math.random() * 5) + 1;
    let b = Math.floor(Math.random() * 5) + 1;
    let c = Math.floor(Math.random() * 5) + 1;
    let d = Math.floor(Math.random() * 5) + 1;

    // We need (a/b) * (c/d) * (e/f) = 1
    // So e/f = (b*d) / (a*c)
    let e_raw = b * d;
    let f_raw = a * c;
    let g = gcd(e_raw, f_raw);
    let e = e_raw / g;
    let f = f_raw / g;

    if (p === 'pattern1') {
      // Ceva: Find AF:FB = e:f
      return { pattern: p, a, b, c, d, e, f, ansX: e, ansY: f };
    } 
    else if (p === 'pattern2') {
      // Menelaus basic: Find AF:FB = e:f. D is external on BC.
      if (a === b) continue; // D cannot be midpoint of external division
      return { pattern: p, a, b, c, d, e, f, ansX: e, ansY: f };
    }
    else if (p === 'pattern3') {
      // Menelaus outer: Find BD:DC = a:b. D is external on BC.
      if (a === b) continue;
      return { pattern: p, a, b, c, d, e, f, ansX: a, ansY: b };
    }
    else if (p === 'pattern4') {
      // Area ratio: Ceva. Find Area(PAB) : Area(ABC)
      // mC = a*c, mB = b*c, mA = a*d
      let mC = a * c;
      let mB = b * c;
      let mA = a * d;
      let M = mC + mB + mA;
      let areaPAB = mC;
      let areaABC = M;
      let g2 = gcd(areaPAB, areaABC);
      return { pattern: p, a, b, c, d, e, f, ansX: areaPAB / g2, ansY: areaABC / g2 };
    }
  }
}

export default function MenelausCevaDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansX, setAnsX] = useState<string>('');
  const [ansY, setAnsY] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsX('');
    setAnsY('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let ux = parseInt(ansX);
    let uy = parseInt(ansY);
    
    // allow multiples (e.g. 2:4 for 1:2 is correct geometrically, though we usually want simplest form)
    // we'll enforce simplest form or proportional. Let's do proportional.
    if (!isNaN(ux) && !isNaN(uy) && ux * problem.ansY === uy * problem.ansX) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setHasChecked(true);
  };

  if (!problem) return null;

  let questionEl = <></>;
  let formulaStr = "";
  if (problem.pattern === 'pattern1') {
    questionEl = (
      <>
        三角形ABCの内部の点Pを通る直線AD, BE, CFがある。<br/>
        <MathEq math={`BD:DC = ${problem.a}:${problem.b}`} /> 、<MathEq math={`CE:EA = ${problem.c}:${problem.d}`} /> のとき、<br/>
        <MathEq math="AF:FB" /> を求めよ。
      </>
    );
    formulaStr = `\\frac{BD}{DC} \\cdot \\frac{CE}{EA} \\cdot \\frac{AF}{FB} = 1 \\quad \\Longrightarrow \\quad \\frac{${problem.a}}{${problem.b}} \\cdot \\frac{${problem.c}}{${problem.d}} \\cdot \\frac{AF}{FB} = 1`;
  } else if (problem.pattern === 'pattern2') {
    questionEl = (
      <>
        三角形ABCにおいて、辺BCを <MathEq math={`${problem.a}:${problem.b}`} /> に外分する点をD、<br/>
        辺ACを <MathEq math={`${problem.c}:${problem.d}`} /> に内分する点をEとする。<br/>
        直線DEと辺ABの交点をFとするとき、<MathEq math="AF:FB" /> を求めよ。
      </>
    );
    formulaStr = `\\frac{BD}{DC} \\cdot \\frac{CE}{EA} \\cdot \\frac{AF}{FB} = 1 \\quad \\Longrightarrow \\quad \\frac{${problem.a}}{${problem.b}} \\cdot \\frac{${problem.c}}{${problem.d}} \\cdot \\frac{AF}{FB} = 1`;
  } else if (problem.pattern === 'pattern3') {
    questionEl = (
      <>
        三角形ABCにおいて、辺ACを <MathEq math={`${problem.c}:${problem.d}`} /> に内分する点をE、<br/>
        辺ABを <MathEq math={`${problem.e}:${problem.f}`} /> に内分する点をFとする。<br/>
        直線FEと直線BCの交点をDとするとき、<MathEq math="BD:DC" /> を求めよ。
      </>
    );
    formulaStr = `\\frac{BD}{DC} \\cdot \\frac{CE}{EA} \\cdot \\frac{AF}{FB} = 1 \\quad \\Longrightarrow \\quad \\frac{BD}{DC} \\cdot \\frac{${problem.c}}{${problem.d}} \\cdot \\frac{${problem.e}}{${problem.f}} = 1`;
  } else if (problem.pattern === 'pattern4') {
    questionEl = (
      <>
        三角形ABCの内部の点Pを通る直線AD, BE, CFがある。<br/>
        <MathEq math={`BD:DC = ${problem.a}:${problem.b}`} /> 、<MathEq math={`CE:EA = ${problem.c}:${problem.d}`} /> のとき、<br/>
        面積比 <MathEq math="\\triangle PAB : \\triangle ABC" /> を求めよ。
      </>
    );
  }

  // --- SVG Drawing Logic ---
  const W = 360;
  const H = 220;
  let svgNodes = [];

  // Define base points
  let A = { x: 180, y: 30 };
  let B = { x: 60, y: 190 };
  let C = { x: 260, y: 190 };

  const getPt = (p1: any, p2: any, m: number, n: number) => {
    return {
      x: (n * p1.x + m * p2.x) / (m + n),
      y: (n * p1.y + m * p2.y) / (m + n)
    };
  };

  const drawPoint = (pt: any, label: string, dx = 0, dy = -10, color = "#1e293b") => {
    svgNodes.push(
      <g key={label}>
        <circle cx={pt.x} cy={pt.y} r={3} fill={color} />
        <text x={pt.x + dx} y={pt.y + dy} fontSize="14" fontWeight="bold" fill={color} textAnchor="middle">{label}</text>
      </g>
    );
  };

  const drawLine = (p1: any, p2: any, color = "#94a3b8", dash = false, strokeWidth = 1) => {
    svgNodes.push(
      <line key={`${p1.x}-${p1.y}-${p2.x}-${p2.y}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={strokeWidth} strokeDasharray={dash ? "4,4" : "none"} />
    );
  };

  if (problem.pattern === 'pattern1' || problem.pattern === 'pattern4') {
    // Ceva
    let D = getPt(B, C, problem.a, problem.b);
    let E = getPt(C, A, problem.c, problem.d);
    let F = getPt(A, B, problem.e, problem.f);
    let P = { x: 0, y: 0 }; // intersection of AD and BE
    // Just use mass points for P
    let mA = problem.a * problem.d;
    let mB = problem.b * problem.c;
    let mC = problem.a * problem.c;
    let M = mA + mB + mC;
    P.x = (mA * A.x + mB * B.x + mC * C.x) / M;
    P.y = (mA * A.y + mB * B.y + mC * C.y) / M;

    // Draw triangle
    drawLine(A, B, "#334155", false, 2);
    drawLine(B, C, "#334155", false, 2);
    drawLine(C, A, "#334155", false, 2);
    
    // Draw cevians
    drawLine(A, D, "#3b82f6", false, 1.5);
    drawLine(B, E, "#3b82f6", false, 1.5);
    drawLine(C, F, "#3b82f6", false, 1.5);

    if (problem.pattern === 'pattern4') {
      // fill PAB
      svgNodes.push(<polygon key="pab" points={`${P.x},${P.y} ${A.x},${A.y} ${B.x},${B.y}`} fill="#bfdbfe" fillOpacity="0.5" />);
    }

    drawPoint(A, "A", 0, -8);
    drawPoint(B, "B", -12, 12);
    drawPoint(C, "C", 12, 12);
    drawPoint(D, "D", 0, 16);
    drawPoint(E, "E", 12, 0);
    drawPoint(F, "F", -12, -4);
    drawPoint(P, "P", 10, -10, "#b91c1c");

  } else {
    // Menelaus (D is external)
    // To fit D on screen, adjust B and C if D goes too far
    // a:b external division. D = (a*C - b*B)/(a-b)
    // If a > b, D is to the right of C.
    // If a < b, D is to the left of B.
    let m = problem.a;
    let n = -problem.b;
    
    // Scale triangle width to fit D
    let W_tri = 150;
    if (Math.abs(m/(m+n)) > 2) W_tri = 80; // shrink triangle if D is far
    
    A = { x: 180, y: 40 };
    B = { x: 180 - W_tri/2, y: 170 };
    C = { x: 180 + W_tri/2, y: 170 };
    if (m < Math.abs(n)) {
      B.x += 40; C.x += 40; // shift right
    } else {
      B.x -= 40; C.x -= 40; // shift left
    }

    let D = getPt(B, C, m, n);
    let E = getPt(C, A, problem.c, problem.d);
    let F = getPt(A, B, problem.e, problem.f);

    // Draw triangle
    drawLine(A, B, "#334155", false, 2);
    drawLine(B, C, "#334155", false, 2);
    drawLine(C, A, "#334155", false, 2);

    // Draw Menelaus line DEF
    // Extend DEF a bit
    let vX = E.x - F.x;
    let vY = E.y - F.y;
    let startLine = { x: F.x - vX*0.5, y: F.y - vY*0.5 };
    let endLine = { x: D.x + vX*0.5, y: D.y + vY*0.5 };
    if (m < Math.abs(n)) { // D is on the left
      endLine = { x: D.x - vX*0.5, y: D.y - vY*0.5 };
    }
    drawLine(startLine, endLine, "#ef4444", false, 1.5);

    // Draw BC extension
    if (m > Math.abs(n)) { // D to the right
      drawLine(C, D, "#94a3b8", true, 1.5);
    } else { // D to the left
      drawLine(D, B, "#94a3b8", true, 1.5);
    }

    drawPoint(A, "A", 0, -8);
    drawPoint(B, "B", -8, 16);
    drawPoint(C, "C", 8, 16);
    drawPoint(D, "D", 0, 16, "#b91c1c");
    drawPoint(E, "E", 12, 0);
    drawPoint(F, "F", -12, 0);
    
    if (hasChecked && problem.pattern === 'pattern3') {
      // Highlight route B -> D -> C
      // Using an arc or curve to show the jump
      let pathD = `M ${B.x} ${B.y + 15} Q ${(B.x+D.x)/2} ${B.y + 40} ${D.x} ${D.y + 15}`;
      let pathC = `M ${D.x} ${D.y + 15} Q ${(D.x+C.x)/2} ${C.y + 30} ${C.x} ${C.y + 15}`;
      svgNodes.push(<path key="jump1" d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrow)" />);
      svgNodes.push(<path key="jump2" d={pathC} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrow)" />);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          メネラウス・チェバの定理ドリル
        </h1>
        <p className="text-gray-500">
          三角形と比の定理を使いこなし、複雑な線分比や面積比を瞬時に導き出す演習です。
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
                <option value="pattern1">パターン1 (チェバの定理)</option>
                <option value="pattern2">パターン2 (メネラウス・内側の比)</option>
                <option value="pattern3">パターン3 (メネラウス・外側の比)</option>
                <option value="pattern4">パターン4 (面積比への応用)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[100px] gap-2 text-base font-bold text-slate-700 leading-relaxed">
              {questionEl}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-xl font-bold">
                <input 
                  type="number" 
                  className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansX} 
                  onChange={e => setAnsX(e.target.value)} 
                />
                <span>：</span>
                <input 
                  type="number" 
                  className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" 
                  value={ansY} 
                  onChange={e => setAnsY(e.target.value)} 
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
                {isCorrect ? '正解！見事な図形的直感です。' : '不正解... 定理の経路「頂点→分点→頂点」を確認しましょう。'}
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
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full h-auto">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                </defs>
                {svgNodes}
              </svg>
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="bg-white p-3 border text-center font-bold text-lg mb-2 text-emerald-700 shadow-sm">
                  正解: <MathEq math={`${problem.ansX} : ${problem.ansY}`} />
                </div>
                
                {problem.pattern !== 'pattern4' ? (
                  <div className="bg-gray-50 p-3 border space-y-2">
                    <p className="font-bold border-b pb-1 mb-2">定理を用いた計算</p>
                    <p>頂点と分点を交互にたどる式を立てます。（頂点 <MathEq math="B \to" /> 分点 <MathEq math="D \to" /> 頂点 <MathEq math="C \to \dots" />）</p>
                    <div className="text-center overflow-x-auto py-2">
                      <MathEq math={formulaStr} block />
                    </div>
                    <p>これを解くと、求める比は <MathEq math={`${problem.ansX} : ${problem.ansY}`} /> となります。</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 border space-y-2">
                    <p className="font-bold border-b pb-1 mb-2">質量重心（メネラウス・チェバの裏技）を用いた解法</p>
                    <p>
                      各頂点に「おもり」を置いたと考えます。<br/>
                      <MathEq math={`BD:DC = ${problem.a}:${problem.b}`} /> より、頂点Bの質量を <MathEq math="b" /> 、頂点Cの質量を <MathEq math="a" /> と置きます。<br/>
                      <MathEq math={`CE:EA = ${problem.c}:${problem.d}`} /> を満たすように全体を調整すると、各頂点の相対質量は以下のようになります。
                    </p>
                    <div className="bg-white p-2 text-center border">
                      <MathEq math={`m_A = ${problem.a * problem.d}, \\quad m_B = ${problem.b * problem.c}, \\quad m_C = ${problem.a * problem.c}`} block />
                    </div>
                    <p>
                      交点Pは三角形全体の重心になります。<br/>
                      実は、内部の三角形の面積比は<strong>対向する頂点の質量</strong>に比例します！
                    </p>
                    <div className="text-center">
                      <MathEq math={`\\triangle PAB : \\triangle ABC = m_C : (m_A + m_B + m_C)`} block />
                      <MathEq math={`= ${problem.a * problem.c} : ${problem.a*problem.d + problem.b*problem.c + problem.a*problem.c}`} block />
                      <MathEq math={`= ${problem.ansX} : ${problem.ansY}`} block />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
