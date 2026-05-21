"use client";

import { useState, useRef, UIEvent } from "react";

const TEMPLATES: Record<string, string> = {
  "blank": "",
  "sample_basic": `kingaku = 300\nkosu = 3\nkingaku_goukei = kingaku * kosu\n表示する("合計は", kingaku_goukei, "円です")`,
  "sample_if": `x = 5\nもし x < 3 ならば:\n｜  x = x + 1\nそうでなくもし x == 5 ならば:\n｜  表示する("xは5です")\nそうでなければ:\n⎿  x = x * 2`,
  "sample_loop": `Data = [10, 20, 30]\ngoukei = 0\nx を 0 から 2 まで 1 ずつ増やしながら繰り返す:\n⎿  goukei = goukei + Data[x]\n表示する("合計:", goukei)`,
  "exam_binary_search": `# 令和7年度 試作問題風 二分探索プログラム\nData = [3,18,29,33,48,52,62,77,89,97]\nkazu = 要素数(Data)\n表示する("探したい数字(例:52)が何番目にあるか検索します")\natai = 52  # テスト用に52を固定で代入\n\nhidari = 0\nmigi = kazu - 1\nowari = 0\n\nhidari <= migi and owari == 0 の間繰り返す:\n｜  aida = (hidari + migi) ÷ 2 \n｜  もし Data[aida] == atai ならば:\n｜  ｜  表示する(atai, "は", aida, "番目にありました")\n｜  ｜  owari = 1\n｜  そうでなくもし Data[aida] < atai ならば:\n｜  ｜  hidari = aida + 1\n｜  そうでなければ:\n⎿  ⎿  migi = aida - 1\n\nもし owari == 0 ならば:\n⎿  表示する(atai, "は見つかりませんでした")`
};

export default function PseudoLangPage() {
  const [code, setCode] = useState(TEMPLATES["exam_binary_search"]);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  
  const generatorRef = useRef<Generator | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCode(TEMPLATES[e.target.value]);
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
    // 実行前にコメントを除外したテキストから変数を抽出
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
      // 罫線をスペースにしてインデント計算
      let text = rawLine.replace(/[｜\|L⎿└│]/g, ' ').replace(/　/g, ' ');
      let indent = text.length - text.trimStart().length;
      let content = text.trim();

      // ★修正: 行の途中にあるコメントも確実に削除する
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

      // 記号と関数の置換
      content = content.replace(/==/g, '===')
                       .replace(/!=/g, '!==')
                       .replace(/\band\b/g, '&&')
                       .replace(/\bor\b/g, '||')
                       .replace(/\bnot\b/g, '!')
                       .replace(/要素数/g, 'sys_len')
                       .replace(/整数/g, 'Math.trunc')
                       .replace(/乱数\(\)/g, 'sys_ransuu()')
                       .replace(/【外部からの入力】/g, 'parseInt(window.prompt("値を入力してください:") || "0")');

      // ★修正: 割り算の正規表現バグを修正
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
      "sys_print", "sys_len", "sys_ransuu",
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
      (arr: any[]) => arr.length,
      () => Math.random()
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">情報I 疑似言語シミュレーター</h1>
          <p className="text-gray-500 text-sm mt-1">大学入学共通テスト（新DNCL・Python風表記）完全対応</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <label className="font-semibold text-sm text-gray-600 whitespace-nowrap">プリセット問題:</label>
          <select 
            onChange={handleTemplateChange}
            disabled={isDebugging}
            className="bg-transparent text-sm font-medium focus:outline-none disabled:opacity-50 text-blue-600 cursor-pointer"
          >
            <option value="exam_binary_search">令和7年 試作問題（二分探索）</option>
            <option value="sample_basic">基本構文と代入</option>
            <option value="sample_if">条件分岐（if文）</option>
            <option value="sample_loop">配列と繰り返し（for文）</option>
            <option value="blank">空白から始める</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左側：エディタエリア */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-wrap gap-1 mb-2 sm:mb-0">
              {!isDebugging && (
                <>
                  <button onClick={() => insertText(" = ")} className="px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-medium rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors">= 代入</button>
                  <button onClick={() => insertText("表示する(\"\")\n")} className="px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-medium rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors">表示する()</button>
                  <button onClick={() => insertText("もし  ならば:\n｜  \n")} className="px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-medium rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors">もし〜ならば:</button>
                  <button onClick={() => insertText("を  から  まで  ずつ増やしながら繰り返す:\n｜  \n")} className="px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-medium rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors">for文</button>
                  <button onClick={() => insertText("の間繰り返す:\n｜  \n")} className="px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-xs font-medium rounded-md hover:bg-gray-50 hover:text-blue-600 transition-colors">while文</button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {!isDebugging ? (
                <>
                  <button onClick={handleRunAll} className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-md text-sm font-bold transition-all shadow-sm">
                    ▶ 実行
                  </button>
                  <button onClick={handleStartDebug} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-bold transition-all shadow-md flex items-center gap-1">
                    <span className="text-lg leading-none">🐞</span> デバッグ
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNextStep()} className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-md text-sm font-bold transition-all shadow-md animate-pulse">
                    ⏭ 次へ進む
                  </button>
                  <button onClick={resetState} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md text-sm font-bold transition-all shadow-sm">
                    ⏹ 終了
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col h-[550px] bg-[#1e1e1e] rounded-xl overflow-hidden shadow-xl ring-1 ring-gray-900/10">
            <div className="h-10 bg-[#2d2d2d] border-b border-[#404040] flex items-center px-4 justify-between select-none">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="text-[#858585] text-xs font-mono">main.dncl (R7 Python Style)</div>
              <div className="w-12"></div>
            </div>

            <div className="flex flex-grow relative font-mono text-sm sm:text-base transition-colors">
              {isDebugging ? (
                <div className="w-full h-full overflow-auto editor-scrollbar py-2" style={{ lineHeight: '1.6' }}>
                  {code.split('\n').map((line, i) => (
                    <div 
                      key={i} 
                      className={`flex px-2 ${currentLine === i ? 'debug-highlight text-yellow-50 font-semibold' : 'border-l-4 border-transparent text-[#d4d4d4]'}`}
                    >
                      <span className="w-10 flex-none text-right mr-4 text-[#858585] select-none">{i + 1}</span>
                      <span className="whitespace-pre flex-grow">{line || ' '}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div 
                    ref={lineNumRef} 
                    className="w-12 flex-none bg-[#1e1e1e] text-[#858585] py-4 pr-3 text-right select-none overflow-hidden border-r border-[#404040]"
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
                    className="flex-grow bg-transparent text-[#d4d4d4] p-4 outline-none resize-none whitespace-pre overflow-auto editor-scrollbar caret-blue-400"
                    style={{ lineHeight: '1.6' }}
                    placeholder="ここにコードを入力..."
                    spellCheck="false"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* 右側：変数モニター＆実行結果 */}
        <div className="flex flex-col w-full lg:w-[35%] gap-6 min-w-0 mt-10 lg:mt-0">
          
          <div className="flex flex-col h-[260px]">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isDebugging ? 'bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-300'}`}></span> 
              <span className="font-bold text-gray-700 text-sm tracking-wide">VARIABLE ENVIRONMENT</span>
            </div>
            <div className="flex-grow bg-white rounded-xl border border-gray-200 overflow-y-auto editor-scrollbar shadow-sm">
              {Object.keys(variables).length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                  {isDebugging ? '変数がありません' : 'デバッグを開始すると表示されます'}
                </div>
              ) : (
                <table className="w-full text-left text-sm table-fixed">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold text-gray-600 w-[40%]">変数名</th>
                      <th className="py-2.5 px-4 font-semibold text-gray-600 w-[60%]">現在の値</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(variables).map(([key, val]) => (
                      <tr key={key} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-blue-600 truncate" title={key}>{key}</td>
                        <td className="py-2.5 px-4 font-mono text-gray-800 truncate" title={JSON.stringify(val)}>
                          {Array.isArray(val) ? (
                            <span className="text-purple-600">{JSON.stringify(val)}</span>
                          ) : typeof val === 'number' ? (
                            <span className="text-orange-600">{val}</span>
                          ) : typeof val === 'boolean' ? (
                            <span className="text-teal-600">{val ? 'true' : 'false'}</span>
                          ) : (
                            <span className="text-green-600">"{val}"</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex flex-col h-[260px]">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="font-bold text-gray-700 text-sm tracking-wide flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                TERMINAL OUTPUT
              </span>
            </div>
            <div className="flex-grow p-4 font-mono text-sm bg-[#0d1117] text-[#56d364] rounded-xl border border-gray-800 overflow-y-auto editor-scrollbar shadow-inner leading-relaxed">
              {error ? (
                <div className="text-[#f85149] whitespace-pre-wrap break-words">{error}</div>
              ) : output.length === 0 ? (
                <div className="text-gray-600 italic">... Waiting for execution ...</div>
              ) : (
                output.map((line, index) => (
                  <div key={index} className="mb-1 break-words">
                    <span className="text-[#30363d] mr-2">❯</span>{line}
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