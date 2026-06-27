"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- 数学ユーティリティ ---
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

function gcd3(x: number, y: number, z: number): number {
  return gcd(gcd(x, y), z);
}

interface ProblemData {
  a: number;
  b: number;
  c: number;
  r1: number;
  r2: number;
}

function generateProblem(): ProblemData {
  while (true) {
    let r1 = Math.floor(Math.random() * 11) - 5; // -5 to 5
    let r2 = Math.floor(Math.random() * 11) - 5;
    if (r1 >= r2) continue; // 必ず r1 < r2
    
    let a_base = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
    
    // b, c が整数になるように調整
    // b = -a(r1+r2)/2, c = a(r2-r1)/2
    let a = a_base;
    if ((r1 + r2) % 2 !== 0 && a % 2 !== 0) {
      a *= 2;
    }
    
    let b = -a * (r1 + r2) / 2;
    let c = a * (r2 - r1) / 2;
    
    let g = gcd3(a, b, c);
    a /= g;
    b /= g;
    c /= g;
    
    return { a, b, c, r1, r2 };
  }
}

export default function AbsoluteValueEqDrillPage() {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // ユーザー入力
  const [ans1, setAns1] = useState<string>('');
  const [ans2, setAns2] = useState<string>('');
  
  // 判定状態
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // 解説レベル
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleNext();
  }, []);

  // グラフ描画
  useEffect(() => {
    if (!problem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 座標系の設定
    // X軸の範囲: r1-2 から r2+2
    const padX = 2;
    const minX = problem.r1 - padX;
    const maxX = problem.r2 + padX;
    const rangeX = maxX - minX;
    
    // Y軸の範囲: -1 から c+2
    const padY = 2;
    const maxY = problem.c + padY;
    const minY = -1;
    const rangeY = maxY - minY;

    const mapX = (x: number) => ((x - minX) / rangeX) * W;
    const mapY = (y: number) => H - ((y - minY) / rangeY) * H;

    // 軸の描画
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    // X軸
    ctx.beginPath();
    ctx.moveTo(0, mapY(0));
    ctx.lineTo(W, mapY(0));
    ctx.stroke();
    // Y軸
    if (minX <= 0 && 0 <= maxX) {
      ctx.beginPath();
      ctx.moveTo(mapX(0), 0);
      ctx.lineTo(mapX(0), H);
      ctx.stroke();
    }

    // y = |ax+b| の描画
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    const midX = -problem.b / problem.a; // 折れ曲がる点
    ctx.moveTo(mapX(minX), mapY(Math.abs(problem.a * minX + problem.b)));
    ctx.lineTo(mapX(midX), mapY(0));
    ctx.lineTo(mapX(maxX), mapY(Math.abs(problem.a * maxX + problem.b)));
    ctx.stroke();

    // y = c の描画
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, mapY(problem.c));
    ctx.lineTo(W, mapY(problem.c));
    ctx.stroke();

    // 交点の強調 (解答後のみ)
    if (hasChecked) {
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.beginPath();
      ctx.arc(mapX(problem.r1), mapY(problem.c), 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mapX(problem.r2), mapY(problem.c), 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // X軸への垂線と座標テキスト
      ctx.strokeStyle = '#10b981';
      ctx.setLineDash([4, 4]);
      
      ctx.beginPath();
      ctx.moveTo(mapX(problem.r1), mapY(problem.c));
      ctx.lineTo(mapX(problem.r1), mapY(0));
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(mapX(problem.r2), mapY(problem.c));
      ctx.lineTo(mapX(problem.r2), mapY(0));
      ctx.stroke();
      
      ctx.setLineDash([]);

      ctx.fillStyle = '#065f46';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`x = ${problem.r1}`, mapX(problem.r1), mapY(-0.5));
      ctx.fillText(`x = ${problem.r2}`, mapX(problem.r2), mapY(-0.5));
    }

    // ラベル
    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`y = |${problem.a === 1 ? '' : problem.a}x${problem.b > 0 ? '+' + problem.b : problem.b < 0 ? problem.b : ''}|`, 10, 20);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`y = ${problem.c}`, 10, 40);

  }, [problem, hasChecked]);

  const handleNext = () => {
    setProblem(generateProblem());
    setAns1('');
    setAns2('');
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const u1 = parseInt(ans1);
    const u2 = parseInt(ans2);
    
    if (isNaN(u1) || isNaN(u2)) {
      alert('枠に整数を入力してください。');
      return;
    }
    
    // 順不同で一致チェック
    if ((u1 === problem.r1 && u2 === problem.r2) || (u1 === problem.r2 && u2 === problem.r1)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    
    setHasChecked(true);
  };

  if (!problem) return null;

  let eqLeft = `|${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b}|`;
  if (problem.b === 0) eqLeft = `|${problem.a === 1 ? '' : problem.a}x|`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      {/* ページタイトルとナビゲーション */}
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          絶対値を含む方程式ドリル
        </h1>
        <p className="text-gray-500">
          絶対値記号の意味を方程式とグラフの交点として視覚的に捉え、素早く解を導く反復練習です。
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
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={`${eqLeft} = ${problem.c}`} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">
                次の方程式を解きなさい。
              </div>
              <div className="flex items-center justify-center gap-2 text-xl">
                <MathEq math="x =" />
                <input type="number" className="w-16 border p-1 text-center font-bold" value={ans1} onChange={e => setAns1(e.target.value)} />
                <MathEq math="," />
                <input type="number" className="w-16 border p-1 text-center font-bold" value={ans2} onChange={e => setAns2(e.target.value)} />
              </div>
              <div className="text-[10px] text-gray-500 text-center">
                ※ 順不同です。左右どちらにどちらの解を入れても正解になります。
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
                {isCorrect ? '正解！素晴らしい！' : '不正解... 解説を見てみよう。'}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説 */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・グラフの交点
              </h2>
              {hasChecked && (
                <div className="flex gap-1 text-[10px]">
                  <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                  <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                  <button type="button" onClick={() => setDetailLevel('detailed')} className={`px-2 py-1 border ${detailLevel === 'detailed' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>丁寧</button>
                </div>
              )}
            </div>

            {/* 常にグラフは表示するが、正解するまでは交点マークは出ない */}
            <div className="flex justify-center mb-4">
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
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm">
                  <MathEq math={`x = ${problem.r1}, \\quad ${problem.r2}`} />
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    <MathEq math={`|X| = c \\implies X = \\pm c`} /> より、<br/>
                    <MathEq math={`${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b} = \\pm ${problem.c}`} /><br/>
                    これを解いて <MathEq math={`x = ${problem.r1}, ${problem.r2}`} />。
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    絶対値の基本性質 <MathEq math={`|X| = c \\implies X = c \\text{ または } X = -c`} /> を利用します。<br/><br/>
                    <MathEq math={`${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b} = ${problem.c}`} /> ･･･①<br/>
                    または<br/>
                    <MathEq math={`${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b} = -${problem.c}`} /> ･･･②<br/>
                    <br/>
                    ①を解くと：<br/>
                    <MathEq math={`${problem.a === 1 ? '' : problem.a}x = ${problem.c} ${problem.b > 0 ? '-' : '+'} ${Math.abs(problem.b)} = ${problem.c - problem.b}`} /><br/>
                    <MathEq math={`x = ${(problem.c - problem.b) / problem.a}`} /><br/>
                    <br/>
                    ②を解くと：<br/>
                    <MathEq math={`${problem.a === 1 ? '' : problem.a}x = -${problem.c} ${problem.b > 0 ? '-' : '+'} ${Math.abs(problem.b)} = ${-problem.c - problem.b}`} /><br/>
                    <MathEq math={`x = ${(-problem.c - problem.b) / problem.a}`} /><br/>
                    <br/>
                    よって解は <MathEq math={`x = ${problem.r1}, ${problem.r2}`} /> となります。
                  </div>
                )}

                {detailLevel === 'detailed' && (
                  <div className="space-y-4">
                    <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded">
                      ■ グラフの意味と絶対値のイメージ
                    </p>
                    <p>
                      絶対値記号 <MathEq math={`|X|`} /> は「原点からの距離」を表します。<br/>
                      方程式 <MathEq math={`${eqLeft} = ${problem.c}`} /> は、<br/>
                      <strong>「中身の <MathEq math={`${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b}`} /> が、<MathEq math="0" /> からの距離が <MathEq math={`${problem.c}`} /> になる」</strong><br/>
                      という状態を求める式です。距離が <MathEq math={`${problem.c}`} /> になる場所は <MathEq math={`${problem.c}`} /> と <MathEq math={`-${problem.c}`} /> の2つありますよね！
                    </p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">1. グラフで交点を確認する</p>
                    <p>
                      上のグラフを見てください。青いV字のグラフが <MathEq math={`y = ${eqLeft}`} />、赤い横線が <MathEq math={`y = ${problem.c}`} /> を表しています。<br/>
                      この方程式の解は、<strong>「青い線と赤い線の交点の <MathEq math="x" /> 座標」</strong> に一致します。<br/>
                      交点は左側と右側に1つずつ、合計2つあることが視覚的にわかります。
                    </p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">2. 中身をプラスとマイナスで外す</p>
                    <div className="bg-gray-50 p-2 border">
                      <MathEq math={`${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b} = \\pm ${problem.c}`} /><br/>
                      という2つの方程式に分けて計算します。
                    </div>
                    
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                      <li>
                        <strong>プラスの場合（右側の交点）:</strong><br/>
                        <MathEq math={`${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b} = ${problem.c}`} /><br/>
                        <MathEq math={`${problem.a === 1 ? '' : problem.a}x = ${problem.c - problem.b}`} /><br/>
                        <MathEq math={`x = ${(problem.c - problem.b) / problem.a}`} />
                      </li>
                      <li>
                        <strong>マイナスの場合（左側の交点）:</strong><br/>
                        <MathEq math={`${problem.a === 1 ? '' : problem.a}x ${problem.b > 0 ? '+' : ''} ${problem.b === 0 ? '' : problem.b} = -${problem.c}`} /><br/>
                        <MathEq math={`${problem.a === 1 ? '' : problem.a}x = ${-problem.c - problem.b}`} /><br/>
                        <MathEq math={`x = ${(-problem.c - problem.b) / problem.a}`} />
                      </li>
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
