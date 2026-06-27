"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- 数学ユーティリティ ---
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

// 多項式の乗算
function multiply(A: number[], B: number[]): number[] {
  const res = new Array(A.length + B.length - 1).fill(0);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      res[i + j] += A[i] * B[j];
    }
  }
  return res;
}

// 多項式のスカラー倍
function scale(A: number[], k: number): number[] {
  return A.map(x => x * k);
}

// 多項式の値の評価
function ev(coeffs: number[], x: number): number {
  let val = 0;
  for (let i = 0; i < coeffs.length; i++) {
    val += coeffs[i] * Math.pow(x, i);
  }
  return val;
}

// 多項式の文字列フォーマット (KaTeX用)
function formatPoly(coeffs: number[]): string {
  let terms = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0) continue;
    let term = '';
    
    // 符号
    if (c < 0) {
      term += terms.length > 0 ? ' - ' : '-';
    } else {
      term += terms.length > 0 ? ' + ' : '';
    }
    
    // 係数
    const absC = Math.abs(c);
    if (i === 0) {
      term += absC;
    } else {
      if (absC !== 1) term += absC;
      if (i === 1) term += 'x';
      else term += `x^{${i}}`;
    }
    terms.push(term);
  }
  if (terms.length === 0) return '0';
  return terms.join('');
}

// 因数のフォーマット (x - a)^p
function formatFactor(a: number, power: number = 1): string {
  if (power === 0) return '';
  let base = '';
  if (a === 0) base = 'x';
  else if (a > 0) base = `(x - ${a})`;
  else base = `(x + ${Math.abs(a)})`;
  
  if (power === 1) return base;
  return `${base}^${power}`;
}

// --- コンポーネント定義 ---

// KaTeXレンダリングラッパー
function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// 問題データの型
interface ProblemData {
  type: string;
  a: number;
  r1: number;
  r2: number;
  power1: number;
  power2: number;
  f: number[];
  g: number[];
  P: number[];
  S_num: number;
  S_den: number;
  formulaName: string;
  formulaDisplay: string;
  denom: number;
  power: number;
}

export default function CalculusDrillPage() {
  const [selectedMode, setSelectedMode] = useState<string>('mix');
  const [problem, setProblem] = useState<ProblemData | null>(null);
  
  // 入力状態
  const [inputNum, setInputNum] = useState<string>('');
  const [inputDen, setInputDen] = useState<string>('');
  
  // 判定状態
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  
  // 表示トグル
  const [showGraph, setShowGraph] = useState<boolean>(true);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [detailLevel, setDetailLevel] = useState<'brief'|'normal'|'detailed'>('normal');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 問題生成ロジック
  const generateProblem = (mode: string) => {
    let type = mode;
    if (type === 'mix') {
      const types = ['1/6_line', '1/6_para', '1/12', '1/20', '1/30'];
      type = types[Math.floor(Math.random() * types.length)];
    }

    const aChoices = [-3, -2, -1, 1, 2, 3];
    const a = aChoices[Math.floor(Math.random() * aChoices.length)];

    let r1 = 0, r2 = 0;
    while (r1 === r2) {
      r1 = Math.floor(Math.random() * 9) - 4; // -4 to 4
      r2 = Math.floor(Math.random() * 9) - 4;
    }
    if (r1 > r2) {
      const temp = r1; r1 = r2; r2 = temp;
    }

    let power1 = 0, power2 = 0;
    let denom = 1, power = 1;
    let formulaName = '', formulaDisplay = '';

    if (type.startsWith('1/6')) {
      power1 = 1; power2 = 1; denom = 6; power = 3;
      formulaName = '1/6公式';
      formulaDisplay = '\\frac{|a|}{6}(\\beta - \\alpha)^3';
    } else if (type === '1/12') {
      power1 = Math.random() > 0.5 ? 2 : 1;
      power2 = power1 === 2 ? 1 : 2;
      denom = 12; power = 4;
      formulaName = '1/12公式';
      formulaDisplay = '\\frac{|a|}{12}(\\beta - \\alpha)^4';
    } else if (type === '1/20') {
      power1 = Math.random() > 0.5 ? 3 : 1;
      power2 = power1 === 3 ? 1 : 3;
      denom = 20; power = 5;
      formulaName = '1/20公式';
      formulaDisplay = '\\frac{|a|}{20}(\\beta - \\alpha)^5';
    } else if (type === '1/30') {
      power1 = 2; power2 = 2; denom = 30; power = 5;
      formulaName = '1/30公式';
      formulaDisplay = '\\frac{|a|}{30}(\\beta - \\alpha)^5';
    }

    // 多項式の構築
    let P = [1];
    for (let i = 0; i < power1; i++) P = multiply(P, [-r1, 1]);
    for (let i = 0; i < power2; i++) P = multiply(P, [-r2, 1]);
    P = scale(P, a);

    // 面積の計算 S = |a|/denom * (r2 - r1)^power
    let S_num = Math.abs(a) * Math.pow(r2 - r1, power);
    let S_den = denom;
    const gDiv = gcd(S_num, S_den);
    S_num /= gDiv;
    S_den /= gDiv;

    // f(x)とg(x)への分割
    let f: number[] = [];
    let g: number[] = [];

    if (type === '1/6_para') {
      // 2次関数同士の面積
      let k2 = 0;
      while (k2 === 0 || k2 === -P[2]) {
        k2 = Math.floor(Math.random() * 5) - 2;
      }
      const k1 = Math.floor(Math.random() * 5) - 2;
      const k0 = Math.floor(Math.random() * 5) - 2;
      f = [P[0] + k0, P[1] + k1, P[2] + k2];
      g = [k0, k1, k2];
    } else {
      // 放物線以上の曲線(f) と 直線(g)
      const c1 = Math.floor(Math.random() * 7) - 3;
      const c0 = Math.floor(Math.random() * 7) - 3;
      f = [...P];
      f[1] = c1;
      f[0] = c0;
      g = [c0 - P[0], c1 - P[1]];
    }

    setProblem({ type, a, r1, r2, power1, power2, f, g, P, S_num, S_den, formulaName, formulaDisplay, denom, power });
    setInputNum('');
    setInputDen('');
    setIsAnswered(false);
    setIsCorrect(false);
    setFeedbackMsg('');
    setShowGraph(true);
    setShowExplanation(false);
  };

  // 初回マウント時
  useEffect(() => {
    generateProblem(selectedMode);
  }, [selectedMode]);

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

    const minX = problem.r1 - 1.2;
    const maxX = problem.r2 + 1.2;

    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i <= 100; i++) {
      const x = minX + (maxX - minX) * i / 100;
      const yf = ev(problem.f, x);
      const yg = ev(problem.g, x);
      minY = Math.min(minY, yf, yg);
      maxY = Math.max(maxY, yf, yg);
    }
    
    // y=0軸が見えるようにする
    minY = Math.min(minY, -1);
    maxY = Math.max(maxY, 1);

    const marginY = (maxY - minY) * 0.15 || 1;
    minY -= marginY;
    maxY += marginY;

    const mapX = (x: number) => pad + ((x - minX) / (maxX - minX)) * graphW;
    const mapY = (y: number) => H - pad - ((y - minY) / (maxY - minY)) * graphH;

    // グリッド線
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
      ctx.moveTo(mapX(x), 0); ctx.lineTo(mapX(x), H);
    }
    ctx.stroke();

    // 軸
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, mapY(0)); ctx.lineTo(W, mapY(0)); // X軸
    ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), H); // Y軸
    ctx.stroke();

    // 塗りつぶし領域 (r1 から r2)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; // blue-500 transparent
    ctx.beginPath();
    for (let i = 0; i <= 50; i++) {
      const x = problem.r1 + (problem.r2 - problem.r1) * i / 50;
      const y = ev(problem.f, x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    for (let i = 50; i >= 0; i--) {
      const x = problem.r1 + (problem.r2 - problem.r1) * i / 50;
      const y = ev(problem.g, x);
      ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.closePath();
    ctx.fill();

    // g(x) 直線・放物線
    ctx.strokeStyle = '#64748b'; // slate-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = minX + (maxX - minX) * i / 100;
      const y = ev(problem.g, x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

    // f(x) 曲線
    ctx.strokeStyle = '#2563eb'; // blue-600
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = minX + (maxX - minX) * i / 100;
      const y = ev(problem.f, x);
      if (i === 0) ctx.moveTo(mapX(x), mapY(y));
      else ctx.lineTo(mapX(x), mapY(y));
    }
    ctx.stroke();

    // 交点のプロット
    ctx.fillStyle = '#dc2626'; // red-600
    [problem.r1, problem.r2].forEach(r => {
      ctx.beginPath();
      ctx.arc(mapX(r), mapY(ev(problem.f, r)), 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // ラベル (x座標)
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(problem.r1.toString(), mapX(problem.r1) - 5, mapY(0) + 15);
    ctx.fillText(problem.r2.toString(), mapX(problem.r2) - 5, mapY(0) + 15);

  }, [problem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    const userNum = parseInt(inputNum) || 0;
    const userDen = inputDen.trim() === '' ? 1 : parseInt(inputDen) || 1;

    // ユーザー入力を既約分数にする
    const userGcd = gcd(userNum, userDen);
    const simplifiedNum = userNum / userGcd * Math.sign(userNum * userDen);
    const simplifiedDen = Math.abs(userDen / userGcd);

    if (simplifiedNum === problem.S_num && simplifiedDen === problem.S_den) {
      setIsCorrect(true);
      if (userDen !== problem.S_den) {
        setFeedbackMsg('正解です！（自動的に約分・整形されました）');
      } else {
        setFeedbackMsg('大正解！完璧です。');
      }
    } else {
      setIsCorrect(false);
      setFeedbackMsg('不正解です。式を見直して再挑戦するか、「解説を見る」を押してください。');
    }
    setIsAnswered(true);
  };

  if (!problem) return <div className="p-8 text-center">生成中...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 微積分・面積公式（無限計算ドリル）
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          微積分・面積公式（無限計算ドリル）
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          定積分の面積公式（1/6, 1/12, 1/20, 1/30）を用いたショートカット計算の反復演習を行います。
        </p>
      </div>

      {/* モード選択 */}
      <div className="border border-gray-300 bg-gray-50 p-4 space-y-2.5">
        <span className="font-bold text-slate-700 block">■ 出題モードの選択</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: '1/6_line', name: '1/6公式 (放物線と直線)' },
            { id: '1/6_para', name: '1/6公式 (2つの放物線)' },
            { id: '1/12', name: '1/12公式 (3次関数と接線)' },
            { id: '1/20', name: '1/20公式 (4次関数と変曲点の接線)' },
            { id: '1/30', name: '1/30公式 (4次関数と二重接線)' },
            { id: 'mix', name: '全種ランダム MIX' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setSelectedMode(m.id); generateProblem(m.id); }}
              className={`retro-btn-classic ${selectedMode === m.id ? 'bg-blue-200 border-blue-400 font-bold' : ''}`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 左カラム：問題と解答入力 */}
        <div className="space-y-6">
          <div className="retro-box bg-white">
            <h2 className="font-bold text-sm border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 問題
            </h2>
            <div className="text-base leading-loose min-h-[80px]">
              次の2つの曲線（直線）で囲まれた部分の面積 <MathEq math="S" /> を求めよ。
              <div className="my-2 space-y-2 text-center text-lg">
                <div><MathEq math={`f(x) = ${formatPoly(problem.f)}`} /></div>
                <div><MathEq math={`g(x) = ${formatPoly(problem.g)}`} /></div>
              </div>
            </div>
          </div>

          <div className="retro-box bg-gray-50">
            <h2 className="font-bold border-b border-gray-300 pb-1.5 mb-4 text-slate-800">
              ■ 解答を入力
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-lg font-bold">
                <span>S =</span>
                <div className="flex flex-col items-center gap-1">
                  <input
                    type="number"
                    value={inputNum}
                    onChange={e => setInputNum(e.target.value)}
                    placeholder="分子"
                    className="retro-input w-24 text-center font-mono text-base"
                    required
                  />
                  <div className="w-full h-px bg-slate-800"></div>
                  <input
                    type="number"
                    value={inputDen}
                    onChange={e => setInputDen(e.target.value)}
                    placeholder="分母(整数時は1)"
                    className="retro-input w-32 text-center font-mono text-base placeholder:text-[10px] placeholder:tracking-tighter"
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
                <button type="button" onClick={() => generateProblem(selectedMode)} className="retro-btn-classic bg-emerald-100 border-emerald-400 font-bold px-4 py-2 w-full mt-1">
                  ランダムに次の問題を生成 ➔
                </button>
              </div>
            </form>

            {isAnswered && (
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
               <>
                 <canvas 
                   ref={canvasRef} 
                   width={500} 
                   height={300} 
                   className="w-full h-auto border border-gray-200 bg-gray-50"
                 />
                 <div className="text-center text-[10px] text-gray-500 mt-1">
                   青線: <MathEq math="f(x)" /> / 灰線: <MathEq math="g(x)" />
                 </div>
               </>
             ) : (
               <div className="h-32 flex items-center justify-center text-gray-400 bg-gray-50 border border-dashed border-gray-300">
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
                      交点は <MathEq math={`x = ${problem.r1}, ${problem.r2}`} />。<br/>
                      <MathEq math="S" /> を求める積分は公式より、
                      <div className="text-center my-2 text-lg font-bold text-red-600">
                        <MathEq math={`S = \\frac{${Math.abs(problem.a)}}{${problem.denom}}(${problem.r2} - ${problem.r1 < 0 ? `(${problem.r1})` : problem.r1})^${problem.power} = ${problem.S_den === 1 ? problem.S_num : `\\frac{${problem.S_num}}{${problem.S_den}}`}`} />
                      </div>
                    </div>
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">1. 交点（接点）を求める</div>
                      <div className="ml-4 mt-1">
                        <MathEq math="f(x) - g(x) = 0" /> を立てて式を整理すると：
                        <div className="text-center my-1">
                          <MathEq math={`${formatPoly(problem.P)} = 0`} />
                        </div>
                        因数分解して交点と接点の重複度を確認します：
                        <div className="text-center my-1">
                          <MathEq math={`${problem.a === 1 ? '' : problem.a === -1 ? '-' : problem.a}${formatFactor(problem.r1, problem.power1)}${formatFactor(problem.r2, problem.power2)} = 0`} />
                        </div>
                        よって交点は、<MathEq math={`x = ${problem.r1}, ${problem.r2}`} /> となります。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700">2. 面積公式の適用 ({problem.formulaName})</div>
                      <div className="ml-4 mt-1">
                        この積分形は <strong>{problem.formulaName}</strong> を用いて一瞬で計算できます。
                        <div className="text-center my-1">
                          <MathEq math={`S = ${problem.formulaDisplay}`} />
                        </div>
                        今回の数値を代入すると：
                        <div className="text-center my-2 text-lg">
                          <MathEq math={`S = \\frac{${Math.abs(problem.a)}}{${problem.denom}}(${problem.r2} - ${problem.r1 < 0 ? `(${problem.r1})` : problem.r1})^${problem.power}`} />
                        </div>
                        <div className="text-center my-2 text-lg font-bold text-red-600">
                          <MathEq math={`= ${problem.S_den === 1 ? problem.S_num : `\\frac{${problem.S_num}}{${problem.S_den}}`}`} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {detailLevel === 'detailed' && (
                  <>
                    <div>
                      <div className="font-bold text-slate-700">1. グラフの上下関係と交点を調べる</div>
                      <div className="ml-4 mt-1 text-xs">
                        面積を求めるには、まず2つの関数 <MathEq math="f(x)" /> と <MathEq math="g(x)" /> の交点を求めます。<br/>
                        交点を求めるために <MathEq math="f(x) = g(x)" /> 、つまり <MathEq math="f(x) - g(x) = 0" /> の方程式を解きます。<br/>
                        <div className="text-center my-1 text-sm bg-white p-2 border">
                          <MathEq math="f(x) - g(x) = 0" /><br/>
                          <MathEq math={`\\Rightarrow ${formatPoly(problem.P)} = 0`} />
                        </div>
                        方程式を解くために因数分解を行います。<br/>
                        <MathEq math={`${problem.a === 1 ? '' : problem.a === -1 ? '-' : problem.a}${formatFactor(problem.r1, problem.power1)}${formatFactor(problem.r2, problem.power2)} = 0`} /> となるため、解は <MathEq math={`x = ${problem.r1}, ${problem.r2}`} /> です。<br/>
                        これにより、積分区間は <MathEq math={`[${problem.r1}, ${problem.r2}]`} /> と定まります。
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">2. 面積の立式と {problem.formulaName} の意味</div>
                      <div className="ml-4 mt-1 text-xs">
                        面積 <MathEq math="S" /> は積分を用いて次のように表されます。<br/>
                        <MathEq math={`S = \\int_{${problem.r1}}^{${problem.r2}} | f(x) - g(x) | dx = \\int_{${problem.r1}}^{${problem.r2}} | ${problem.a === 1 ? '' : problem.a === -1 ? '-' : problem.a}${formatFactor(problem.r1, problem.power1)}${formatFactor(problem.r2, problem.power2)} | dx`} />
                        <br/><br/>
                        普通に展開して積分すると非常に計算が大変ですが、積分区間がちょうど因数分解の解になっている場合、<strong>{problem.formulaName}</strong> が使えます。<br/>
                        <div className="my-2 bg-yellow-100 p-2 border border-yellow-400">
                          <strong>【{problem.formulaName}の公式】</strong><br/>
                          <MathEq math={`\\int_{\\alpha}^{\\beta} (x-\\alpha)^{${problem.power1}}(x-\\beta)^{${problem.power2}} dx`} /> などを計算すると、必ず<br/>
                          <MathEq math={`S = ${problem.formulaDisplay}`} /> の形になるという強力なショートカットです。<br/>
                          （※ <MathEq math="a" /> は最高次項の係数です）
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 mt-3">3. 公式への代入と丁寧な計算</div>
                      <div className="ml-4 mt-1 text-xs">
                        公式に今回の数値を当てはめます。最高次係数 <MathEq math={`a = ${problem.a}`} />、積分区間 <MathEq math={`\\alpha = ${problem.r1}, \\beta = ${problem.r2}`} /> なので：
                        <div className="text-center my-2 text-sm">
                          <MathEq math={`S = \\frac{|${problem.a}|}{${problem.denom}} \\times \\Big( ${problem.r2} - (${problem.r1}) \\Big)^${problem.power}`} /><br/>
                          <MathEq math={`= \\frac{${Math.abs(problem.a)}}{${problem.denom}} \\times (${problem.r2 - problem.r1})^${problem.power}`} /><br/>
                          <MathEq math={`= \\frac{${Math.abs(problem.a)}}{${problem.denom}} \\times ${Math.pow(problem.r2 - problem.r1, problem.power)}`} />
                        </div>
                        最後に分数として約分します。<br/>
                        分子は <MathEq math={`${Math.abs(problem.a) * Math.pow(problem.r2 - problem.r1, problem.power)}`} />、分母は <MathEq math={`${problem.denom}`} /> なので、最大公約数で割ると：
                        <div className="text-center my-2 text-lg font-bold text-red-600">
                          <MathEq math={`S = ${problem.S_den === 1 ? problem.S_num : `\\frac{${problem.S_num}}{${problem.S_den}}`}`} />
                        </div>
                        これが求める面積です。グラフ上の色付き部分と一致していることを確認しましょう！
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
