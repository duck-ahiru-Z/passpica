"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { generateTrigSynthesisProblem, type TrigSynthesisPattern as Pattern, type TrigSynthesisProblem as ProblemData } from '@/src/lib/trigSynthesis';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';
import { parseStrictPositiveInteger } from '@/src/lib/strictPositiveInteger';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function fractionEquivalent(input: string, expected: string): boolean {
  const parse = (value: string) => {
    const normalized = value.trim().replace(/\s+/g, '');
    const parts = normalized.split('/');
    if (parts.length === 1) return Number(parts[0]);
    if (parts.length !== 2 || Number(parts[1]) === 0) return Number.NaN;
    return Number(parts[0]) / Number(parts[1]);
  };
  const actual = parse(input);
  const target = parse(expected);
  return Number.isFinite(actual) && Number.isFinite(target) && Math.abs(actual - target) < 1e-10;
}

export default function TrigSynthesisDrill() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useClientGeneratedState<ProblemData>(() => generateTrigSynthesisProblem('mix'));
  
  const [ansROuter, setAnsROuter] = useState<string>('');
  const [ansRInner, setAnsRInner] = useState<string>('');
  const [ansAlpha, setAnsAlpha] = useState<string>('');
  const [ansCos, setAnsCos] = useState<string>('');
  const [ansSin, setAnsSin] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleNext = () => {
    setProblem(generateTrigSynthesisProblem(selectedPattern));
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
    
    const rOut = parseStrictPositiveInteger(ansROuter);
    const rIn = parseStrictPositiveInteger(ansRInner, true);
    
    let isOk = false;
    // check r
    if (rOut !== null && rIn !== null && rOut === problem.rOuter && rIn === problem.rInner) {
      // check alpha
      const uAlp = ansAlpha.trim().replace(/\s+/g, '').toLowerCase();
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
          if (fractionEquivalent(ansCos, problem.ansCos ?? '') && fractionEquivalent(ansSin, problem.ansSin ?? '')) {
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

  const drawGraph = useCallback(() => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const x = problem.a.sign * Math.sqrt(problem.a.d) * problem.a.c;
    const y = problem.b.sign * Math.sqrt(problem.b.d) * problem.b.c;
    
    const max = Math.max(Math.abs(x), Math.abs(y), 2);
    const scale = Math.min(W/2 - 30, H/2 - 30) / max;
    
    const cx = W/2;
    const cy = H/2;

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
    const sP = toScr(x, y);
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
    const lx = sP.x + (x >= 0 ? 8 : -40);
    const ly = sP.y + (y >= 0 ? -8 : 16);
    const lblX = problem.a.d === 1 ? `${problem.a.sign * problem.a.c}` : `${problem.a.sign < 0 ? '-' : ''}${problem.a.c === 1 ? '' : problem.a.c}√${problem.a.d}`;
    const lblY = problem.b.d === 1 ? `${problem.b.sign * problem.b.c}` : `${problem.b.sign < 0 ? '-' : ''}${problem.b.c === 1 ? '' : problem.b.c}√${problem.b.d}`;
    ctx.fillText(`P(${lblX}, ${lblY})`, lx, ly);

    // Draw arc for angle alpha
    const angle = Math.atan2(y, x);
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
    const aMid = angle / 2;
    const ax = cx + 35 * Math.cos(aMid);
    const ay = cy - 35 * Math.sin(aMid);
    ctx.fillText('α', ax, ay);
  }, [problem]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  if (!problem) return <main className="max-w-5xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  let rStr = "";
  if (problem.rInner === 1) rStr = `${problem.rOuter}`;
  else rStr = `${problem.rOuter === 1 ? '' : problem.rOuter}\\sqrt{${problem.rInner}}`;

  let explanationEl = <></>;
  if (hasChecked) {
    const xStr = problem.a.d === 1 ? `${problem.a.sign * problem.a.c}` : `${problem.a.sign < 0 ? '-' : ''}${problem.a.c === 1 ? '' : problem.a.c}\\sqrt{${problem.a.d}}`;
    const yStr = problem.b.d === 1 ? `${problem.b.sign * problem.b.c}` : `${problem.b.sign < 0 ? '-' : ''}${problem.b.c === 1 ? '' : problem.b.c}\\sqrt{${problem.b.d}}`;

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
        const parts = aDisplay.split("/");
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
              <label htmlFor="trig-synthesis-mode" className="sr-only">三角関数の合成の演習パターン</label>
              <select
                id="trig-synthesis-mode"
                value={selectedPattern}
                onChange={e => { const pattern = e.target.value as Pattern | 'mix'; setSelectedPattern(pattern); setProblem(generateTrigSynthesisProblem(pattern)); setAnsROuter(''); setAnsRInner(''); setAnsAlpha(''); setAnsCos(''); setAnsSin(''); setHasChecked(false); setIsCorrect(false); }}
                className="border p-1 text-xs"
              >
                <option value="mix">実戦練習：三角関数の合成 全パターンランダム</option>
                <option value="pattern1">基礎練習：第一象限の有名角だけ</option>
                <option value="pattern2">基礎練習：マイナスを含む有名角だけ</option>
                <option value="pattern3">基礎練習：係数が大きい形だけ</option>
                <option value="pattern4">基礎練習：有名角でない発展形だけ</option>
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
                    aria-label="振幅の平方根の外側の係数"
                    type="number" 
                    className="w-16 bg-transparent border-b-2 outline-none text-center font-bold text-xl text-slate-800 focus:border-blue-500" 
                    value={ansROuter} 
                    onChange={e => setAnsROuter(e.target.value)} 
                    placeholder="外"
                  />
                  <span className="text-xl font-bold">√</span>
                  <input 
                    aria-label="振幅の平方根の内側の数"
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
                  aria-label="偏角 alpha"
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
                      aria-label="cos alpha の値"
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
                      aria-label="sin alpha の値"
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
