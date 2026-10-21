"use client";

import { useState, useRef, UIEvent, type KeyboardEvent } from "react";
import Link from "next/link";

import { TEMPLATES, TEMPLATE_OPTIONS } from "@/src/data/pseudo-lang";
import { parseStrictInteger } from "@/src/lib/strictInteger";
import { editIndentationSelection } from "@/src/lib/pseudoLangEditor";

const MAX_PSEUDO_CODE_CHARACTERS = 100000;
const MAX_PSEUDO_CODE_LINES = 10000;
const MAX_PROGRAM_INPUT_CHARACTERS = 100000;

export default function PseudoLangPage() {
  const initialTmpl = TEMPLATES["exam_binary_search"];
  const [code, setCode] = useState<string>(typeof initialTmpl === 'string' ? initialTmpl : initialTmpl.code);
  const [programInput, setProgramInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isDebugging, setIsDebugging] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const [isOneBased, setIsOneBased] = useState<boolean>(typeof initialTmpl !== 'string' && initialTmpl.isOneBased ? true : false);
  const [selectedTemplate, setSelectedTemplate] = useState('exam_binary_search');

  const formatArrayValue = (value: unknown[], ancestors = new WeakSet<object>(), depth = 0): string => {
    if (depth >= 8) return '[…]';
    if (ancestors.has(value)) return '[循環参照]';
    ancestors.add(value);
    const visibleValues = isOneBased ? value.slice(1) : value;
    const shownValues = visibleValues.slice(0, 100);
    const formatted = `[${shownValues.map((item, index) => `${isOneBased ? index + 1 : index}: ${Array.isArray(item) ? formatArrayValue(item, ancestors, depth + 1) : String(item)}`).join(', ')}${visibleValues.length > shownValues.length ? ', …' : ''}]`;
    ancestors.delete(value);
    return formatted;
  };

  
  const generatorRef = useRef<Generator | null>(null);
  const outputBufferRef = useRef<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTemplate = e.target.value;
    const tmpl = TEMPLATES[nextTemplate];
    setSelectedTemplate(nextTemplate);
    setCode(typeof tmpl === 'string' ? tmpl : tmpl.code);
    setProgramInput(e.target.value === 'exam_2025_tsuishi_fig2' ? '1, 1, 1, 400' : e.target.value === 'exam_2025_tsuishi_fig5' ? 'かん' : '');
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
    if (!updateCode(newCode)) return;
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + insertStr.length;
      textarea.focus();
    }, 0);
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();

    const textarea = event.currentTarget;
    const edit = editIndentationSelection(code, textarea.selectionStart, textarea.selectionEnd, event.shiftKey);
    if (!edit.changed || !updateCode(edit.code)) return;
    setTimeout(() => {
      textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
      textarea.focus();
    }, 0);
  };

  const resetState = () => {
    outputBufferRef.current = [];
    setOutput([]);
    setError(null);
    setVariables({});
    setCurrentLine(null);
    setIsDebugging(false);
    generatorRef.current = null;
  };

  const updateCode = (nextCode: string) => {
    const lineCount = nextCode.split('\n').length;
    if (nextCode.length > MAX_PSEUDO_CODE_CHARACTERS || lineCount > MAX_PSEUDO_CODE_LINES) {
      resetState();
      setError(nextCode.length > MAX_PSEUDO_CODE_CHARACTERS
        ? `プログラムは${MAX_PSEUDO_CODE_CHARACTERS}文字以内にしてください。`
        : `プログラムは${MAX_PSEUDO_CODE_LINES}行以内にしてください。`);
      return false;
    }
    setCode(nextCode);
    resetState();
    return true;
  };

  const createRunner = () => {
    if (code.length > MAX_PSEUDO_CODE_CHARACTERS) {
      throw new Error(`プログラムは${MAX_PSEUDO_CODE_CHARACTERS}文字以内にしてください。`);
    }
    if (code.split('\n').length > MAX_PSEUDO_CODE_LINES) {
      throw new Error(`プログラムは${MAX_PSEUDO_CODE_LINES}行以内にしてください。`);
    }
    if (programInput.length > MAX_PROGRAM_INPUT_CHARACTERS) {
      throw new Error(`プログラムへの入力は${MAX_PROGRAM_INPUT_CHARACTERS}文字以内にしてください。`);
    }
    const stripComment = (line: string) => {
      let quote = '';
      let escaped = false;
      for (let index = 0; index < line.length; index++) {
        const char = line[index];
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if ((char === '"' || char === "'") && (!quote || quote === char)) {
          quote = quote ? '' : char;
          continue;
        }
        if (!quote && (char === '#' || (char === '/' && line[index + 1] === '/'))) return line.slice(0, index);
      }
      return line;
    };
    const cleanCode = code.split('\n').map(stripComment).join('\n');
    const inputQueue: Array<{ value: string; quoted: boolean; afterSeparator: 'comma' | 'newline' | null }> = [];
    let inputValue = '';
    let quotedInput = false;
    let inputWasQuoted = false;
    let quoteClosed = false;
    let lastInputSeparator: 'comma' | 'newline' | null = null;
    for (let index = 0; index < programInput.length; index++) {
      const char = programInput[index];
      if (char === '"') {
        if (quotedInput && programInput[index + 1] === '"') {
          inputValue += '"';
          index++;
        } else if (!quotedInput && !quoteClosed && inputValue.trim() === '') {
          quotedInput = true;
          inputWasQuoted = true;
          quoteClosed = false;
          inputValue = '';
        } else if (quotedInput) {
          quotedInput = false;
          quoteClosed = true;
        } else {
          throw new Error('プログラムへの入力の引用符の位置が正しくありません。');
        }
      } else if (!quotedInput && (char === ',' || char === '\n' || char === '\r')) {
        inputQueue.push({
          value: inputWasQuoted ? inputValue : inputValue.trim(),
          quoted: inputWasQuoted,
          afterSeparator: lastInputSeparator,
        });
        inputValue = '';
        inputWasQuoted = false;
        quoteClosed = false;
        lastInputSeparator = char === ',' ? 'comma' : 'newline';
        if (char === '\r' && programInput[index + 1] === '\n') index++;
      } else {
        if (quoteClosed) {
          if (!/\s/.test(char)) throw new Error('プログラムへの入力で引用符の後に余分な文字があります。');
        } else {
          inputValue += char;
        }
      }
    }
    if (quotedInput) throw new Error('プログラムへの入力で引用符が閉じていません。');
    if (inputValue !== '' || inputWasQuoted || quoteClosed || lastInputSeparator === 'comma') {
      inputQueue.push({
        value: inputWasQuoted ? inputValue : inputValue.trim(),
        quoted: inputWasQuoted,
        afterSeparator: lastInputSeparator,
      });
    }
    while (inputQueue.length > 0 && !inputQueue[inputQueue.length - 1].quoted && inputQueue[inputQueue.length - 1].value === '' && inputQueue[inputQueue.length - 1].afterSeparator !== 'comma') {
      inputQueue.pop();
    }
    let inputIndex = 0;
    const readInput = (kind: string) => {
      if (inputIndex >= inputQueue.length) {
        throw new Error(`${kind}の入力値が足りません。上の「プログラムへの入力」を確認してください。`);
      }
      const input = inputQueue[inputIndex++];
      if (!input.value && !input.quoted) throw new Error(`${kind}の入力値が空です。空文字を入力する場合は二重引用符で囲んでください。`);
      const value = input.value;
      return value;
    };
    const readInteger = () => {
      const value = readInput('整数');
      const parsed = parseStrictInteger(value);
      if (parsed === null) throw new Error(`整数として読み取れません: ${value}`);
      return parsed;
    };
    const runtimeHelpers = `
      const sys_maxArrayLength = 100000;
      const sys_maxTotalArrayElements = 1000000;
      let sys_totalArrayElements = 0;
      const sys_arrayTargets = new WeakMap();
      const sys_wrap_array = (arr) => {
        const logicalLength = oneBased ? arr.length - 1 : arr.length;
        if (logicalLength > sys_maxArrayLength) throw new Error('配列の要素数が上限（100000）を超えました。');
        if (sys_totalArrayElements + logicalLength > sys_maxTotalArrayElements) {
          throw new Error('配列の合計割り当て要素数が上限（1000000）を超えました。');
        }
        const wrapped = new Proxy(arr, {
          get(target, property, receiver) {
            if (property === 'length') return oneBased ? target.length - 1 : target.length;
            if (typeof property !== 'string' || !/^(0|[1-9]\\d*)$/.test(property)) {
              throw new Error('配列の添字には0以上の整数を指定してください。');
            }
            const index = Number(property);
            if (!Number.isSafeInteger(index) || index >= sys_maxArrayLength + (oneBased ? 1 : 0)) {
              throw new Error('配列の要素数が上限（100000）を超えました。');
            }
            if ((oneBased && index === 0) || index >= target.length) {
              throw new Error('配列の範囲外の要素を参照しました。添字を確認してください。');
            }
            return Reflect.get(target, property, receiver);
          },
          set(target, property, value, receiver) {
            if (typeof property !== 'string' || !/^(0|[1-9]\\d*)$/.test(property)) {
              throw new Error('配列には整数の添字で代入してください。');
            }
            const index = Number(property);
            if (!Number.isSafeInteger(index) || index >= sys_maxArrayLength + (oneBased ? 1 : 0)) {
              throw new Error('配列の要素数が上限（100000）を超えました。');
            }
            if (oneBased && index === 0) {
              throw new Error('1始まりの配列では添字0に代入できません。');
            }
            const addedLength = Math.max(0, index + 1 - target.length);
            if (sys_totalArrayElements + addedLength > sys_maxTotalArrayElements) {
              throw new Error('配列の合計割り当て要素数が上限（1000000）を超えました。');
            }
            const result = Reflect.set(target, property, value, receiver);
            sys_totalArrayElements += addedLength;
            return result;
          },
        });
        sys_totalArrayElements += logicalLength;
        sys_arrayTargets.set(wrapped, arr);
        return wrapped;
      };
      const sys_clone = (value, seen = new WeakMap(), budget = { remaining: 10000 }, depth = 0) => {
        if (!Array.isArray(value)) return value;
        if (budget.remaining <= 0 || depth >= 32) return '[表示上限]';
        if (seen.has(value)) return seen.get(value);
        const target = sys_arrayTargets.get(value) || value;
        const cloned = [];
        seen.set(value, cloned);
        for (let index = 0; index < target.length; index++) {
          if (budget.remaining <= 0) {
            cloned.push('[表示上限]');
            break;
          }
          budget.remaining--;
          cloned.push(sys_clone(target[index], seen, budget, depth + 1));
        }
        return cloned;
      };
      const sys_len = (value) => {
        if (typeof value === 'string') return value.length;
        if (!Array.isArray(value)) throw new Error('要素数の対象には配列または文字列を指定してください。');
        return value.length;
      };
      const sys_add = (left, right, line) => {
        if (Array.isArray(left) || Array.isArray(right)) {
          throw new Error(line + '行目: 配列は加算できません。');
        }
        if (typeof left === 'string' || typeof right === 'string') {
          const leftText = String(left);
          const rightText = String(right);
          if (leftText.length + rightText.length > 100000) {
            throw new Error(line + '行目: 文字列の長さが上限（100000文字）を超えました。');
          }
          return leftText + rightText;
        }
        if (typeof left !== 'number' || typeof right !== 'number' || !Number.isFinite(left) || !Number.isFinite(right)) {
          throw new Error(line + '行目: 数値の加算には有限の数値を指定してください。');
        }
        const result = left + right;
        if (!Number.isFinite(result)) throw new Error(line + '行目: 加算結果が数値の範囲を超えました。');
        return result;
      };
      const sys_subtract = (left, right, line) => {
        if (typeof left !== 'number' || typeof right !== 'number' || !Number.isFinite(left) || !Number.isFinite(right)) {
          throw new Error(line + '行目: 減算には有限の数値を指定してください。');
        }
        const result = left - right;
        if (!Number.isFinite(result)) throw new Error(line + '行目: 減算結果が数値の範囲を超えました。');
        return result;
      };
      const sys_multiply = (left, right, line) => {
        if (typeof left !== 'number' || typeof right !== 'number' || !Number.isFinite(left) || !Number.isFinite(right)) {
          throw new Error(line + '行目: 乗算には有限の数値を指定してください。');
        }
        const result = left * right;
        if (!Number.isFinite(result)) throw new Error(line + '行目: 乗算結果が数値の範囲を超えました。');
        return result;
      };
      const sys_power = (left, right, line) => {
        if (typeof left !== 'number' || typeof right !== 'number' || !Number.isFinite(left) || !Number.isFinite(right)) {
          throw new Error(line + '行目: べき乗には有限の数値を指定してください。');
        }
        const result = left ** right;
        if (!Number.isFinite(result)) throw new Error(line + '行目: べき乗の結果が数値の範囲を超えました。');
        return result;
      };
      const sys_get_index = (value, index, line) => {
        if (index === 'length' && Array.isArray(value)) return value.length;
        if (index === 'length' && typeof value === 'string') return value.length;
        if (!Number.isSafeInteger(index) || index < 0) {
          throw new Error(line + '行目: 添字には0以上の整数を指定してください。');
        }
        if (Array.isArray(value)) {
          if (oneBased && index === 0) throw new Error(line + '行目: 1始まりの配列では添字0を参照できません。');
          const target = sys_arrayTargets.get(value) || value;
          if (index >= target.length) throw new Error(line + '行目: 配列の範囲外の要素を参照しました。添字を確認してください。');
          return value[index];
        }
        if (typeof value === 'string') {
          if (index >= value.length) throw new Error(line + '行目: 配列または文字列の範囲外を参照しました。');
          return value[index];
        }
        throw new Error(line + '行目: 添字アクセスの対象には配列または文字列を指定してください。');
      };
      const sys_set_index = (value, index, item, line) => {
        if (!Array.isArray(value)) throw new Error(line + '行目: 添字を指定して代入できるのは配列だけです。');
        if (!Number.isSafeInteger(index) || index < 0) {
          throw new Error(line + '行目: 添字には0以上の整数を指定してください。');
        }
        if (oneBased && index === 0) throw new Error(line + '行目: 1始まりの配列では添字0に代入できません。');
        value[index] = item;
        return item;
      };
      const sys_arr = (arr) => {
        if (sys_arrayTargets.has(arr)) return arr;
        const values = arr.map(value => Array.isArray(value) ? sys_arr(value) : value);
        return sys_wrap_array(oneBased ? [undefined, ...values] : values);
      };
      const sys_output_text = (value, remaining = 100000, ancestors = new WeakSet()) => {
        if (value === undefined || value === null) return '';
        if (!Array.isArray(value)) {
          const text = String(value);
          return text.length > remaining ? text.slice(0, remaining + 1) : text;
        }
        if (ancestors.has(value)) return '[循環参照]';
        ancestors.add(value);
        const target = sys_arrayTargets.get(value) || value;
        const firstIndex = oneBased ? 1 : 0;
        let text = '';
        for (let index = firstIndex; index < target.length; index++) {
          if (index > firstIndex) text += ',';
          if (text.length > remaining) {
            text = text.slice(0, remaining + 1);
            break;
          }
          text += sys_output_text(target[index], Math.max(0, remaining - text.length), ancestors);
          if (text.length > remaining) {
            text = text.slice(0, remaining + 1);
            break;
          }
        }
        ancestors.delete(value);
        return text;
      };
      const sys_input = () => readString("文字列");
      const sys_int_input = () => readInteger();
      const sys_print = (...args) => print(...args.map(value => Array.isArray(value) ? sys_output_text(value) : value));
      const sys_ransuu = () => Math.random();
      const sys_step = (step, line) => {
        if (!Number.isFinite(step) || step <= 0) throw new Error(line + '行目: 繰り返しの増分は正の数にしてください。');
        return step;
      };
      const sys_loop_bound = (value, line) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new Error(line + '行目: 繰り返しの開始値と終了値は有限の数値にしてください。');
        }
        return value;
      };
      const sys_loop_next = (value, step, direction, end, line) => {
        const next = value + step * direction;
        if ((direction > 0 && next === Infinity) || (direction < 0 && next === -Infinity)) return next;
        if (!Number.isFinite(next) || (direction > 0 ? next <= value : next >= value)) {
          if (direction > 0 && value >= end) return Infinity;
          if (direction < 0 && value <= end) return -Infinity;
          throw new Error(line + '行目: 繰り返しのカウンタが数値の範囲内で進めません。');
        }
        return next;
      };
      const sys_int_divide = (left, right, line) => {
        if (typeof left !== 'number' || typeof right !== 'number' || !Number.isFinite(left) || !Number.isFinite(right)) {
          throw new Error(line + '行目: 整数除算には有限の数値を指定してください。');
        }
        if (right === 0) throw new Error(line + '行目: 0で割ることはできません。');
        return Math.trunc(left / right);
      };
      const sys_divide = (left, right, line) => {
        if (typeof left !== 'number' || typeof right !== 'number' || !Number.isFinite(left) || !Number.isFinite(right)) {
          throw new Error(line + '行目: 除算には有限の数値を指定してください。');
        }
        if (right === 0) throw new Error(line + '行目: 0で割ることはできません。');
        const result = left / right;
        if (!Number.isFinite(result)) throw new Error(line + '行目: 除算結果が数値の範囲を超えました。');
        return result;
      };
      const sys_modulo = (left, right, line) => {
        if (typeof left !== 'number' || typeof right !== 'number' || !Number.isFinite(left) || !Number.isFinite(right)) {
          throw new Error(line + '行目: 剰余演算には有限の数値を指定してください。');
        }
        if (right === 0) throw new Error(line + '行目: 0で割ることはできません。');
        return left % right;
      };
    `;
    const lines = code.split('\n');
    let jsCode = "";
    const vars = new Set<string>();
    const codeWithoutStrings = cleanCode.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, value => ' '.repeat(value.length));
    const identifier = '[a-zA-Z_\\u3040-\\u30ff\\u4e00-\\u9faf][a-zA-Z0-9_\\u3040-\\u30ff\\u4e00-\\u9faf]*';
    const validIdentifier = new RegExp(`^${identifier}$`);
    const reservedNames = new Set(['if', 'elif', 'else', 'while', 'for', 'and', 'or', 'not', 'かつ', 'または', 'でない', 'sys_len', 'sys_add', 'sys_subtract', 'sys_multiply', 'sys_power', 'sys_get_index', 'sys_set_index', 'sys_arr', 'sys_input', 'sys_int_input', 'sys_print', 'sys_ransuu', 'sys_step', 'sys_int_divide', 'sys_divide', 'sys_modulo', 'sys_loop_bound', 'sys_loop_next', 'sys_maxArrayLength', 'sys_maxTotalArrayElements', 'sys_totalArrayElements', 'sys_arrayTargets', 'sys_wrap_array', 'sys_clone', 'sys_output_text', 'Math', 'MATH_MAX', 'MATH_TRUNC', 'Array', 'Boolean', 'BigInt', 'Date', 'Error', 'Function', 'Infinity', 'JSON', 'Map', 'NaN', 'Number', 'Object', 'Promise', 'Proxy', 'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'WeakMap', 'WeakSet', 'globalThis', 'print', 'readString', 'readInteger', 'oneBased', 'maxSteps', '__steps', '__pseudo_get_vars', 'do', 'debugger', 'let', 'const', 'var', 'true', 'false', 'null', 'undefined', 'function', 'return', 'new', 'this', 'class', 'delete', 'in', 'instanceof', 'typeof', 'void', 'with', 'yield', 'await', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'import', 'export', 'default', 'extends', 'super', 'static', 'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'arguments', 'eval']);

    const varRegex = /([a-zA-Z_\u3040-\u30ff\u4e00-\u9faf][a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9faf]*)\s*(?:\[[^\]]+\])?\s*=(?!=)/g;
    let match;
    while ((match = varRegex.exec(codeWithoutStrings)) !== null) {
      if (!['if', 'elif', 'else', 'while', 'for', 'and', 'or', 'not', 'sys_len', 'sys_arr', 'sys_input', 'sys_int_input', 'sys_print', 'Math'].includes(match[1])) {
        vars.add(match[1]);
      }
    }
    const arrRegex = /([a-zA-Z_\u3040-\u30ff\u4e00-\u9faf][a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9faf]*)\s*\[/g;
    const arrVars = new Set<string>();
    while ((match = arrRegex.exec(codeWithoutStrings)) !== null) {
      if (!['if', 'elif', 'else', 'while', 'for', 'and', 'or', 'not', 'sys_len', 'sys_arr', 'sys_input', 'sys_int_input', 'sys_print', 'Math'].includes(match[1])) {
        arrVars.add(match[1]);
        vars.add(match[1]);
      }
    }
    const forRegex = /([a-zA-Z0-9_\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+)\s*を.+?から/g;
    while ((match = forRegex.exec(codeWithoutStrings)) !== null) {
      vars.add(match[1]);
    }

    const varNames = Array.from(vars);
    const invalidNames = varNames.filter(name => !validIdentifier.test(name) || reservedNames.has(name));
    if (invalidNames.length) throw new Error(`使用できない変数名です: ${invalidNames.join(', ')}`);
    let loopTemporaryIndex = 0;
    const getLoopTemporaryNames = () => {
      let names: [string, string, string, string];
      do {
        const prefix = `__pseudo_loop_${loopTemporaryIndex++}`;
        names = [`${prefix}_start`, `${prefix}_end`, `${prefix}_step`, `${prefix}_cursor`];
      } while (names.some(name => vars.has(name) || reservedNames.has(name)));
      return names;
    };
    if (varNames.length > 0) {
      jsCode += `let ${varNames.join(', ')};\n`;
      for (const arrVar of Array.from(arrVars)) {
        jsCode += `${arrVar} = sys_arr([]);\n`;
      }
    }
    jsCode += `const __pseudo_get_vars = () => {
      const res = Object.create(null);
      const snapshotBudget = { remaining: 10000 };
      ${varNames.map(v => `
        try {
          if (typeof ${v} !== 'undefined') {
            res[${JSON.stringify(v)}] = typeof ${v} === 'object' && ${v} !== null ? sys_clone(${v}, new WeakMap(), snapshotBudget) : ${v};
          }
        } catch(e) {}
      `).join('')}
      return res;
    };\n`;

    const getYieldCode = (lineIndex: number) => {
      return `if (++__steps > maxSteps) throw new Error("実行ステップ数が上限を超えました。無限ループの可能性があります。");
      yield { line: ${lineIndex}, getVars: __pseudo_get_vars };\n`;
    };
    const getYieldExpression = (lineIndex: number) => `((++__steps > maxSteps) ? (() => { throw new Error("実行ステップ数が上限を超えました。無限ループの可能性があります。"); })() : (yield { line: ${lineIndex}, getVars: __pseudo_get_vars }))`;

    const expressionTokenPattern = /\s+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[a-zA-Z_\u3040-\u30ff\u4e00-\u9faf][a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9faf]*|===|!==|<=|>=|&&|\|\||[+\-*\/%()[\],<>!=.]/y;
    const allowedFunctions = new Set(['sys_len', 'sys_add', 'sys_subtract', 'sys_multiply', 'sys_power', 'sys_get_index', 'sys_set_index', 'sys_arr', 'sys_input', 'sys_int_input', 'sys_print', 'sys_ransuu', 'sys_int_divide', 'sys_divide', 'sys_modulo', 'MATH_MAX', 'MATH_TRUNC']);
    const functionArities = new Map<string, [number, number]>([
      ['sys_len', [1, 1]], ['sys_add', [3, 3]], ['sys_subtract', [3, 3]], ['sys_multiply', [3, 3]], ['sys_power', [3, 3]], ['sys_get_index', [3, 3]], ['sys_set_index', [4, 4]],
      ['sys_arr', [1, 1]], ['sys_input', [1, 1]], ['sys_int_input', [0, 0]], ['sys_print', [0, Infinity]],
      ['sys_ransuu', [0, 0]], ['sys_int_divide', [3, 3]], ['sys_divide', [3, 3]], ['sys_modulo', [3, 3]],
      ['MATH_MAX', [1, Infinity]], ['MATH_TRUNC', [1, 1]],
    ]);
    const validateExpression = (expression: string, lineNumber: number, allowTopLevelCommas = false) => {
      const normalizedLogicalExpression = normalizeLogicalNot(normalizeDnclLogicalOperators(expression));
      const originalExpressionWithoutStrings = normalizedLogicalExpression.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, ' ');
      if (/\+\+|--/.test(originalExpressionWithoutStrings)) {
        throw new Error(`${lineNumber}行目: 変数を直接変更する++/--演算子には対応していません。`);
      }
      const boundedAdditionExpression = convertStringAddition(normalizedLogicalExpression, lineNumber);
      const expressionWithoutStrings = boundedAdditionExpression.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, ' ');
      if (/\b(?:MATH_(?:MAX|TRUNC)|sys_(?:get|set)_index)\s*\(/.test(expressionWithoutStrings)) {
        throw new Error(`${lineNumber}行目: 内部関数名は使用できません。`);
      }
      const convertedExpression = convertIndexReads(boundedAdditionExpression, lineNumber);
      const normalized = convertedExpression.replace(/\bMath\.max\b/g, 'MATH_MAX').replace(/\bMath\.trunc\b/g, 'MATH_TRUNC');
      const tokens: string[] = [];
      let cursor = 0;
      while (cursor < normalized.length) {
        expressionTokenPattern.lastIndex = cursor;
        const token = expressionTokenPattern.exec(normalized);
        if (!token) throw new Error(`${lineNumber}行目: 未対応の記号「${normalized[cursor]}」です。`);
        cursor = expressionTokenPattern.lastIndex;
        if (!/^\s+$/.test(token[0])) tokens.push(token[0]);
      }

      if (tokens.length === 0) throw new Error(`${lineNumber}行目: 式がありません。`);

      const comparisonCounts = [0];
      const commaAllowed = [allowTopLevelCommas];
      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token === '(') {
          comparisonCounts.push(0);
          commaAllowed.push(allowedFunctions.has(tokens[index - 1]));
        } else if (token === '[') {
          comparisonCounts.push(0);
          commaAllowed.push(true);
        } else if (token === ')' || token === ']') {
          comparisonCounts.pop();
          commaAllowed.pop();
        } else if (token === ',') {
          if (!commaAllowed[commaAllowed.length - 1]) {
            throw new Error(`${lineNumber}行目: 複数の式は関数の引数または配列の要素として区切ってください。`);
          }
          const previous = tokens[index - 1];
          const next = tokens[index + 1];
          if (!previous || !next || ['(', '[', ',', '&&', '||', '===', '!==', '<', '>', '<=', '>=', '+', '-', '*', '/', '%'].includes(previous) || [')', ']', ',', '&&', '||', '===', '!==', '<', '>', '<=', '>=', '+', '-', '*', '/', '%'].includes(next)) {
            throw new Error(`${lineNumber}行目: カンマの前後に式が必要です。`);
          }
          comparisonCounts[comparisonCounts.length - 1] = 0;
        } else if (token === '&&' || token === '||') {
          comparisonCounts[comparisonCounts.length - 1] = 0;
        } else if (['===', '!==', '<', '>', '<=', '>='].includes(token)) {
          const currentDepth = comparisonCounts.length - 1;
          comparisonCounts[currentDepth]++;
          if (comparisonCounts[currentDepth] > 1) {
            throw new Error(`${lineNumber}行目: 比較演算子を連続して使う場合は、式を括弧で区切ってください。`);
          }
        }
      }

      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        const unaryNot = token === '!' && (
          index === 0 || ['(', '[', ',', '!', '&&', '||', '===', '!==', '<', '>', '<=', '>=', '+', '-', '*', '/', '%'].includes(tokens[index - 1])
        );
        if (token === '.' || token === '=' || (token === '!' && !unaryNot)) {
          throw new Error(`${lineNumber}行目: 未対応の演算子「${token}」です。`);
        }
        if (/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token) && !Number.isFinite(Number(token))) {
          throw new Error(`${lineNumber}行目: 数値リテラルが扱える範囲を超えています。`);
        }
        if (/^(?:"|')/.test(token)) continue;
        if (/^[a-zA-Z_\u3040-\u30ff\u4e00-\u9faf]/.test(token)) {
          if (allowedFunctions.has(token)) {
            if (tokens[index + 1] !== '(') throw new Error(`${lineNumber}行目: 関数「${token}」の書き方が正しくありません。`);
            const [minimumArguments, maximumArguments] = functionArities.get(token)!;
            let nesting = 0;
            let squareNesting = 0;
            let commaCount = 0;
            let closingIndex = -1;
            for (let argumentIndex = index + 1; argumentIndex < tokens.length; argumentIndex++) {
              if (tokens[argumentIndex] === '[') squareNesting++;
              else if (tokens[argumentIndex] === ']') squareNesting--;
              else if (tokens[argumentIndex] === '(') nesting++;
              else if (tokens[argumentIndex] === ')') {
                nesting--;
                if (nesting === 0) {
                  closingIndex = argumentIndex;
                  break;
                }
              } else if (tokens[argumentIndex] === ',' && nesting === 1 && squareNesting === 0) {
                commaCount++;
              }
            }
            if (closingIndex >= 0) {
              const argumentCount = closingIndex === index + 2 ? 0 : commaCount + 1;
              if (argumentCount < minimumArguments || argumentCount > maximumArguments) {
                const expected = minimumArguments === maximumArguments
                  ? `${minimumArguments}個`
                  : `${minimumArguments}個以上`;
                throw new Error(`${lineNumber}行目: 関数「${token}」には${expected}の引数が必要です（${argumentCount}個指定されています）。`);
              }
            }
          } else if (!vars.has(token) && token !== 'true' && token !== 'false') {
            throw new Error(`${lineNumber}行目: 未定義または未対応の名前「${token}」です。`);
          } else if (tokens[index + 1] === '(') {
            throw new Error(`${lineNumber}行目: 変数「${token}」を関数として呼び出せません。`);
          }
        }
        if ((token === ']' || token === ')') && tokens[index + 1] === '(') {
          throw new Error(`${lineNumber}行目: 配列や括弧の値を関数として呼び出せません。`);
        }
      }
      return convertedExpression;
    };

    const findAssignment = (statement: string) => {
      let quote = '';
      let escaped = false;
      let nesting = 0;
      for (let index = 0; index < statement.length; index++) {
        const char = statement[index];
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; continue; }
        if (quote) continue;
        if (char === '(' || char === '[') nesting++;
        else if (char === ')' || char === ']') nesting--;
        else if (char === '=' && nesting === 0 && statement[index - 1] !== '=' && statement[index - 1] !== '!' && statement[index - 1] !== '<' && statement[index - 1] !== '>' && statement[index + 1] !== '=') return index;
      }
      return -1;
    };

    const matchingOpenParen = (source: string, closeIndex: number, openChar: string, closeChar: string) => {
      const openIndexes: number[] = [];
      let quote = '';
      let escaped = false;
      for (let index = 0; index <= closeIndex; index++) {
        const char = source[index];
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if ((char === '"' || char === "'") && (!quote || quote === char)) {
          quote = quote ? '' : char;
          continue;
        }
        if (quote) continue;
        if (char === openChar) openIndexes.push(index);
        else if (char === closeChar) {
          const openIndex = openIndexes.pop();
          if (index === closeIndex) return openIndex ?? -1;
        }
      }
      return -1;
    };

    const matchingCloseParen = (source: string, openIndex: number, openChar: string, closeChar: string) => {
      const openIndexes: number[] = [];
      let quote = '';
      let escaped = false;
      for (let index = openIndex; index < source.length; index++) {
        const char = source[index];
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if ((char === '"' || char === "'") && (!quote || quote === char)) {
          quote = quote ? '' : char;
          continue;
        }
        if (quote) continue;
        if (char === openChar) openIndexes.push(index);
        else if (char === closeChar) {
          const matchedOpen = openIndexes.pop();
          if (openIndexes.length === 0 && matchedOpen === openIndex) return index;
        }
      }
      return -1;
    };

    const splitTopLevelComma = (source: string) => {
      const parts: string[] = [];
      let quote = '';
      let escaped = false;
      let depth = 0;
      let start = 0;
      for (let index = 0; index < source.length; index++) {
        const char = source[index];
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; continue; }
        if (quote) continue;
        if (char === '(' || char === '[') depth++;
        else if (char === ')' || char === ']') depth--;
        else if (char === ',' && depth === 0) {
          parts.push(source.slice(start, index));
          start = index + 1;
        }
      }
      parts.push(source.slice(start));
      return parts;
    };

    const parseAssignmentTarget = (target: string, lineNumber: number) => {
      const baseMatch = target.match(new RegExp(`^(${identifier})`));
      if (!baseMatch) return null;
      const base = baseMatch[1];
      const indexes: string[] = [];
      let cursor = baseMatch[0].length;

      while (cursor < target.length) {
        while (cursor < target.length && /\s/.test(target[cursor])) cursor++;
        if (target[cursor] !== '[') break;
        const closeIndex = matchingCloseParen(target, cursor, '[', ']');
        if (closeIndex < 0) return null;
        indexes.push(...splitTopLevelComma(target.slice(cursor + 1, closeIndex)).map(index => validateExpression(index, lineNumber)));
        cursor = closeIndex + 1;
      }

      if (target.slice(cursor).trim() !== '') return null;
      return { base, indexes };
    };

    const isNameChar = (char: string | undefined) => Boolean(char && /[a-zA-Z0-9_\u3040-\u30ff\u4e00-\u9faf]/.test(char));
    const operandBoundaryBeforeSign = (source: string, index: number) => {
      let cursor = index - 1;
      while (cursor >= 0 && /\s/.test(source[cursor])) cursor--;
      return cursor < 0 || /[([,+\-*/%<>=!&|]/.test(source[cursor]);
    };

    const readLeftAtomStart = (source: string, end: number): number => {
      let cursor = end - 1;
      while (cursor >= 0 && /\s/.test(source[cursor])) cursor--;
      if (cursor < 0) return -1;
      let start = cursor;
      if (source[cursor] === ')') {
        start = matchingOpenParen(source, cursor, '(', ')');
        if (start < 0) return -1;
        let calleeEnd = start - 1;
        while (calleeEnd >= 0 && /\s/.test(source[calleeEnd])) calleeEnd--;
        if (isNameChar(source[calleeEnd])) {
          while (isNameChar(source[calleeEnd])) calleeEnd--;
          if (source[calleeEnd] === '.') {
            calleeEnd--;
            while (isNameChar(source[calleeEnd])) calleeEnd--;
          }
          start = calleeEnd + 1;
        }
      } else if (source[cursor] === ']') {
        start = matchingOpenParen(source, cursor, '[', ']');
        if (start < 0) return -1;
        while (start > 0 && source[start - 1] === ']') {
          const previousOpen = matchingOpenParen(source, start - 1, '[', ']');
          if (previousOpen < 0) return -1;
          start = previousOpen;
        }
        let nameStart = start - 1;
        while (nameStart >= 0 && isNameChar(source[nameStart])) nameStart--;
        start = nameStart + 1;
      } else {
        const numericToken = source.slice(0, cursor + 1).match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/);
        const numericStart = numericToken ? cursor + 1 - numericToken[0].length : -1;
        if (numericStart >= 0 && (numericStart === 0 || !isNameChar(source[numericStart - 1]))) {
          start = numericStart;
        } else {
          while (cursor >= 0 && (isNameChar(source[cursor]) || /[.]/.test(source[cursor]))) cursor--;
          start = cursor + 1;
        }
      }
      let sign = start - 1;
      while (sign >= 0 && /\s/.test(source[sign])) sign--;
      if ((source[sign] === '-' || source[sign] === '+') && operandBoundaryBeforeSign(source, sign)) start = sign;
      return start;
    };

    const readIndexBaseStart = (source: string, indexStart: number) => {
      const prefix = source.slice(0, indexStart).replace(/\s+$/, '');
      const stringLiteral = prefix.match(/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')$/);
      if (stringLiteral) return prefix.length - stringLiteral[0].length;
      return readLeftAtomStart(source, indexStart);
    };

    const convertIndexReads = (expression: string, lineNumber: number): string => {
      let quote = '';
      let escaped = false;
      for (let index = 0; index < expression.length; index++) {
        const char = expression[index];
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if ((char === '"' || char === "'") && (!quote || quote === char)) {
          quote = quote ? '' : char;
          continue;
        }
        if (quote || char !== '[') continue;

        let previous = index - 1;
        while (previous >= 0 && /\s/.test(expression[previous])) previous--;
        const previousChar = expression[previous];
        if (previous < 0 || (!isNameChar(previousChar) && previousChar !== ']' && previousChar !== ')' && previousChar !== '"' && previousChar !== "'")) continue;

        const closeIndex = matchingCloseParen(expression, index, '[', ']');
        const baseStart = readIndexBaseStart(expression, index);
        if (closeIndex < 0 || baseStart < 0 || baseStart >= index) continue;

        let base = convertIndexReads(expression.slice(baseStart, index).trim(), lineNumber);
        const itemIndexes = splitTopLevelComma(expression.slice(index + 1, closeIndex));
        for (const itemIndex of itemIndexes) {
          const convertedIndex = convertIndexReads(itemIndex, lineNumber);
          base = `sys_get_index(${base}, (${convertedIndex}), ${lineNumber})`;
        }
        const replacement = base;
        return convertIndexReads(`${expression.slice(0, baseStart)}${replacement}${expression.slice(closeIndex + 1)}`, lineNumber);
      }
      return expression;
    };

    const readLeftOperandStart = (source: string, end: number): number => {
      let start = readLeftAtomStart(source, end);
      if (start < 0) return start;
      while (true) {
        let operatorIndex = start - 1;
        while (operatorIndex >= 0 && /\s/.test(source[operatorIndex])) operatorIndex--;
        if (source[operatorIndex] === '*' && source[operatorIndex - 1] === '*') {
          start = readLeftOperandStart(source, operatorIndex - 1);
          if (start < 0) return start;
          continue;
        }
        if (!['*', '/', '%'].includes(source[operatorIndex])) break;
        const previousAtomStart = readLeftAtomStart(source, operatorIndex);
        if (previousAtomStart < 0) break;
        start = previousAtomStart;
      }
      return start;
    };

    const readRightOperandEnd = (source: string, start: number): number => {
      let cursor = start;
      while (cursor < source.length && /\s/.test(source[cursor])) cursor++;
      if (source[cursor] === '-' || source[cursor] === '+') {
        const signedEnd = readRightOperandEnd(source, cursor + 1);
        return signedEnd < 0 ? -1 : signedEnd;
      }
      let operandEnd = -1;
      if (source[cursor] === '(' || source[cursor] === '[') {
        const close = source[cursor] === '(' ? ')' : ']';
        operandEnd = matchingCloseParen(source, cursor, source[cursor], close);
        if (operandEnd < 0) return -1;
      } else {
        const numericToken = source.slice(cursor).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
        if (numericToken) {
          operandEnd = cursor + numericToken[0].length - 1;
        } else {
          const nameStart = cursor;
          while (cursor < source.length && isNameChar(source[cursor])) cursor++;
          if (cursor === nameStart) return -1;
          if (source[cursor] === '.') {
            cursor++;
            while (cursor < source.length && isNameChar(source[cursor])) cursor++;
          }
          while (cursor < source.length && /\s/.test(source[cursor])) cursor++;
          if (source[cursor] === '(') {
            const callEnd = matchingCloseParen(source, cursor, '(', ')');
            if (callEnd < 0) return -1;
            cursor = callEnd + 1;
          }
          while (source[cursor] === '[') {
            const indexEnd = matchingCloseParen(source, cursor, '[', ']');
            if (indexEnd < 0) return -1;
            cursor = indexEnd + 1;
          }
          operandEnd = cursor - 1;
        }
      }
      let powerOperatorIndex = operandEnd + 1;
      while (powerOperatorIndex < source.length && /\s/.test(source[powerOperatorIndex])) powerOperatorIndex++;
      if (source.slice(powerOperatorIndex, powerOperatorIndex + 2) === '**') {
        return readRightOperandEnd(source, powerOperatorIndex + 2);
      }
      return operandEnd;
    };

    const normalizeUnaryExponentiation = (expression: string): string => {
      let normalized = expression;
      let searchFrom = 0;
      while (true) {
        const powerIndex = normalized.indexOf('**', searchFrom);
        if (powerIndex < 0) return normalized;
        const baseStart = readLeftAtomStart(normalized, powerIndex);
        if (baseStart < 0 || (normalized[baseStart] !== '-' && normalized[baseStart] !== '+') || !operandBoundaryBeforeSign(normalized, baseStart)) {
          searchFrom = powerIndex + 2;
          continue;
        }
        let baseEnd = powerIndex - 1;
        while (baseEnd >= baseStart && /\s/.test(normalized[baseEnd])) baseEnd--;
        const base = normalizeUnaryExponentiation(normalized.slice(baseStart + 1, baseEnd + 1).trim());
        const exponentEnd = readRightOperandEnd(normalized, powerIndex + 2);
        if (exponentEnd < powerIndex + 2) {
          searchFrom = powerIndex + 2;
          continue;
        }
        const sign = normalized[baseStart];
        const exponent = normalizeUnaryExponentiation(normalized.slice(powerIndex + 2, exponentEnd + 1).trim());
        const replacement = `${sign}(${base} ** ${exponent})`;
        normalized = `${normalized.slice(0, baseStart)}${replacement}${normalized.slice(exponentEnd + 1)}`;
        searchFrom = baseStart + replacement.length;
      }
    };

    const convertStringAddition = (expression: string, lineNumber: number): string => {
      const normalize = (source: string): string => {
        const commaParts: string[] = [];
        let quote = '';
        let escaped = false;
        let depth = 0;
        let commaStart = 0;
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (escaped) { escaped = false; continue; }
          if (char === '\\' && quote) { escaped = true; continue; }
          if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; continue; }
          if (quote) continue;
          if (char === '(' || char === '[') depth++;
          else if (char === ')' || char === ']') depth--;
          else if (char === ',' && depth === 0) {
            commaParts.push(source.slice(commaStart, index));
            commaStart = index + 1;
          }
        }
        if (commaParts.length > 0) {
          commaParts.push(source.slice(commaStart));
          return commaParts.map(part => normalize(part)).join(', ');
        }

        const precedenceParts: string[] = [];
        const precedenceOperators: string[] = [];
        const lowPrecedenceOperators = ['===', '!==', '&&', '||', '<=', '>=', '==', '!=', '<', '>'];
        quote = '';
        escaped = false;
        depth = 0;
        let precedenceStart = 0;
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (escaped) { escaped = false; continue; }
          if (char === '\\' && quote) { escaped = true; continue; }
          if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; continue; }
          if (quote) continue;
          if (char === '(' || char === '[') { depth++; continue; }
          if (char === ')' || char === ']') { depth--; continue; }
          if (depth !== 0) continue;
          const operator = lowPrecedenceOperators.find(candidate => source.startsWith(candidate, index));
          if (!operator) continue;
          precedenceParts.push(source.slice(precedenceStart, index));
          precedenceOperators.push(operator);
          index += operator.length - 1;
          precedenceStart = index + 1;
        }
        if (precedenceOperators.length > 0) {
          precedenceParts.push(source.slice(precedenceStart));
          return precedenceParts.map(part => normalize(part)).reduce(
            (result, part, index) => index === 0 ? part : `${result} ${precedenceOperators[index - 1]} ${part}`,
            '',
          );
        }

        let grouped = '';
        quote = '';
        escaped = false;
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (escaped) { escaped = false; grouped += char; continue; }
          if (char === '\\' && quote) { escaped = true; grouped += char; continue; }
          if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; grouped += char; continue; }
          if (!quote && (char === '(' || char === '[')) {
            const closeChar = char === '(' ? ')' : ']';
            const closeIndex = matchingCloseParen(source, index, char, closeChar);
            if (closeIndex >= 0) {
              grouped += char + normalize(source.slice(index + 1, closeIndex)) + closeChar;
              index = closeIndex;
              continue;
            }
          }
          grouped += char;
        }

        const terms: string[] = [];
        const operators: Array<'+' | '-'> = [];
        quote = '';
        escaped = false;
        depth = 0;
        let termStart = 0;
        for (let index = 0; index < grouped.length; index++) {
          const char = grouped[index];
          if (escaped) { escaped = false; continue; }
          if (char === '\\' && quote) { escaped = true; continue; }
          if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; continue; }
          if (quote) continue;
          if (char === '(' || char === '[') { depth++; continue; }
          if (char === ')' || char === ']') { depth--; continue; }
          if (depth !== 0 || (char !== '+' && char !== '-')) continue;

          let previous = index - 1;
          while (previous >= 0 && /\s/.test(grouped[previous])) previous--;
          const previousChar = grouped[previous];
          const nextChar = grouped[index + 1];
          const isExponentSign = /(?:\d+(?:\.\d*)?|\.\d+)[eE]$/.test(grouped.slice(0, index)) && /\d/.test(nextChar ?? '');
          if (isExponentSign || previous < 0 || /[([,+\-*/%<>=!&|]/.test(previousChar ?? '')) continue;
          terms.push(grouped.slice(termStart, index).trim());
          operators.push(char);
          termStart = index + 1;
        }
        if (operators.length === 0) return grouped;
        terms.push(grouped.slice(termStart).trim());
        let result = terms[0];
        for (let index = 0; index < operators.length; index++) {
          const right = terms[index + 1];
          result = operators[index] === '+'
            ? `sys_add((${result}), (${right}), ${lineNumber})`
            : `sys_subtract((${result}), (${right}), ${lineNumber})`;
        }
        return result;
      };
      return normalize(expression);
    };

    const convertIntegerDivision = (expression: string, lineNumber: number) => {
      let converted = expression;
      const findMultiplicativeIndex = (source: string) => {
        const integerIndex = source.indexOf('÷');
        const floatIndex = source.indexOf('/');
        const moduloIndex = source.indexOf('%');
        const candidates = [integerIndex, floatIndex, moduloIndex].filter(index => index >= 0);
        for (let index = 0; index < source.length; index++) {
          if (source[index] === '*' && source[index - 1] !== '*' && source[index + 1] !== '*') candidates.push(index);
        }
        return candidates.length === 0 ? -1 : Math.min(...candidates);
      };
      let operatorIndex = findMultiplicativeIndex(converted);
      while (operatorIndex >= 0) {
        const leftStart = readLeftOperandStart(converted, operatorIndex);
        const rightEnd = readRightOperandEnd(converted, operatorIndex + 1);
        if (leftStart < 0 || rightEnd < operatorIndex + 1) {
          throw new Error(`${lineNumber}行目: ÷の左右の式を解釈できません。`);
        }
        const left = converted.slice(leftStart, operatorIndex).trim();
        const right = converted.slice(operatorIndex + 1, rightEnd + 1).trim();
        const operator = converted[operatorIndex];
        const helper = operator === '÷' ? 'sys_int_divide'
          : operator === '%' ? 'sys_modulo'
            : operator === '*' ? 'sys_multiply' : 'sys_divide';
        converted = `${converted.slice(0, leftStart)}${helper}((${left}), (${right}), ${lineNumber})${converted.slice(rightEnd + 1)}`;
        const nextIndex = findMultiplicativeIndex(converted.slice(leftStart));
        operatorIndex = nextIndex < 0 ? -1 : leftStart + nextIndex;
      }

      while (true) {
        const powerIndex = converted.lastIndexOf('**');
        if (powerIndex < 0) break;
        const baseStart = readLeftAtomStart(converted, powerIndex);
        const exponentEnd = readRightOperandEnd(converted, powerIndex + 2);
        if (baseStart < 0 || exponentEnd < powerIndex + 2) {
          throw new Error(`${lineNumber}行目: べき乗の左右の式を解釈できません。`);
        }
        let base = converted.slice(baseStart, powerIndex).trim();
        let unarySign = '';
        if ((base[0] === '-' || base[0] === '+') && operandBoundaryBeforeSign(converted, baseStart)) {
          unarySign = base[0];
          base = base.slice(1).trim();
        }
        const exponent = converted.slice(powerIndex + 2, exponentEnd + 1).trim();
        const replacement = `${unarySign}sys_power((${base}), (${exponent}), ${lineNumber})`;
        converted = `${converted.slice(0, baseStart)}${replacement}${converted.slice(exponentEnd + 1)}`;
      }
      return normalizeUnaryExponentiation(converted);
    };

    const replaceBoundaryOperator = (expression: string, operator: string, replacement: string) => {
      const identifierCharacters = 'a-zA-Z0-9_\\u3040-\\u30ff\\u4e00-\\u9faf';
      const pattern = new RegExp(`(^|[^${identifierCharacters}])${operator}(?=$|[^${identifierCharacters}])`, 'g');
      return expression.replace(pattern, (_match, prefix: string) => `${prefix}${replacement}`);
    };

    // DNCL gives かつ, または, and postfix でない the same precedence and
    // evaluates them from left to right. Parenthesize each step before JS sees it.
    const normalizeDnclLogicalOperators = (expression: string) => {
      if (!/[\uE100-\uE102]/.test(expression)) return expression;
      const normalize = (source: string): string => {
        const commaParts: string[] = [];
        let commaQuote = '';
        let commaEscaped = false;
        let commaDepth = 0;
        let commaStart = 0;
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (commaEscaped) { commaEscaped = false; continue; }
          if (char === '\\' && commaQuote) { commaEscaped = true; continue; }
          if ((char === '"' || char === "'") && (!commaQuote || commaQuote === char)) { commaQuote = commaQuote ? '' : char; continue; }
          if (commaQuote) continue;
          if (char === '(' || char === '[') commaDepth++;
          else if (char === ')' || char === ']') commaDepth--;
          else if (char === ',' && commaDepth === 0) {
            commaParts.push(source.slice(commaStart, index));
            commaStart = index + 1;
          }
        }
        if (commaParts.length > 0) {
          commaParts.push(source.slice(commaStart));
          return commaParts.map(part => normalize(part)).join(', ');
        }

        let quote = '';
        let escaped = false;
        let depth = 0;
        const parts: string[] = [];
        const operators: string[] = [];
        let start = 0;
        for (let index = 0; index < source.length; index++) {
          const char = source[index];
          if (escaped) { escaped = false; continue; }
          if (char === '\\' && quote) { escaped = true; continue; }
          if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; continue; }
          if (quote) continue;
          if (char === '(' || char === '[') { depth++; continue; }
          if (char === ')' || char === ']') { depth--; continue; }
          if (depth !== 0) continue;
          const match = /^(?:&&|\|\||[\uE100-\uE102])/.exec(source.slice(index));
          if (!match) continue;
          parts.push(source.slice(start, index).trim());
          operators.push(match[0]);
          index += match[0].length - 1;
          start = index + 1;
        }
        if (operators.length === 0) {
          // Logical expressions inside an explicit group still follow DNCL order.
          let rebuilt = '';
          let quote = '';
          let escaped = false;
          for (let index = 0; index < source.length; index++) {
            const char = source[index];
            if (escaped) { escaped = false; rebuilt += char; continue; }
            if (char === '\\' && quote) { escaped = true; rebuilt += char; continue; }
            if ((char === '"' || char === "'") && (!quote || quote === char)) { quote = quote ? '' : char; rebuilt += char; continue; }
            if (!quote && (char === '(' || char === '[')) {
              const close = char === '(' ? ')' : ']';
              let innerDepth = 1;
              let innerQuote = '';
              let innerEscaped = false;
              let end = index + 1;
              for (; end < source.length; end++) {
                const next = source[end];
                if (innerEscaped) { innerEscaped = false; continue; }
                if (next === '\\' && innerQuote) { innerEscaped = true; continue; }
                if ((next === '"' || next === "'") && (!innerQuote || innerQuote === next)) { innerQuote = innerQuote ? '' : next; continue; }
                if (innerQuote) continue;
                if (next === char) innerDepth++;
                else if (next === close && --innerDepth === 0) break;
              }
              if (end < source.length) {
                rebuilt += char + normalize(source.slice(index + 1, end)) + close;
                index = end;
                continue;
              }
            }
            rebuilt += char;
          }
          return rebuilt;
        }
        parts.push(source.slice(start).trim());
        let result = normalize(parts[0]);
        for (let index = 0; index < operators.length; index++) {
          const right = normalize(parts[index + 1]);
          const operator = operators[index];
          if (operator === '\uE102') {
            if (!parts[index + 1]) result = `!(${result})`;
            else if (index === 0 && !result && right) result = `!(${right})`;
            else if (result && right) throw new Error('「でない」の後ろに論理演算子が必要です。');
            else throw new Error('「でない」の前後に式が必要です。');
          } else {
            if (!result || !right) throw new Error('論理演算子の前後に式が必要です。');
            const javascriptOperator = operator === '\uE100' ? '&&' : operator === '\uE101' ? '||' : operator;
            result = `((${result}) ${javascriptOperator} (${right}))`;
          }
        }
        return result;
      };
      return normalize(expression);
    };

    const normalizeLogicalNot = (expression: string) => {
      let normalized = expression;
      const maskStrings = (source: string) => source.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, literal => ' '.repeat(literal.length));
      let scan = maskStrings(normalized);
      let cursor = scan.length - 1;
      while (cursor >= 0) {
        if (scan[cursor] !== '!' || scan[cursor + 1] === '=') {
          cursor--;
          continue;
        }

        let prefixIndex = cursor - 1;
        while (prefixIndex >= 0 && /\s/.test(scan[prefixIndex])) prefixIndex--;
        const followsIfKeyword = prefixIndex >= 0 && scan.slice(0, prefixIndex + 1).trimEnd().endsWith('もし');
        if (prefixIndex >= 0 && !followsIfKeyword && !/[([,{!&|=<>+\-*\/%]/.test(scan[prefixIndex])) {
          cursor--;
          continue;
        }

        let end = cursor + 1;
        let parenthesisDepth = 0;
        let bracketDepth = 0;
        for (; end < scan.length; end++) {
          const char = scan[end];
          if (char === '(') parenthesisDepth++;
          else if (char === ')') {
            if (parenthesisDepth === 0) break;
            parenthesisDepth--;
          } else if (char === '[') bracketDepth++;
          else if (char === ']') {
            if (bracketDepth === 0) break;
            bracketDepth--;
          } else if (parenthesisDepth === 0 && bracketDepth === 0) {
            if (char === ',') break;
            if ((char === '&' && scan[end + 1] === '&') || (char === '|' && scan[end + 1] === '|')) break;
          }
        }

        const operand = normalized.slice(cursor + 1, end).trim();
        if (operand) {
          const replacement = `!(${operand})`;
          normalized = `${normalized.slice(0, cursor)}${replacement}${normalized.slice(end)}`;
          scan = `${scan.slice(0, cursor)}${maskStrings(replacement)}${scan.slice(end)}`;
        }
        cursor--;
      }
      return normalized;
    };

    const wrapArrayLiterals = (source: string) => {
      const literals: Array<{ start: number; end: number }> = [];
      let cursor = 0;
      while (cursor < source.length) {
        if (source[cursor] !== '[') {
          cursor++;
          continue;
        }
        let previous = cursor - 1;
        while (previous >= 0 && /\s/.test(source[previous])) previous--;
        if (previous >= 0 && (isNameChar(source[previous]) || source[previous] === ']' || source[previous] === ')' || source[previous] === '\uE001')) {
          cursor++;
          continue;
        }
        let depth = 0;
        let end = cursor;
        for (; end < source.length; end++) {
          if (source[end] === '[') depth++;
          else if (source[end] === ']' && --depth === 0) break;
        }
        if (end >= source.length) {
          cursor++;
          continue;
        }
        literals.push({ start: cursor, end: end + 1 });
        cursor = end + 1;
      }
      let result = source;
      for (let index = literals.length - 1; index >= 0; index--) {
        const { start, end } = literals[index];
        result = `${result.slice(0, start)}sys_arr(${result.slice(start, end)})${result.slice(end)}`;
      }
      return result;
    };

    const blockStack: Array<{ indent: number; kind: 'if' | 'loop' | 'scoped-loop'; hasBody: boolean }> = [];

    const closeBlock = (lineNumber: number) => {
      const block = blockStack.pop();
      if (block && !block.hasBody) throw new Error(`${lineNumber}行目: ${block.kind === 'if' ? '条件分岐' : '繰り返し'}の本体がありません。字下げを確認してください。`);
      jsCode += block?.kind === 'scoped-loop' ? '}}\n' : '}\n';
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const text = rawLine.replace(/^([\t 　｜|⎿└│]*)/, prefix => prefix.replace(/[｜|⎿└│]/g, ' ').replace(/　/g, ' '));
      const indent = text.length - text.trimStart().length;
      let content = text.trim();

      content = stripComment(content).trim();

      if (!content) continue;

      const codeWithoutStringLiterals = content.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, ' ');
      if (/\b(?:sys_[a-zA-Z_][a-zA-Z0-9_]*|MATH_(?:MAX|TRUNC))\s*\(/.test(codeWithoutStringLiterals)) {
        throw new Error(`${i + 1}行目: 内部関数名は使用できません。`);
      }

      const isElseOrElif = /^そうでなくもし.*ならば:?\s*$/.test(content) || /^そうでなければ:?\s*$/.test(content);

      for (const block of blockStack) if (indent > block.indent) block.hasBody = true;

      while (blockStack.length > 0 && indent < blockStack[blockStack.length - 1].indent) {
        closeBlock(i + 1);
      }

      if (isElseOrElif && blockStack.length > 0 && blockStack[blockStack.length - 1].kind === 'if' && indent === blockStack[blockStack.length - 1].indent) {
        const block = blockStack[blockStack.length - 1];
        if (!block.hasBody) throw new Error(`${i + 1}行目: 条件分岐の本体がありません。字下げを確認してください。`);
        blockStack.pop();
        jsCode += '} ';
      } else {
        if (isElseOrElif) throw new Error(`${i + 1}行目: 対応する「もし〜ならば」がありません。字下げを確認してください。`);
        while (blockStack.length > 0 && indent <= blockStack[blockStack.length - 1].indent) {
          closeBlock(i + 1);
        }
      }
      if (blockStack.length === 0 && indent > 0) {
        throw new Error(`${i + 1}行目: 対応するブロックがない位置に字下げがあります。`);
      }

      let parsed = "";
      let opensBlock = false;
      let yieldsInHeader = false;

      const stringLiterals: string[] = [];
      content = content.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, literal => {
        const index = stringLiterals.push(literal) - 1;
        return `\uE000${index}\uE001`;
      });

      content = content.replace(/===|!==|==|!=/g, operator => operator === '==' ? '===' : operator === '!=' ? '!==' : operator)
                       .replace(/【外部からの入力】/g, 'sys_input("値")')
                       .replace(/【整数を入力】/g, 'sys_int_input()')
                       .replace(/【文字列を入力】/g, 'sys_input("文字列")')
                       .replace(/要素数\s*\(/g, 'sys_len(')
                       .replace(/最大値\s*\(/g, 'Math.max(')
                       .replace(/整数\s*\(/g, 'Math.trunc(')
                       .replace(/乱数\s*\(/g, 'sys_ransuu(');
      content = replaceBoundaryOperator(content, 'and', '&&');
      content = replaceBoundaryOperator(content, 'or', '||');
      content = replaceBoundaryOperator(content, 'not', '!');
      content = replaceBoundaryOperator(content, 'かつ', '\uE100');
      content = replaceBoundaryOperator(content, 'または', '\uE101');
      content = replaceBoundaryOperator(content, 'でない', '\uE102');

      content = wrapArrayLiterals(content);

      content = convertIntegerDivision(content, i + 1);
      content = content.replace(/\uE000(\d+)\uE001/g, (_, index: string) => stringLiterals[Number(index)]);

      if (content.includes('÷')) throw new Error(`${i + 1}行目: ÷の式を解釈できません。左右を括弧で囲んでください。`);

      if (content.startsWith('もし') && content.match(/ならば:?\s*$/)) {
        const cond = validateExpression(content.substring(2).replace(/ならば:?\s*$/, '').trim(), i + 1);
        parsed = `if ((${getYieldExpression(i)}, ${cond})) {`;
        yieldsInHeader = true;
        opensBlock = true;
      } else if (content.startsWith('そうでなくもし') && content.match(/ならば:?\s*$/)) {
        const cond = validateExpression(content.substring(7).replace(/ならば:?\s*$/, '').trim(), i + 1);
        parsed = `else if ((${getYieldExpression(i)}, ${cond})) {`;
        yieldsInHeader = true;
        opensBlock = true;
      } else if (content.match(/^そうでなければ:?\s*$/)) {
        parsed = `else {`;
        opensBlock = true;
      } else if (content.match(/^(.+?)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ増やしながら繰り返す:?$/)) {
        const m = content.match(/^(.+?)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ増やしながら繰り返す:?$/);
        if (!validIdentifier.test(m![1].trim()) || reservedNames.has(m![1].trim())) throw new Error(`${i + 1}行目: 繰り返し変数名が正しくありません。`);
        const start = validateExpression(m![2], i + 1);
        const end = validateExpression(m![3], i + 1);
        const step = validateExpression(m![4], i + 1);
        const [startName, endName, stepName, cursorName] = getLoopTemporaryNames();
        parsed = `{ const ${startName} = sys_loop_bound((${start}), ${i + 1}); const ${endName} = sys_loop_bound((${end}), ${i + 1}); const ${stepName} = sys_step((${step}), ${i + 1}); for (let ${cursorName} = ${startName}; (${m![1].trim()} = ${cursorName}, ${getYieldExpression(i)}, ${cursorName} <= ${endName}); ${cursorName} = sys_loop_next(${cursorName}, ${stepName}, 1, ${endName}, ${i + 1})) {`;
        yieldsInHeader = true;
        opensBlock = true;
      } else if (content.match(/^(.+?)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ減らしながら繰り返す:?$/)) {
        const m = content.match(/^(.+?)\s*を\s*(.+?)\s*から\s*(.+?)\s*まで\s*(.+?)\s*ずつ減らしながら繰り返す:?$/);
        if (!validIdentifier.test(m![1].trim()) || reservedNames.has(m![1].trim())) throw new Error(`${i + 1}行目: 繰り返し変数名が正しくありません。`);
        const start = validateExpression(m![2], i + 1);
        const end = validateExpression(m![3], i + 1);
        const step = validateExpression(m![4], i + 1);
        const [startName, endName, stepName, cursorName] = getLoopTemporaryNames();
        parsed = `{ const ${startName} = sys_loop_bound((${start}), ${i + 1}); const ${endName} = sys_loop_bound((${end}), ${i + 1}); const ${stepName} = sys_step((${step}), ${i + 1}); for (let ${cursorName} = ${startName}; (${m![1].trim()} = ${cursorName}, ${getYieldExpression(i)}, ${cursorName} >= ${endName}); ${cursorName} = sys_loop_next(${cursorName}, ${stepName}, -1, ${endName}, ${i + 1})) {`;
        yieldsInHeader = true;
        opensBlock = true;
      } else if (content.match(/^(.+?)\s*の間繰り返す:?$/)) {
        const m = content.match(/^(.+?)\s*の間繰り返す:?$/);
        const condition = validateExpression(m![1], i + 1);
        parsed = `while ((${getYieldExpression(i)}, ${condition})) {`;
        yieldsInHeader = true;
        opensBlock = true;
      } else if (content.match(/^表示する\s*\(/)) {
        const args = content.replace(/^表示する\s*/, '');
        if (!args.endsWith(')')) throw new Error(`${i + 1}行目: 表示するの括弧が閉じていません。`);
        const formattedArgs = validateExpression(args.slice(1, -1), i + 1, true);
        parsed = `sys_print(${formattedArgs});`;
      } else {
        const assignmentIndex = findAssignment(content);
        if (assignmentIndex < 0) throw new Error(`${i + 1}行目: 対応していない命令です。`);
        const target = content.slice(0, assignmentIndex).trim();
        const value = content.slice(assignmentIndex + 1).trim();
        const assignmentTarget = parseAssignmentTarget(target, i + 1);
        if (!assignmentTarget) throw new Error(`${i + 1}行目: 代入先が正しくありません。`);
        validateExpression(assignmentTarget.base, i + 1);
        const formattedValue = validateExpression(value, i + 1);
        if (assignmentTarget.indexes.length === 0) {
          parsed = `${assignmentTarget.base} = ${formattedValue};`;
        } else {
          let container = assignmentTarget.base;
          for (const itemIndex of assignmentTarget.indexes.slice(0, -1)) {
            container = `sys_get_index(${container}, (${itemIndex}), ${i + 1})`;
          }
          parsed = `sys_set_index(${container}, (${assignmentTarget.indexes.at(-1)}), (${formattedValue}), ${i + 1});`;
        }
      }

      jsCode += parsed + '\n';
      if (!yieldsInHeader) jsCode += getYieldCode(i);

      if (opensBlock) {
        const kind = parsed.startsWith('if') || parsed.startsWith('else')
          ? 'if'
          : parsed.startsWith('{') ? 'scoped-loop' : 'loop';
        blockStack.push({ indent, kind, hasBody: false });
      }
    }

    while (blockStack.length > 0) {
      closeBlock(lines.length);
    }

    // The generated function is intentionally dynamic because the editor executes user-selected pseudocode.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor as any;
    const maxOutputLines = 1000;
    const maxOutputCharacters = 100000;
    let outputCharacterCount = outputBufferRef.current.reduce((total, line) => total + line.length, 0);
    
    const makeGen = new GeneratorFunction(
      "print", "readString", "readInteger", "oneBased", "maxSteps",
      `
      let __steps = 0;
      ${runtimeHelpers}
      try {
        ${jsCode}
      } catch(e) {
        throw e;
      }
      `
    );

    return makeGen(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (...args: any[]) => {
        const parts = args.map((value: unknown) => String(value));
        const lineLength = parts.reduce((total: number, part: string) => total + part.length, 0);
        if (outputBufferRef.current.length >= maxOutputLines || outputCharacterCount + lineLength > maxOutputCharacters) {
          throw new Error('表示結果が上限（1000行または100000文字）を超えました。');
        }
        outputCharacterCount += lineLength;
        outputBufferRef.current.push(parts.join(""));
      },
      (kind: string) => readInput(kind),
      () => readInteger(),
      isOneBased,
      100000
    );
  };

  const handleRunAll = () => {
    resetState();
    try {
      const gen = createRunner();
      let res = gen.next();
      while (!res.done) {
        res = gen.next();
      }
      setOutput([...outputBufferRef.current]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setOutput([...outputBufferRef.current]);
      generatorRef.current = null;
      setError(`プログラムを実行できませんでした: ${err.message}`);
    }
  };

  const handleStartDebug = () => {
    resetState();
    try {
      const gen = createRunner();
      generatorRef.current = gen;
      setIsDebugging(true);
      handleNextStep(gen);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(`デバッグを開始できませんでした: ${err.message}`);
    }
  };

  const handleNextStep = (overrideGen?: Generator) => {
    const gen = overrideGen || generatorRef.current;
    if (!gen) return;

    try {
      const res = gen.next();
      if (res.done) {
        setOutput([...outputBufferRef.current]);
        setIsDebugging(false);
        generatorRef.current = null;
        setCurrentLine(null);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = res.value as any;
        setCurrentLine(val.line);
        setVariables(val.getVars());
        setOutput([...outputBufferRef.current]);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setOutput([...outputBufferRef.current]);
      generatorRef.current = null;
      setError(`実行エラー: ${err.message}`);
      setIsDebugging(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="mb-8">
        <nav aria-label="パンくずリスト" className="text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:underline">トップ</Link> <span aria-hidden="true">›</span> <Link href="/learn" className="hover:underline">学習室</Link> <span aria-hidden="true">›</span> 情報I
        </nav>
        <h1 className="text-xl md:text-2xl font-bold border-b border-gray-300 pb-2 my-3">
          共通テスト擬似言語（DNCL）エディタ
        </h1>
        <p className="text-gray-500 mb-6">
          大学入学共通テスト「情報I」で出題されるPython風の擬似言語コードを、ブラウザ上で実際に書いて実行・一行ずつデバッグできます。
        </p>
      </div>

      <section aria-label="プログラムの設定" className="retro-box !bg-slate-50 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-400 text-xs w-full">
          <label htmlFor="pseudo-lang-template" className="text-gray-600 font-semibold">プリセット読み込み:</label>
          <select 
            id="pseudo-lang-template"
            value={selectedTemplate}
            onChange={handleTemplateChange}
            disabled={isDebugging}
            className="min-w-0 bg-white border border-slate-500 p-1 focus:outline-blue-600 disabled:opacity-50 text-blue-800 cursor-pointer font-medium"
          >
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-400 text-xs w-full">
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 font-medium">
            <input 
              type="checkbox" 
              checked={isOneBased} 
              onChange={(e) => { setIsOneBased(e.target.checked); resetState(); }}
              disabled={isDebugging}
              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 rounded"
            />
            配列の要素番号を1から始める
          </label>
        </div>
        <label className="min-w-0 bg-white px-3 py-2 border border-slate-400 text-xs">
          <span className="block text-gray-600 font-semibold mb-1">プログラムへの入力（カンマ / 改行区切り）</span>
          <textarea
            rows={2}
            aria-label="プログラムへの入力"
            maxLength={MAX_PROGRAM_INPUT_CHARACTERS}
            value={programInput}
            onChange={event => { setProgramInput(event.target.value); resetState(); }}
            disabled={isDebugging}
            placeholder={'例: 1, 1, 1, 400\nまたは1行ずつ入力'}
            className="retro-input w-full resize-y font-mono disabled:bg-gray-100"
          />
          <span className="block text-[10px] text-gray-500 mt-1">入力を求める箇所に、左から順番に値を渡します。カンマを含む文字列や空文字は &quot;Smith, John&quot;、&quot;&quot; のように二重引用符で囲みます。</span>
        </label>
      </section>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* 左側：エディタ */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-3">
            <div className="flex flex-wrap gap-1.5">
              {!isDebugging && (
                <>
                  <button type="button" onClick={() => insertText(" = ")} className="retro-btn-classic">= 代入</button>
                  <button type="button" onClick={() => insertText("表示する(\"\")\n")} className="retro-btn-classic">表示する()</button>
                  <button type="button" onClick={() => insertText("もし  ならば:\n｜  \n")} className="retro-btn-classic">もし〜ならば:</button>
                  <button type="button" onClick={() => insertText("を  から  まで  ずつ増やしながら繰り返す:\n｜  \n")} className="retro-btn-classic">for文</button>
                  <button type="button" onClick={() => insertText("の間繰り返す:\n｜  \n")} className="retro-btn-classic">while文</button>
                </>
              )}
            </div>

            <div className="flex gap-2 shrink-0 justify-end">
              {!isDebugging ? (
                <>
                  <button type="button" onClick={handleRunAll} className="retro-btn-classic !bg-blue-100 !border-blue-400 !text-blue-900 !font-bold">
                    ▶ 実行
                  </button>
                  <button type="button" onClick={handleStartDebug} className="retro-btn-classic !bg-amber-100 !border-amber-400 !text-amber-900 !font-bold">
                    🐞 デバッグ
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => handleNextStep()} className="retro-btn-classic !bg-amber-100 !border-amber-400 !text-amber-900 !font-bold">
                    ⏭ 1ステップ進む
                  </button>
                  <button type="button" onClick={resetState} className="retro-btn-classic !bg-red-100 !border-red-400 !text-red-900 !font-bold">
                    ⏹ 終了
                  </button>
                </>
              )}
            </div>
          </div>

          <section aria-label="コードエディタ" className="retro-box flex flex-col h-[420px] sm:h-[520px] p-0 overflow-hidden">
            <div className="h-10 bg-slate-100 border-b border-slate-400 flex items-center px-4 justify-between select-none">
              <span className="text-slate-700 text-xs font-bold">擬似言語コード</span>
              <span className="text-slate-500 text-xs font-mono">editor.dncl</span>
            </div>

            <div className="flex flex-grow relative font-mono text-sm sm:text-base transition-colors">
              {isDebugging ? (
                <div className="w-full h-full overflow-auto editor-scrollbar py-2 text-slate-800" style={{ lineHeight: '1.6' }}>
                  {code.split('\n').map((line, i) => (
                    <div 
                      key={i} 
                      className={`flex px-2 ${currentLine === i ? 'bg-blue-100 border-l-4 border-blue-500 text-slate-900 font-bold' : 'border-l-4 border-transparent'}`}
                    >
                      <span className="w-8 flex-none text-right mr-4 text-slate-500 select-none">{i + 1}</span>
                      <span className="whitespace-pre flex-grow">{line || ' '}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div 
                    ref={lineNumRef} 
                    className="w-12 flex-none bg-slate-50 text-slate-500 py-4 pr-3 text-right whitespace-pre select-none overflow-hidden border-r border-slate-300"
                    style={{ lineHeight: '1.6' }}
                  >
                    {code.split('\n').map((_, i) => i + 1).join('\n')}
                  </div>
                  <textarea
                    ref={textareaRef}
                    aria-label="擬似言語コード"
                    maxLength={MAX_PSEUDO_CODE_CHARACTERS}
                    value={code}
                    onChange={(e) => { updateCode(e.target.value); }}
                    onKeyDown={handleEditorKeyDown}
                    onScroll={handleScroll}
                    className="flex-grow bg-white text-slate-800 p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 resize-none whitespace-pre overflow-auto editor-scrollbar caret-blue-600"
                    style={{ lineHeight: '1.6' }}
                    placeholder="ここに擬似言語コードを入力してください..."
                    spellCheck="false"
                  />
                </>
              )}
            </div>
          </section>
        </div>

        {/* 右側：変数モニターと実行出力 */}
        <div className="flex flex-col w-full lg:w-[35%] gap-4 min-w-0 mt-2 lg:mt-0">
          
          {/* 変数モニター */}
          <section aria-label="変数モニター" className="flex flex-col min-h-[210px] h-[250px]">
            <h2 className="flex items-center gap-2 mb-2 px-1 text-gray-700 text-sm font-semibold">
              <span className={`w-2 h-2 rounded-full ${isDebugging ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></span> 
              <span>変数モニター（リアルタイム値）</span>
            </h2>
            <div className="retro-box flex-grow min-h-0 overflow-y-auto editor-scrollbar p-0">
              {Object.keys(variables).length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400 text-xs p-4 text-center leading-normal">
                  {isDebugging ? 'スコープ内に有効な変数がありません' : 'デバッグ（ステップ実行）を開始すると変数の値がリアルタイムで追跡できます'}
                </div>
              ) : (
                <table className="classic-table w-full text-left text-xs table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 font-medium">
                    <tr>
                      <th className="py-2.5 px-4 text-gray-600 w-[45%] font-medium">変数名</th>
                      <th className="py-2.5 px-4 text-gray-600 w-[55%] font-medium">値</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {Object.entries(variables).map(([key, val]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-4 text-indigo-600 truncate" title={key}>{key}</td>
                        <td className="py-2.5 px-4 text-gray-800 truncate" title={Array.isArray(val) ? formatArrayValue(val) : JSON.stringify(val)}>
                          {Array.isArray(val) ? (
                            <span className="text-purple-600">{formatArrayValue(val)}</span>
                          ) : typeof val === 'number' ? (
                        <span className="text-amber-800">{val}</span>
                          ) : typeof val === 'boolean' ? (
                        <span className="text-teal-700">{val ? '真' : '偽'}</span>
                          ) : (
                        <span className="text-emerald-700">&quot;{String(val)}&quot;</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* 実行ターミナル */}
          <section aria-label="ターミナル出力" className="flex flex-col min-h-[210px] h-[250px]">
            <h2 className="flex items-center gap-2 mb-2 px-1 text-gray-700 text-sm font-semibold">
              <span>🖥️ ターミナル出力（表示画面）</span>
            </h2>
            <div className="flex-grow p-4 font-mono text-xs bg-white text-slate-800 border border-slate-300 overflow-y-auto editor-scrollbar leading-relaxed">
              {error && <div role="alert" className="text-red-700 whitespace-pre-wrap break-all mb-3">{error}</div>}
              {output.length === 0 && !error && <div className="text-slate-500 italic">実行結果がここに表示されます...</div>}
              <div aria-live="polite" aria-relevant="additions text">
                {output.map((line, index) => (
                  <div key={index} className="mb-1 whitespace-pre-wrap break-all">
                    <span className="text-blue-700 mr-2">❯</span>{line}
                  </div>
                ))}
              </div>
            </div>
          </section>
          
        </div>

      </div>

    </main>
  );
}
