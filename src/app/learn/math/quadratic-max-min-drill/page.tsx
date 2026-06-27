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
  eq: string;
  alpha: number;
  beta: number;
  a: number;
  p: number;
  q: number;
  maxV: number;
  maxX: number[];
  minV: number;
  minX: number[];
  isDownward: boolean;
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  let p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  while (true) {
    let alpha = Math.floor(Math.random() * 9) - 4; // -4 to 4
    let length = Math.floor(Math.random() * 4) + 2; // 2 to 5
    let beta = alpha + length;
    
    let p = 0, a = 1, isDownward = false;
    
    let logicPattern = p_type;
    if (p_type === 'pattern4') {
      a = -(Math.floor(Math.random() * 3) + 1); // -1 to -3
      isDownward = true;
      let sub = Math.floor(Math.random() * 3);
      if (sub === 0) logicPattern = 'pattern1';
      if (sub === 1) logicPattern = 'pattern2';
      if (sub === 2) logicPattern = 'pattern3';
    } else {
      a = Math.floor(Math.random() * 3) + 1; // 1 to 3
    }
    
    if (logicPattern === 'pattern1') {
      p = alpha + Math.floor(Math.random() * (length - 1)) + 1;
      if (p - alpha === beta - p) {
        p += Math.random() < 0.5 ? 1 : -1;
        if (p <= alpha || p >= beta) p = alpha + 1;
        if (p - alpha === beta - p) p = alpha + 1;
      }
    } else if (logicPattern === 'pattern2') {
      if (Math.random() < 0.5) p = alpha - Math.floor(Math.random() * 3) - 1;
      else p = beta + Math.floor(Math.random() * 3) + 1;
    } else if (logicPattern === 'pattern3') {
      if (length % 2 !== 0) {
        length++;
        beta++;
      }
      p = alpha + length / 2;
    }
    
    let q = Math.floor(Math.random() * 9) - 4;
    let eq = `y = ${a === 1 ? '' : a === -1 ? '-' : a}(x ${p === 0 ? '' : p > 0 ? '-' : '+'} ${Math.abs(p)})^2 ${q === 0 ? '' : q > 0 ? '+' : '-'} ${Math.abs(q)}`;
    
    let f = (x: number) => a * (x - p) * (x - p) + q;
    let maxV = -Infinity; let minV = Infinity;
    let maxX: number[] = []; let minX: number[] = [];
    
    let testPoints = [alpha, beta];
    if (p >= alpha && p <= beta) testPoints.push(p);
    
    for (let x of testPoints) {
      let y = f(x);
      if (y > maxV) { maxV = y; maxX = [x]; }
      else if (y === maxV && !maxX.includes(x)) { maxX.push(x); }
      
      if (y < minV) { minV = y; minX = [x]; }
      else if (y === minV && !minX.includes(x)) { minX.push(x); }
    }
    
    maxX.sort((x1, x2) => x1 - x2);
    minX.sort((x1, x2) => x1 - x2);
    
    return { pattern: p_type, eq, alpha, beta, a, p, q, maxV, maxX, minV, minX, isDownward };
  }
}

export default function QuadraticMaxMinDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ansMaxV, setAnsMaxV] = useState('');
  const [ansMaxX1, setAnsMaxX1] = useState('');
  const [ansMaxX2, setAnsMaxX2] = useState('');
  
  const [ansMinV, setAnsMinV] = useState('');
  const [ansMinX1, setAnsMinX1] = useState('');
  const [ansMinX2, setAnsMinX2] = useState('');
  
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, [selectedPattern]);

  const drawGraph = () => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const f = (x: number) => problem.a * (x - problem.p) * (x - problem.p) + problem.q;
    
    let minX = problem.alpha - 2;
    let maxX = problem.beta + 2;
    if (problem.p < minX) minX = problem.p - 1;
    if (problem.p > maxX) maxX = problem.p + 1;
    
    let rangeX = maxX - minX;
    
    let minY = problem.q;
    let maxY = problem.q;
    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let y = f(x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    
    let rangeY = maxY - minY;
    if (rangeY === 0) rangeY = 10;
    minY -= rangeY * 0.2;
    maxY += rangeY * 0.2;
    rangeY = maxY - minY;

    const mapX = (x: number) => ((x - minX) / rangeX) * W;
    const mapY = (y: number) => H - ((y - minY) / rangeY) * H;

    // axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0)); ctx.lineTo(W, mapY(0));
    ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), H);
    ctx.stroke();

    // entire parabola (thin)
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      let x = minX + (rangeX * i) / 100;
      let y = f(x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // valid domain (thick)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      let x = problem.alpha + ((problem.beta - problem.alpha) * i) / 100;
      let y = f(x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

    if (hasChecked) {
      // Max dots
      ctx.fillStyle = '#ef4444'; // red
      problem.maxX.forEach(x => {
        let y = problem.maxV;
        ctx.beginPath();
        ctx.arc(mapX(x), mapY(y), 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Max`, mapX(x), mapY(y) - 10);
      });

      // Min dots
      ctx.fillStyle = '#3b82f6'; // blue
      problem.minX.forEach(x => {
        let y = problem.minV;
        ctx.beginPath();
        ctx.arc(mapX(x), mapY(y), 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Min`, mapX(x), mapY(y) + 18);
      });
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAnsMaxV(''); setAnsMaxX1(''); setAnsMaxX2('');
    setAnsMinV(''); setAnsMinX1(''); setAnsMinX2('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const checkVals = (uV: string, ux1: string, ux2: string, pV: number, pX: number[]) => {
      if (parseInt(uV) !== pV) return false;
      let uX = [];
      if (ux1.trim() !== '') uX.push(parseInt(ux1));
      if (ux2.trim() !== '') uX.push(parseInt(ux2));
      uX.sort((a,b)=>a-b);
      if (uX.length !== pX.length) return false;
      for (let i=0; i<uX.length; i++) {
        if (uX[i] !== pX[i]) return false;
      }
      return true;
    };

    let maxOk = checkVals(ansMaxV, ansMaxX1, ansMaxX2, problem.maxV, problem.maxX);
    let minOk = checkVals(ansMinV, ansMinX1, ansMinX2, problem.minV, problem.minX);

    setIsCorrect(maxOk && minOk);
    setHasChecked(true);
  };

  if (!problem) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          2次関数の最大・最小ドリル
        </h1>
        <p className="text-gray-500">
          定義域と軸の位置関係をグラフから視覚的に判断し、最大値・最小値を求める演習です。
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
                <option value="pattern1">パターン1 (軸が定義域の内側)</option>
                <option value="pattern2">パターン2 (軸が外側・単調増減)</option>
                <option value="pattern3">パターン3 (軸が中央・対称)</option>
                <option value="pattern4">パターン4 (上に凸 a&lt;0)</option>
              </select>
            </div>

            <div className="text-center my-6 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="text-center text-lg font-bold text-blue-700 bg-blue-50 py-2 border border-blue-200">
              <MathEq math={`(${problem.alpha} \\le x \\le ${problem.beta})`} />
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="text-center font-bold text-gray-700 mb-4">
                上記の関数の最大値と最小値を求めなさい。
              </div>
              
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <div className="flex items-center gap-2 bg-red-50 p-2 border border-red-200 rounded">
                  <div className="font-bold text-red-700 w-12 text-right">最大値:</div>
                  <input type="number" className="w-16 border p-1 text-center font-bold" value={ansMaxV} onChange={e => setAnsMaxV(e.target.value)} />
                  <div className="ml-2 text-[10px] text-gray-600">
                    (x = <input type="number" className="w-10 border p-1 text-center mx-1" value={ansMaxX1} onChange={e => setAnsMaxX1(e.target.value)} />
                    <span className="mx-1">,</span>
                    <input type="number" className="w-10 border p-1 text-center mx-1" value={ansMaxX2} onChange={e => setAnsMaxX2(e.target.value)} placeholder="空" />
                    のとき)
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 p-2 border border-blue-200 rounded">
                  <div className="font-bold text-blue-700 w-12 text-right">最小値:</div>
                  <input type="number" className="w-16 border p-1 text-center font-bold" value={ansMinV} onChange={e => setAnsMinV(e.target.value)} />
                  <div className="ml-2 text-[10px] text-gray-600">
                    (x = <input type="number" className="w-10 border p-1 text-center mx-1" value={ansMinX1} onChange={e => setAnsMinX1(e.target.value)} />
                    <span className="mx-1">,</span>
                    <input type="number" className="w-10 border p-1 text-center mx-1" value={ansMinX2} onChange={e => setAnsMinX2(e.target.value)} placeholder="空" />
                    のとき)
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 text-center mt-4">
                ※ xの値が1つしかない場合は、2つ目の枠を空欄にしてください。<br/>
                ※ xが2つある場合は、順不同で入力可能です。
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
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
                {isCorrect ? '正解！グラフでの位置関係をマスターしましたね。' : '不正解... グラフで頂点と端点の位置を確認しよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・定義域のグラフ
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
                className="border border-gray-300 bg-white shadow-sm"
              />
            </div>

            {!hasChecked ? (
              <div className="flex items-center justify-center text-gray-400 italic">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed">
                
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm flex flex-col gap-2">
                  <div className="text-red-700">最大値: {problem.maxV} <span className="text-sm font-normal text-gray-600">(x = {problem.maxX.join(', ')})</span></div>
                  <div className="text-blue-700">最小値: {problem.minV} <span className="text-sm font-normal text-gray-600">(x = {problem.minX.join(', ')})</span></div>
                </div>

                <div className="bg-gray-50 p-2 border">
                  <p className="font-bold border-b pb-1 mb-1">1. グラフの形と軸を確認</p>
                  <p>方程式は <MathEq math={problem.eq} /> です。</p>
                  <p>頂点は <MathEq math={`(${problem.p}, ${problem.q})`} />、軸は <MathEq math={`x = ${problem.p}`} /> です。</p>
                  <p><MathEq math="x^2" /> の係数が <MathEq math={`${problem.a}`} /> なので、<strong className="text-red-600">{problem.isDownward ? '上に凸' : '下に凸'}</strong>の放物線になります。</p>
                </div>

                <div className="bg-gray-50 p-2 border">
                  <p className="font-bold border-b pb-1 mb-1">2. 定義域との位置関係</p>
                  <p>定義域は <MathEq math={`${problem.alpha} \\le x \\le ${problem.beta}`} /> です。</p>
                  <p>軸 <MathEq math={`x = ${problem.p}`} /> がこの範囲に<strong>{problem.p >= problem.alpha && problem.p <= problem.beta ? '含まれる' : '含まれない'}</strong>ことに注意します。</p>
                  <ul className="list-disc pl-4 mt-2">
                    {problem.isDownward ? (
                      <>
                        <li>上に凸なので、頂点が一番高くなります。（定義域内にあればそれが最大値）</li>
                        <li>軸から遠い端点ほど、グラフは低く（小さく）なります。</li>
                      </>
                    ) : (
                      <>
                        <li>下に凸なので、頂点が一番低くなります。（定義域内にあればそれが最小値）</li>
                        <li>軸から遠い端点ほど、グラフは高く（大きく）なります。</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-2 border">
                  <p className="font-bold border-b pb-1 mb-1">3. 値の計算</p>
                  <p>候補となる点の <MathEq math="y" /> 座標を計算します。</p>
                  <ul className="pl-2 mt-1 space-y-1 font-mono text-[10px]">
                    <li>x = {problem.alpha} のとき: y = {problem.a * (problem.alpha - problem.p) ** 2 + problem.q}</li>
                    <li>x = {problem.beta} のとき: y = {problem.a * (problem.beta - problem.p) ** 2 + problem.q}</li>
                    {problem.p >= problem.alpha && problem.p <= problem.beta && (
                      <li className="font-bold">x = {problem.p} (頂点): y = {problem.q}</li>
                    )}
                  </ul>
                  <p className="mt-2">グラフ（太線部分）と合わせて確認すると、解答のようになります。</p>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
