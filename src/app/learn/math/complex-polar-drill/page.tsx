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
  ansR?: string;       // e.g. "2", "2\\sqrt{2}"
  ansTheta?: string;   // e.g. "pi/6", "5pi/6", "pi"
  ansA?: string;       // e.g. "-2"
  ansB?: string;       // e.g. "2\\sqrt{3}"
  
  // For rendering Canvas
  zX: number;
  zY: number;
  rVal: number;
  thetaVal: number; // radians

  // For Pattern 4
  isProduct?: boolean;
  z1?: {r: number, th: string, thVal: number};
  z2?: {r: number, th: string, thVal: number};

  expLines: string[];
}

function parseAngleStr(thVal: number): string {
  const eps = 0.01;
  const pi = Math.PI;
  if (Math.abs(thVal - 0) < eps) return "0";
  if (Math.abs(thVal - pi/6) < eps) return "pi/6";
  if (Math.abs(thVal - pi/4) < eps) return "pi/4";
  if (Math.abs(thVal - pi/3) < eps) return "pi/3";
  if (Math.abs(thVal - pi/2) < eps) return "pi/2";
  if (Math.abs(thVal - 2*pi/3) < eps) return "2pi/3";
  if (Math.abs(thVal - 3*pi/4) < eps) return "3pi/4";
  if (Math.abs(thVal - 5*pi/6) < eps) return "5pi/6";
  if (Math.abs(thVal - pi) < eps) return "pi";
  if (Math.abs(thVal - 7*pi/6) < eps) return "7pi/6";
  if (Math.abs(thVal - 5*pi/4) < eps) return "5pi/4";
  if (Math.abs(thVal - 4*pi/3) < eps) return "4pi/3";
  if (Math.abs(thVal - 3*pi/2) < eps) return "3pi/2";
  if (Math.abs(thVal - 5*pi/3) < eps) return "5pi/3";
  if (Math.abs(thVal - 7*pi/4) < eps) return "7pi/4";
  if (Math.abs(thVal - 11*pi/6) < eps) return "11pi/6";
  if (Math.abs(thVal - 2*pi) < eps) return "2pi";
  return "0";
}

function formatComplex(x: number, yStr: string): string {
  let res = "";
  if (x !== 0) res += x;
  if (yStr === "0") return res === "" ? "0" : res;
  
  if (yStr.startsWith("-")) {
    if (yStr === "-1") res += "-i";
    else res += yStr + "i";
  } else {
    if (x !== 0) res += "+";
    if (yStr === "1") res += "i";
    else res += yStr + "i";
  }
  return res;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  const getRStr = (r2: number) => {
    let root = Math.sqrt(r2);
    if (Math.abs(root - Math.round(root)) < 0.001) return Math.round(root).toString();
    // Simplified roots for our limited set (8, 12, 18, 20, 32, etc.)
    if (r2 === 8) return "2\\sqrt{2}";
    if (r2 === 12) return "2\\sqrt{3}";
    if (r2 === 18) return "3\\sqrt{2}";
    if (r2 === 20) return "2\\sqrt{5}";
    if (r2 === 27) return "3\\sqrt{3}";
    if (r2 === 32) return "4\\sqrt{2}";
    return `\\sqrt{${r2}}`;
  };

  while (true) {
    if (p === 'pattern1' || p === 'pattern2') {
      let bases = [
        {x: 1, y: Math.sqrt(3), xS: "1", yS: "\\sqrt{3}", r2: 4, th: Math.PI/3},
        {x: Math.sqrt(3), y: 1, xS: "\\sqrt{3}", yS: "1", r2: 4, th: Math.PI/6},
        {x: 1, y: 1, xS: "1", yS: "1", r2: 2, th: Math.PI/4}
      ];
      let b = bases[Math.floor(Math.random() * bases.length)];
      let k = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
      
      let x = b.x * k;
      let y = b.y * k;
      let r2 = b.r2 * k * k;
      
      let xS = b.xS === "1" ? k.toString() : (k === 1 ? b.xS : `${k}${b.xS}`);
      let yS = b.yS === "1" ? k.toString() : (k === 1 ? b.yS : `${k}${b.yS}`);
      
      let signX = 1;
      let signY = 1;
      
      if (p === 'pattern2') {
        signX = Math.random() > 0.5 ? 1 : -1;
        signY = Math.random() > 0.5 ? 1 : -1;
        if (signX === 1 && signY === 1) signX = -1; // force quad II-IV
      }
      
      let finalX = x * signX;
      let finalY = y * signY;
      let finalXS = signX === -1 ? `-${xS}` : xS;
      let finalYS = signY === -1 ? `-${yS}` : yS;
      
      let zStr = "";
      if (finalXS === "1") zStr = "1";
      else if (finalXS === "-1") zStr = "-1";
      else zStr = finalXS;
      
      if (finalYS.startsWith("-")) {
        if (finalYS === "-1") zStr += " - i";
        else zStr += ` - ${finalYS.substring(1)}i`;
      } else {
        if (finalYS === "1") zStr += " + i";
        else zStr += ` + ${finalYS}i`;
      }
      
      let qStr = `複素数 $z = ${zStr}$ を極形式 $r(\\cos\\theta + i\\sin\\theta)$ で表せ。`;
      
      let rVal = Math.sqrt(r2);
      let rStr = getRStr(r2);
      let thVal = Math.atan2(finalY, finalX);
      if (thVal < 0) thVal += 2 * Math.PI;
      
      let ansTheta = parseAngleStr(thVal);
      let thDisplay = ansTheta.replace("pi", "\\pi");
      if (thDisplay.startsWith("1\\pi")) thDisplay = thDisplay.replace("1\\pi", "\\pi");
      if (thDisplay.includes("/")) {
        let pts = thDisplay.split("/");
        thDisplay = `\\frac{${pts[0]}}{${pts[1]}}`;
      }
      
      let expLines = [
        `r = \\sqrt{(${finalXS})^2 + (${finalYS})^2} = ${rStr}`,
        `\\cos\\theta = \\frac{${finalXS}}{${rStr}}, \\quad \\sin\\theta = \\frac{${finalYS}}{${rStr}}`,
        `0 \\le \\theta < 2\\pi \\text{ の範囲でこれを満たす } \\theta \\text{ は } ${thDisplay}`,
        `\\text{よって極形式は } z = ${rStr}\\left(\\cos ${thDisplay} + i\\sin ${thDisplay}\\right)`
      ];
      
      return { pattern: p, qStr, ansR: rStr, ansTheta, zX: finalX, zY: finalY, rVal, thetaVal: thVal, expLines };
    }
    else if (p === 'pattern3') {
      let rVal = Math.floor(Math.random() * 5) + 2; // 2..6
      let axes = [
        {th: 0, x: rVal, y: 0, s: `${rVal}`},
        {th: Math.PI/2, x: 0, y: rVal, s: `${rVal}i`},
        {th: Math.PI, x: -rVal, y: 0, s: `-${rVal}`},
        {th: Math.PI*3/2, x: 0, y: -rVal, s: `-${rVal}i`}
      ];
      let a = axes[Math.floor(Math.random() * axes.length)];
      
      let qStr = `複素数 $z = ${a.s}$ を極形式 $r(\\cos\\theta + i\\sin\\theta)$ で表せ。`;
      let ansTheta = parseAngleStr(a.th);
      let thDisplay = ansTheta.replace("pi", "\\pi");
      if (thDisplay.startsWith("1\\pi")) thDisplay = thDisplay.replace("1\\pi", "\\pi");
      if (thDisplay === "0") thDisplay = "0";
      else if (thDisplay.includes("/")) {
        let pts = thDisplay.split("/");
        thDisplay = `\\frac{${pts[0]}}{${pts[1]}}`;
      }
      
      let expLines = [
        `\\text{複素数平面上で、点 } ${a.s} \\text{ は原点からの距離が } ${rVal} \\text{、偏角が } ${thDisplay} \\text{ の位置にあります。}`,
        `\\text{よって極形式は } z = ${rVal}\\left(\\cos ${thDisplay} + i\\sin ${thDisplay}\\right)`
      ];
      
      return { pattern: p, qStr, ansR: rVal.toString(), ansTheta, zX: a.x, zY: a.y, rVal, thetaVal: a.th, expLines };
    }
    else if (p === 'pattern4') {
      let isProduct = Math.random() > 0.5;
      // Generate two angles that sum/diff to famous angles
      let angles = [
        {val: Math.PI/6, s: "\\frac{\\pi}{6}"},
        {val: Math.PI/4, s: "\\frac{\\pi}{4}"},
        {val: Math.PI/3, s: "\\frac{\\pi}{3}"},
        {val: Math.PI/2, s: "\\frac{\\pi}{2}"},
        {val: 2*Math.PI/3, s: "\\frac{2\\pi}{3}"},
        {val: 3*Math.PI/4, s: "\\frac{3\\pi}{4}"},
        {val: 5*Math.PI/6, s: "\\frac{5\\pi}{6}"}
      ];
      
      let a1 = angles[Math.floor(Math.random() * angles.length)];
      let a2 = angles[Math.floor(Math.random() * angles.length)];
      
      let r1 = Math.floor(Math.random() * 3) + 2; // 2..4
      let r2 = Math.floor(Math.random() * 3) + 2;
      
      let thRes = isProduct ? a1.val + a2.val : a1.val - a2.val;
      while (thRes < 0) thRes += 2*Math.PI;
      while (thRes >= 2*Math.PI) thRes -= 2*Math.PI;
      
      let rRes = isProduct ? r1 * r2 : r1 / r2;
      
      // Need rRes to be simple if quotient (or just don't do quotient if it's messy)
      if (!isProduct) {
        let mults = [2, 3, 4, 6, 8, 9, 12];
        r1 = mults[Math.floor(Math.random() * mults.length)];
        let divs = [2, 3, 4];
        r2 = divs[Math.floor(Math.random() * divs.length)];
        while (r1 % r2 !== 0) {
          r1 = mults[Math.floor(Math.random() * mults.length)];
          r2 = divs[Math.floor(Math.random() * divs.length)];
        }
        rRes = r1 / r2;
      }
      
      let z1Str = `z_1 = ${r1}\\left(\\cos ${a1.s} + i\\sin ${a1.s}\\right)`;
      let z2Str = `z_2 = ${r2}\\left(\\cos ${a2.s} + i\\sin ${a2.s}\\right)`;
      let qStr = `$${z1Str}$, $${z2Str}$ のとき、$${isProduct ? 'z_1 z_2' : '\\frac{z_1}{z_2}'}$ を $a+bi$ の形で表せ。`;
      
      let cosVal = Math.cos(thRes);
      let sinVal = Math.sin(thRes);
      let zX = rRes * cosVal;
      let zY = rRes * sinVal;
      
      // find a and b strings
      let thStr = parseAngleStr(thRes);
      // to determine exact string
      let ansA = "", ansB = "";
      
      // Check famous cos
      if (Math.abs(cosVal) < 0.01) ansA = "0";
      else if (Math.abs(cosVal - 1) < 0.01) ansA = `${rRes}`;
      else if (Math.abs(cosVal + 1) < 0.01) ansA = `-${rRes}`;
      else if (Math.abs(cosVal - 0.5) < 0.01) ansA = `${rRes/2}`;
      else if (Math.abs(cosVal + 0.5) < 0.01) ansA = `-${rRes/2}`;
      else if (Math.abs(cosVal - Math.sqrt(3)/2) < 0.01) ansA = `${rRes/2}\\sqrt{3}`;
      else if (Math.abs(cosVal + Math.sqrt(3)/2) < 0.01) ansA = `-${rRes/2}\\sqrt{3}`;
      else if (Math.abs(cosVal - Math.sqrt(2)/2) < 0.01) ansA = `${rRes/2}\\sqrt{2}`;
      else if (Math.abs(cosVal + Math.sqrt(2)/2) < 0.01) ansA = `-${rRes/2}\\sqrt{2}`;
      
      if (Math.abs(sinVal) < 0.01) ansB = "0";
      else if (Math.abs(sinVal - 1) < 0.01) ansB = `${rRes}`;
      else if (Math.abs(sinVal + 1) < 0.01) ansB = `-${rRes}`;
      else if (Math.abs(sinVal - 0.5) < 0.01) ansB = `${rRes/2}`;
      else if (Math.abs(sinVal + 0.5) < 0.01) ansB = `-${rRes/2}`;
      else if (Math.abs(sinVal - Math.sqrt(3)/2) < 0.01) ansB = `${rRes/2}\\sqrt{3}`;
      else if (Math.abs(sinVal + Math.sqrt(3)/2) < 0.01) ansB = `-${rRes/2}\\sqrt{3}`;
      else if (Math.abs(sinVal - Math.sqrt(2)/2) < 0.01) ansB = `${rRes/2}\\sqrt{2}`;
      else if (Math.abs(sinVal + Math.sqrt(2)/2) < 0.01) ansB = `-${rRes/2}\\sqrt{2}`;

      // cleanup "1\sqrt{3}" to "\sqrt{3}"
      if (ansA === "1\\sqrt{3}") ansA = "\\sqrt{3}";
      if (ansA === "-1\\sqrt{3}") ansA = "-\\sqrt{3}";
      if (ansB === "1\\sqrt{3}") ansB = "\\sqrt{3}";
      if (ansB === "-1\\sqrt{3}") ansB = "-\\sqrt{3}";
      if (ansA === "1\\sqrt{2}") ansA = "\\sqrt{2}";
      if (ansA === "-1\\sqrt{2}") ansA = "-\\sqrt{2}";
      if (ansB === "1\\sqrt{2}") ansB = "\\sqrt{2}";
      if (ansB === "-1\\sqrt{2}") ansB = "-\\sqrt{2}";
      
      // if fractional like 1.5, write as 3/2 etc
      if (ansA.includes(".")) ansA = `${rRes}/2`; // if rRes is odd
      if (ansB.includes(".")) ansB = `${rRes}/2`;
      
      let finalThDisplay = thStr.replace("pi", "\\pi");
      if (finalThDisplay.startsWith("1\\pi")) finalThDisplay = finalThDisplay.replace("1\\pi", "\\pi");
      if (finalThDisplay.includes("/")) {
        let pts = finalThDisplay.split("/");
        finalThDisplay = `\\frac{${pts[0]}}{${pts[1]}}`;
      }
      if (finalThDisplay === "0") finalThDisplay = "0";

      let expLines = [
        `\\text{極形式の${isProduct ? '積' : '商'}の性質を利用します。}`,
        `${isProduct ? 'z_1 z_2' : '\\frac{z_1}{z_2}'} = ${isProduct ? `${r1} \\times ${r2}` : `\\frac{${r1}}{${r2}}`}\\left\\{ \\cos\\left(${a1.s} ${isProduct ? '+' : '-'} ${a2.s}\\right) + i\\sin\\left(${a1.s} ${isProduct ? '+' : '-'} ${a2.s}\\right) \\right\\}`,
        `= ${rRes}\\left(\\cos ${finalThDisplay} + i\\sin ${finalThDisplay}\\right)`,
        `= ${rRes}\\left( ${ansA === '0' ? '0' : ansA} + ${ansB === '0' ? '0' : ansB}i \\right)`,
        `= ${ansA === '0' ? '' : ansA} ${ansB === '0' ? '' : (ansB.startsWith('-') ? ansB : (ansA === '0' ? ansB : '+'+ansB)) + 'i'}`
      ];
      
      return { 
        pattern: p, qStr, ansA, ansB, 
        zX, zY, rVal: rRes, thetaVal: thRes,
        isProduct, z1: {r:r1, th:a1.s, thVal:a1.val}, z2: {r:r2, th:a2.s, thVal:a2.val},
        expLines 
      };
    }
  }
}

export default function ComplexPolarDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansR, setAnsR] = useState<string>('');
  const [ansTheta, setAnsTheta] = useState<string>('');
  const [ansA, setAnsA] = useState<string>('');
  const [ansB, setAnsB] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsR('');
    setAnsTheta('');
    setAnsA('');
    setAnsB('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const cleanAns = (s: string) => s.trim().replace(/\s+/g, '').replace(/\\/g, '');

  const handleCheck = () => {
    if (!problem) return;
    
    let isOk = false;
    if (problem.pattern === 'pattern4') {
      let uA = cleanAns(ansA);
      let pA = cleanAns(problem.ansA!);
      let uB = cleanAns(ansB);
      let pB = cleanAns(problem.ansB!);
      // handle simple numeric matches as well if no sqrt
      if (uA === pA && uB === pB) isOk = true;
    } else {
      let uR = cleanAns(ansR);
      let pR = cleanAns(problem.ansR!);
      let uTh = cleanAns(ansTheta).toLowerCase();
      let pTh = cleanAns(problem.ansTheta!);
      if (uR === pR && (uTh === pTh || (uTh === "0" && pTh === "2pi") || (uTh === "2pi" && pTh === "0"))) {
        isOk = true;
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

    let maxR = problem.rVal;
    if (problem.pattern === 'pattern4') {
      maxR = Math.max(maxR, problem.z1!.r, problem.z2!.r);
    }
    maxR = Math.max(maxR, 2) * 1.2;

    let scale = Math.min(W/2 - 20, H/2 - 20) / maxR;
    let cx = W/2;
    let cy = H/2;

    const toScr = (x: number, y: number) => ({
      x: cx + x * scale,
      y: cy - y * scale
    });

    // Draw axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Re', W - 15, cy - 5);
    ctx.fillText('Im', cx + 5, 10);

    const drawZ = (x: number, y: number, r: number, th: number, label: string, color: string) => {
      let scr = toScr(x, y);
      
      // Line to origin
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(scr.x, scr.y); ctx.stroke();
      
      // Point
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(scr.x, scr.y, 4, 0, Math.PI*2); ctx.fill();
      
      // Label
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(label, scr.x + (x >= 0 ? 8 : -20), scr.y + (y >= 0 ? -8 : 16));
      
      // Arc
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.arc(cx, cy, 20, 0, -th, true);
      ctx.stroke();
    };

    if (problem.pattern === 'pattern4') {
      let z1x = problem.z1!.r * Math.cos(problem.z1!.thVal);
      let z1y = problem.z1!.r * Math.sin(problem.z1!.thVal);
      let z2x = problem.z2!.r * Math.cos(problem.z2!.thVal);
      let z2y = problem.z2!.r * Math.sin(problem.z2!.thVal);
      
      drawZ(z1x, z1y, problem.z1!.r, problem.z1!.thVal, 'z₁', '#94a3b8');
      drawZ(z2x, z2y, problem.z2!.r, problem.z2!.thVal, 'z₂', '#94a3b8');
      
      if (hasChecked) {
        drawZ(problem.zX, problem.zY, problem.rVal, problem.thetaVal, 'z', '#ef4444');
      }
    } else {
      drawZ(problem.zX, problem.zY, problem.rVal, problem.thetaVal, 'z', '#3b82f6');
      if (hasChecked) {
        // Label r and theta clearly
        let midA = problem.thetaVal / 2;
        ctx.fillStyle = '#ef4444';
        ctx.fillText('θ', cx + 30*Math.cos(midA), cy - 30*Math.sin(midA));
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('r', cx + (problem.zX*scale)/2 - 10, cy - (problem.zY*scale)/2 - 10);
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
          複素数の極形式変換ドリル
        </h1>
        <p className="text-gray-500">
          複素数平面上の位置（絶対値と偏角）を直感的に把握し、極形式への変換や積・商の計算をマスターします。
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
                <option value="pattern1">パターン1 (第1象限・基本)</option>
                <option value="pattern2">パターン2 (第2〜第4象限)</option>
                <option value="pattern3">パターン3 (純虚数・実数)</option>
                <option value="pattern4">パターン4 (極形式の積・商)</option>
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
                  <span className="text-sm text-gray-500 mb-2">結果を <MathEq math="a+bi" /> の形で入力</span>
                  <div className="flex items-center gap-2 text-xl">
                    <input 
                      type="text" 
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ansA} 
                      onChange={e => setAnsA(e.target.value)} 
                      placeholder="a (実部)"
                    />
                    <span>+</span>
                    <input 
                      type="text" 
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ansB} 
                      onChange={e => setAnsB(e.target.value)} 
                      placeholder="b (虚部)"
                    />
                    <span>i</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">※ルートは \sqrt&#123;3&#125; と入力</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 font-bold border-t pt-4">
                  <div className="flex items-center gap-4 text-xl">
                    <span><MathEq math="r =" /></span>
                    <input 
                      type="text" 
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ansR} 
                      onChange={e => setAnsR(e.target.value)} 
                      placeholder="絶対値"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xl">
                    <span><MathEq math="\theta =" /></span>
                    <input 
                      type="text" 
                      className="w-24 bg-transparent border-b-2 outline-none text-center font-bold text-slate-800 focus:border-blue-500" 
                      value={ansTheta} 
                      onChange={e => setAnsTheta(e.target.value)} 
                      placeholder="偏角"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">※ \sqrt&#123;2&#125; や 5pi/6 などを入力</span>
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
                {isCorrect ? '正解！複素数平面のイメージが完璧です。' : '不正解... グラフと解説を見て確認しましょう。'}
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
