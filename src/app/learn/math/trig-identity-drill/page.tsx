"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import FractionRootInput, { FractionRootValue, defaultFractionRoot, checkFractionRoot } from '@/src/components/math/FractionRootInput';

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

interface TermVal {
  sign: 1 | -1;
  num: number;
  root: number;
  den: number;
}

function getVal(sign: 1 | -1, sqNum: number, sqDen: number): TermVal {
  if (sqNum === 0) return { sign: 1, num: 0, root: 1, den: 1 };
  let inside = sqNum * sqDen;
  let coeff = 1;
  for (let i = 2; i * i <= inside; i++) {
    while (inside % (i * i) === 0) {
      coeff *= i;
      inside /= (i * i);
    }
  }
  let den = sqDen;
  let g = gcd(coeff, den);
  coeff /= g;
  den /= g;
  
  return { sign, num: coeff, root: inside, den: den };
}

function formatTerm(v: TermVal): string {
  if (v.num === 0) return '0';
  let s = v.sign === 1 ? '' : '-';
  
  let numStr = '';
  if (v.root === 1) {
    numStr = `${v.num}`;
  } else {
    numStr = `${v.num === 1 ? '' : v.num}\\sqrt{${v.root}}`;
  }
  
  if (v.den === 1) return `${s}${numStr}`;
  return `${s}\\frac{${numStr}}{${v.den}}`;
}

type Pattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

interface ProblemData {
  pattern: Pattern;
  givenType: 'sin' | 'cos' | 'tan' | 'sum';
  givenVal: TermVal;
  ansSin: TermVal;
  ansCos: TermVal;
  ansTan: TermVal;
  ansProd: TermVal;
  isObtuse: boolean;
  eq: string;
  X2: number; Y2: number; R2: number; signX: 1|-1;
  p: number; q: number; // for pattern4 sum
}

function generateProblem(selectedPattern: Pattern | 'mix'): ProblemData {
  const p_type = selectedPattern === 'mix' 
    ? ['pattern1', 'pattern2', 'pattern3', 'pattern4'][Math.floor(Math.random() * 4)] as Pattern
    : selectedPattern;

  if (p_type === 'pattern4') {
    let q = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
    let maxP = Math.floor(q * 1.414); // sqrt(2)
    let p = Math.floor(Math.random() * (maxP * 2 + 1)) - maxP;
    if (p === q || p === -q || p === 0) p = 1; // avoid 0, 1, -1 for non-trivial
    
    // sum = p/q. (sin+cos)^2 = p^2/q^2 => 1 + 2sin cos = p^2/q^2 => sin cos = (p^2 - q^2)/(2q^2)
    let sqNum = Math.abs(p * p - q * q);
    let signProd = p * p - q * q >= 0 ? 1 : -1;
    let sqDen = 2 * q * q;
    
    // We can just use getVal to simplify (p^2 - q^2) / (2q^2) 
    // wait, getVal takes squared values. The actual value is (p^2-q^2)/(2q^2), not its sqrt.
    // So we need a standard fraction simplifier.
    let num = p * p - q * q;
    let den = 2 * q * q;
    let g = gcd(num, den);
    num /= g; den /= g;
    let prodVal: TermVal = { sign: num >= 0 ? 1 : -1, num: Math.abs(num), root: 1, den: den };
    
    let sumVal: TermVal = { sign: p >= 0 ? 1 : -1, num: Math.abs(p), root: 1, den: q };
    
    return {
      pattern: p_type, givenType: 'sum', givenVal: sumVal,
      ansSin: prodVal, ansCos: prodVal, ansTan: prodVal, ansProd: prodVal, // dummy
      isObtuse: false, eq: `\\sin \\theta + \\cos \\theta = ${formatTerm(sumVal)}`,
      X2: 0, Y2: 0, R2: 0, signX: 1, p, q
    };
  }

  let triples = [[3,4,5], [5,12,13], [8,15,17]];
  let X2, Y2, R2, signX: 1|-1 = 1;
  let isObtuse = false;

  if (p_type === 'pattern1' || p_type === 'pattern2') {
    let t = triples[Math.floor(Math.random() * triples.length)];
    if (Math.random() < 0.5) {
      X2 = t[0]*t[0]; Y2 = t[1]*t[1];
    } else {
      X2 = t[1]*t[1]; Y2 = t[0]*t[0];
    }
    R2 = t[2]*t[2];
    
    if (p_type === 'pattern2') {
      signX = -1;
      isObtuse = true;
    }
  } else {
    // pattern3
    let r = Math.floor(Math.random() * 4) + 2; // 2 to 5
    R2 = r * r;
    X2 = Math.floor(Math.random() * (R2 - 1)) + 1; // 1 to R2-1
    Y2 = R2 - X2;
    if (Math.random() < 0.5) {
      signX = -1;
      isObtuse = true;
    }
  }

  let sinVal = getVal(1, Y2, R2);
  let cosVal = getVal(signX, X2, R2);
  let tanVal = getVal(signX, Y2, X2);

  let types: ('sin'|'cos'|'tan')[] = ['sin', 'cos', 'tan'];
  let givenType = types[Math.floor(Math.random() * 3)];
  let givenVal = givenType === 'sin' ? sinVal : givenType === 'cos' ? cosVal : tanVal;
  let eq = `\\${givenType} \\theta = ${formatTerm(givenVal)}`;

  return {
    pattern: p_type, givenType, givenVal,
    ansSin: sinVal, ansCos: cosVal, ansTan: tanVal, ansProd: sinVal, // dummy
    isObtuse, eq, X2, Y2, R2, signX, p: 0, q: 0
  };
}

export default function TrigIdentityDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | 'mix'>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  const [ans1, setAns1] = useState<FractionRootValue>(defaultFractionRoot);
  const [ans2, setAns2] = useState<FractionRootValue>(defaultFractionRoot);
  const [ans3, setAns3] = useState<FractionRootValue>(defaultFractionRoot); // for pattern4 prod
  
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

    if (problem.pattern === 'pattern4') {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("式の値の計算のため、図形は省略します", W/2, H/2);
      return;
    }

    let cx = W / 2;
    let cy = H / 2;
    let R = 80;

    // x-axis, y-axis
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();

    // Unit circle
    ctx.strokeStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.stroke();

    // Calculate endpoint
    let x = problem.signX * Math.sqrt(problem.X2);
    let y = Math.sqrt(problem.Y2);
    let r = Math.sqrt(problem.R2);
    
    let px = cx + (x / r) * R;
    let py = cy - (y / r) * R;

    // Radius line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Perpendicular
    ctx.strokeStyle = '#3b82f6';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right angle mark
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(px + (x>0 ? -8 : 8), cy);
    ctx.lineTo(px + (x>0 ? -8 : 8), cy - 8);
    ctx.lineTo(px, cy - 8);
    ctx.stroke();

    // Angle arc
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    let theta = Math.atan2(y, x);
    ctx.arc(cx, cy, 20, -theta, 0); // canvas angles: y is down
    ctx.stroke();

    if (hasChecked) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("r", cx + (px-cx)/2 - 10, cy + (py-cy)/2 - 5);
      
      ctx.fillStyle = '#3b82f6';
      ctx.fillText("y", px + 8, cy + (py-cy)/2);
      ctx.fillText("x", cx + (px-cx)/2, cy + 15);
    }
  };

  useEffect(() => {
    drawGraph();
  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem(selectedPattern));
    setAns1(defaultFractionRoot);
    setAns2(defaultFractionRoot);
    setAns3(defaultFractionRoot);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    let isOk = false;
    
    if (problem.pattern === 'pattern4') {
      isOk = checkFractionRoot(ans3, problem.ansProd.sign, problem.ansProd.num, problem.ansProd.root, problem.ansProd.den);
    } else {
      let ok1 = false, ok2 = false;
      if (problem.givenType === 'sin') {
        ok1 = checkFractionRoot(ans1, problem.ansCos.sign, problem.ansCos.num, problem.ansCos.root, problem.ansCos.den);
        ok2 = checkFractionRoot(ans2, problem.ansTan.sign, problem.ansTan.num, problem.ansTan.root, problem.ansTan.den);
      } else if (problem.givenType === 'cos') {
        ok1 = checkFractionRoot(ans1, problem.ansSin.sign, problem.ansSin.num, problem.ansSin.root, problem.ansSin.den);
        ok2 = checkFractionRoot(ans2, problem.ansTan.sign, problem.ansTan.num, problem.ansTan.root, problem.ansTan.den);
      } else {
        ok1 = checkFractionRoot(ans1, problem.ansSin.sign, problem.ansSin.num, problem.ansSin.root, problem.ansSin.den);
        ok2 = checkFractionRoot(ans2, problem.ansCos.sign, problem.ansCos.num, problem.ansCos.root, problem.ansCos.den);
      }
      isOk = ok1 && ok2;
    }

    setIsCorrect(isOk);
    setHasChecked(true);
  };

  if (!problem) return null;

  let target1 = problem.givenType === 'sin' ? 'cos' : 'sin';
  let target2 = problem.givenType === 'tan' ? 'cos' : 'tan';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          三角比の相互関係ドリル
        </h1>
        <p className="text-gray-500">
          単位円上の直角三角形をイメージして、三角比の相互関係を瞬時に導く反復練習です。
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
                <option value="pattern1">パターン1 (鋭角の基本)</option>
                <option value="pattern2">パターン2 (鈍角の処理)</option>
                <option value="pattern3">パターン3 (平方根を含む値)</option>
                <option value="pattern4">パターン4 (式の値の計算)</option>
              </select>
            </div>

            <div className="text-center mt-6 mb-2 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            {problem.pattern !== 'pattern4' && (
              <div className="text-center font-bold text-blue-700 bg-blue-50 py-2 border border-blue-200 mb-6">
                <MathEq math={problem.isObtuse ? '90^\\circ < \\theta < 180^\\circ' : '0^\\circ < \\theta < 90^\\circ'} />
              </div>
            )}
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700 mb-4">
                {problem.pattern === 'pattern4' ? '次の式の値を求めなさい。' : '残りの2つの三角比の値を求めなさい。'}
              </div>
              
              <div className="flex flex-col items-center gap-6 text-lg font-bold">
                {problem.pattern === 'pattern4' ? (
                  <div className="flex items-center gap-4 bg-gray-50 p-4 border rounded">
                    <MathEq math="\sin\theta \cos\theta =" />
                    <FractionRootInput value={ans3} onChange={setAns3} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 border rounded">
                      <div className="w-16 text-right"><MathEq math={`\\${target1}\\theta =`} /></div>
                      <FractionRootInput value={ans1} onChange={setAns1} />
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 border rounded">
                      <div className="w-16 text-right"><MathEq math={`\\${target2}\\theta =`} /></div>
                      <FractionRootInput value={ans2} onChange={setAns2} />
                    </div>
                  </>
                )}
              </div>

              <div className="text-[10px] text-gray-500 text-center mt-4">
                ※ 平方根がない場合は √ の中は <code>1</code> (または空欄) にしてください。<br/>
                ※ 整数になる場合は分母を <code>1</code> (または空欄) にしてください。<br/>
                ※ 分数は必ず約分し、分母は有理化してください。
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
                {isCorrect ? '正解！図との対応も確認しましょう。' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説とグラフ */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・図形
              </h2>
            </div>

            <div className="flex justify-center mb-4">
              <canvas 
                ref={canvasRef} 
                width={200} 
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
                
                {problem.pattern === 'pattern4' ? (
                  <>
                    <div className="bg-gray-50 p-2 border">
                      <p className="font-bold border-b pb-1 mb-1">両辺を2乗して相互関係を利用する</p>
                      <MathEq math={`(\\sin\\theta + \\cos\\theta)^2 = \\left(${formatTerm({sign: problem.p>=0?1:-1, num: Math.abs(problem.p), root: 1, den: problem.q})}\\right)^2`} /><br/>
                      <MathEq math={`\\sin^2\\theta + 2\\sin\\theta\\cos\\theta + \\cos^2\\theta = \\frac{${problem.p*problem.p}}{${problem.q*problem.q}}`} /><br/>
                      相互関係 <MathEq math="\sin^2\theta + \cos^2\theta = 1" /> を代入して、<br/>
                      <MathEq math={`1 + 2\\sin\\theta\\cos\\theta = \\frac{${problem.p*problem.p}}{${problem.q*problem.q}}`} /><br/>
                      <MathEq math={`2\\sin\\theta\\cos\\theta = \\frac{${problem.p*problem.p}}{${problem.q*problem.q}} - 1 = \\frac{${problem.p*problem.p - problem.q*problem.q}}{${problem.q*problem.q}}`} /><br/>
                      よって、<br/>
                      <MathEq math={`\\sin\\theta\\cos\\theta = ${formatTerm(problem.ansProd)}`} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-3 border text-center font-bold text-lg mb-2 text-emerald-700 shadow-sm flex flex-col gap-2">
                      <MathEq math={`\\sin\\theta = ${formatTerm(problem.ansSin)}`} />
                      <MathEq math={`\\cos\\theta = ${formatTerm(problem.ansCos)}`} />
                      <MathEq math={`\\tan\\theta = ${formatTerm(problem.ansTan)}`} />
                    </div>

                    <div className="bg-gray-50 p-2 border">
                      <p className="font-bold border-b pb-1 mb-1">図形を用いた解法（x, y, r）</p>
                      <p>公式 <MathEq math="\sin^2\theta + \cos^2\theta = 1" /> を使っても解けますが、直角三角形（単位円）をイメージすると直感的で符号ミスを防げます。</p>
                      <ul className="list-disc pl-4 mt-2">
                        <li><MathEq math="r = \sqrt{x^2 + y^2}" /></li>
                        <li><MathEq math="\sin\theta = \frac{y}{r}" /></li>
                        <li><MathEq math="\cos\theta = \frac{x}{r}" /></li>
                        <li><MathEq math="\tan\theta = \frac{y}{x}" /></li>
                      </ul>
                      <p className="mt-2 text-red-600 font-bold">
                        ※ {problem.isObtuse ? '鈍角なので、x座標がマイナスになります！' : '鋭角なので、x座標はプラスです。'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-2 border">
                      <p>今回の問題では、図形から以下の値が読み取れます（比率として）：</p>
                      <MathEq math={`x^2 = ${problem.X2}, \\quad y^2 = ${problem.Y2}, \\quad r^2 = ${problem.R2}`} /><br/>
                      <MathEq math={`x = ${problem.signX > 0 ? '' : '-'}\\sqrt{${problem.X2}}, \\quad y = \\sqrt{${problem.Y2}}, \\quad r = \\sqrt{${problem.R2}}`} /><br/>
                      これらを定義の式に代入して有理化すると、正しい答えが得られます。
                    </div>
                  </>
                )}

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}