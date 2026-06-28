"use client";

import { useState, useRef, UIEvent } from "react";
import Link from "next/link";

import { TEMPLATES, TEMPLATE_OPTIONS } from "@/data/pseudo-lang";

export default function PseudoLangPage() {
  const [code, setCode] = useState(TEMPLATES["exam_binary_search"]);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [isOneBased, setIsOneBased] = useState(false);

  
  const generatorRef = useRef<Generator | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tmpl = TEMPLATES[e.target.value];
    setCode(typeof tmpl === 'string' ? tmpl : tmpl.code);
    if (typeof tmpl !== 'string' && tmpl.isOneBased !== undefined) {
      setIsOneBased(tmpl.isOneBased);
    } else {
      setIsOneBased(false);
    }
    resetState();
  };

  const insertText = (insertStr: string) => {
    if (isDebugging) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode = code.substring(0, start) + insertStr + code.substring(end);
    setCode(newCode);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + insertStr.length;
      textarea.focus();
    }, 0);
  };

  const resetState = () => {
    setOutput([]);
    setError(null);
    setVariables({});
    setCurrentLine(null);
    setIsDebugging(false);
    generatorRef.current = null;
  };

  const createRunner = () => {
    const cleanCode = code.replace(/(#|\/\/).*/g, '');
    const lines = code.split('\n');
    let jsCode = "";
    const vars = new Set<string>();

    const varRegex = /([a-zA-Z0-9_\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+)\s*=/g;
    let match;
    while ((match = varRegex.exec(cleanCode)) !== null) {
      if (!['if', 'elif', 'else', 'while', 'for', 'and', 'or', 'not'].includes(match[1])) {
        vars.add(match[1]);
      }
    }
    const forRegex = /([a-zA-Z0-9_\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+)\s*を.+?から/g;
    while ((match = forRegex.exec(cleanCode)) !== null) {
      vars.add(match[1]);
    }

    const varNames = Array.from(vars);
    if (varNames.length > 0) {
      jsCode += `let ${varNames.join(', ')};\n`;
    }

    const getYieldCode = (lineIndex: number) => {
      return `yield { line: ${lineIndex}, getVars: () => {
        const res = {};
        ${varNames.map(v => `
          try { 
            if (typeof ${v} !== 'undefined') {
              res["${v}"] = typeof ${v} === 'object' && ${v} !== null ? JSON.parse(JSON.stringify(${v})) : ${v};
            }
          } catch(e) {}
        `).join('')}
        return res;
      } };\n`;
    };

    let blockStack: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      let rawLine = lines[i];
      let text = rawLine.replace(/[｜\|L⎿└│]/g, ' ').replace(/　/g, ' ');
      let indent = text.length - text.trimStart().length;
      let content = text.trim();

      content = content.replace(/(#|\/\/).*/, '').trim();

      if (!content) continue;

      let isElseOrElif = content.startsWith('そうでなくもし') || content.startsWith('そうでなければ');

      while (blockStack.length > 0 && indent < blockStack[blockStack.length - 1]) {
        blockStack.pop();
        jsCode += '}\n';
      }

      if (isElseOrElif && blockStack.length > 0 && indent === blockStack[blockStack.length - 1]) {
        blockStack.pop();
        jsCode += '} ';
      } else {
        while (blockStack.length > 0 && indent <= blockStack[blockStack.length - 1]) {
          blockStack.pop();
          jsCode += '}\n';
        }
      }

      let parsed = "";
      let opensBlock = false;

      content = content.replace(/==/g, '===')
                       .replace(/!=/g, '!==')
                       .replace(/\band\b/g, '&&')
                       .replace(/\bor\b/g, '||')
                       .replace(/\bnot\b/g, '!')
                       .replace(/要素数/g, 'sys_len')
                       .replace(/整数/g, 'Math.trunc')
                       .replace(/乱数\(\)/g, 'sys_ransuu()')
                       .replace(/【外部からの入力】/g, 'parseInt(window.prompt("値を入力してください:") || "0")')
                       .replace(/【整数を入力】/g, 'parseInt(window.prompt("整数を入力してください:") || "0")')
                       .replace(/【文字列を入力】/g, 'window.prompt("文字列を入力してください:") || ""');

      content = content.replace(/=\s*(\[.*\])$/, '= sys_arr($1)');

      content = content.replace(/([a-zA-Z0-9_\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+(?:\[[^\]]+\])?|\([^\)]+\))\s*÷\s*([a-zA-Z0-9_\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+(?:\[[^\]]+\])?|\([^\)]+\))/g, 'Math.trunc($1 / $2)');

      if (content.startsWith('もし') && content.endsWith(':')) {
        let cond = content.substring(2, content.length - 1).replace(/ならば$/, '').trim();
        parsed = `if (${cond}) {`;
        opensBlock = true;
      } else if (content.startsWith('そうでなくもし') && content.endsWith(':')) {
        let cond = content.substring(7, content.length - 1).replace(/ならば$/, '').trim();
        parsed = `else if (${cond}) {`;
        opensBlock = true;
      } else if (content.startsWith('そうでなければ:')) {
        parsed = `else {`;
        opensBlock = true;
      } else if (content.match(/(.+)を(.+)から(.+)まで(.+)ずつ増やしながら繰り返す:/)) {
        let m = content.match(/(.+)を(.+)から(.+)まで(.+)ずつ増やしながら繰り返す:/);
        parsed = `for (${m![1].trim()} = (${m![2]}); ${m![1].trim()} <= (${m![3]}); ${m![1].trim()} += (${m![4]})) {`;
        opensBlock = true;
      } else if (content.match(/(.+)を(.+)から(.+)まで(.+)ずつ減らしながら繰り返す:/)) {
        let m = content.match(/(.+)を(.+)から(.+)まで(.+)ずつ減らしながら繰り返す:/);
        parsed = `for (${m![1].trim()} = (${m![2]}); ${m![1].trim()} >= (${m![3]}); ${m![1].trim()} -= (${m![4]})) {`;
        opensBlock = true;
      } else if (content.match(/(.+)の間繰り返す:/)) {
        let m = content.match(/(.+)の間繰り返す:/);
        parsed = `while (${m![1].trim()}) {`;
        opensBlock = true;
      } else if (content.startsWith('表示する(')) {
        let args = content.substring(4);
        parsed = `sys_print${args};`;
      } else {
        parsed = content + ';';
      }

      if (parsed.startsWith('else')) {
        jsCode += parsed + '\n';
        jsCode += getYieldCode(i);
      } else {
        jsCode += getYieldCode(i);
        jsCode += parsed + '\n';
      }

      if (opensBlock) {
        blockStack.push(indent);
      }
    }

    while (blockStack.length > 0) {
      blockStack.pop();
      jsCode += '}\n';
    }

    const GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor as any;
    
    const makeGen = new GeneratorFunction(
      "sys_print", "sys_len", "sys_ransuu", "sys_arr",
      `
      try {
        ${jsCode}
      } catch(e) {
        throw e;
      }
      `
    );

    return makeGen(
      (...args: any[]) => { setOutput(prev => [...prev, args.join("")]); },
      (arr: any[]) => isOneBased ? arr.length - 1 : arr.length,
      () => Math.random(),
      (arr: any[]) => isOneBased ? [undefined, ...arr] : arr
    );
  };

  const handleRunAll = () => {
    resetState();
    try {
      const gen = createRunner();
      let res = gen.next();
      while (!res.done) res = gen.next();
    } catch (err: any) {
      setError(`構文エラー: 記述内容を確認してください。(${err.message})`);
    }
  };

  const handleStartDebug = () => {
    resetState();
    try {
      const gen = createRunner();
      generatorRef.current = gen;
      setIsDebugging(true);
      handleNextStep(gen);
    } catch (err: any) {
      setError(`構文エラー: 記述内容を確認してください。(${err.message})`);
    }
  };

  const handleNextStep = (overrideGen?: Generator) => {
    const gen = overrideGen || generatorRef.current;
    if (!gen) return;

    try {
      const res = gen.next();
      if (res.done) {
        setIsDebugging(false);
        generatorRef.current = null;
        setCurrentLine(null);
      } else {
        const val = res.value as any;
        setCurrentLine(val.line);
        setVariables(val.getVars());
      }
    } catch (err: any) {
      setError(`実行エラー: ${err.message}`);
      setIsDebugging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-slate-800 font-sans">
      
      {/* ページヘッダー */}
      <div className="mb-8">
        <nav className="text-xs text-slate-500 mb-2 font-pixel">
          <Link href="/" className="hover:underline">トップ</Link> &gt; <Link href="/learn" className="hover:underline">学習室</Link> &gt; 情報I
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          💻 共通テスト擬似言語（DNCL）エディタ＆シミュレータ
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          大学入学共通テスト「情報I」で出題されるPython風の擬似言語コードを、ブラウザ上で実際に書いて実行・一行ずつデバッグできます。
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs font-bold w-full md:w-auto">
          <label className="text-slate-600">プリセット読み込み:</label>
          <select 
            onChange={handleTemplateChange}
            disabled={isDebugging}
            className="bg-transparent font-bold focus:outline-none disabled:opacity-50 text-indigo-600 cursor-pointer"
          >
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-slate-800 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs font-bold w-full md:w-auto">
          <label className="flex items-center gap-1 cursor-pointer text-slate-700">
            <input 
              type="checkbox" 
              checked={isOneBased} 
              onChange={(e) => setIsOneBased(e.target.checked)}
              disabled={isDebugging}
              className="w-4 h-4 text-indigo-600 border-slate-800 focus:ring-indigo-500 rounded"
            />
            配列の要素番号を1から始める（最近の共通テスト形式）
          </label>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* 左側：エディタ */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-3">
            <div className="flex flex-wrap gap-1.5">
              {!isDebugging && (
                <>
                  <button onClick={() => insertText(" = ")} className="px-2.5 py-1 bg-white border-2 border-slate-800 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors">= 代入</button>
                  <button onClick={() => insertText("表示する(\"\")\n")} className="px-2.5 py-1 bg-white border-2 border-slate-800 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors">表示する()</button>
                  <button onClick={() => insertText("もし  ならば:\n｜  \n")} className="px-2.5 py-1 bg-white border-2 border-slate-800 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors">もし〜ならば:</button>
                  <button onClick={() => insertText("を  から  まで  ずつ増やしながら繰り返す:\n｜  \n")} className="px-2.5 py-1 bg-white border-2 border-slate-800 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors">for文</button>
                  <button onClick={() => insertText("の間繰り返す:\n｜  \n")} className="px-2.5 py-1 bg-white border-2 border-slate-800 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors">while文</button>
                </>
              )}
            </div>

            <div className="flex gap-2 shrink-0 justify-end">
              {!isDebugging ? (
                <>
                  <button onClick={handleRunAll} className="retro-btn text-xs py-1.5 px-4 rounded-lg bg-slate-900 text-white border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                    ▶ 実行
                  </button>
                  <button onClick={handleStartDebug} className="retro-btn text-xs py-1.5 px-4 rounded-lg bg-indigo-500 border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(15,23,42,1)] flex items-center gap-1">
                    🐞 デバッグ
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNextStep()} className="retro-btn text-xs py-1.5 px-4 rounded-lg bg-amber-400 border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(15,23,42,1)] animate-pulse">
                    ⏭ 1ステップ進む
                  </button>
                  <button onClick={resetState} className="retro-btn text-xs py-1.5 px-4 rounded-lg bg-rose-500 border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(15,23,42,1)] text-white">
                    ⏹ 終了
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col h-[520px] bg-[#1e1e1e] border-4 border-slate-800 rounded-2xl overflow-hidden shadow-[4px_4px_0_0_rgba(30,41,59,1)]">
            <div className="h-10 bg-[#2d2d2d] border-b border-[#404040] flex items-center px-4 justify-between select-none">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="text-[#858585] text-xs font-mono">editor.dncl (R7 Python Style)</div>
              <div className="w-12"></div>
            </div>

            <div className="flex flex-grow relative font-mono text-sm sm:text-base transition-colors">
              {isDebugging ? (
                <div className="w-full h-full overflow-auto editor-scrollbar py-2 text-[#d4d4d4]" style={{ lineHeight: '1.6' }}>
                  {code.split('\n').map((line, i) => (
                    <div 
                      key={i} 
                      className={`flex px-2 ${currentLine === i ? 'bg-amber-500/20 border-l-4 border-amber-400 text-yellow-50 font-bold' : 'border-l-4 border-transparent'}`}
                    >
                      <span className="w-8 flex-none text-right mr-4 text-[#858585] select-none">{i + 1}</span>
                      <span className="whitespace-pre flex-grow">{line || ' '}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div 
                    ref={lineNumRef} 
                    className="w-12 flex-none bg-[#1a1a1a] text-[#707070] py-4 pr-3 text-right select-none overflow-hidden border-r border-[#3a3a3a]"
                    style={{ lineHeight: '1.6' }}
                  >
                    {code.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={handleScroll}
                    className="flex-grow bg-transparent text-[#e4e4e4] p-4 outline-none resize-none whitespace-pre overflow-auto editor-scrollbar caret-indigo-400"
                    style={{ lineHeight: '1.6' }}
                    placeholder="ここに擬似言語コードを入力してください..."
                    spellCheck="false"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* 右側：変数モニターと実行出力 */}
        <div className="flex flex-col w-full lg:w-[35%] gap-6 min-w-0 mt-8 lg:mt-0">
          
          {/* 変数モニター */}
          <div className="flex flex-col h-[250px]">
            <div className="flex items-center gap-2 mb-2 px-1 text-slate-700 text-xs font-bold">
              <span className={`w-2 h-2 rounded-full ${isDebugging ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`}></span> 
              <span>変数モニター（リアルタイム値）</span>
            </div>
            <div className="flex-grow bg-white border-3 border-slate-800 rounded-xl overflow-y-auto editor-scrollbar shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {Object.keys(variables).length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 text-xs font-semibold p-4 text-center leading-normal">
                  {isDebugging ? 'スコープ内に有効な変数がありません' : 'デバッグ（ステップ実行）を開始すると変数の値がリアルタイムで追跡できます'}
                </div>
              ) : (
                <table className="w-full text-left text-xs table-fixed">
                  <thead className="bg-slate-50 border-b-2 border-slate-800 sticky top-0 z-10 font-bold">
                    <tr>
                      <th className="py-2 px-3 text-slate-700 w-[45%]">変数名</th>
                      <th className="py-2 px-3 text-slate-700 w-[55%]">値</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {Object.entries(variables).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-indigo-600 truncate font-semibold" title={key}>{key}</td>
                        <td className="py-2 px-3 text-slate-800 truncate" title={JSON.stringify(val)}>
                          {Array.isArray(val) ? (
                            <span className="text-purple-600 font-bold">{JSON.stringify(val)}</span>
                          ) : typeof val === 'number' ? (
                            <span className="text-amber-600 font-bold">{val}</span>
                          ) : typeof val === 'boolean' ? (
                            <span className="text-teal-600 font-bold">{val ? '真' : '偽'}</span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">"{val}"</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 実行ターミナル */}
          <div className="flex flex-col h-[250px]">
            <div className="flex items-center gap-2 mb-2 px-1 text-slate-700 text-xs font-bold">
              <span>🖥️ ターミナル出力（表示画面）</span>
            </div>
            <div className="flex-grow p-4 font-mono text-xs bg-[#0d1117] text-[#56d364] border-3 border-slate-800 rounded-xl overflow-y-auto editor-scrollbar shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),2px_2px_0px_rgba(0,0,0,1)] leading-relaxed">
              {error ? (
                <div className="text-rose-400 whitespace-pre-wrap break-all">{error}</div>
              ) : output.length === 0 ? (
                <div className="text-slate-600 italic">実行結果がここに表示されます...</div>
              ) : (
                output.map((line, index) => (
                  <div key={index} className="mb-1 break-all">
                    <span className="text-slate-700 mr-2">❯</span>{line}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
