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

interface Term {
  sign: 1 | -1;
  c: number; // outer int
  d: number; // inner sqrt
} // value = sign * c * sqrt(d)

interface ProblemData {
  pattern: Pattern;
  a: Term;
  b: Term;
  rOuter: number;
  rInner: number;
  ansAlpha: string; // e.g. "pi/6", "5pi/6", "-pi/4", "alpha"
  ansCos?: string;  // e.g. "3/5"
  ansSin?: string;  // e.g. "4/5"
  qStr: string;
}

function termStr(t: Term, isFirst: boolean): string {
  let s = "";
  if (t.sign === -1) s += "-";
  else if (!isFirst) s += "+";
  
  if (t.c === 1 && t.d === 1) {
    if (s === "+" || s === "-") return s;
    if (s === "") return "";
  }
  if (t.d === 1) {
    s += t.c;
  } else {
    if (t.c !== 1) s += t.c;
    s += `\\sqrt{${t.d}}`;
  }
  return s;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let a: Term = { sign: 1, c: 1, d: 1 };
    let b: Term = { sign: 1, c: 1, d: 1 };
    let rOuter = 1;
    let rInner = 1;
    let ansAlpha = "";
    let ansCos = "";
    let ansSin = "";

    if (p === 'pattern1' || p === 'pattern2') {
      let pairs = [
        { c1:1, d1:1, c2:1, d2:3, alpha: "pi/3" }, // 1, sqrt(3) -> r=2, cos=1/2, sin=sq3/2 -> 60deg
        { c1:1, d1:3, c2:1, d2:1, alpha: "pi/6" }, // sqrt(3), 1 -> r=2, cos=sq3/2, sin=1/2 -> 30deg
        { c1:1, d1:1, c2:1, d2:1, alpha: "pi/4" }  // 1, 1 -> r=sqrt(2) -> 45deg
      ];
      let pair = pairs[Math.floor(Math.random() * pairs.length)];
      
      a = { sign: 1, c: pair.c1, d: pair.d1 };
      b = { sign: 1, c: pair.c2, d: pair.d2 };
      
      if (p === 'pattern2') {
        a.sign = Math.random() > 0.5 ? 1 : -1;
        b.sign = Math.random() > 0.5 ? 1 : -1;
        if (a.sign === 1 && b.sign === 1) b.sign = -1; // force at least one negative
      }

      // calculate alpha
      let x = a.sign * Math.sqrt(a.d) * a.c;
      let y = b.sign * Math.sqrt(b.d) * b.c;
      let r = Math.sqrt(x*x + y*y);
      let angle = Math.atan2(y, x);
      
      // format r
      if (Math.abs(r - 2) < 0.01) { rOuter = 2; rInner = 1; }
      else if (Math.abs(r - Math.sqrt(2)) < 0.01) { rOuter = 1; rInner = 2; }
      
      // format angle
      const pi = Math.PI;
      const eps = 0.01;
      if (Math.abs(angle - pi/6) < eps) ansAlpha = "pi/6";
      else if (Math.abs(angle - pi/4) < eps) ansAlpha = "pi/4";
      else if (Math.abs(angle - pi/3) < eps) ansAlpha = "pi/3";
      else if (Math.abs(angle - 2*pi/3) < eps) ansAlpha = "2pi/3";
      else if (Math.abs(angle - 3*pi/4) < eps) ansAlpha = "3pi/4";
      else if (Math.abs(angle - 5*pi/6) < eps) ansAlpha = "5pi/6";
      else if (Math.abs(angle - (-pi/6)) < eps || Math.abs(angle - 11*pi/6) < eps) ansAlpha = "-pi/6"; // 11pi/6 or -pi/6
      else if (Math.abs(angle - (-pi/4)) < eps || Math.abs(angle - 7*pi/4) < eps) ansAlpha = "-pi/4";
      else if (Math.abs(angle - (-pi/3)) < eps || Math.abs(angle - 5*pi/3) < eps) ansAlpha = "-pi/3";
      else if (Math.abs(angle - (-2*pi/3)) < eps || Math.abs(angle - 4*pi/3) < eps) ansAlpha = "-2pi/3";
      else if (Math.abs(angle - (-3*pi/4)) < eps || Math.abs(angle - 5*pi/4) < eps) ansAlpha = "-3pi/4";
      else if (Math.abs(angle - (-5*pi/6)) < eps || Math.abs(angle - 7*pi/6) < eps) ansAlpha = "-5pi/6";
      
    } else if (p === 'pattern3') {
      let pairs = [
        { c1:1, d1:6, c2:1, d2:2, rO:2, rI:2, aStr:"pi/6" }, // sq6, sq2 -> 2sq2, cos=sq3/2, sin=1/2 -> 30deg
        { c1:1, d1:2, c2:1, d2:6, rO:2, rI:2, aStr:"pi/3" }, // sq2, sq6 -> 60deg
        { c1:3, d1:1, c2:1, d2:3, rO:2, rI:3, aStr:"pi/6" }, // 3, sq3 -> r=sqrt(12)=2sq3, cos=3/2sq3=sq3/2 -> 30deg
        { c1:1, d1:3, c2:3, d2:1, rO:2, rI:3, aStr:"pi/3" }
      ];
      let pair = pairs[Math.floor(Math.random() * pairs.length)];
      a = { sign: 1, c: pair.c1, d: pair.d1 };
      b = { sign: 1, c: pair.c2, d: pair.d2 };
      
      // maybe add sign
      if (Math.random() > 0.5) {
        a.sign = Math.random() > 0.5 ? 1 : -1;
        b.sign = Math.random() > 0.5 ? 1 : -1;
        if (a.sign === 1 && b.sign === 1) b.sign = -1;
      }

      rOuter = pair.rO;
      rInner = pair.rI;
      
      let x = a.sign * Math.sqrt(a.d) * a.c;
      let y = b.sign * Math.sqrt(b.d) * b.c;
      let angle = Math.atan2(y, x);
      const pi = Math.PI;
      const eps = 0.01;
      // Re-evaluate angle
      if (Math.abs(angle - pi/6) < eps) ansAlpha = "pi/6";
      else if (Math.abs(angle - pi/4) < eps) ansAlpha = "pi/4";
      else if (Math.abs(angle - pi/3) < eps) ansAlpha = "pi/3";
      else if (Math.abs(angle - 2*pi/3) < eps) ansAlpha = "2pi/3";
      else if (Math.abs(angle - 3*pi/4) < eps) ansAlpha = "3pi/4";
      else if (Math.abs(angle - 5*pi/6) < eps) ansAlpha = "5pi/6";
      else if (Math.abs(angle - (-pi/6)) < eps || Math.abs(angle - 11*pi/6) < eps) ansAlpha = "-pi/6";
      else if (Math.abs(angle - (-pi/4)) < eps || Math.abs(angle - 7*pi/4) < eps) ansAlpha = "-pi/4";
      else if (Math.abs(angle - (-pi/3)) < eps || Math.abs(angle - 5*pi/3) < eps) ansAlpha = "-pi/3";
      else if (Math.abs(angle - (-2*pi/3)) < eps || Math.abs(angle - 4*pi/3) < eps) ansAlpha = "-2pi/3";
      else if (Math.abs(angle - (-3*pi/4)) < eps || Math.abs(angle - 5*pi/4) < eps) ansAlpha = "-3pi/4";
      else if (Math.abs(angle - (-5*pi/6)) < eps || Math.abs(angle - 7*pi/6) < eps) ansAlpha = "-5pi/6";

    } else if (p === 'pattern4') {
      let triples = [
        { x:3, y:4, r:5 }, { x:4, y:3, r:5 },
        { x:5, y:12, r:13 }, { x:12, y:5, r:13 },
        { x:8, y:15, r:17 }
      ];
      let tr = triples[Math.floor(Math.random() * triples.length)];
      let signX = Math.random() > 0.5 ? 1 : -1;
      let signY = Math.random() > 0.5 ? 1 : -1;
      a = { sign: signX as 1|-1, c: tr.x, d: 1 };
      b = { sign: signY as 1|-1, c: tr.y, d: 1 };
      rOuter = tr.r;
      rInner = 1;
      ansAlpha = "alpha";
      ansCos = `${signX * tr.x}/${tr.r}`;
      ansSin = `${signY * tr.y}/${tr.r}`;
    }

    let aStr = termStr(a, true);
    if (aStr === "" || aStr === "-") aStr += "1"; // should not happen with sin
    if (aStr === "1") aStr = "";
    if (aStr === "-1") aStr = "-";
    
    let bStr = termStr(b, false);
    if (bStr === "+" || bStr === "-") bStr += "1";
    if (bStr === "+1") bStr = "+";
    if (bStr === "-1") bStr = "-";

    let qStr = `${aStr}\\sin\\theta ${bStr}\\cos\\theta`;

    return { pattern: p, a, b, rOuter, rInner, ansAlpha, ansCos, ansSin, qStr };
  }
}

export default function TrigSynthesisDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansROuter, setAnsROuter] = useState<string>('');
  const [ansRInner, setAnsRInner] = useState<string>('');
  const [ansAlpha, setAnsAlpha] = useState<string>('');
  const [ansCos, setAnsCos] = useState<string>('');
  const [ansSin, setAnsSin] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsROuter('');
    setAnsRInner('');
    setAnsAlpha('');
    setAnsCos('');
    setAnsSin('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let rOut = parseInt(ansROuter) || 1;
    let rIn = parseInt(ansRInner) || 1;
    
    let isOk = false;
    // check r
    if (rOut === problem.rOuter && rIn === problem.rInner) {
      // check alpha
      let uAlp = ansAlpha.trim().replace(/\s+/g, '').toLowerCase();
      // allow 11pi/6 or -pi/6
      let okAlp = uAlp === problem.ansAlpha || 
                  (problem.ansAlpha === "-pi/6" && uAlp === "11pi/6") ||
                  (problem.ansAlpha === "-pi/4" && uAlp === "7pi/4") ||
                  (problem.ansAlpha === "-pi/3" && uAlp === "5pi/3") ||
                  (problem.ansAlpha === "-2pi/3" && uAlp === "4pi/3") ||
                  (problem.ansAlpha === "-3pi/4" && uAlp === "5pi/4") ||
                  (problem.ansAlpha === "-5pi/6" && uAlp === "7pi/6");

      if (uAlp === "alpha" || uAlp === "α") okAlp = problem.ansAlpha === "alpha";

      if (okAlp) {
        if (problem.pattern === 'pattern4') {
          if (ansCos.trim() === problem.ansCos && ansSin.trim() === problem.ansSin) {
            isOk = true;
          }
        } else {
          isOk = true;
        }
      }
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

    let x = problem.a.sign * Math.sqrt(problem.a.d) * problem.a.c;
    let y = problem.b.sign * Math.sqrt(problem.b.d) * problem.b.c;
    
    let max = Math.max(Math.abs(x), Math.abs(y), 2);
    let scale = Math.min(W/2 - 30, H/2 - 30) / max;
    
    let cx = W/2;
    let cy = H/2;

    const toScr = (px: number, py: number) => ({
      x: cx + px * scale,
      y: cy - py * scale
    });

    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // Draw point P
    let sP = toScr(x, y);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sP.x, sP.y); ctx.stroke();
    
    // Draw dashed lines to axes
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(sP.x, sP.y); ctx.lineTo(sP.x, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sP.x, sP.y); ctx.lineTo(cx, sP.y); ctx.stroke();
    ctx.setLineDash([]);

    // Point
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(sP.x, sP.y, 4, 0, Math.PI*2); ctx.fill();
    ctx.font = '12px sans-serif';
    
    // label P
    let lx = sP.x + (x >= 0 ? 8 : -40);
    let ly = sP.y + (y >= 0 ? -8 : 16);
    let lblX = problem.a.d === 1 ? `${problem.a.sign * problem.a.c}` : `${problem.a.sign < 0 ? '-' : ''}${problem.a.c === 1 ? '' : problem.a.c}√${problem.a.d}`;
    let lblY = problem.b.d === 1 ? `${problem.b.sign * problem.b.c}` : `${problem.b.sign < 0 ? '-' : ''}${problem.b.c === 1 ? '' : problem.b.c}√${problem.b.d}`;
    ctx.fillText(`P(${lblX}, ${lblY})`, lx, ly);

    // Draw arc for angle alpha
    let angle = Math.atan2(y, x);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (angle >= 0) {
      ctx.arc(cx, cy, 25, 0, -angle, true);
    } else {
      ctx.arc(cx, cy, 25, 0, -angle, false);
    }
    ctx.stroke();

    // alpha label
    ctx.fillStyle = '#ef4444';
    let aMid = angle / 2;
    let ax = cx + 35 * Math.cos(aMid);
    let ay = cy - 35 * Math.sin(aMid);
    ctx.fillText('α', ax, ay);
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  if (!problem) return null;

  let rStr = "";
  if (problem.rInner === 1) rStr = `${problem.rOuter}`;
  else rStr = `${problem.rOuter === 1 ? '' : problem.rOuter}\\sqrt{${problem.rInner}}`;

  let explanationEl = <></>;
  if (hasChecked) {
    let xStr = problem.a.d === 1 ? `${problem.a.sign * problem.a.c}` : `${problem.a.sign < 0 ? '-' : ''}${problem.a.c === 1 ? '' : problem.a.c}\\sqrt{${problem.a.d}}`;
    let yStr = problem.b.d === 1 ? `${problem.b.sign * problem.b.c}` : `${problem.b.sign < 0 ? '-' : ''}${problem.b.c === 1 ? '' : problem.b.c}\\sqrt{${problem.b.d}}`;

    if (problem.pattern === 'pattern4') {
      explanationEl = (
        <div className="space-y-4">
          <p><MathEq math={`a\\sin\\theta + b\\cos\\theta`} /> を合成する際は、座標平面に点 <MathEq math={`P(a, b)`} /> をプロットします。<br/>ここでは <MathEq math={`P(${xStr}, ${yStr})`} /> となります。</p>
          <div className="bg-white p-3 border rounded text-center mb-4">
            <MathEq math={`r = \\sqrt{(${xStr})^2 + (${yStr})^2} = ${rStr}`} block />
          </div>
          <p>偏角 <MathEq math="\\alpha" /> は有名角にならないため、そのまま <MathEq math="\\alpha" /> を用いて表します。</p>
          <div className="bg-gray-50 p-3 border rounded text-center">
            <MathEq math={`${rStr} \\sin(\\theta + \\alpha)`} block />
            <span className="text-gray-600 text-[10px]">ただし <MathEq math={`\\cos\\alpha = \\frac{${xStr}}{${rStr}}, \\sin\\alpha = \\frac{${yStr}}{${rStr}}`} /></span>
          </div>
        </div>
      );
    } else {
      let aDisplay = problem.ansAlpha.replace("pi", "\\pi");
      if (aDisplay.startsWith("1\\pi")) aDisplay = aDisplay.replace("1\\pi", "\\pi");
      if (aDisplay.startsWith("-1\\pi")) aDisplay = aDisplay.replace("-1\\pi", "-\\pi");
      // proper fraction rendering
      if (aDisplay.includes("/")) {
        let parts = aDisplay.split("/");
        aDisplay = `\\frac{${parts[0]}}{${parts[1]}}`;
      }

      explanationEl = (
        <div className="space-y-4">
          <p>座標平面に点 <MathEq math={`P(${xStr}, ${yStr})`} /> をプロットします。</p>
          <div className="bg-white p-3 border rounded text-center mb-4">
            <MathEq math={`r = \\sqrt{(${xStr})^2 + (${yStr})^2} = ${rStr}`} block />
          </div>
          <p>図より、原点からの線分が <MathEq math="x" /> 軸正の向きとなす角（偏角 <MathEq math="\\alpha" />）は <MathEq math={aDisplay} /> とわかります。</p>
          <div className="bg-gray-50 p-3 border rounded text-center">
            <MathEq math={`${rStr} \\sin\\left(\\theta ${problem.ansAlpha.startsWith('-') ? '-' : '+'} ${aDisplay.replace('-','')}\\right)`} block />
          </div>
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
          三角関数の合成ドリル
        </h1>
        <p className="text-gray-500">
          <MathEq math="a\sin\theta + b\cos\theta = r\sin(\theta+\alpha)" /> への変形を、座標平面のイメージと結びつけて定着させます。
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
                <option value="pattern1">パターン1 (第一象限の有名角)</option>
                <option value="pattern2">パターン2 (マイナスを含む有名角)</option>
                <option value="pattern3">パターン3 (係数が大きい)</option>
                <option value="pattern4">パターン4 (有名角にならない発展)</option>
              </select>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded shadow-sm mb-6 flex flex-col justify-center min-h-[100px] gap-2 text-xl font-bold text-slate-800 leading-relaxed text-center">
              <MathEq math={problem.qStr} />
            </div>
            
            <div className="space-y-6 flex flex-col items-center justify-center">
              
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-gray-500">振幅 <MathEq math="r" /></span>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-xl text-slate-800 focus:border-blue-500" 
                    value={ansROuter} 
                    onChange={e => setAnsROuter(e.target.value)} 
                    placeholder="外"
                  />
                  <span className="text-xl font-bold">√</span>
                  <input 
                    type="number" 
                    className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-xl text-slate-800 focus:border-blue-500" 
                    value={ansRInner} 
                    onChange={e => setAnsRInner(e.target.value)} 
                    placeholder="中"
                  />
                </div>
                <span className="text-[10px] text-gray-400">※整数なら中は空欄または1</span>
              </div>

              <div className="flex flex-col items-center gap-1 w-full border-t pt-4">
                <span className="text-sm font-bold text-gray-500">偏角 <MathEq math="\alpha" /></span>
                <input 
                  type="text" 
                  className="w-32 bg-transparent border-b-2 outline-none text-center font-bold text-xl text-slate-800 focus:border-blue-500" 
                  value={ansAlpha} 
                  onChange={e => setAnsAlpha(e.target.value)} 
                  placeholder="例: pi/6, alpha"
                />
                <span className="text-[10px] text-gray-400">※有名角でない場合は alpha と入力</span>
              </div>

              <div className={`w-full flex-col items-center gap-2 border-t pt-4 ${ansAlpha.toLowerCase() === 'alpha' || ansAlpha === 'α' ? 'flex' : 'hidden'}`}>
                <span className="text-sm font-bold text-gray-500">有名角でない場合の補足</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span><MathEq math="\cos\alpha=" /></span>
                    <input 
                      type="text" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-base text-slate-800 focus:border-blue-500" 
                      value={ansCos} 
                      onChange={e => setAnsCos(e.target.value)} 
                      placeholder="3/5"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span><MathEq math="\sin\alpha=" /></span>
                    <input 
                      type="text" 
                      className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-base text-slate-800 focus:border-blue-500" 
                      value={ansSin} 
                      onChange={e => setAnsSin(e.target.value)} 
                      placeholder="4/5"
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
                {isCorrect ? '正解！座標平面のイメージが完璧です。' : '不正解... rの計算や偏角の向きを図で確認しましょう。'}
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
                {explanationEl}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
