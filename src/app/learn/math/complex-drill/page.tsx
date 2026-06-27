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

const PROBLEMS = [
  { zStr: '1 + i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: Math.PI / 4, thetaStr: '\\frac{\\pi}{4}', n: 8, zn: 16 },
  { zStr: '1 - i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: 7 * Math.PI / 4, thetaStr: '\\frac{7\\pi}{4}', n: 8, zn: 16 },
  { zStr: '-1 + i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: 3 * Math.PI / 4, thetaStr: '\\frac{3\\pi}{4}', n: 8, zn: 16 },
  { zStr: '-1 - i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: 5 * Math.PI / 4, thetaStr: '\\frac{5\\pi}{4}', n: 8, zn: 16 },
  { zStr: '1 + \\sqrt{3}i', r: 2, rStr: '2', theta: Math.PI / 3, thetaStr: '\\frac{\\pi}{3}', n: 6, zn: 64 },
  { zStr: '-1 + \\sqrt{3}i', r: 2, rStr: '2', theta: 2 * Math.PI / 3, thetaStr: '\\frac{2\\pi}{3}', n: 3, zn: 8 },
  { zStr: '-1 - \\sqrt{3}i', r: 2, rStr: '2', theta: 4 * Math.PI / 3, thetaStr: '\\frac{4\\pi}{3}', n: 3, zn: 8 },
  { zStr: '1 - \\sqrt{3}i', r: 2, rStr: '2', theta: 5 * Math.PI / 3, thetaStr: '\\frac{5\\pi}{3}', n: 3, zn: 8 },
  { zStr: '\\frac{\\sqrt{2}}{2} + \\frac{\\sqrt{2}}{2}i', r: 1, rStr: '1', theta: Math.PI / 4, thetaStr: '\\frac{\\pi}{4}', n: 8, zn: 1 },
  { zStr: '\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i', r: 1, rStr: '1', theta: Math.PI / 6, thetaStr: '\\frac{\\pi}{6}', n: 12, zn: 1 },
  { zStr: '\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i', r: 1, rStr: '1', theta: Math.PI / 3, thetaStr: '\\frac{\\pi}{3}', n: 6, zn: 1 },
  { zStr: '-\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i', r: 1, rStr: '1', theta: 2 * Math.PI / 3, thetaStr: '\\frac{2\\pi}{3}', n: 3, zn: 1 },
  { zStr: '-\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i', r: 1, rStr: '1', theta: 5 * Math.PI / 6, thetaStr: '\\frac{5\\pi}{6}', n: 12, zn: 1 },
];

export default function ComplexDrillPage() {
  const [problem, setProblem] = useState<typeof PROBLEMS[0] | null>(null);
  
  // 入力状態
  const [inN, setInN] = useState('');
  const [inZn, setInZn] = useState('');
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [detailLevel, setDetailLevel] = useState<'brief'|'normal'|'detailed'>('normal');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateProblem = () => {
    const p = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];
    setProblem(p);
    setInN('');
    setInZn('');
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

    // 表示スケールの決定（最大絶対値がキャンバスに収まるように）
    const maxR = problem.r === 1 ? 1.5 : Math.pow(problem.r, problem.n) * 1.1;
    const scale = Math.min(graphW, graphH) / 2 / maxR;

    const mapX = (r: number, th: number) => cx + r * Math.cos(th) * scale;
    const mapY = (r: number, th: number) => cy - r * Math.sin(th) * scale;

    // 軸
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy); // 実軸
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H); // 虚軸
    ctx.stroke();

    // ラベル
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('Re', W - 20, cy - 5);
    ctx.fillText('Im', cx + 5, 15);

    // 単位円 (もしスケール的に見えるなら)
    if (scale > 10) {
      ctx.beginPath();
      ctx.arc(cx, cy, 1 * scale, 0, 2 * Math.PI);
      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // z, z^2 ... z^n のプロット
    ctx.beginPath();
    for (let k = 1; k <= problem.n; k++) {
      const rk = Math.pow(problem.r, k);
      const thk = problem.theta * k;
      const px = mapX(rk, thk);
      const py = mapY(rk, thk);

      if (k === 1) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'; // 軌跡
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let k = 1; k <= problem.n; k++) {
      const rk = Math.pow(problem.r, k);
      const thk = problem.theta * k;
      const px = mapX(rk, thk);
      const py = mapY(rk, thk);

      // 点
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fillStyle = k === problem.n ? '#ef4444' : '#3b82f6';
      ctx.fill();

      // 原点からのベクトル
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = k === problem.n ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // テキスト
      if (k === 1 || k === problem.n || problem.n <= 8) {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px sans-serif';
        const label = k === 1 ? 'z' : `z^${k}`;
        ctx.fillText(label, px + 6, py - 6);
      }
    }

  }, [problem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    const userN = parseInt(inN);
    const userZn = parseInt(inZn);

    if (userN === problem.n && userZn === problem.zn) {
      setIsCorrect(true);
      setFeedbackMsg('大正解！完璧です。');
    } else {
      setIsCorrect(false);
      setFeedbackMsg('不正解です。極形式に直して偏角を考えてみましょう。または「正解と解説を見る」を押してください。');
    }
  };

  if (!problem) return <div className="p-8 text-center">生成中...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 複素数平面・ド・モアブルの定理ドリル
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          複素数平面・ド・モアブルの定理ドリル
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          極形式とド・モアブルの定理を用いて、複素数の累乗が実数となる最小の自然数を求める演習を行います。
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
              複素数 <MathEq math={`z = ${problem.zStr}`} /> について、<MathEq math="z^n" /> が正の実数となるような最小の正の整数 <MathEq math="n" /> を求めよ。<br/>
              また、そのときの <MathEq math="z^n" /> の値を求めよ。
            </div>
          </div>

          <div className="retro-box bg-gray-50">
            <h2 className="font-bold border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 解答を入力
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <div className="flex flex-col gap-4 text-lg font-bold w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <MathEq math="n =" />
                  <input
                    type="number" value={inN} onChange={e => setInN(e.target.value)}
                    placeholder="整数" required className="retro-input w-32 text-center font-mono text-base"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <MathEq math="z^n =" />
                  <input
                    type="number" value={inZn} onChange={e => setInZn(e.target.value)}
                    placeholder="整数" required className="retro-input w-32 text-center font-mono text-base"
                  />
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
               <span className="font-bold text-slate-700">■ 複素数平面上の軌跡</span>
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
                      <MathEq math={`\\arg(z) = ${problem.thetaStr}`} /> より、<MathEq math={`n \\times ${problem.thetaStr} = 2k\\pi`} /> を満たす最小の自然数 <MathEq math="n" /> は <MathEq math={`${problem.n}`} />。
                      <div className="text-center my-4 text-lg font-bold text-red-600">
                        <MathEq math={`n = ${problem.n}, \\quad z^n = (${problem.rStr})^{${problem.n}} = ${problem.zn}`} />
                      </div>
                    </div>
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">1. 極形式への変換</div>
                      <div className="ml-4 mt-1">
                        複素数 <MathEq math={`z = ${problem.zStr}`} /> の絶対値 <MathEq math="r" /> と偏角 <MathEq math="\theta" /> を求めます。<br/>
                        <MathEq math={`r = |z| = ${problem.rStr}`} /> <br/>
                        <MathEq math={`\\theta = \\arg(z) = ${problem.thetaStr}`} /> <br/>
                        よって、<MathEq math={`z = ${problem.rStr}\\left(\\cos ${problem.thetaStr} + i\\sin ${problem.thetaStr}\\right)`} />
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700">2. ド・モアブルの定理の適用</div>
                      <div className="ml-4 mt-1">
                        <MathEq math={`z^n = (${problem.rStr})^n \\left(\\cos \\left(n \\times ${problem.thetaStr}\\right) + i\\sin \\left(n \\times ${problem.thetaStr}\\right)\\right)`} />
                        <br/>
                        これが正の実数となる条件は、虚部が <MathEq math="0" /> かつ 実部が正（<MathEq math="> 0" />）であること。<br/>
                        つまり、偏角 <MathEq math={`n \\times ${problem.thetaStr} = 2k\\pi`} /> （<MathEq math="k" /> は自然数）となる最小の <MathEq math="n" /> を探します。
                      </div>
                    </div>

                    <div className="text-center my-4 text-lg font-bold text-red-600 border-t border-b border-yellow-300 py-2">
                      <MathEq math={`n = ${problem.n}`} /> <br/>
                      <MathEq math={`z^n = (${problem.rStr})^{${problem.n}} = ${problem.zn}`} />
                    </div>
                  </>
                )}

                {detailLevel === 'detailed' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">1. 極形式とは何か？</div>
                      <div className="ml-4 mt-1 text-xs">
                        複素数 <MathEq math="a+bi" /> を平面上の座標 <MathEq math="(a, b)" /> とみなしたとき、原点からの距離を絶対値 <MathEq math="r" />、実軸（x軸）の正の向きからの角度を偏角 <MathEq math="\theta" /> と呼びます。<br/>
                        <MathEq math={`r = \\sqrt{a^2 + b^2}`} /><br/>
                        これにより、複素数を <MathEq math="z = r(\\cos\\theta + i\\sin\\theta)" /> という形に直すことができます。これが極形式です。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">2. 実際の数値で極形式を作る</div>
                      <div className="ml-4 mt-1 text-xs">
                        今回の複素数は <MathEq math={`z = ${problem.zStr}`} /> です。<br/>
                        三平方の定理を使って絶対値 <MathEq math="r" /> を計算すると：<br/>
                        <MathEq math={`r = ${problem.rStr}`} /> となります。<br/>
                        次に偏角 <MathEq math="\theta" /> です。直角三角形を思い浮かべて角度を考えると：<br/>
                        <MathEq math={`\\theta = ${problem.thetaStr}`} /> であることがわかります。<br/>
                        これで極形式が作れました：<br/>
                        <MathEq math={`z = ${problem.rStr}\\left(\\cos ${problem.thetaStr} + i\\sin ${problem.thetaStr}\\right)`} />
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">3. ド・モアブルの定理とその意味</div>
                      <div className="ml-4 mt-1 text-xs">
                        <strong>ド・モアブルの定理</strong> を使うと、「複素数を <MathEq math="n" /> 乗すると、絶対値は <MathEq math="n" /> 乗され、偏角（角度）は <MathEq math="n" /> 倍される」という強力な計算ができます。<br/>
                        <div className="bg-white p-2 border my-1">
                          <MathEq math={`z^n = (${problem.rStr})^n \\left(\\cos \\left(n \\times ${problem.thetaStr}\\right) + i\\sin \\left(n \\times ${problem.thetaStr}\\right)\\right)`} />
                        </div>
                        グラフ上の青い点をみてください。<br/>
                        1乗、2乗、3乗...と掛け合わせるたびに、点が原点の周りを <MathEq math={`${problem.thetaStr}`} /> ずつ回転しながら広がっていくのがわかりますね。<br/>
                        今回は「正の実数になる」つまり、実軸の正の方向（右側）に点がピッタリ着地するタイミングを探します。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">4. 最小の <MathEq math="n" /> を求める</div>
                      <div className="ml-4 mt-1 text-xs">
                        右側（実軸の正の方向）に着地するということは、偏角が <MathEq math="0, 2\pi, 4\pi \dots" /> つまり <MathEq math="2\pi" /> の整数倍になればよいということです。<br/>
                        <MathEq math={`n \\times ${problem.thetaStr} = 2k\\pi`} /> (<MathEq math="k" /> は自然数)<br/>
                        これを満たす最小の自然数 <MathEq math="n" /> は、分母を払うように考えればすぐにわかります。<br/>
                        よって <strong><MathEq math={`n = ${problem.n}`} /></strong> です。<br/><br/>
                        最後に、そのときの値を求めます。偏角は <MathEq math="0" /> になるので <MathEq math="\cos 0 = 1, \sin 0 = 0" /> となり、絶対値の部分だけが残ります。<br/>
                        <div className="text-center my-2 text-lg font-bold text-red-600">
                          <MathEq math={`z^n = (${problem.rStr})^{${problem.n}} = ${problem.zn}`} />
                        </div>
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
