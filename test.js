/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const code = fs.readFileSync('./src/data/pseudo-lang/exam2025TsuishiFig4.ts', 'utf8').split('\`')[1];

let jsCode = "";
const vars = new Set();
const cleanCode = code.replace(/(#|\/\/).*/g, '');

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

const lines = code.split('\n');
let blockStack = [];

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
    parsed = `for (${m[1].trim()} = (${m[2]}); ${m[1].trim()} <= (${m[3]}); ${m[1].trim()} += (${m[4]})) {`;
    opensBlock = true;
  } else if (content.match(/(.+)を(.+)から(.+)まで(.+)ずつ減らしながら繰り返す:/)) {
    let m = content.match(/(.+)を(.+)から(.+)まで(.+)ずつ減らしながら繰り返す:/);
    parsed = `for (${m[1].trim()} = (${m[2]}); ${m[1].trim()} >= (${m[3]}); ${m[1].trim()} -= (${m[4]})) {`;
    opensBlock = true;
  } else if (content.match(/(.+)の間繰り返す:/)) {
    let m = content.match(/(.+)の間繰り返す:/);
    parsed = `while (${m[1].trim()}) {`;
    opensBlock = true;
  } else if (content.startsWith('表示する(')) {
    let args = content.substring(4);
    parsed = `sys_print${args};`;
  } else {
    parsed = content + ';';
  }

  if (parsed.startsWith('else')) {
    jsCode += parsed + '\n';
  } else {
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

console.log("=== JS CODE ===");
console.log(jsCode);

// test execution
const sys_print = (...args) => console.log(...args);
const sys_len = (arr) => arr.length - 1;
const sys_ransuu = () => Math.random();
const sys_arr = (arr) => [undefined, ...arr];

try {
  eval(jsCode);
} catch (e) {
  console.error("ERROR", e);
}
