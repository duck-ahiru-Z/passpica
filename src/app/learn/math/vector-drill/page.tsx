"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- ユーティリティ ---
function gcd(x: number, y: number): number {
  x = Math.abs(x); y = Math.abs(y);
  while (y) {
    const t = y; y = x % y; x = t;
  }
  return x;
}

// KaTeXレンダリング
function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// 互いに素なペアを生成
function generateCoprimePair(max: number = 5): [number, number] {
  let m = 0, n = 0;
  while (true) {
    m = Math.floor(Math.random() * max) + 1;
    n = Math.floor(Math.random() * max) + 1;
    if (gcd(m, n) === 1) break;
  }
  return [m, n];
}

interface VectorProblem {
  m: number; n: number;
  s: number; t: number;
  xNum: number; xDen: number;
  yNum: number; yDen: number;
}

export default function VectorDrillPage() {
  const [problem, setProblem] = useState<VectorProblem | null>(null);
  
  // 入力状態
  const [inXNum, setInXNum] = useState('');
  const [inXDen, setInXDen] = useState('');
  const [inYNum, setInYNum] = useState('');
  const [inYDen, setInYDen] = useState('');
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [detailLevel, setDetailLevel] = useState<'brief'|'normal'|'detailed'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateProblem = () => {
    // 1〜5程度のシンプルな比を生成
    const [m, n] = generateCoprimePair(5);
    const [s, t] = generateCoprimePair(5);

    // x = (t*m) / (s*n + t*m + t*n)
    // y = (n*s) / (s*n + t*m + t*n)
    const den = s * n + t * m + t * n;
    const numX = t * m;
    const numY = n * s;

    const gX = gcd(numX, den);
    const gY = gcd(numY, den);

    setProblem({
      m, n, s, t,
      xNum: numX / gX, xDen: den / gX,
      yNum: numY / gY, yDen: den / gY
    });

    setInXNum(''); setInXDen('');
    setInYNum(''); setInYDen('');
    setFeedbackMsg('');
    setIsCorrect(false);
    setShowExplanation(false);
    setShowGraph(true);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  // グラフ描画
  useEffect(() => {
    if (!problem || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const W = canvasRef.current.width;
    const H = canvasRef.current.height;
    ctx.clearRect(0, 0, W, H);

    // 固定座標
    const O = { x: 40, y: 260 };
    const A = { x: 250, y: 40 };
    const B = { x: 460, y: 260 };

    // 座標計算
    const C = {
      x: O.x + (A.x - O.x) * (problem.m / (problem.m + problem.n)),
      y: O.y + (A.y - O.y) * (problem.m / (problem.m + problem.n))
    };
    const D = {
      x: O.x + (B.x - O.x) * (problem.s / (problem.s + problem.t)),
      y: O.y + (B.y - O.y) * (problem.s / (problem.s + problem.t))
    };
    const P = {
      x: O.x + (A.x - O.x) * (problem.xNum / problem.xDen) + (B.x - O.x) * (problem.yNum / problem.yDen),
      y: O.y + (A.y - O.y) * (problem.xNum / problem.xDen) + (B.y - O.y) * (problem.yNum / problem.yDen)
    };

    const drawLine = (p1: any, p2: any, color: string, width = 1) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const drawPoint = (p: any, label: string, color = '#1e293b') => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(label, p.x + 8, p.y - 8);
    };

    // 三角形
    drawLine(O, A, '#94a3b8', 2);
    drawLine(A, B, '#94a3b8', 2);
    drawLine(B, O, '#94a3b8', 2);

    // 線分 AD, BC
    drawLine(A, D, '#3b82f6', 1.5);
    drawLine(B, C, '#10b981', 1.5);

    // ベクトル OP
    drawLine(O, P, '#ef4444', 2.5);

    // 点
    drawPoint(O, 'O');
    drawPoint(A, 'A');
    drawPoint(B, 'B');
    drawPoint(C, `C(${problem.m}:${problem.n})`, '#10b981');
    drawPoint(D, `D(${problem.s}:${problem.t})`, '#3b82f6');
    drawPoint(P, 'P', '#ef4444');

  }, [problem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    const parseInput = (numStr: string, denStr: string) => {
      const n = parseInt(numStr) || 0;
      const d = denStr.trim() === '' ? 1 : parseInt(denStr) || 1;
      const g = gcd(n, d);
      return { num: (n / g) * Math.sign(n * d), den: Math.abs(d / g) };
    };

    const userX = parseInput(inXNum, inXDen);
    const userY = parseInput(inYNum, inYDen);

    if (
      userX.num === problem.xNum && userX.den === problem.xDen &&
      userY.num === problem.yNum && userY.den === problem.yDen
    ) {
      setIsCorrect(true);
      setFeedbackMsg('大正解！完璧です。');
    } else {
      setIsCorrect(false);
      setFeedbackMsg('不正解です。式を見直して再挑戦するか、「正解と解説を見る」を押してください。');
    }
  };

  if (!problem) return <div className="p-8 text-center">生成中...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; ベクトル・交点位置ベクトルドリル
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          ベクトル・交点位置ベクトルドリル
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          内分点から引いた2直線の交点の位置ベクトルを求める反復演習を行います。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box bg-white">
            <h2 className="font-bold text-sm border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 問題
            </h2>
            <div className="text-base leading-relaxed">
              <MathEq math="\triangle \text{OAB}" /> において、辺 <MathEq math="\text{OA}" /> を <MathEq math={`${problem.m}:${problem.n}`} /> に内分する点を <MathEq math="\text{C}" />、
              辺 <MathEq math="\text{OB}" /> を <MathEq math={`${problem.s}:${problem.t}`} /> に内分する点を <MathEq math="\text{D}" /> とする。<br />
              線分 <MathEq math="\text{AD}" /> と <MathEq math="\text{BC}" /> の交点を <MathEq math="\text{P}" /> とするとき、 
              <MathEq math="\vec{\text{OP}}" /> を <MathEq math="\vec{\text{OA}}" /> および <MathEq math="\vec{\text{OB}}" /> を用いて表せ。
            </div>
          </div>

          <div className="retro-box bg-gray-50">
            <h2 className="font-bold border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 解答を入力
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-bold flex-wrap justify-center">
                <MathEq math="\vec{\text{OP}} =" />
                <div className="flex flex-col items-center gap-1 mx-2">
                  <input
                    type="number" value={inXNum} onChange={e => setInXNum(e.target.value)}
                    placeholder="分子" required className="retro-input w-24 text-center font-mono text-base"
                  />
                  <div className="w-full h-px bg-slate-800"></div>
                  <input
                    type="number" value={inXDen} onChange={e => setInXDen(e.target.value)}
                    placeholder="分母(1)" className="retro-input w-24 text-center font-mono text-base placeholder:text-[10px]"
                  />
                </div>
                <MathEq math="\vec{\text{OA}} +" />
                <div className="flex flex-col items-center gap-1 mx-2">
                  <input
                    type="number" value={inYNum} onChange={e => setInYNum(e.target.value)}
                    placeholder="分子" required className="retro-input w-24 text-center font-mono text-base"
                  />
                  <div className="w-full h-px bg-slate-800"></div>
                  <input
                    type="number" value={inYDen} onChange={e => setInYDen(e.target.value)}
                    placeholder="分母(1)" className="retro-input w-24 text-center font-mono text-base placeholder:text-[10px]"
                  />
                </div>
                <MathEq math="\vec{\text{OB}}" />
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 w-full max-w-sm mt-2">
                <button type="submit" className="retro-btn-classic bg-blue-100 border-blue-400 font-bold px-4 py-2 flex-grow">
                  解答する
                </button>
                <button type="button" onClick={() => setShowExplanation(!showExplanation)} className="retro-btn-classic bg-yellow-100 border-yellow-400 px-4 py-2 flex-grow">
                  {showExplanation ? '解説を隠す' : '正解と解説を見る'}
                </button>
                <button type="button" onClick={generateProblem} className="retro-btn-classic bg-emerald-100 border-emerald-400 font-bold px-4 py-2 w-full mt-1">
                  ランダムに次の問題を生成 ➔
                </button>
              </div>
            </form>

            {feedbackMsg && (
              <div className={`mt-4 p-3 border font-bold text-center ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
                {feedbackMsg}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：グラフと解説 */}
        <div className="space-y-6">
          <div className="retro-box bg-white p-2">
             <div className="flex justify-between items-center mb-2 px-2 border-b border-gray-200 pb-1">
               <span className="font-bold text-slate-700">■ グラフ表示</span>
               <button onClick={() => setShowGraph(!showGraph)} type="button" className="retro-btn-classic text-[10px] px-2 py-0.5">
                 {showGraph ? 'グラフを隠す' : 'グラフを表示する'}
               </button>
             </div>
             {showGraph ? (
               <canvas ref={canvasRef} width={500} height={300} className="w-full h-auto border border-gray-200 bg-gray-50" />
             ) : (
               <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 border border-dashed border-gray-300">
                 グラフは非表示です
               </div>
             )}
          </div>

          {showExplanation && (
            <div className="retro-box bg-yellow-50/50 space-y-4 border-yellow-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-yellow-400 pb-1.5 gap-2">
                <h2 className="font-bold text-sm text-slate-800">
                  ■ 解説・計算ステップ
                </h2>
                <div className="flex gap-1 text-[10px]">
                  <button type="button" onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解 (上級者)</button>
                  <button type="button" onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準 (デフォルト)</button>
                  <button type="button" onClick={() => setDetailLevel('detailed')} className={`px-2 py-1 border ${detailLevel === 'detailed' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>超丁寧 (初学者)</button>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-relaxed">
                {detailLevel === 'brief' && (
                  <div>
                    <div className="font-bold text-slate-700">【略解】</div>
                    <div className="ml-4 mt-1">
                      メネラウスの定理、または係数比較の連立方程式を解くと直ちに求まる。
                      <div className="text-center my-4 text-lg font-bold text-red-600">
                        <MathEq math={`\\vec{\\text{OP}} = \\frac{${problem.xNum}}{${problem.xDen}}\\vec{\\text{OA}} + \\frac{${problem.yNum}}{${problem.yDen}}\\vec{\\text{OB}}`} />
                      </div>
                    </div>
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <>
                    <p>
                      点 <MathEq math="\text{P}" /> は線分 <MathEq math="\text{AD}" /> 上にあるので、実数 <MathEq math="k" /> を用いて表すと：<br/>
                      <MathEq math={`\\vec{\\text{OP}} = (1-k)\\vec{\\text{OA}} + k\\vec{\\text{OD}} = (1-k)\\vec{\\text{OA}} + \\frac{${problem.s}k}{${problem.s+problem.t}}\\vec{\\text{OB}}`} /> ･･･①
                    </p>
                    <p>
                      同様に、点 <MathEq math="\text{P}" /> は線分 <MathEq math="\text{BC}" /> 上にあるので、実数 <MathEq math="j" /> を用いて表すと：<br/>
                      <MathEq math={`\\vec{\\text{OP}} = j\\vec{\\text{OC}} + (1-j)\\vec{\\text{OB}} = \\frac{${problem.m}j}{${problem.m+problem.n}}\\vec{\\text{OA}} + (1-j)\\vec{\\text{OB}}`} /> ･･･②
                    </p>
                    <p>
                      <MathEq math="\vec{\text{OA}}" /> と <MathEq math="\vec{\text{OB}}" /> は一次独立（<MathEq math="\vec{\text{OA}} \neq \vec{0}, \vec{\text{OB}} \neq \vec{0}, \vec{\text{OA}} \not\parallel \vec{\text{OB}}" />）なので、①②の係数を比較して：
                    </p>
                    <div className="ml-4 border-l-2 border-yellow-400 pl-4 my-2">
                      <MathEq math={`1-k = \\frac{${problem.m}j}{${problem.m+problem.n}}`} /> <br/>
                      <MathEq math={`\\frac{${problem.s}k}{${problem.s+problem.t}} = 1-j`} />
                    </div>
                    <p>
                      これを解くと、<MathEq math={`k = \\frac{${problem.n * (problem.s + problem.t)}}{${problem.s * problem.n + problem.t * problem.m + problem.t * problem.n}}`} /> となり、①に代入して：
                    </p>
                    <div className="text-center my-4 text-lg font-bold text-red-600">
                      <MathEq math={`\\vec{\\text{OP}} = \\frac{${problem.xNum}}{${problem.xDen}}\\vec{\\text{OA}} + \\frac{${problem.yNum}}{${problem.yDen}}\\vec{\\text{OB}}`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ※別解として、<MathEq math="\triangle \text{OAD}" /> と直線 <MathEq math="\text{BC}" /> に関してメネラウスの定理を用いることでも同様の結果が速やかに得られます。
                    </p>
                  </>
                )}

                {detailLevel === 'detailed' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">1. 線分の内分点とベクトル表示</div>
                      <div className="ml-4 mt-1 text-xs">
                        交点 <MathEq math="\text{P}" /> を求めるには、点 <MathEq math="\text{P}" /> が「線分 <MathEq math="\text{AD}" /> 上の点」であり、同時に「線分 <MathEq math="\text{BC}" /> 上の点」であるという2つの視点から式を立てます。<br/>
                        まず、問題文から点 <MathEq math="\text{C}, \text{D}" /> をベクトルで表します。<br/>
                        <MathEq math={`\\vec{\\text{OC}} = \\frac{${problem.m}}{${problem.m+problem.n}}\\vec{\\text{OA}}`} /> 、
                        <MathEq math={`\\vec{\\text{OD}} = \\frac{${problem.s}}{${problem.s+problem.t}}\\vec{\\text{OB}}`} />
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">2. パラメータを用いた交点の立式</div>
                      <div className="ml-4 mt-1 text-xs">
                        点 <MathEq math="\text{P}" /> は線分 <MathEq math="\text{AD}" /> を <MathEq math="(k) : (1-k)" /> の比に内分すると考えます。（パラメータ <MathEq math="k" /> を使います）<br/>
                        <div className="bg-white p-2 border my-1 text-center">
                          <MathEq math={`\\vec{\\text{OP}} = (1-k)\\vec{\\text{OA}} + k\\vec{\\text{OD}}`} /> ･･･①
                        </div>
                        ここに <MathEq math="\vec{\text{OD}}" /> を代入すると、<br/>
                        <MathEq math={`\\vec{\\text{OP}} = (1-k)\\vec{\\text{OA}} + k\\left(\\frac{${problem.s}}{${problem.s+problem.t}}\\vec{\\text{OB}}\\right)`} /> となります。<br/><br/>
                        全く同じように、点 <MathEq math="\text{P}" /> が線分 <MathEq math="\text{BC}" /> 上にあることからパラメータ <MathEq math="j" /> を用いて表します。<br/>
                        <div className="bg-white p-2 border my-1 text-center">
                          <MathEq math={`\\vec{\\text{OP}} = j\\vec{\\text{OC}} + (1-j)\\vec{\\text{OB}}`} /> ･･･②
                        </div>
                        ここに <MathEq math="\vec{\text{OC}}" /> を代入すると、<br/>
                        <MathEq math={`\\vec{\\text{OP}} = j\\left(\\frac{${problem.m}}{${problem.m+problem.n}}\\vec{\\text{OA}}\\right) + (1-j)\\vec{\\text{OB}}`} /> となります。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">3. 係数比較と連立方程式の詳しい解法</div>
                      <div className="ml-4 mt-1 text-xs">
                        平面上の任意のベクトルは、一次独立（平行でなく共にゼロベクトルではない）な2つのベクトル <MathEq math="\vec{\text{OA}}, \vec{\text{OB}}" /> を用いてただ1通りに表せます。<br/>
                        よって、①と②の式の <MathEq math="\vec{\text{OA}}" /> の係数どうし、<MathEq math="\vec{\text{OB}}" /> の係数どうしは等しくなります。
                        <div className="ml-4 border-l-2 border-yellow-400 pl-4 my-2">
                          <MathEq math="\vec{\text{OA}}" /> の係数: <MathEq math={`1-k = \\frac{${problem.m}}{${problem.m+problem.n}}j`} /><br/>
                          <MathEq math="\vec{\text{OB}}" /> の係数: <MathEq math={`\\frac{${problem.s}}{${problem.s+problem.t}}k = 1-j`} />
                        </div>
                        この連立方程式を解きます。<br/>
                        第2式より <MathEq math={`j = 1 - \\frac{${problem.s}}{${problem.s+problem.t}}k`} /> これを第1式に代入します。<br/>
                        <MathEq math={`1-k = \\frac{${problem.m}}{${problem.m+problem.n}}\\left(1 - \\frac{${problem.s}}{${problem.s+problem.t}}k\\right)`} /><br/>
                        これを展開して <MathEq math="k" /> について丁寧に解くと、<MathEq math={`k = \\frac{${problem.n * (problem.s + problem.t)}}{${problem.s * problem.n + problem.t * problem.m + problem.t * problem.n}}`} /> が得られます。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">4. 最終的な代入</div>
                      <div className="ml-4 mt-1 text-xs">
                        求まった <MathEq math="k" /> を①の式に代入して整理・約分すると、最終的な答えになります。<br/>
                        <div className="text-center my-2 text-lg font-bold text-red-600">
                          <MathEq math={`\\vec{\\text{OP}} = \\frac{${problem.xNum}}{${problem.xDen}}\\vec{\\text{OA}} + \\frac{${problem.yNum}}{${problem.yDen}}\\vec{\\text{OB}}`} />
                        </div>
                        ※ グラフ上の赤い点Pの位置ベクトルが、<MathEq math="\vec{\text{OA}}" /> と <MathEq math="\vec{\text{OB}}" /> をどのように縮小して足し合わせたものか、視覚的にも確認してみてください。
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
