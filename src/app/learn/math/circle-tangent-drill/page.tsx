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

function gcd3(x: number, y: number, z: number): number {
  return gcd(gcd(x, y), z);
}

function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

interface CircleProblem {
  s: number; t: number;
  R2: number;
  A1: number; B1: number; C1: number;
  A2: number; B2: number; C2: number;
  x1: number; y1: number;
  x2: number; y2: number;
}

export default function CircleTangentDrillPage() {
  const [problem, setProblem] = useState<CircleProblem | null>(null);
  
  // 入力状態
  const [L1_A, setL1_A] = useState('');
  const [L1_B, setL1_B] = useState('');
  const [L1_C, setL1_C] = useState('');
  const [L2_A, setL2_A] = useState('');
  const [L2_B, setL2_B] = useState('');
  const [L2_C, setL2_C] = useState('');
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [detailLevel, setDetailLevel] = useState<'brief'|'normal'|'detailed'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateProblem = () => {
    // 適当な格子点(x1, y1)
    const basePoints = [
      [3, 4], [4, 3], [-3, 4], [4, -3], [3, -4], [-4, 3],
      [1, 2], [2, 1], [-1, 2], [2, -1], [1, -2], [-2, 1],
      [2, 3], [3, 2], [-2, 3], [3, -2], [2, -3], [-3, 2],
      [1, 3], [3, 1], [-1, 3], [3, -1], [1, -3], [-3, 1],
    ];
    const [x1, y1] = basePoints[Math.floor(Math.random() * basePoints.length)];
    const R2 = x1*x1 + y1*y1;
    
    // 接線1: x1*x + y1*y = R2 上の点P(s, t)
    const kChoices = [-2, -1, 1, 2];
    const k = kChoices[Math.floor(Math.random() * kChoices.length)];
    const s = x1 - k * y1;
    const t = y1 + k * x1;
    
    // 答えの正規化関数
    const normalizeLine = (a: number, b: number, c: number) => {
      const g = gcd3(a, b, c);
      let na = a / g, nb = b / g, nc = c / g;
      if (na < 0 || (na === 0 && nb < 0)) {
        na = -na; nb = -nb; nc = -nc;
      }
      return [na, nb, nc];
    };

    const [nA1, nB1, nC1] = normalizeLine(x1, y1, R2);
    
    // 接線2の導出 (Pを通るもう1つの接線)
    // T(x1, y1)のOP(s, t)に対する対称点U(x2, y2)
    const s2_t2 = s*s - t*t;
    const st2 = 2*s*t;
    const X2_scaled = s2_t2 * x1 + st2 * y1;
    const Y2_scaled = st2 * x1 - s2_t2 * y1;
    const normFactor = s*s + t*t;
    
    const [nA2, nB2, nC2] = normalizeLine(X2_scaled, Y2_scaled, normFactor * R2);

    setProblem({ 
      s, t, R2, 
      A1: nA1, B1: nB1, C1: nC1, 
      A2: nA2, B2: nB2, C2: nC2, 
      x1, y1,
      x2: X2_scaled / normFactor, y2: Y2_scaled / normFactor
    });

    setL1_A(''); setL1_B(''); setL1_C('');
    setL2_A(''); setL2_B(''); setL2_C('');
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

    const pad = 30;
    const graphW = W - 2 * pad;
    const graphH = H - 2 * pad;
    const cx = W / 2;
    const cy = H / 2;

    const maxCoord = Math.max(Math.abs(problem.s), Math.abs(problem.t), Math.sqrt(problem.R2)) + 2;
    const scale = Math.min(graphW, graphH) / 2 / maxCoord;

    const mapX = (x: number) => cx + x * scale;
    const mapY = (y: number) => cy - y * scale;

    // グリッド線
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i = -Math.ceil(maxCoord); i <= Math.ceil(maxCoord); i++) {
      ctx.moveTo(mapX(i), 0); ctx.lineTo(mapX(i), H);
      ctx.moveTo(0, mapY(i)); ctx.lineTo(W, mapY(i));
    }
    ctx.stroke();

    // 軸
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();

    // 円
    ctx.beginPath();
    ctx.arc(cx, cy, Math.sqrt(problem.R2) * scale, 0, 2 * Math.PI);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 接線
    const drawLine = (p1: {x:number, y:number}, p2: {x:number, y:number}, color: string) => {
      // 画面外まで伸ばす
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      ctx.beginPath();
      ctx.moveTo(mapX(p1.x - dx*10), mapY(p1.y - dy*10));
      ctx.lineTo(mapX(p1.x + dx*10), mapY(p1.y + dy*10));
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    drawLine({x: problem.x1, y: problem.y1}, {x: problem.s, y: problem.t}, '#3b82f6');
    drawLine({x: problem.x2, y: problem.y2}, {x: problem.s, y: problem.t}, '#3b82f6');

    // 半径（補助線）
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(mapX(problem.x1), mapY(problem.y1));
    ctx.moveTo(cx, cy); ctx.lineTo(mapX(problem.x2), mapY(problem.y2));
    ctx.strokeStyle = '#10b981';
    ctx.stroke();
    ctx.setLineDash([]);

    // 点
    const drawPoint = (x: number, y: number, color: string, label: string) => {
      ctx.beginPath();
      ctx.arc(mapX(x), mapY(y), 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(label, mapX(x) + 6, mapY(y) - 6);
    };

    drawPoint(problem.s, problem.t, '#ef4444', `P(${problem.s}, ${problem.t})`);
    drawPoint(problem.x1, problem.y1, '#10b981', 'T');
    drawPoint(problem.x2, problem.y2, '#10b981', 'U');
    drawPoint(0, 0, '#64748b', 'O');

  }, [problem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    const normalizeUserLine = (a: string, b: string, c: string) => {
      let va = parseInt(a) || 0;
      let vb = parseInt(b) || 0;
      let vc = parseInt(c) || 0;
      const g = gcd3(va, vb, vc);
      if (g > 0) { va /= g; vb /= g; vc /= g; }
      if (va < 0 || (va === 0 && vb < 0)) {
        va = -va; vb = -vb; vc = -vc;
      }
      return [va, vb, vc];
    };

    const [uA1, uB1, uC1] = normalizeUserLine(L1_A, L1_B, L1_C);
    const [uA2, uB2, uC2] = normalizeUserLine(L2_A, L2_B, L2_C);

    const isMatch1 = (uA1 === problem.A1 && uB1 === problem.B1 && uC1 === problem.C1) &&
                     (uA2 === problem.A2 && uB2 === problem.B2 && uC2 === problem.C2);
    
    const isMatch2 = (uA1 === problem.A2 && uB1 === problem.B2 && uC1 === problem.C2) &&
                     (uA2 === problem.A1 && uB2 === problem.B1 && uC2 === problem.C1);

    if (isMatch1 || isMatch2) {
      setIsCorrect(true);
      setFeedbackMsg('大正解！完璧です。（順不同・自動約分済み）');
    } else {
      setIsCorrect(false);
      setFeedbackMsg('不正解です。円外の点を通る直線の方程式から判別式を利用するか、接点の公式を使いましょう。');
    }
  };

  const formatLine = (a: number, b: number, c: number) => {
    let res = '';
    if (a !== 0) res += (a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`);
    if (b !== 0) {
      if (res.length > 0) {
        res += (b > 0 ? ` + ${b === 1 ? 'y' : b + 'y'}` : ` - ${Math.abs(b) === 1 ? 'y' : Math.abs(b) + 'y'}`);
      } else {
        res += (b === 1 ? 'y' : b === -1 ? '-y' : `${b}y`);
      }
    }
    return `${res} = ${c}`;
  };

  if (!problem) return <div className="p-8 text-center">生成中...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 図形と方程式・円の接線ドリル
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          図形と方程式・円の接線ドリル
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          円の外部の点から引いた2本の接線の方程式を正確に求めるための計算演習を行います。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box bg-white">
            <h2 className="font-bold text-sm border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 問題
            </h2>
            <div className="text-base leading-loose min-h-[80px]">
              点 <MathEq math={`\\text{P}(${problem.s}, ${problem.t})`} /> から 円 <MathEq math={`x^2 + y^2 = ${problem.R2}`} /> に引いた2本の接線の方程式を求めよ。
            </div>
          </div>

          <div className="retro-box bg-gray-50">
            <h2 className="font-bold border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 解答を入力
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <div className="flex flex-col gap-3 text-base font-bold w-full max-w-sm">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-gray-500 mr-2 text-sm">接線1:</span>
                  <input type="number" value={L1_A} onChange={e => setL1_A(e.target.value)} placeholder="A" className="retro-input w-16 text-center font-mono" />
                  <MathEq math="x +" />
                  <input type="number" value={L1_B} onChange={e => setL1_B(e.target.value)} placeholder="B" className="retro-input w-16 text-center font-mono" />
                  <MathEq math="y =" />
                  <input type="number" value={L1_C} onChange={e => setL1_C(e.target.value)} placeholder="C" required className="retro-input w-16 text-center font-mono" />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-gray-500 mr-2 text-sm">接線2:</span>
                  <input type="number" value={L2_A} onChange={e => setL2_A(e.target.value)} placeholder="A" className="retro-input w-16 text-center font-mono" />
                  <MathEq math="x +" />
                  <input type="number" value={L2_B} onChange={e => setL2_B(e.target.value)} placeholder="B" className="retro-input w-16 text-center font-mono" />
                  <MathEq math="y =" />
                  <input type="number" value={L2_C} onChange={e => setL2_C(e.target.value)} placeholder="C" required className="retro-input w-16 text-center font-mono" />
                </div>
                <div className="text-center text-[10px] text-gray-400 font-normal">
                  ※ <MathEq math="x" /> や <MathEq math="y" /> の係数が無い場合は 0 を入力するか空欄にしてください。<br/>
                  （順不同・自動的に整数比に正規化されて判定されます）
                </div>
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
               <span className="font-bold text-slate-700">■ 図形描画</span>
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
                      接点を <MathEq math="(x_1, y_1)" /> と置くか、中心からの距離 <MathEq math={`d=\\sqrt{${problem.R2}}`} /> を用いて方程式を立てて解く。
                      <div className="text-center my-4 text-lg font-bold text-red-600 border-t border-b border-yellow-300 py-2">
                        <MathEq math={formatLine(problem.A1, problem.B1, problem.C1)} /> <br/>
                        <MathEq math={formatLine(problem.A2, problem.B2, problem.C2)} />
                      </div>
                    </div>
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">解法（接点の座標を置く方法）</div>
                      <div className="ml-4 mt-1">
                        接点を <MathEq math="(x_1, y_1)" /> とおくと、接線の方程式は <MathEq math={`x_1 x + y_1 y = ${problem.R2}`} /> ･･･①<br/>
                        これが点 <MathEq math={`\\text{P}(${problem.s}, ${problem.t})`} /> を通るから、<br/>
                        <MathEq math={`${problem.s} x_1 ${problem.t >= 0 ? '+' : ''} ${problem.t} y_1 = ${problem.R2}`} /> ･･･②<br/>
                        また、接点は円上の点だから、<MathEq math={`x_1^2 + y_1^2 = ${problem.R2}`} /> ･･･③<br/>
                        ②と③を連立して解くと、接点 <MathEq math="(x_1, y_1)" /> が2つ求まります。<br/>
                        それぞれを①に代入して分母を払うと、以下の2直線の式が得られます。
                      </div>
                    </div>

                    <div className="text-center my-4 text-lg font-bold text-red-600 border-t border-b border-yellow-300 py-2">
                      <MathEq math={formatLine(problem.A1, problem.B1, problem.C1)} /> <br/>
                      <MathEq math={formatLine(problem.A2, problem.B2, problem.C2)} />
                    </div>
                  </>
                )}

                {detailLevel === 'detailed' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">解法の選択：王道の「点と直線の距離」で解いてみよう</div>
                      <div className="ml-4 mt-1 text-xs">
                        接線の方程式を求める方法はいくつかありますが、計算ミスが少なく一番おすすめなのが<strong>「円の中心から接線までの距離 ＝ 半径」</strong>を利用する方法です。<br/>
                        この方法で丁寧に解いてみましょう。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">1. 接線の式を文字で置く</div>
                      <div className="ml-4 mt-1 text-xs">
                        点 <MathEq math={`\\text{P}(${problem.s}, ${problem.t})`} /> を通る直線の傾きを <MathEq math="m" /> とおくと、その方程式は：<br/>
                        <MathEq math={`y - (${problem.t}) = m (x - (${problem.s}))`} /><br/>
                        これを「点と直線の距離の公式」が使えるように <MathEq math="ax+by+c=0" /> の形に整理します。<br/>
                        <MathEq math={`mx - y - ${problem.s}m + ${problem.t} = 0`} /> ･･･①<br/>
                        <span className="text-gray-500">※ 本当は「<MathEq math={`x = ${problem.s}`} /> の直線（y軸に平行な直線）」になる可能性もゼロではないので、グラフを見て確認するか、場合分けが必要ですが、今回は一旦 <MathEq math="m" /> があるとして進めます。</span>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">2. 点と直線の距離の公式を使う</div>
                      <div className="ml-4 mt-1 text-xs">
                        円の方程式は <MathEq math={`x^2 + y^2 = ${problem.R2}`} /> なので、<br/>
                        中心は <MathEq math="(0, 0)" />、半径は <MathEq math={`R = \\sqrt{${problem.R2}}`} /> です。<br/><br/>
                        直線①と、中心 <MathEq math="(0,0)" /> との距離 <MathEq math="d" /> が、半径 <MathEq math={`\\sqrt{${problem.R2}}`} /> にピッタリ等しくなれば「接する」ことになります。<br/>
                        <div className="bg-white p-2 border my-1">
                          距離 <MathEq math="d = \frac{|m(0) - (-1)(0) - \dots|}{\sqrt{m^2 + (-1)^2}}" /><br/>
                          <MathEq math={`\\frac{|- ${problem.s}m + ${problem.t}|}{\\sqrt{m^2 + 1}} = \\sqrt{${problem.R2}}`} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">3. 方程式を解いて <MathEq math="m" /> を求める</div>
                      <div className="ml-4 mt-1 text-xs">
                        上の式の分母を払って、両辺を2乗してルートと絶対値を外します。<br/>
                        <MathEq math={`(- ${problem.s}m + ${problem.t})^2 = ${problem.R2}(m^2 + 1)`} /><br/>
                        これを展開して <MathEq math="m" /> についての2次方程式を作ります。<br/>
                        <MathEq math={`(${problem.s}^2 - ${problem.R2})m^2 - 2 \\times ${problem.s} \\times ${problem.t}m + (${problem.t}^2 - ${problem.R2}) = 0`} /><br/>
                        この2次方程式を解くことで、<MathEq math="m" /> が2つ求まります（これが2本の接線の傾きです）。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">4. 傾きを代入して接線を完成させる</div>
                      <div className="ml-4 mt-1 text-xs">
                        求まった2つの <MathEq math="m" /> をそれぞれ①の式に代入し、全体を整数倍して係数が整数になるように綺麗に整理すると、最終的な答えになります。<br/>
                        <div className="text-center my-4 text-lg font-bold text-red-600 border-t border-b border-yellow-300 py-2">
                          <MathEq math={formatLine(problem.A1, problem.B1, problem.C1)} /> <br/>
                          <MathEq math={formatLine(problem.A2, problem.B2, problem.C2)} />
                        </div>
                        ※ グラフ上の赤い2本の直線と円が、綺麗に1点で接していることを視覚的に確認しましょう！
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
