"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- ユーティリティ ---
function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

interface SequenceProblem {
  a1: number;
  p: number;
  q: number;
  alpha: number;
  C: number;
}

export default function SequenceDrillPage() {
  const [problem, setProblem] = useState<SequenceProblem | null>(null);
  
  // 入力状態
  const [inC, setInC] = useState('');
  const [inP, setInP] = useState('');
  const [inAlpha, setInAlpha] = useState('');
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [detailLevel, setDetailLevel] = useState<'brief'|'normal'|'detailed'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateProblem = () => {
    const alpha = Math.floor(Math.random() * 11) - 5; // -5 to 5
    
    const pChoices = [-3, -2, 2, 3, 4, 5];
    const p = pChoices[Math.floor(Math.random() * pChoices.length)];
    
    const q = alpha * (1 - p);
    
    let a1 = alpha;
    while (a1 === alpha) {
      a1 = Math.floor(Math.random() * 11) - 5;
    }
    
    const C = a1 - alpha;

    setProblem({ a1, p, q, alpha, C });
    setInC('');
    setInP('');
    setInAlpha('');
    setFeedbackMsg('');
    setIsCorrect(false);
    setShowExplanation(false);
    setShowGraph(true);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  // グラフ描画 (コブウェブプロット)
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

    // 計算ステップ
    const steps = [problem.a1];
    for (let i = 0; i < 4; i++) {
      steps.push(problem.p * steps[i] + problem.q);
    }

    // 表示範囲の決定
    let minV = Math.min(...steps.slice(0, 3), problem.alpha, 0) - 2;
    let maxV = Math.max(...steps.slice(0, 3), problem.alpha, 0) + 2;

    // 広すぎる場合は制限する
    if (maxV - minV > 100) {
      minV = Math.max(minV, -50);
      maxV = Math.min(maxV, 50);
    }

    const mapX = (x: number) => pad + ((x - minV) / (maxV - minV)) * graphW;
    const mapY = (y: number) => H - pad - ((y - minV) / (maxV - minV)) * graphH;

    // 軸
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0)); ctx.lineTo(W, mapY(0)); // X軸
    ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), H); // Y軸
    ctx.stroke();

    // y = x の直線
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mapX(minV), mapY(minV));
    ctx.lineTo(mapX(maxV), mapY(maxV));
    ctx.stroke();
    ctx.setLineDash([]);

    // y = px + q の直線
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mapX(minV), mapY(problem.p * minV + problem.q));
    ctx.lineTo(mapX(maxV), mapY(problem.p * maxV + problem.q));
    ctx.stroke();

    // コブウェブのステップ描画
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // red-500
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mapX(steps[0]), mapY(0));
    
    for (let i = 0; i < steps.length - 1; i++) {
      const x = steps[i];
      const y = steps[i+1];
      
      // 垂直に移動 (x, x) -> (x, y)
      ctx.lineTo(mapX(x), mapY(y));
      // 水平に移動 (x, y) -> (y, y)
      ctx.lineTo(mapX(y), mapY(y));
      
      // 点を描画
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(mapX(x), mapY(y), 3, 0, 2*Math.PI);
      ctx.fill();
    }
    ctx.stroke();

    // ラベル
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px sans-serif';
    ctx.fillText('y = x', mapX(maxV - 5), mapY(maxV - 5) - 5);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`y = ${problem.p}x ${problem.q >= 0 ? '+' : ''}${problem.q}`, mapX(minV + 2), mapY(problem.p * (minV + 2) + problem.q) - 5);

    // a1 と 特性解の強調
    ctx.fillStyle = '#10b981'; // emerald
    ctx.beginPath();
    ctx.arc(mapX(problem.alpha), mapY(problem.alpha), 5, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = '#0f766e';
    ctx.fillText(`α=${problem.alpha}`, mapX(problem.alpha) + 8, mapY(problem.alpha) + 12);

    ctx.fillStyle = '#64748b';
    ctx.fillText(`a₁=${problem.a1}`, mapX(problem.a1) + 5, mapY(0) - 5);

  }, [problem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    const userC = parseInt(inC);
    const userP = parseInt(inP);
    const userAlpha = parseInt(inAlpha);

    if (userC === problem.C && userP === problem.p && userAlpha === problem.alpha) {
      setIsCorrect(true);
      setFeedbackMsg('大正解！完璧です。');
    } else {
      setIsCorrect(false);
      setFeedbackMsg('不正解です。特性方程式を解いて、初項からのズレを確認しましょう。または「正解と解説を見る」を押してください。');
    }
  };

  if (!problem) return <div className="p-8 text-center">生成中...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 数列・隣接2項間の漸化式ドリル
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          数列・隣接2項間の漸化式ドリル
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          特性方程式を用いて漸化式を解き、一般項を求める計算演習と、その収束・発散をコブウェブプロットで視覚化します。
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
              次の条件によって定められる数列 <MathEq math="\{a_n\}" /> の一般項 <MathEq math="a_n" /> を求めよ。<br/>
              <div className="text-center my-4 text-lg">
                <MathEq math={`a_1 = ${problem.a1}, \\quad a_{n+1} = ${problem.p}a_n ${problem.q >= 0 ? '+' : ''} ${problem.q}`} />
              </div>
            </div>
          </div>

          <div className="retro-box bg-gray-50">
            <h2 className="font-bold border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 解答を入力
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-bold flex-wrap justify-center">
                <MathEq math="a_n =" />
                <input
                  type="number" value={inC} onChange={e => setInC(e.target.value)}
                  placeholder="係数" required className="retro-input w-20 text-center font-mono text-base mx-1"
                />
                <MathEq math="\cdot \Big(" />
                <input
                  type="number" value={inP} onChange={e => setInP(e.target.value)}
                  placeholder="公比" required className="retro-input w-20 text-center font-mono text-base mx-1"
                />
                <MathEq math="\Big)^{n-1} +" />
                <input
                  type="number" value={inAlpha} onChange={e => setInAlpha(e.target.value)}
                  placeholder="定数" required className="retro-input w-20 text-center font-mono text-base mx-1"
                />
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
               <span className="font-bold text-slate-700">■ 階段図（コブウェブプロット）</span>
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
                      特性方程式 <MathEq math={`\\alpha = ${problem.p}\\alpha ${problem.q >= 0 ? '+' : ''} ${problem.q}`} /> より <MathEq math={`\\alpha = ${problem.alpha}`} />。<br/>
                      <MathEq math={`a_n - (${problem.alpha}) = (${problem.p})^{n-1} (a_1 - (${problem.alpha}))`} /> より一般項が求まる。
                      <div className="text-center my-4 text-lg font-bold text-red-600">
                        <MathEq math={`a_n = ${problem.C} \\cdot (${problem.p})^{n-1} ${problem.alpha >= 0 ? '+' : ''} ${problem.alpha}`} />
                      </div>
                    </div>
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">1. 特性方程式を解く</div>
                      <div className="ml-4 mt-1">
                        漸化式 <MathEq math={`a_{n+1} = ${problem.p}a_n ${problem.q >= 0 ? '+' : ''} ${problem.q}`} /> において、<br/>
                        <MathEq math={`a_{n+1}, a_n`} /> を <MathEq math="\alpha" /> と置いた特性方程式 <MathEq math={`\\alpha = ${problem.p}\\alpha ${problem.q >= 0 ? '+' : ''} ${problem.q}`} /> を解きます。<br/>
                        <MathEq math={`(${1 - problem.p})\\alpha = ${problem.q}`} /> より、<MathEq math={`\\alpha = ${problem.alpha}`} /> となります。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700">2. 等比数列の形に変形</div>
                      <div className="ml-4 mt-1">
                        特性解を用いて、漸化式を以下のように変形できます。<br/>
                        <MathEq math={`a_{n+1} - (${problem.alpha}) = ${problem.p}(a_n - (${problem.alpha}))`} /> <br/>
                        これは、数列 <MathEq math={`\\{a_n - (${problem.alpha})\\}`} /> が初項 <MathEq math={`a_1 - (${problem.alpha}) = ${problem.a1} - (${problem.alpha}) = ${problem.C}`} />、公比 <MathEq math={`${problem.p}`} /> の等比数列であることを示しています。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700">3. 一般項の算出</div>
                      <div className="ml-4 mt-1">
                        よって、等比数列の一般項の公式より：<br/>
                        <div className="text-center my-4 text-lg font-bold text-red-600 border-t border-b border-yellow-300 py-2">
                          <MathEq math={`a_n - (${problem.alpha}) = ${problem.C} \\cdot (${problem.p})^{n-1}`} /> <br/>
                          <MathEq math={`a_n = ${problem.C} \\cdot (${problem.p})^{n-1} ${problem.alpha >= 0 ? '+' : ''} ${problem.alpha}`} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {detailLevel === 'detailed' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">1. なぜ特性方程式を解くのか？</div>
                      <div className="ml-4 mt-1 text-xs">
                        <MathEq math={`a_{n+1} = ${problem.p}a_n ${problem.q >= 0 ? '+' : ''} ${problem.q}`} /> のような漸化式は、後ろに付いている定数 <MathEq math={`${problem.q}`} /> のせいで、そのままでは等比数列になりません。<br/>
                        そこで、全体をうまくズラして <strong><MathEq math={`a_{n+1} - \\alpha = ${problem.p}(a_n - \\alpha)`} /></strong> という綺麗な等比数列の形に変形したいと考えます。<br/>
                        この式を展開して元の式と係数を比較すると、<MathEq math={`a_{n+1} = ${problem.p}a_n - ${problem.p}\\alpha + \\alpha`} /> となります。<br/>
                        つまり、<MathEq math={`\\alpha - ${problem.p}\\alpha = ${problem.q}`} /> となれば、うまく変形できることになります。<br/>
                        この <MathEq math="\alpha" /> を求めるための方程式が <strong>特性方程式 <MathEq math={`\alpha = ${problem.p}\alpha ${problem.q >= 0 ? '+' : ''} ${problem.q}`} /></strong> です。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">2. 実際に特性解を求めて変形する</div>
                      <div className="ml-4 mt-1 text-xs">
                        特性方程式を解きます。<br/>
                        <div className="text-center my-1 bg-white p-2 border">
                          <MathEq math={`\\alpha = ${problem.p}\\alpha ${problem.q >= 0 ? '+' : ''} ${problem.q}`} /><br/>
                          <MathEq math={`\\alpha - ${problem.p}\\alpha = ${problem.q}`} /><br/>
                          <MathEq math={`(${1 - problem.p})\\alpha = ${problem.q}`} /><br/>
                          <MathEq math={`\\alpha = ${problem.alpha}`} />
                        </div>
                        これで、ズラすべき量 <MathEq math="\alpha" /> がわかりました。元の漸化式は次のように変形できます。<br/>
                        <MathEq math={`a_{n+1} - (${problem.alpha}) = ${problem.p}(a_n - (${problem.alpha}))`} /> <br/>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">3. 新しい等比数列として解く</div>
                      <div className="ml-4 mt-1 text-xs">
                        ここで、<MathEq math={`b_n = a_n - (${problem.alpha})`} /> という新しい数列を考えると、<MathEq math={`b_{n+1} = ${problem.p} b_n`} /> となり、公比 <MathEq math={`${problem.p}`} /> の等比数列になります。<br/>
                        初項 <MathEq math={`b_1`} /> は、<MathEq math={`b_1 = a_1 - (${problem.alpha}) = ${problem.a1} - (${problem.alpha}) = ${problem.C}`} /> です。<br/>
                        等比数列の一般項の公式 <MathEq math={`b_n = b_1 \\cdot r^{n-1}`} /> より、<br/>
                        <MathEq math={`b_n = ${problem.C} \\cdot (${problem.p})^{n-1}`} /> となります。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">4. 元の数列に戻す</div>
                      <div className="ml-4 mt-1 text-xs">
                        <MathEq math={`b_n`} /> を元の <MathEq math={`a_n - (${problem.alpha})`} /> に戻します。<br/>
                        <MathEq math={`a_n - (${problem.alpha}) = ${problem.C} \\cdot (${problem.p})^{n-1}`} /><br/>
                        最後に <MathEq math={`(${problem.alpha})`} /> を移項して完成です！
                        <div className="text-center my-2 text-lg font-bold text-red-600 border-t border-b border-yellow-300 py-2">
                          <MathEq math={`a_n = ${problem.C} \\cdot (${problem.p})^{n-1} ${problem.alpha >= 0 ? '+' : ''} ${problem.alpha}`} />
                        </div>
                        ※ グラフ上の赤い点（数列の値）が、回数を重ねるごとに交点 <MathEq math={`\alpha = ${problem.alpha}`} /> に向かって近づくか、遠ざかるかを確認してみてください。
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
