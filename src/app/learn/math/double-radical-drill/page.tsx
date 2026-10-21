"use client";

import { useState } from 'react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { doubleRadicalPatterns, generateDoubleRadicalProblem, parseRadicandAnswer, type DoubleRadicalMode, type DoubleRadicalPattern } from '@/src/lib/doubleRadicalProblems';
import { useClientGeneratedState } from '@/src/lib/useClientGeneratedState';

// --- 数学ユーティリティ ---
function MathEq({ math, block = false }: { math: string; block?: boolean }) {
  const html = katex.renderToString(math, { displayMode: block, throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

const patternLabels: Record<DoubleRadicalPattern, string> = {
  pattern1: '基本の和',
  pattern2: '基本の差',
  pattern3: '係数付き',
  pattern4: '係数なし・√2で割る形',
};

export default function DoubleRadicalDrillPage() {
  const [selectedPattern, setSelectedPattern] = useState<DoubleRadicalMode>('mix');
  const [problem, setProblem] = useClientGeneratedState(() => generateDoubleRadicalProblem('mix'));
  const [strategy, setStrategy] = useState<DoubleRadicalPattern | ''>('');
  
  // ユーザー入力
  const [ansA, setAnsA] = useState<string>('');
  const [ansB, setAnsB] = useState<string>('');
  
  // 判定状態
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [validationError, setValidationError] = useState('');
  // 解説レベル
  const [detailLevel, setDetailLevel] = useState<'brief' | 'normal' | 'detailed'>('normal');

  const handleNext = (pattern: DoubleRadicalMode = selectedPattern) => {
    setProblem(generateDoubleRadicalProblem(pattern));
    setStrategy(pattern === 'mix' ? '' : pattern);
    setAnsA('');
    setAnsB('');
    setHasChecked(false);
    setIsCorrect(false);
    setValidationError('');
  };

  const handleCheck = () => {
    if (!problem) return;
    
    const ua = parseRadicandAnswer(ansA);
    const ub = parseRadicandAnswer(ansB);
    
    if (ua === null || ub === null) {
      setValidationError('2つの枠に正の整数を入力してください。小数や空欄は使えません。');
      return;
    }

    setValidationError('');
    
    if (strategy === problem.pattern && ua === problem.a && ub === problem.b) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    
    setHasChecked(true);
  };

  if (!problem) return <main className="max-w-4xl mx-auto px-4 py-8 text-slate-500">問題を準備しています…</main>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans text-sm">
      
      {/* ページタイトルとナビゲーション */}
      <div className="mb-6">
        <Link href="/drill" className="text-blue-600 hover:underline mb-2 inline-block">
          ← 無限演習ポータルへ戻る
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 border-b border-gray-300 pb-2">
          二重根号の外し方ドリル
        </h1>
        <p className="text-gray-500">
          まず基礎練習で苦手な形を固定して反復し、慣れたら実戦練習で形を見て解法を選びます。
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
                aria-label="二重根号の演習パターン"
                value={selectedPattern}
                onChange={e => { const pattern = e.target.value as DoubleRadicalMode; setSelectedPattern(pattern); handleNext(pattern); }}
                className="border p-1 text-sm"
              >
                <option value="mix">実戦練習：二重根号 全パターンランダム</option>
                <option value="pattern1">基礎練習：基本の和だけ</option>
                <option value="pattern2">基礎練習：基本の差だけ</option>
                <option value="pattern3">基礎練習：係数付きだけ</option>
                <option value="pattern4">基礎練習：係数なし・√2で割る形だけ</option>
              </select>
            </div>

            <div className="text-center my-8 text-2xl font-bold bg-white p-4 border border-gray-300 rounded shadow-sm">
              <MathEq math={problem.eq} />
            </div>
            
            <div className="space-y-4">
              <div className="text-center font-bold text-gray-700">二重根号を外しなさい。</div>
              {selectedPattern === 'mix' ? (
                <fieldset className="space-y-2">
                  <legend className="w-full text-center font-bold">実戦練習：式の形から解法パターンを選んでください。</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {doubleRadicalPatterns.map(pattern => <label key={pattern} className={`retro-btn-classic flex items-center gap-2 cursor-pointer ${strategy === pattern ? 'bg-blue-100 border-blue-400 font-bold' : ''}`}><input type="radio" name="double-radical-strategy" value={pattern} checked={strategy === pattern} onChange={() => { setStrategy(pattern); setHasChecked(false); setIsCorrect(false); }} className="accent-blue-600" />{patternLabels[pattern]}</label>)}
                  </div>
                </fieldset>
              ) : (
                <p role="status" aria-live="polite" className="text-center font-bold text-blue-800">基礎練習：{patternLabels[selectedPattern]}に固定して繰り返します。</p>
              )}
              <div className="flex items-center justify-center gap-2 text-xl">
                <MathEq math="=" />
                {problem.pattern === 'pattern4' ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-2 px-4">
                      {/* Root A */}
                      <div className="flex items-stretch">
                        <div className="text-2xl font-serif text-slate-700 flex items-center pr-1 select-none">√</div>
                        <div className="border-t-2 border-slate-700 pt-1">
                          <input aria-label="大きい数の根号内" aria-invalid={Boolean(validationError)} aria-describedby={validationError ? 'radical-answer-error' : undefined} type="number" className="w-12 bg-transparent border-b outline-none text-center font-bold text-lg text-slate-800 focus:border-blue-500" value={ansA} onChange={e => { setAnsA(e.target.value); setValidationError(''); setHasChecked(false); setIsCorrect(false); }} placeholder="大" />
                        </div>
                      </div>
                      
                      <div className="text-xl font-bold">{problem.sign}</div>
                      
                      {/* Root B */}
                      <div className="flex items-stretch">
                        <div className="text-2xl font-serif text-slate-700 flex items-center pr-1 select-none">√</div>
                        <div className="border-t-2 border-slate-700 pt-1">
                          <input aria-label="小さい数の根号内" aria-invalid={Boolean(validationError)} aria-describedby={validationError ? 'radical-answer-error' : undefined} type="number" className="w-12 bg-transparent border-b outline-none text-center font-bold text-lg text-slate-800 focus:border-blue-500" value={ansB} onChange={e => { setAnsB(e.target.value); setValidationError(''); setHasChecked(false); setIsCorrect(false); }} placeholder="小" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 text-xl font-bold flex items-stretch">
                      <div className="text-xl font-serif text-slate-700 flex items-center pr-0.5 select-none">√</div>
                      <div className="border-t-2 border-slate-700 pt-0.5">2</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Root A */}
                    <div className="flex items-stretch">
                      <div className="text-3xl font-serif text-slate-700 flex items-center pr-1 select-none">√</div>
                      <div className="border-t-[3px] border-slate-700 pt-1">
                        <input aria-label="大きい数の根号内" aria-invalid={Boolean(validationError)} aria-describedby={validationError ? 'radical-answer-error' : undefined} type="number" className="w-16 bg-transparent border-b outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" value={ansA} onChange={e => { setAnsA(e.target.value); setValidationError(''); setHasChecked(false); setIsCorrect(false); }} placeholder="大" />
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold px-2">{problem.sign}</div>
                    
                    {/* Root B */}
                    <div className="flex items-stretch">
                      <div className="text-3xl font-serif text-slate-700 flex items-center pr-1 select-none">√</div>
                      <div className="border-t-[3px] border-slate-700 pt-1">
                        <input aria-label="小さい数の根号内" aria-invalid={Boolean(validationError)} aria-describedby={validationError ? 'radical-answer-error' : undefined} type="number" className="w-16 bg-transparent border-b outline-none text-center font-bold text-2xl text-slate-800 focus:border-blue-500" value={ansB} onChange={e => { setAnsB(e.target.value); setValidationError(''); setHasChecked(false); setIsCorrect(false); }} placeholder="小" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {validationError && <p id="radical-answer-error" role="alert" className="text-center text-red-700 font-semibold">{validationError}</p>}
              <div className="text-xs text-gray-500 text-center">
                ※ 引き算の場合、必ず大きい数字を左側（大）に入力してください。<br/>
                ※ 根号の中身を入力してください（例：√4 の場合は「4」）。<br/>
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
                onClick={() => handleNext()}
                className="retro-btn-classic"
              >
                次の問題へ ➔
              </button>
            </div>

            {hasChecked && (
              <div role="status" aria-live="polite" className={`mt-4 p-3 border font-bold text-center ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
                {isCorrect ? '正解！素晴らしい！' : `不正解... 解法パターンは「${patternLabels[problem.pattern]}」です。解説を見てみよう。`}
              </div>
            )}
          </div>
        </div>

        {/* 右カラム：解説 */}
        <div className="space-y-6">
          <div className="retro-box min-h-[400px]">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-4">
              <h2 className="text-sm font-bold">
                ■ 解説・解法プロセス
              </h2>
              {hasChecked && (
                <div className="flex gap-1 text-xs">
                  <button type="button" aria-pressed={detailLevel === 'brief'} onClick={() => setDetailLevel('brief')} className={`px-2 py-1 border ${detailLevel === 'brief' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>略解</button>
                  <button type="button" aria-pressed={detailLevel === 'normal'} onClick={() => setDetailLevel('normal')} className={`px-2 py-1 border ${detailLevel === 'normal' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>標準</button>
                  <button type="button" aria-pressed={detailLevel === 'detailed'} onClick={() => setDetailLevel('detailed')} className={`px-2 py-1 border ${detailLevel === 'detailed' ? 'bg-yellow-400 font-bold border-yellow-500' : 'bg-white border-yellow-300'}`}>丁寧</button>
                </div>
              )}
            </div>

            {!hasChecked ? (
              <div className="flex h-full items-center justify-center text-gray-400 italic mt-20">
                解答するとここに解説が表示されます。
              </div>
            ) : (
              <div className="space-y-4 text-sm leading-relaxed">
                <div className="bg-white p-3 border text-center font-bold text-lg mb-4 text-emerald-700 shadow-sm">
                  {problem.pattern === 'pattern4' ? (
                    <MathEq math={`${problem.eq} = \\frac{\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}}{\\sqrt{2}}`} />
                  ) : (
                    <MathEq math={`${problem.eq} = \\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} />
                  )}
                </div>

                {detailLevel === 'brief' && (
                  <div>
                    {problem.pattern === 'pattern3' && (
                      <div className="mb-2">
                        <MathEq math={`${problem.eq} = \\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.k} \\times ${problem.k} \\times ${problem.inner}}}`} block />
                        <MathEq math={`= \\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}`} block />
                      </div>
                    )}
                    {problem.pattern === 'pattern4' && (
                      <div className="mb-2">
                        <MathEq math={`${problem.eq} = \\sqrt{\\frac{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}{2}}`} block />
                      </div>
                    )}
                    足して <MathEq math={`${problem.sum}`} />、かけて <MathEq math={`${problem.prod}`} /> になる2数は <MathEq math={`${problem.a}`} /> と <MathEq math={`${problem.b}`} />。<br/>
                    よって、解答の通りになります。
                  </div>
                )}

                {detailLevel === 'normal' && (
                  <div>
                    {problem.pattern === 'pattern3' && (
                      <div className="mb-4">
                        二重根号を外すには、内側のルートの前の係数を「<MathEq math="2" />」にする必要があります。<br/>
                        今回は係数が <MathEq math={`${2 * problem.k!}`} /> なので、<MathEq math={`${problem.k!}`} /> をルートの中に戻します。<br/>
                        <MathEq math={`${2 * problem.k!}\\sqrt{${problem.inner}} = 2 \\times \\sqrt{${problem.k!}^2 \\times ${problem.inner}} = 2\\sqrt{${problem.prod}}`} /><br/>
                        これにより、式は <MathEq math={`\\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}`} /> となります。
                      </div>
                    )}
                    {problem.pattern === 'pattern4' && (
                      <div className="mb-4">
                        二重根号を外すには、内側のルートの前の係数を「<MathEq math="2" />」にする必要があります。<br/>
                        しかし今回は係数がありません。そこで、無理やりルートの中身の分母・分子に2を掛けます。<br/>
                        <MathEq math={`${problem.eq} = \\sqrt{\\frac{2(${problem.X} ${problem.sign} \\sqrt{${problem.prod}})}{2}} = \\sqrt{\\frac{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}{2}}`} />
                      </div>
                    )}
                    
                    基本形 <MathEq math={`\\sqrt{A \\pm 2\\sqrt{B}}`} /> になったら、「足して<MathEq math="A" />」「かけて<MathEq math="B" />」になる2数を見つけます。<br/>
                    今回は、<br/>
                    ・足して <MathEq math={`${problem.sum}`} /><br/>
                    ・かけて <MathEq math={`${problem.prod}`} /><br/>
                    になる2数を探すと、<MathEq math={`${problem.a}`} /> と <MathEq math={`${problem.b}`} /> が見つかります。<br/>
                    <br/>
                    {problem.sign === '-' && (
                      <div className="text-red-600 font-bold mb-2">
                        ※引き算の場合は、必ず大きい数を先に書くルールを忘れないようにしましょう。
                      </div>
                    )}
                    したがって、答えは上の通りに外れます。
                  </div>
                )}

                {detailLevel === 'detailed' && (
                  <div className="space-y-4">
                    <p className="font-bold text-blue-700 bg-blue-50 p-2 rounded">
                      ■ 二重根号を外すための基本原理
                    </p>
                    <p>
                      <MathEq math={`(\\sqrt{x} \\pm \\sqrt{y})^2 = (x+y) \\pm 2\\sqrt{xy}`} /> という展開公式を使います。<br/>
                      この両辺にルートを被せると、<br/>
                      <MathEq math={`\\sqrt{(x+y) \\pm 2\\sqrt{xy}} = \\sqrt{x} \\pm \\sqrt{y}`} /> （※ただし <MathEq math={`x > y`} />）<br/>
                      となります。これが二重根号を外す公式です。
                    </p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">1. 式の形を整える</p>
                    {problem.pattern === 'pattern1' || problem.pattern === 'pattern2' ? (
                      <p>今回はすでに <MathEq math={`\\sqrt{A \\pm 2\\sqrt{B}}`} /> の形（内側のルートの前に2がある）になっているので、そのまま次へ進めます。</p>
                    ) : problem.pattern === 'pattern3' ? (
                      <div className="bg-gray-50 p-2 border">
                        公式を使うためには、内側のルートの前を必ず「<MathEq math="2" />」にする必要があります。<br/>
                        式は <MathEq math={`${problem.eq}`} /> です。<br/>
                        <MathEq math={`${2 * problem.k!}`} /> のうち、<MathEq math={`${problem.k!}`} /> をルートの中に入れます（2乗して入れます）。<br/>
                        <MathEq math={`${problem.k!}\\sqrt{${problem.inner}} = \\sqrt{${problem.k!}^2 \\times ${problem.inner}} = \\sqrt{${problem.prod}}`} /><br/>
                        これで、式は <MathEq math={`\\sqrt{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}`} /> という基本形に変形できました。
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-2 border">
                        公式を使うためには、内側のルートの前を必ず「<MathEq math="2" />」にする必要があります。<br/>
                        しかし <MathEq math={`${problem.eq}`} /> には2がありませんし、ルートの中から無理やり2を出す（4で割る）こともできません。<br/>
                        そこで、分数にして分母と分子に2を掛けます。<br/>
                        <MathEq math={`\\sqrt{\\frac{${problem.X} ${problem.sign} \\sqrt{${problem.prod}}}{1}} = \\sqrt{\\frac{2 \\times (${problem.X} ${problem.sign} \\sqrt{${problem.prod}})}{2 \\times 1}} = \\sqrt{\\frac{${problem.sum} ${problem.sign} 2\\sqrt{${problem.prod}}}{2}}`} /><br/>
                        これで、分子が基本形になりました！
                      </div>
                    )}

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">2. 和と積から2数を見つける</p>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-white border p-3 text-center">
                        <div className="text-gray-500 mb-1">和 (x+y)</div>
                        <div className="font-bold text-xl text-blue-600">{problem.sum}</div>
                      </div>
                      <div className="flex-1 bg-white border p-3 text-center">
                        <div className="text-gray-500 mb-1">積 (xy)</div>
                        <div className="font-bold text-xl text-green-600">{problem.prod}</div>
                      </div>
                    </div>
                    <p>
                      掛けて <MathEq math={`${problem.prod}`} /> になるペアを考え、その中で足して <MathEq math={`${problem.sum}`} /> になるものを探します。<br/>
                      見つかる2数は <MathEq math={`${problem.a}`} /> と <MathEq math={`${problem.b}`} /> です。
                    </p>

                    <p className="font-bold border-b border-gray-300 pb-1 mt-4 mb-2">3. 答えの形にする</p>
                    {problem.pattern === 'pattern4' ? (
                      <p>
                        分子の二重根号が外れて <MathEq math={`\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} /> となります。<br/>
                        分母には <MathEq math={`\\sqrt{2}`} /> が残っているので、最終的な答えは <MathEq math={`\\frac{\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}}{\\sqrt{2}}`} /> です。
                      </p>
                    ) : (
                      <p>
                        そのままルートを被せて <MathEq math={`\\sqrt{${problem.a}} ${problem.sign} \\sqrt{${problem.b}}`} /> が答えです。<br/>
                        {problem.sign === '-' && "※引き算の場合、ルートの中がマイナスにならないよう、必ず大きい数を左側に置きます。"}
                      </p>
                    )}
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
