"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { getQuadraticInequalityRegion, getQuadraticInequalityRootLabelBaselines, parseQuadraticInequalityFraction, reverseQuadraticInequalitySign, type QuadraticInequalityAnswerType } from '@/src/lib/quadraticInequality';
import { generateQuadraticInequalityProblem, type QuadraticInequalityPattern, type QuadraticInequalityProblem } from '@/src/lib/quadraticInequalityProblems';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

type AnsType = QuadraticInequalityAnswerType;
type Pattern = QuadraticInequalityPattern;
type ProblemData = QuadraticInequalityProblem;

const generateProblem = generateQuadraticInequalityProblem;

export default function QuadraticInequalityDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useClientGeneratedState<ProblemData>(() => generateProblem('mix'));
  
  const [userAnsType, setUserAnsType] = useState<AnsType>(1);
  const [ans1Num, setAns1Num] = useState<string>('');
  const [ans1Den, setAns1Den] = useState<string>('');
  const [ans2Num, setAns2Num] = useState<string>('');
  const [ans2Den, setAns2Den] = useState<string>('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGraph = useCallback(() => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const D = problem.b * problem.b - 4 * problem.a * problem.c;
    const vx = -problem.b / (2 * problem.a);
    const vy = -D / (4 * problem.a);

    let minX = vx - 4;
    let maxX = vx + 4;
    
    if (problem.roots.length === 2) {
      const r1 = problem.roots[0].num / problem.roots[0].den;
      const r2 = problem.roots[1].num / problem.roots[1].den;
      minX = r1 - 2;
      maxX = r2 + 2;
    }

    const rangeX = maxX - minX;
    const func = (x: number) => problem.a * x * x + problem.b * x + problem.c;
    
    let minY = vy;
    let maxY = vy;
    for (let i = 0; i <= 100; i++) {
      const x = minX + (rangeX * i) / 100;
      const y = func(x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    if (minY > 0) minY = -1;
    if (maxY < 0) maxY = 1;
    
    let rangeY = maxY - minY;
    minY -= rangeY * 0.1;
    maxY += rangeY * 0.1;
    rangeY = maxY - minY;

    const mapX = (x: number) => ((x - minX) / rangeX) * W;
    const mapY = (y: number) => H - ((y - minY) / rangeY) * H;

    // x-axis
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0));
    ctx.lineTo(W, mapY(0));
    ctx.stroke();
    
    // y-axis
    if (minX <= 0 && 0 <= maxX) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mapX(0), 0);
      ctx.lineTo(mapX(0), H);
      ctx.stroke();
    }

    if (hasChecked) {
      // Fill each continuous solution interval along the parabola and x-axis.
      ctx.fillStyle = problem.ineqSign === '<' || problem.ineqSign === '\\le' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      const satisfiesInequality = (y: number) =>
        problem.ineqSign === '<' || problem.ineqSign === '\\le' ? y <= 0 : y >= 0;
      let region: Array<{ x: number; y: number }> = [];
      const fillRegion = () => {
        if (region.length === 0) return;
        const first = region[0];
        const last = region[region.length - 1];
        ctx.beginPath();
        ctx.moveTo(mapX(first.x), mapY(0));
        region.forEach(point => ctx.lineTo(mapX(point.x), mapY(point.y)));
        ctx.lineTo(mapX(last.x), mapY(0));
        ctx.closePath();
        ctx.fill();
        region = [];
      };

      for (let i = 0; i <= 200; i++) {
        const x = minX + (rangeX * i) / 200;
        const y = func(x);
        if (satisfiesInequality(y)) region.push({ x, y });
        else fillRegion();
      }
      fillRegion();

      // Draw Roots Dots
      ctx.fillStyle = '#000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const rootLabels = problem.roots.map(r => {
        const x = r.num / r.den;
        const text = r.den === 1 ? `${r.num}` : `${r.num}/${r.den}`;
        return { root: r, x, text, labelX: mapX(x), width: ctx.measureText(text).width };
      });
      const labelBaselines = getQuadraticInequalityRootLabelBaselines(
        rootLabels.map(({ labelX, width }) => ({ x: labelX, width })),
        mapY(0) + 16,
      );
      rootLabels.forEach(({ x, text }, index) => {
        ctx.beginPath();
        if (problem.ineqSign === '<' || problem.ineqSign === '>') {
          ctx.arc(mapX(x), mapY(0), 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#000';
        } else {
          ctx.arc(mapX(x), mapY(0), 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        ctx.fillText(text, mapX(x), labelBaselines[index]);
      });
    }

    // Parabola
    ctx.strokeStyle = problem.a > 0 ? '#3b82f6' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = minX + (rangeX * i) / 100;
      const y = func(x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

  }, [problem, hasChecked]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  const handleNext = (pattern: Pattern | 'mix' = selectedPattern) => {
    setProblem(generateProblem(pattern));
    setUserAnsType(1);
    setAns1Num(''); setAns1Den('');
    setAns2Num(''); setAns2Den('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;

    const firstRequired = [1, 2, 3, 4, 5, 6].includes(userAnsType);
    const secondRequired = [1, 2, 3, 4].includes(userAnsType);
    if ((firstRequired && !ans1Num.trim()) || (secondRequired && !ans2Num.trim())) return;
    
    if (userAnsType !== problem.ansType) {
      setIsCorrect(false);
      setHasChecked(true);
      return;
    }
    
    // Type 7 and 8 have no inputs
    if (problem.ansType === 7 || problem.ansType === 8) {
      setIsCorrect(true);
      setHasChecked(true);
      return;
    }
    
    const u1 = parseQuadraticInequalityFraction(ans1Num, ans1Den);
    const u2 = [1, 2, 3, 4].includes(problem.ansType)
      ? parseQuadraticInequalityFraction(ans2Num, ans2Den)
      : null;
    if (!u1 || ([1, 2, 3, 4].includes(problem.ansType) && !u2)) {
      setIsCorrect(false);
      setHasChecked(true);
      return;
    }
    const r1 = problem.roots[0];
    
    if (problem.ansType === 5 || problem.ansType === 6) {
      if (u1.num === r1.num && u1.den === r1.den) setIsCorrect(true);
      else setIsCorrect(false);
    } else {
      const r2 = problem.roots[1];
      if (u1.num === r1.num && u1.den === r1.den && u2?.num === r2.num && u2.den === r2.den) setIsCorrect(true);
      else setIsCorrect(false);
    }
    
    setHasChecked(true);
  };

  if (!problem) return null;

  const formatRoot = ({ num, den }: ProblemData['roots'][number]) => den === 1 ? `${num}` : `${num}/${den}`;
  const rootsLabel = problem.roots.map(formatRoot);
  const normalizedSign = problem.a < 0 ? reverseQuadraticInequalitySign(problem.ineqSign) : problem.ineqSign;
  const inequalityRegion = getQuadraticInequalityRegion(normalizedSign);
  const transformedA = -problem.a;
  const transformedB = -problem.b;
  const transformedC = -problem.c;
  const transformedExpression = [
    `${transformedA === 1 ? '' : transformedA === -1 ? '-' : transformedA}x^2`,
    transformedB === 0 ? '' : `${transformedB > 0 ? '+' : '-'}${Math.abs(transformedB) === 1 ? '' : Math.abs(transformedB)}x`,
    transformedC === 0 ? '' : `${transformedC > 0 ? '+' : '-'}${Math.abs(transformedC)}`,
  ].join('');
  const solutionLabel = (() => {
    switch (problem.ansType) {
      case 1: return `${rootsLabel[0]} < x < ${rootsLabel[1]}`;
      case 2: return `x < ${rootsLabel[0]} または ${rootsLabel[1]} < x`;
      case 3: return `${rootsLabel[0]} ≤ x ≤ ${rootsLabel[1]}`;
      case 4: return `x ≤ ${rootsLabel[0]} または ${rootsLabel[1]} ≤ x`;
      case 5: return `x = ${rootsLabel[0]}`;
      case 6: return `x = ${rootsLabel[0]} 以外のすべての実数`;
      case 7: return 'すべての実数';
      case 8: return '解なし';
    }
  })();
  const graphDescription = `${problem.eq} のグラフ。${problem.a > 0 ? '下に凸' : '上に凸'}の放物線で、x軸との交点は ${rootsLabel.join(' と ')}。${hasChecked ? `色付き部分が不等式を満たす範囲で、解は ${solutionLabel}。` : '解答後に不等式を満たす範囲が色付きで表示されます。'}`;

  const renderInputBox = (numState: string, setNum: (s:string)=>void, denState: string, setDen: (s:string)=>void, side: '左側の境界値' | '右側の境界値' | '境界値') => (
    <div className="flex flex-col items-center justify-center inline-flex align-middle">
      <input type="text" aria-label={`${side}の分子`} className="w-10 border border-gray-400 p-1 text-center font-bold" value={numState} onChange={e => { setNum(e.target.value); setHasChecked(false); setIsCorrect(false); }} />
      <div className="w-full border-b-2 border-slate-800 my-0.5"></div>
      <input type="text" aria-label={`${side}の分母`} className="w-10 border border-gray-400 p-1 text-center font-bold bg-gray-50" value={denState} onChange={e => { setDen(e.target.value); setHasChecked(false); setIsCorrect(false); }} placeholder="1" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          2次不等式の解ドリル
        </h1>
        <p className="text-gray-500">
          放物線とx軸の位置関係をイメージして、2次不等式を素早く正確に解く反復練習です。
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
                onChange={e => {
                  const pattern = e.target.value as Pattern | 'mix';
                  setSelectedPattern(pattern);
                  handleNext(pattern);
                }}
                className="border p-1 text-xs"
              >
                <option value="mix">実戦練習：二次不等式 全パターンランダム</option>
                <option value="pattern1">基礎練習：基本・内側/外側だけ</option>
                <option value="pattern2">基礎練習：マイナス係数だけ</option>
                <option value="pattern3">基礎練習：解が分数だけ</option>
                <option value="pattern4">基礎練習：D=0の特殊解だけ</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700 mb-4">
                解の形を選んでから、数値を入力してください。
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 1} onChange={() => { setUserAnsType(1); setHasChecked(false); setIsCorrect(false); }} />
                  <MathEq math="A < x < B" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 3} onChange={() => { setUserAnsType(3); setHasChecked(false); setIsCorrect(false); }} />
                  <MathEq math="A \le x \le B" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 2} onChange={() => { setUserAnsType(2); setHasChecked(false); setIsCorrect(false); }} />
                  <MathEq math="x < A, \quad B < x" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 4} onChange={() => { setUserAnsType(4); setHasChecked(false); setIsCorrect(false); }} />
                  <MathEq math="x \le A, \quad B \le x" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 5} onChange={() => { setUserAnsType(5); setHasChecked(false); setIsCorrect(false); }} />
                  <MathEq math="x = A" />
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 6} onChange={() => { setUserAnsType(6); setHasChecked(false); setIsCorrect(false); }} />
                  <><MathEq math="x \neq A" /> のすべての実数</>
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 7} onChange={() => { setUserAnsType(7); setHasChecked(false); setIsCorrect(false); }} />
                  すべての実数
                </label>
                <label className="flex items-center gap-2 border p-2 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="ansType" checked={userAnsType === 8} onChange={() => { setUserAnsType(8); setHasChecked(false); setIsCorrect(false); }} />
                  解なし
                </label>
              </div>

              <div className="flex items-center justify-center h-16 text-lg font-bold">
                {userAnsType === 1 && <>{renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den, '左側の境界値')} <span className="mx-2"><MathEq math="< x <" /></span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den, '右側の境界値')}</>}
                {userAnsType === 3 && <>{renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den, '左側の境界値')} <span className="mx-2"><MathEq math="\le x \le" /></span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den, '右側の境界値')}</>}
                {userAnsType === 2 && <>x <span className="mx-2"><MathEq math="<" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den, '左側の境界値')} <span className="mx-2">,</span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den, '右側の境界値')} <span className="mx-2"><MathEq math="<" /></span> x</>}
                {userAnsType === 4 && <>x <span className="mx-2"><MathEq math="\le" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den, '左側の境界値')} <span className="mx-2">,</span> {renderInputBox(ans2Num, setAns2Num, ans2Den, setAns2Den, '右側の境界値')} <span className="mx-2"><MathEq math="\le" /></span> x</>}
                {userAnsType === 5 && <>x <span className="mx-2"><MathEq math="=" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den, '境界値')}</>}
                {userAnsType === 6 && <>x <span className="mx-2"><MathEq math="\neq" /></span> {renderInputBox(ans1Num, setAns1Num, ans1Den, setAns1Den, '境界値')} <span className="ml-2 text-sm font-normal">のすべての実数</span></>}
                {userAnsType === 7 && <span className="text-blue-600">すべての実数</span>}
                {userAnsType === 8 && <span className="text-red-600">解なし</span>}
              </div>

            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <button 
                onClick={handleCheck}
                disabled={([1, 2, 3, 4, 5, 6].includes(userAnsType) && !ans1Num.trim()) || ([1, 2, 3, 4].includes(userAnsType) && !ans2Num.trim())}
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
                {isCorrect ? '正解！グラフで領域を視覚的に確認しよう。' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・領域グラフ
              </h2>
              {hasChecked && (
                <div className="flex gap-1 text-[10px]">
                  <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                  <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                </div>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={200} 
                role="img"
                aria-label={graphDescription}
                className="border border-gray-300 bg-white shadow-sm w-full max-w-full h-auto"
              />
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                
                {problem.a < 0 && (
                  <div className="bg-red-50 p-2 border border-red-200">
                    <p className="font-bold text-red-600 mb-1">【重要】最初に x² の係数をプラスにする！</p>
                    <p>両辺に <MathEq math="-1" /> を掛けます。<strong className="text-red-600 underline">このとき不等号の向きが逆になることに注意！</strong></p>
                    <MathEq math={`${transformedExpression} ${normalizedSign} 0`} block />
                  </div>
                )}

                {problem.roots.length === 2 && (
                  <div className="bg-gray-50 p-2 border">
                    <p>因数分解すると、左辺は <MathEq math={`= 0`} /> のとき、<MathEq math={`x = ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}, \\quad ${problem.roots[1].den === 1 ? problem.roots[1].num : `\\frac{${problem.roots[1].num}}{${problem.roots[1].den}}`}`} /> となります。</p>
                    <p>{problem.a < 0 ? '変形後の式' : '左辺'}のグラフは、下に凸の放物線になります。</p>
                    <p className="mt-2">今回は {inequalityRegion.boundary} 条件なので、x軸より「{inequalityRegion.side}」の部分を探します。</p>
                    <p>グラフの色付き部分に対応する $x$ の範囲が答えです。</p>
                  </div>
                )}

                {problem.roots.length === 1 && (
                  <div className="bg-gray-50 p-2 border">
                    <p>{problem.a < 0 ? '変形後の左辺' : '左辺'}は完全平方式 <MathEq math={`${Math.abs(problem.a) === 1 ? '' : Math.abs(problem.a)}\\left(x ${problem.roots[0].num < 0 ? '+' : '-'} ${Math.abs(problem.roots[0].num)}\\right)^2`} /> になります。</p>
                    <p>判別式 <MathEq math="D=0" /> であり、放物線は x軸と <MathEq math={`x = ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}`} /> で接します。</p>
                    <p className="mt-2">{problem.a < 0 ? '変形後のグラフから' : 'グラフから'}、{inequalityRegion.boundary} 条件を満たす <MathEq math="x" /> を探します。</p>
                    <ul className="list-disc pl-4 mt-1">
                      {problem.ansType === 5 && <li>接点のみが条件を満たすため、答えは <MathEq math={`x = ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}`} /> となります。</li>}
                      {problem.ansType === 6 && <li>接点以外はすべて条件を満たすため、答えは <MathEq math={`x \\neq ${problem.roots[0].den === 1 ? problem.roots[0].num : `\\frac{${problem.roots[0].num}}{${problem.roots[0].den}}`}`} /> のすべての実数です。</li>}
                      {problem.ansType === 7 && <li>すべての点で条件を満たすため、答えは「すべての実数」です。</li>}
                      {problem.ansType === 8 && <li>二次式は実数範囲で常に{problem.a > 0 ? '0以上' : '0以下'}です。したがって、この不等号を満たす値はなく、答えは「解なし」です。</li>}
                    </ul>
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
