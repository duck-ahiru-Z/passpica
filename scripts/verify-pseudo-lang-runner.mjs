import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';

const require = createRequire(import.meta.url);
require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  module._compile(javascript, filename);
};
const { TEMPLATES, TEMPLATE_OPTIONS } = require('../src/data/pseudo-lang/index.ts');
const { parseStrictInteger } = require('../src/lib/strictInteger.ts');
const { editIndentationSelection } = require('../src/lib/pseudoLangEditor.ts');

const optionValues = TEMPLATE_OPTIONS.map(option => option.value);
if (new Set(optionValues).size !== optionValues.length || optionValues.length !== Object.keys(TEMPLATES).length || optionValues.some(value => !(value in TEMPLATES))) {
  throw new Error('Preset options and available pseudo-language templates do not match.');
}
for (const [code, start, end, outdent, expectedCode, expectedStart, expectedEnd] of [
  ['ab', 1, 1, false, 'a  b', 3, 3],
  ['  alpha\nbeta', 5, 5, true, 'alpha\nbeta', 3, 3],
  ['alpha', 2, 2, true, 'alpha', 2, 2],
  ['a\nb', 0, 2, false, '  a\nb', 2, 4],
  ['  a\n  b\nc', 2, 4, true, 'a\n  b\nc', 0, 2],
  ['  a\n  b', 2, 5, true, 'a\nb', 0, 2],
  ['  a\r\n  b', 2, 7, true, 'a\r\nb', 0, 3],
]) {
  const actual = editIndentationSelection(code, start, end, outdent);
  if (actual.code !== expectedCode || actual.selectionStart !== expectedStart || actual.selectionEnd !== expectedEnd) {
    throw new Error(`Editor indentation edit failed: expected ${JSON.stringify({ code: expectedCode, selectionStart: expectedStart, selectionEnd: expectedEnd })}, received ${JSON.stringify(actual)}`);
  }
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(resolve(root, 'src/app/learn/information/pseudo-lang/page.tsx'), 'utf8');
const runnerStart = page.indexOf('  const createRunner = () => {');
const runnerEnd = page.indexOf('\n  const handleRunAll', runnerStart);
if (runnerStart < 0 || runnerEnd < 0) throw new Error('Could not locate the page runner.');

const runnerSource = page.slice(runnerStart, runnerEnd).trim();
const compiled = ts.transpile(runnerSource, { target: ts.ScriptTarget.ES2022 });
const runnerLimits = Object.fromEntries(['MAX_PSEUDO_CODE_CHARACTERS', 'MAX_PSEUDO_CODE_LINES', 'MAX_PROGRAM_INPUT_CHARACTERS'].map(name => {
  const match = page.match(new RegExp(`const ${name} = (\\d+);`));
  if (!match) throw new Error(`Could not find ${name} in the editor page.`);
  return [name, Number(match[1])];
}));
for (const [id, template] of Object.entries(TEMPLATES)) {
  const source = typeof template === 'string' ? template : template.code;
  if (source.length > runnerLimits.MAX_PSEUDO_CODE_CHARACTERS || source.split('\n').length > runnerLimits.MAX_PSEUDO_CODE_LINES) {
    throw new Error(`Preset ${id} exceeds the editor input limits.`);
  }
}
const makeRunnerWithLimits = new Function(
  'code', 'programInput', 'isOneBased', 'outputBufferRef', 'parseStrictInteger',
  'MAX_PSEUDO_CODE_CHARACTERS', 'MAX_PSEUDO_CODE_LINES', 'MAX_PROGRAM_INPUT_CHARACTERS',
  `${compiled}\nreturn createRunner();`
);
const makeRunner = (code, programInput, isOneBased, outputBufferRef, integerParser) => makeRunnerWithLimits(
  code, programInput, isOneBased, outputBufferRef, integerParser,
  runnerLimits.MAX_PSEUDO_CODE_CHARACTERS, runnerLimits.MAX_PSEUDO_CODE_LINES, runnerLimits.MAX_PROGRAM_INPUT_CHARACTERS,
);

const cases = [
  { id: 'sample_basic', output: ['合計は900円です'] },
  { id: 'sample_if', output: ['xは5です'] },
  { id: 'sample_loop', output: ['合計:60'] },
  { id: 'exam_binary_search', output: ['探したい数字(例:52)の添字を検索します', '52は添字5にありました'] },
  { id: 'exam_prototype_coin', output: ['46円の最小交換硬貨枚数：3枚'] },
  { id: 'exam_2025_honshi_fig4', output: ['次の工芸品の担当は部員2です。'] },
  { id: 'exam_2025_honshi_fig5', output: [
    '工芸品1……部員1:1日目～4日目', '工芸品2……部員2:1日目～1日目', '工芸品3……部員3:1日目～3日目',
    '工芸品4……部員2:2日目～2日目', '工芸品5……部員2:3日目～5日目', '工芸品6……部員3:4日目～7日目',
    '工芸品7……部員1:5日目～6日目', '工芸品8……部員2:6日目～9日目', '工芸品9……部員1:7日目～9日目',
  ] },
  { id: 'exam_2025_tsuishi_fig2', input: '1, 1, 1, 400', output: ['生徒の出席番号は?', 'ごみの入れ物は? バケツ:1 ごみ袋:2', 'ごみの種類は? 可燃ごみ:1 不燃ごみ:2', '計量結果 (g)は?', '記録:1番 / 容器1 / 種類1 / 400g'] },
  { id: 'exam_2025_tsuishi_fig4', output: ['可燃ごみの総重量は450g', '不燃ごみの総重量は750g'] },
  { id: 'exam_2025_tsuishi_fig5', input: 'かん', output: ['ごみの種類の名称は?', '分類番号：4'] },
  { id: 'exam_2025_tsuishi_fig6', output: ['可燃ごみの総重量は450g', '不燃ごみの総重量は750g', 'ペットボトルの総重量は0g', 'かんの総重量は0g', 'びんの総重量は0g', '金属の総重量は0g', '落ち葉の総重量は0g'] },
  { id: 'exam_2026_honshi', output: ['2人目の待ち時間：0分間', '3人目の待ち時間：2分間', '4人目の待ち時間：0分間', '5人目の待ち時間：2分間', '6人目の待ち時間：4分間'] },
  { id: 'exam_2026_tsuishi', output: [] },
  { id: 'blank', output: [] },
];

function getTemplate(id) {
  const value = TEMPLATES[id];
  if (!value) throw new Error(`Unknown template: ${id}`);
  return typeof value === 'string' ? { code: value, isOneBased: false } : { code: value.code, isOneBased: value.isOneBased ?? false };
}

function run(id, input = '') {
  const template = getTemplate(id);
  const outputBufferRef = { current: [] };
  const generator = makeRunner(template.code, input, template.isOneBased, outputBufferRef, parseStrictInteger);
  let step = generator.next();
  let steps = 0;
  while (!step.done) {
    if (++steps > 100000) throw new Error(`${id}: exceeded execution limit`);
    step = generator.next();
  }
  return outputBufferRef.current;
}

for (const testCase of cases) {
  const actual = run(testCase.id, testCase.input ?? '');
  if (testCase.id === 'exam_2026_tsuishi') {
    if (actual.length !== 120 || !actual[0].includes('セット1に問題')) {
      throw new Error(`${testCase.id}: unexpected output ${JSON.stringify(actual)}`);
    }
    const templateCode = getTemplate(testCase.id).code;
    const categoryMatch = templateCode.match(/Bunya = \[([^\]]+)\]/);
    if (!categoryMatch) throw new Error(`${testCase.id}: category data is missing.`);
    const categories = categoryMatch[1].split(',').map(value => Number(value.trim()));
    if (categories.length !== 193 || categories[0] !== 2 || categories[1] !== 0 || categories.at(-1) !== 5) {
      throw new Error(`${testCase.id}: expected a 193-item category list with the published endpoints.`);
    }
    const selectedPerSet = new Map();
    const selectedProblems = new Set();
    for (const line of actual) {
      const match = line.match(/^セット(\d+)に問題(\d+)を採用$/);
      if (!match) throw new Error(`${testCase.id}: unexpected selection line ${line}`);
      const set = Number(match[1]);
      const problemNumber = Number(match[2]);
      const index = problemNumber - 1;
      if (problemNumber < 1 || problemNumber > categories.length || selectedProblems.has(index)) {
        throw new Error(`${testCase.id}: invalid or duplicate problem number ${problemNumber}`);
      }
      selectedProblems.add(index);
      const category = categories[index];
      const counts = selectedPerSet.get(set) ?? new Map();
      counts.set(category, (counts.get(category) ?? 0) + 1);
      selectedPerSet.set(set, counts);
    }
    for (const [set, counts] of selectedPerSet) {
      if ([...counts.values()].some(count => count > 5) || [...counts.values()].reduce((sum, count) => sum + count, 0) !== 30) {
        throw new Error(`${testCase.id}: category cap failed for set ${set}: ${JSON.stringify([...counts])}`);
      }
    }
    if (selectedPerSet.size !== 4) throw new Error(`${testCase.id}: expected four quiz sets.`);
  } else if (JSON.stringify(actual) !== JSON.stringify(testCase.output)) {
    throw new Error(`${testCase.id}: expected ${JSON.stringify(testCase.output)}, received ${JSON.stringify(actual)}`);
  }
}

const stringSymbols = runCode('表示する("L | == 整数( ! not でない")\n');
if (stringSymbols[0] !== 'L | == 整数( ! not でない') throw new Error(`String literal changed: ${JSON.stringify(stringSymbols)}`);
const stringWhitespace = runCode('表示する("first  second\\n  third")\n');
if (stringWhitespace[0] !== 'first  second\n  third') throw new Error(`String spaces or line breaks were changed: ${JSON.stringify(stringWhitespace)}`);
const internalNameString = runCode('表示する("MATH_MAX(", "MATH_TRUNC(")\n');
if (internalNameString[0] !== 'MATH_MAX(MATH_TRUNC(') throw new Error(`Internal function text was rejected or changed: ${JSON.stringify(internalNameString)}`);
const helperNameString = runCode('表示する("sys_divide(", "sys_arr(")\n');
if (helperNameString[0] !== 'sys_divide(sys_arr(') throw new Error(`Internal helper text was rejected or changed: ${JSON.stringify(helperNameString)}`);
const placeholderName = runCode('__PSEUDO_STRING_0__ = 42\n表示する(__PSEUDO_STRING_0__)\n');
if (placeholderName[0] !== '42') throw new Error(`String placeholder collided with a valid variable name: ${JSON.stringify(placeholderName)}`);
const japaneseIdentifier = runCode('状態かつ条件 = 7\n表示する(状態かつ条件)\n');
if (japaneseIdentifier[0] !== '7') throw new Error(`Japanese identifier containing an operator word changed: ${JSON.stringify(japaneseIdentifier)}`);
const japaneseIdentifiers = runCode('条件または結果 = 8\nでない状態 = 9\n表示する(条件または結果, でない状態)\n');
if (japaneseIdentifiers[0] !== '89') throw new Error(`Japanese identifiers containing operator words changed: ${JSON.stringify(japaneseIdentifiers)}`);
const englishOperatorIdentifiers = runCode('状態and値 = 7\n結果or値 = 8\nnot状態 = 9\n表示する(状態and値, 結果or値, not状態)\n');
if (englishOperatorIdentifiers[0] !== '789') throw new Error(`Japanese identifiers containing English operator words changed: ${JSON.stringify(englishOperatorIdentifiers)}`);
const keywordPrefixIdentifiers = runCode('そうでなくもし結果 = 4\nそうでなければ結果 = 5\n表示する(そうでなくもし結果, そうでなければ結果)\n');
if (keywordPrefixIdentifiers[0] !== '45') throw new Error(`Identifier beginning with a branch keyword was misparsed: ${JSON.stringify(keywordPrefixIdentifiers)}`);
const japaneseOperators = runCode(
  'left = 1\nright = 2\nもし left == 1 かつ right == 2 ならば:\n｜  表示する("and")\nもし false または true ならば:\n｜  表示する("or")\nもし でない false ならば:\n｜  表示する("not")\nもし not false ならば:\n｜  表示する("english not")\n',
);
if (JSON.stringify(japaneseOperators) !== JSON.stringify(['and', 'or', 'not', 'english not'])) {
  throw new Error(`Japanese logical operators failed: ${JSON.stringify(japaneseOperators)}`);
}
const dnclLogicalOrder = runCode(
  'first = true\nsecond = false\nthird = false\nleftToRight = first または second かつ third\npostfixNot = first かつ second でない\npostfixChain = first かつ second でない または third\ngrouped = first または (second かつ third)\nkosu = 10\ndnclExample = kosu > 12 かつ kosu < 27 でない\ndnclGroupedExample = kosu > 12 かつ (kosu < 27 でない)\n表示する(leftToRight, postfixNot, postfixChain, grouped, dnclExample, dnclGroupedExample)\n',
);
if (JSON.stringify(dnclLogicalOrder) !== JSON.stringify(['falsetruetruetruetruefalse'])) {
  throw new Error(`DNCL logical order/postfix negation failed: ${JSON.stringify(dnclLogicalOrder)}`);
}
const dnclLogicalArguments = runCode(
  'a = true\nb = false\n表示する(a かつ a, a または b, a かつ b でない, b)\n',
);
if (JSON.stringify(dnclLogicalArguments) !== JSON.stringify(['truetruetruefalse'])) {
  throw new Error(`DNCL logical expressions changed argument boundaries: ${JSON.stringify(dnclLogicalArguments)}`);
}
for (const invalidLogicalExpression of [
  'value = true かつ\n',
  'value = true または または false\n',
  'value = true でない false\n',
]) {
  try {
    runCode(invalidLogicalExpression);
    throw new Error(`Malformed DNCL logical expression was accepted: ${invalidLogicalExpression}`);
  } catch (error) {
    if (String(error).includes('Malformed DNCL logical expression was accepted')) throw error;
  }
}
const shortCircuitLogicalOperators = runCode(
  'andResult = false and (1 / 0 == 0)\norResult = true or (1 / 0 == 0)\n表示する(andResult, orResult)\n',
);
if (JSON.stringify(shortCircuitLogicalOperators) !== JSON.stringify(['falsetrue'])) {
  throw new Error(`Logical operators did not short-circuit: ${JSON.stringify(shortCircuitLogicalOperators)}`);
}
const strictComparisonOperators = runCode(
  'value = 2\nequal = value === 2\nnotEqual = value !== 3\n表示する(equal, notEqual)\n',
);
if (JSON.stringify(strictComparisonOperators) !== JSON.stringify(['truetrue'])) {
  throw new Error(`Strict comparison operators were altered: ${JSON.stringify(strictComparisonOperators)}`);
}
const notComparisonPrecedence = runCode(
  'value = 3\nnotResult = not value == 2\nsymbolResult = !value == 2\nparenResult = でない (value == 2)\nchainResult = not not value == 2\nlogicalResult = (not value == 2) and true\n表示する(notResult, symbolResult, parenResult, chainResult, logicalResult)\n',
);
if (JSON.stringify(notComparisonPrecedence) !== JSON.stringify(['truetruetruefalsetrue'])) {
  throw new Error(`Logical negation precedence failed: ${JSON.stringify(notComparisonPrecedence)}`);
}
const leadingLetterName = runCode('LoopCount = 4\n表示する(LoopCount)\n');
if (leadingLetterName[0] !== '4') throw new Error(`Leading L variable name failed: ${JSON.stringify(leadingLetterName)}`);
const integerDivision = runCode('a = (7 + 4) ÷ 2\n表示する(a)\n');
if (integerDivision[0] !== '5') throw new Error(`Integer division failed: ${JSON.stringify(integerDivision)}`);
const negativePowerDivision = runCode('value = -2 ** 2 ÷ 2\n表示する(value)\n');
if (negativePowerDivision[0] !== '-2') throw new Error(`Unary minus and exponent precedence failed: ${JSON.stringify(negativePowerDivision)}`);
for (const [source, expected] of [
  ['value = -2 ** 2\n表示する(value)\n', '-4'],
  ['value = 2 * -3 ** 2 ÷ 2\n表示する(value)\n', '-9'],
  ['value = 10 ÷ -2 ** 2\n表示する(value)\n', '-2'],
  ['value = -2 ** 2 ** 3\n表示する(value)\n', '-256'],
  ['value = (-2) ** 2\n表示する(value)\n', '4'],
  ['value = 2 ** -2\n表示する(value)\n', '0.25'],
  ['value = -2 ** -2\n表示する(value)\n', '-0.25'],
  ['value = 2 ** 3 ** 2\n表示する(value)\n', '512'],
  ['value = 2 ** 3 * 4\n表示する(value)\n', '32'],
  ['value = 2 * 3 ** 2\n表示する(value)\n', '18'],
  ['value = 20 / 2 * 3\n表示する(value)\n', '30'],
  ['value = 2 * 3 / 4\n表示する(value)\n', '1.5'],
  ['value = 10 - 2 * 3 + 4\n表示する(value)\n', '8'],
]) {
  const actual = runCode(source);
  if (actual[0] !== expected) throw new Error(`Unary exponent precedence failed: expected ${expected}, received ${JSON.stringify(actual)}`);
}
const fractionalDivision = runCode('value = 7.5 / 2\n表示する(value)\n');
if (fractionalDivision[0] !== '3.75') throw new Error(`Fractional division failed: ${JSON.stringify(fractionalDivision)}`);
for (const [source, expected] of [
  ['value = 10 % 3\n表示する(value)\n', '1'],
  ['value = -7 % 3\n表示する(value)\n', '-1'],
  ['value = 10 % 4 / 2\n表示する(value)\n', '1'],
  ['value = 10 / 4 % 2\n表示する(value)\n', '0.5'],
]) {
  const actual = runCode(source);
  if (actual[0] !== expected) throw new Error(`Modulo precedence failed: expected ${expected}, received ${JSON.stringify(actual)}`);
}
try {
  runCode('value = 10 % 0\n');
  throw new Error('Modulo by zero was accepted.');
} catch (error) {
  if (!String(error).includes('0で割ることはできません')) throw error;
}
for (const [source, expectedError] of [
  ['value = 1e999\n', '数値リテラルが扱える範囲を超えています'],
  ['value = 1e308 + 1e308\n', '加算結果が数値の範囲を超えました'],
  ['value = 1e308 - -1e308\n', '減算結果が数値の範囲を超えました'],
  ['value = 1e308 * 1e308\n', '乗算結果が数値の範囲を超えました'],
  ['value = 10 ** 1000\n', 'べき乗の結果が数値の範囲を超えました'],
]) {
  try {
    runCode(source);
    throw new Error(`Out-of-range numeric expression was accepted: ${source}`);
  } catch (error) {
    if (!String(error).includes(expectedError)) throw error;
  }
}
const additionSemantics = runCode('sum = 2 + 3 * 4\ntext = "Pass" + "pica"\n表示する(sum, text)\n');
if (JSON.stringify(additionSemantics) !== JSON.stringify(['14Passpica'])) {
  throw new Error(`Numeric or string addition failed: ${JSON.stringify(additionSemantics)}`);
}
const additionComparisonPrecedence = runCode(
  'value = 2\nleftComparison = value + 1 == 3\nrightComparison = value > 1 + 0\nlogicalComparison = value + 1 == 3 and value - 1 == 1\n表示する(leftComparison, rightComparison, logicalComparison)\n',
);
if (JSON.stringify(additionComparisonPrecedence) !== JSON.stringify(['truetruetrue'])) {
  throw new Error(`Addition changed comparison or logical precedence: ${JSON.stringify(additionComparisonPrecedence)}`);
}
try {
  runCode('text = "x"\ni を 1 から 30 まで 1 ずつ増やしながら繰り返す:\n｜  text = text + text\n');
  throw new Error('Unbounded string concatenation was accepted.');
} catch (error) {
  if (!String(error).includes('文字列の長さが上限')) throw error;
}
try {
  runCode('items = [1]\nresult = items + items\n');
  throw new Error('Array addition was accepted.');
} catch (error) {
  if (!String(error).includes('配列は加算できません')) throw error;
}
const largeRowLiteral = Array.from({ length: 20000 }, () => '0').join(',');
try {
  runCode(`rows = []\ni を 0 から 60 まで 1 ずつ増やしながら繰り返す:\n｜  rows[i] = [${largeRowLiteral}]\n`);
  throw new Error('Repeated large array allocation exceeded the memory budget without an error.');
} catch (error) {
  if (!String(error).includes('配列の合計割り当て要素数')) throw error;
}
for (const zeroDivision of ['value = 7 / 0\n', 'value = 0 / 0\n']) {
  try {
    runCode(zeroDivision);
    throw new Error(`Division by zero was accepted: ${zeroDivision}`);
  } catch (error) {
    if (!String(error).includes('0で割ることはできません')) throw error;
  }
}
const fractionalIntegerDivision = runCode('value = 7.5 ÷ 2\n表示する(value)\n');
if (fractionalIntegerDivision[0] !== '3') throw new Error(`Fractional integer division failed: ${JSON.stringify(fractionalIntegerDivision)}`);
for (const zeroDivision of ['value = 7 ÷ 0\n', 'value = 0 ÷ 0\n']) {
  try {
    runCode(zeroDivision);
    throw new Error(`Integer division by zero was accepted: ${zeroDivision}`);
  } catch (error) {
    if (!String(error).includes('0で割ることはできません')) throw error;
  }
}
for (const [source, expected] of [
  ['a = ((7 + 4) * 2) ÷ (1 + 1)\n表示する(a)\n', '11'],
  ['a = 7 ÷ 2 ÷ 2\n表示する(a)\n', '1'],
  ['a = -7 ÷ 2\n表示する(a)\n', '-3'],
  ['a = 7 ÷ -2\n表示する(a)\n', '-3'],
  ['a = 2 + 7 ÷ 3 * 2\n表示する(a)\n', '6'],
  ['a = 8 * -7 ÷ 2\n表示する(a)\n', '-28'],
  ['a = 2 * 3 ÷ 2\n表示する(a)\n', '3'],
  ['a = 2 ** 3 ÷ 2\n表示する(a)\n', '4'],
  ['a = 16 ÷ 2 ** 3\n表示する(a)\n', '2'],
  ['a = 16 ÷ (2 + 1) ** 2\n表示する(a)\n', '1'],
  ['a = 128 ÷ 2 ** 3 ** 2\n表示する(a)\n', '0'],
  ['a = 2 / 3 ÷ 2\n表示する(a)\n', '0'],
  ['a = 10 - 2 * 3 ÷ 2\n表示する(a)\n', '7'],
  ['a = 2 * 3 ÷ 2 ÷ 2\n表示する(a)\n', '1'],
  ['a = 最大値(3, 9) ÷ 2\n表示する(a)\n', '4'],
  ['items = [8, 4]\na = items[0] ÷ items[1]\n表示する(a)\n', '2'],
  ['a = 2 ** 3 / 2\n表示する(a)\n', '4'],
  ['a = 16 / 2 ** 3\n表示する(a)\n', '2'],
  ['a = 8 / 2 / 2\n表示する(a)\n', '2'],
  ['a = 1e-3 ÷ 1e-4\n表示する(a)\n', '10'],
  ['a = 1 ÷ 2e-1\n表示する(a)\n', '5'],
  ['a = -1e-3 ÷ 2e-4\n表示する(a)\n', '-5'],
]) {
  const actual = runCode(source);
  if (actual[0] !== expected) throw new Error(`Integer division boundary failed: expected ${expected}, received ${JSON.stringify(actual)}`);
}
const oneBasedLength = runCode('items = [3, 8]\n表示する(要素数(items))\n', '', true);
if (oneBasedLength[0] !== '2') throw new Error(`One-based array length failed: ${JSON.stringify(oneBasedLength)}`);
const stringLength = runCode('表示する(要素数("hello"))\n');
if (stringLength[0] !== '5') throw new Error(`String length failed: ${JSON.stringify(stringLength)}`);
const arrayLengthWithCommas = runCode('items = [[1, 2], [3, 4]]\n表示する(要素数(items[1, 0] + "x"), 最大値(1, 4, 2))\n');
if (arrayLengthWithCommas[0] !== '24') throw new Error(`Function argument counting included nested commas: ${JSON.stringify(arrayLengthWithCommas)}`);
for (const invalidFunctionCall of [
  'value = 要素数()\n',
  'value = 要素数([1, 2], 3)\n',
  'value = 最大値()\n',
  'value = 整数(1, 2)\n',
  'value = 乱数(1)\n',
]) {
  try {
    runCode(invalidFunctionCall);
    throw new Error(`Function call with an invalid argument count was accepted: ${invalidFunctionCall}`);
  } catch (error) {
    if (!String(error).includes('引数が必要')) throw error;
  }
}
try {
  runCode('value = 5\n表示する(要素数(value))\n');
  throw new Error('Element count accepted a non-array value.');
} catch (error) {
  if (!String(error).includes('配列または文字列')) throw error;
}
const oneBasedLengthProperty = runCode('items = [3, 8]\n表示する(items["length"])\n', '', true);
if (oneBasedLengthProperty[0] !== '2') throw new Error(`One-based array length property failed: ${JSON.stringify(oneBasedLengthProperty)}`);
const quotedCommaInput = runCode('name = 【文字列を入力】\n表示する(name)\n', '"Smith, John"');
if (quotedCommaInput[0] !== 'Smith, John') throw new Error(`Quoted comma input failed: ${JSON.stringify(quotedCommaInput)}`);
const escapedQuoteInput = runCode('name = 【文字列を入力】\n表示する(name)\n', '"She said ""hello"""');
if (escapedQuoteInput[0] !== 'She said "hello"') throw new Error(`Escaped quote input failed: ${JSON.stringify(escapedQuoteInput)}`);
const emptyQuotedInput = runCode('name = 【文字列を入力】\nもし name == "" ならば:\n｜  表示する("empty")\n', '""');
if (emptyQuotedInput[0] !== 'empty') throw new Error(`Empty quoted string input failed: ${JSON.stringify(emptyQuotedInput)}`);
const multilineInput = runCode('first = 【整数を入力】\nsecond = 【整数を入力】\n表示する(first + second)\n', '12\n30');
if (multilineInput[0] !== '42') throw new Error(`Multiline input failed: ${JSON.stringify(multilineInput)}`);
const crlfInput = runCode('first = 【整数を入力】\nsecond = 【整数を入力】\n表示する(first + second)\n', '12\r\n30\r\n');
if (crlfInput[0] !== '42') throw new Error(`CRLF input failed: ${JSON.stringify(crlfInput)}`);
try {
  runCode('first = 【整数を入力】\nsecond = 【整数を入力】\n', '12\n');
  throw new Error('A trailing line break was treated as a second input value.');
} catch (error) {
  if (!String(error).includes('入力値が足りません')) throw error;
}
try {
  runCode('first = 【整数を入力】\nsecond = 【整数を入力】\n', '12,\n');
  throw new Error('A trailing comma was silently treated as a line ending.');
} catch (error) {
  if (!String(error).includes('入力値が空です')) throw error;
}
const quotedEmptyWithTrailingNewline = runCode('name = 【文字列を入力】\nもし name == "" ならば:\n｜  表示する("empty")\n', '""\n');
if (quotedEmptyWithTrailingNewline[0] !== 'empty') throw new Error(`Quoted empty input with trailing newline failed: ${JSON.stringify(quotedEmptyWithTrailingNewline)}`);
try {
  runCode('first = 【整数を入力】\nsecond = 【整数を入力】\n', '12,,30');
  throw new Error('An empty field between input values was silently skipped.');
} catch (error) {
  if (!String(error).includes('入力値が空です')) throw error;
}
try {
  runCode('name = 【文字列を入力】\n', '"Smith"Jr');
  throw new Error('Malformed quoted input was accepted.');
} catch (error) {
  if (!String(error).includes('余分な文字')) throw error;
}
try {
  runCode('name = 【文字列を入力】\n', '"first" "second"');
  throw new Error('Adjacent quoted input values were silently merged.');
} catch (error) {
  if (!String(error).includes('引用符の位置')) throw error;
}
const nestedOneBased = runCode('items = [[3, 8], [5, 9]]\n表示する(items[2][1])\n', '', true);
if (nestedOneBased[0] !== '5') throw new Error(`Nested one-based arrays failed: ${JSON.stringify(nestedOneBased)}`);
const commaIndexedArray = runCode('items = [[3, 8], [5, 9]]\nvalue = items[1, 0]\nitems[1, 1] = 7\n表示する(value, items[1, 1])\n');
if (commaIndexedArray[0] !== '57') throw new Error(`Comma-indexed arrays failed: ${JSON.stringify(commaIndexedArray)}`);
const commaIndexedOneBasedArray = runCode('items = [[3, 8], [5, 9]]\nvalue = items[2, 1]\nitems[2, 2] = 7\n表示する(value, items[2, 2])\n', '', true);
if (commaIndexedOneBasedArray[0] !== '57') throw new Error(`One-based comma-indexed arrays failed: ${JSON.stringify(commaIndexedOneBasedArray)}`);
const nestedIndexedAssignment = runCode('items = [[0, 0], [0, 0]]\ni = 1\nj = 0\nitems[i][j] = 7\n表示する(items[1][0])\n');
if (nestedIndexedAssignment[0] !== '7') throw new Error(`Nested indexed assignment failed: ${JSON.stringify(nestedIndexedAssignment)}`);
const assignedOneBased = runCode('items = []\nitems[2] = 42\n表示する(items[2])\n', '', true);
if (assignedOneBased[0] !== '42') throw new Error(`One-based array assignment failed: ${JSON.stringify(assignedOneBased)}`);
const maximumOneBasedIndex = runCode('items = []\nitems[100000] = 42\n表示する(要素数(items), items[100000])\n', '', true);
if (maximumOneBasedIndex[0] !== '10000042') throw new Error(`One-based array upper bound was off by one: ${JSON.stringify(maximumOneBasedIndex)}`);
for (const source of [
  'items = [3, 8]\n表示する(items[0])\n',
  'items = [[3, 8]]\n表示する(items[1, 0])\n',
  'items = [3, 8]\nitems[0] = 9\n',
]) {
  try {
    runCode(source, '', true);
    throw new Error(`One-based array access accepted index 0: ${source}`);
  } catch (error) {
    if (!String(error).includes('添字0')) throw error;
  }
}
for (const [source, oneBased] of [
  ['items = [3, 8]\n表示する(items[2])\n', false],
  ['items = [[3, 8]]\n表示する(items[0, 2])\n', false],
]) {
  try {
    runCode(source, '', oneBased);
    throw new Error(`Out-of-range array read was accepted: ${source}`);
  } catch (error) {
    if (!String(error).includes('範囲外')) throw error;
  }
}
const printedArray = runCode('items = [3, 8]\n表示する(items)\n');
if (printedArray[0] !== '3,8') throw new Error(`Array output failed: ${JSON.stringify(printedArray)}`);
const printedOneBasedArray = runCode('items = [3, 8]\n表示する(items)\n', '', true);
const directOneBasedArray = runCode('表示する([3, 8])\n', '', true);
if (directOneBasedArray[0] !== '3,8') throw new Error(`Direct one-based array literal output failed: ${JSON.stringify(directOneBasedArray)}`);
const directOneBasedArrayIndex = runCode('value = [3, 8][1]\n表示する(value)\n', '', true);
if (directOneBasedArrayIndex[0] !== '3') throw new Error(`Direct one-based array literal indexing failed: ${JSON.stringify(directOneBasedArrayIndex)}`);
const nestedDirectOneBasedArrayIndex = runCode('value = [[3, 8], [5, 9]][2][1]\n表示する(value)\n', '', true);
if (nestedDirectOneBasedArrayIndex[0] !== '5') throw new Error(`Nested direct one-based array indexing failed: ${JSON.stringify(nestedDirectOneBasedArrayIndex)}`);
const directStringIndex = runCode('value = "abc"[0]\n表示する(value)\n', '', true);
if (directStringIndex[0] !== 'a') throw new Error(`Direct string indexing was changed by array literal conversion: ${JSON.stringify(directStringIndex)}`);
const stringVariableIndex = runCode('value = "abc"\n表示する(value[1], value["length"])\n');
if (stringVariableIndex[0] !== 'b3') throw new Error(`String variable indexing failed: ${JSON.stringify(stringVariableIndex)}`);
try {
  runCode('value = "abc"\n表示する(value[3])\n');
  throw new Error('Out-of-range string indexing was accepted.');
} catch (error) {
  if (!String(error).includes('範囲外')) throw error;
}
for (const invalidIndexProgram of [
  'value = 5\nresult = value[0]\n表示する(result)\n',
  'value = true\nresult = value[0]\n表示する(result)\n',
  'value = 5\nvalue[0] = 7\n',
  'items = [1, 2]\nvalue = items[1.5]\n',
  'items = [1, 2]\nvalue = items["1"]\n',
]) {
  try {
    runCode(invalidIndexProgram);
    throw new Error(`A non-indexable value was accepted as an array: ${invalidIndexProgram}`);
  } catch (error) {
    if (!String(error).includes('配列または文字列') && !String(error).includes('配列だけ') && !String(error).includes('添字には')) throw error;
  }
}
if (printedOneBasedArray[0] !== '3,8') throw new Error(`One-based array output exposed its internal offset: ${JSON.stringify(printedOneBasedArray)}`);
const printedNestedOneBasedArray = runCode('items = [[3, 8], [5, 9]]\n表示する(items)\n', '', true);
if (printedNestedOneBasedArray[0] !== '3,8,5,9') throw new Error(`Nested one-based array output exposed an internal offset: ${JSON.stringify(printedNestedOneBasedArray)}`);
const printedSparseOneBasedArray = runCode('items = []\nitems[3] = 7\n表示する(items)\n', '', true);
if (printedSparseOneBasedArray[0] !== ',,7') throw new Error(`Sparse one-based array output lost its empty positions: ${JSON.stringify(printedSparseOneBasedArray)}`);
const sparseZeroBasedRead = runCode('items = []\nitems[2] = 7\n表示する(items[1])\n');
if (sparseZeroBasedRead[0] !== 'undefined') throw new Error(`Reading an allocated sparse-array slot failed: ${JSON.stringify(sparseZeroBasedRead)}`);
const sparseOneBasedRead = runCode('items = []\nitems[3] = 7\n表示する(items[2])\n', '', true);
if (sparseOneBasedRead[0] !== 'undefined') throw new Error(`Reading an allocated one-based sparse-array slot failed: ${JSON.stringify(sparseOneBasedRead)}`);
const cyclicZeroBasedArray = runCode('items = []\nitems[0] = items\n表示する(items)\n');
if (cyclicZeroBasedArray[0] !== '[循環参照]') throw new Error(`Cyclic array output was not bounded: ${JSON.stringify(cyclicZeroBasedArray)}`);
const cyclicOneBasedArray = runCode('items = []\nitems[1] = items\n表示する(items)\n', '', true);
if (cyclicOneBasedArray[0] !== '[循環参照]') throw new Error(`Cyclic one-based array output was not bounded: ${JSON.stringify(cyclicOneBasedArray)}`);
const cyclicDebugRunner = makeRunner('items = []\nitems[0] = items\n表示する("debug")\n', '', false, { current: [] }, parseStrictInteger);
cyclicDebugRunner.next();
cyclicDebugRunner.next();
const cyclicDebugSnapshot = cyclicDebugRunner.next().value.getVars();
if (cyclicDebugSnapshot.items[0] !== cyclicDebugSnapshot.items) throw new Error('Debug snapshots did not preserve cyclic array references safely.');
const largeDebugArraySource = `items = [${Array.from({ length: 12000 }, (_, index) => index).join(',')}]\n`;
const largeDebugArrayRunner = makeRunner(largeDebugArraySource, '', false, { current: [] }, parseStrictInteger);
const largeDebugArraySnapshot = largeDebugArrayRunner.next().value.getVars().items;
if (largeDebugArraySnapshot.length !== 10001 || largeDebugArraySnapshot.at(-1) !== '[表示上限]') {
  throw new Error(`Large debug arrays were not truncated safely: length=${largeDebugArraySnapshot.length}, last=${largeDebugArraySnapshot.at(-1)}`);
}
const manyVariablesSource = `${Array.from({ length: 1200 }, (_, index) => `value${index} = ${index}`).join('\n')}\n表示する(value1199)\n`;
const manyVariablesOutput = { current: [] };
const manyVariablesGenerator = makeRunner(manyVariablesSource, '', false, manyVariablesOutput, parseStrictInteger);
const manyVariablesFirstStep = manyVariablesGenerator.next();
if (manyVariablesFirstStep.done || manyVariablesFirstStep.value.getVars().value0 !== 0 || manyVariablesFirstStep.value.getVars().value1199 !== undefined) {
  throw new Error('Shared debug variable snapshots returned incorrect initial values.');
}
let manyVariablesStep = manyVariablesFirstStep;
while (!manyVariablesStep.done) manyVariablesStep = manyVariablesGenerator.next();
if (manyVariablesOutput.current.at(-1) !== '1199') {
  throw new Error(`A program with many variables failed: ${JSON.stringify(manyVariablesOutput.current.at(-1))}`);
}
for (const [source, oneBased] of [
  ['items = [3, 8]\n表示する(items[0])\n', true],
  ['items = [3, 8]\n表示する(items[2])\n', false],
  ['items = [[3, 8]]\n表示する(items[1][0])\n', true],
  ['items = [3, 8]\n表示する(items["constructor"])\n', false],
  ['items = [3, 8]\nitems["length"] = 1\n', true],
  ['items = [3, 8]\nitems[0] = 9\n', true],
  ['items = []\nitems[100000] = 1\n', false],
  ['items = []\nitems[100001] = 1\n', true],
]) {
  try {
    runCode(source, '', oneBased);
    throw new Error(`Out-of-range array access was accepted: ${source}`);
  } catch (error) {
    if (!String(error).includes('配列の範囲外') && !String(error).includes('配列の添字') && !String(error).includes('配列には') && !String(error).includes('添字0') && !String(error).includes('添字には') && !String(error).includes('上限')) throw error;
  }
}
const commentMarkers = runCode('表示する("// # L |") # trailing comment\n');
if (commentMarkers[0] !== '// # L |') throw new Error(`Comment marker handling failed: ${JSON.stringify(commentMarkers)}`);
const descendingLoop = runCode('sum = 0\ni を 3 から 1 まで 1 ずつ減らしながら繰り返す:\n｜  sum = sum + i\n表示する(sum)\n');
if (descendingLoop[0] !== '6') throw new Error(`Descending loop failed: ${JSON.stringify(descendingLoop)}`);
const fixedLoopBounds = runCode('limit = 3\nstep = 1\nsum = 0\ni を 1 から limit まで step ずつ増やしながら繰り返す:\n｜  limit = 1\n｜  step = 2\n｜  sum = sum + i\n表示する(sum)\n');
if (fixedLoopBounds[0] !== '6') throw new Error(`For-loop bounds and step were not captured at loop start: ${JSON.stringify(fixedLoopBounds)}`);
const modifiedIncreasingCounter = runCode('sum = 0\ni を 1 から 3 まで 1 ずつ増やしながら繰り返す:\n｜  sum = sum + i\n｜  i = i + 10\n表示する(sum)\n');
if (modifiedIncreasingCounter[0] !== '6') throw new Error(`Changing an increasing loop counter changed its sequence: ${JSON.stringify(modifiedIncreasingCounter)}`);
const modifiedDecreasingCounter = runCode('sum = 0\ni を 3 から 1 まで 1 ずつ減らしながら繰り返す:\n｜  sum = sum + i\n｜  i = i - 10\n表示する(sum)\n');
if (modifiedDecreasingCounter[0] !== '6') throw new Error(`Changing a decreasing loop counter changed its sequence: ${JSON.stringify(modifiedDecreasingCounter)}`);
const arrayLoopInteraction = runCode('items = [10, 20, 30]\nsum = 0\ni を 1 から 要素数(items) まで 1 ずつ増やしながら繰り返す:\n｜  sum = sum + items[i]\n表示する(sum)\n', '', true);
if (arrayLoopInteraction[0] !== '60') throw new Error(`One-based array loop interaction failed: ${JSON.stringify(arrayLoopInteraction)}`);
const loopTemporaryCollision = runCode('__pseudo_loop_0_start = 7\nsum = 0\ni を 1 から 2 まで 1 ずつ増やしながら繰り返す:\n｜  sum = sum + i\n表示する(__pseudo_loop_0_start, sum)\n');
if (loopTemporaryCollision[0] !== '73') throw new Error(`Generated loop temporary collided with a user variable: ${JSON.stringify(loopTemporaryCollision)}`);
const nestedForLoops = runCode('sum = 0\ni を 1 から 2 まで 1 ずつ増やしながら繰り返す:\n｜  j を 1 から 2 まで 1 ずつ増やしながら繰り返す:\n｜  ｜  sum = sum + i * j\n表示する(sum)\n');
if (nestedForLoops[0] !== '9') throw new Error(`Nested for loops failed: ${JSON.stringify(nestedForLoops)}`);
const branchInsideLoop = runCode('sum = 0\ni を 1 から 3 まで 1 ずつ増やしながら繰り返す:\n｜  もし i == 2 ならば:\n｜  ｜  sum = sum + 10\n｜  そうでなければ:\n｜  ｜  sum = sum + i\n表示する(sum)\n');
if (branchInsideLoop[0] !== '14') throw new Error(`Branch inside for loop failed: ${JSON.stringify(branchInsideLoop)}`);
for (const badStepProgram of [
  'sum = 0\ni を 4 から 3 まで 0 ずつ増やしながら繰り返す:\n｜  sum = sum + i\n',
  'sum = 0\ni を 1 から 3 まで 0 ずつ増やしながら繰り返す:\n｜  sum = sum + i\n',
  'sum = 0\ni を 1 から 3 まで -1 ずつ増やしながら繰り返す:\n｜  sum = sum + i\n',
]) {
  try {
    runCode(badStepProgram);
    throw new Error(`Invalid loop step was accepted: ${badStepProgram}`);
  } catch (error) {
    if (!String(error).includes('増分は正の数')) throw error;
  }
}
try {
  runCode('i を 1e308 * 1e308 から 2 まで 1 ずつ増やしながら繰り返す:\n｜  表示する(i)\n');
  throw new Error('Infinite loop bound was accepted.');
} catch (error) {
  if (!String(error).includes('乗算結果が数値の範囲を超えました')) throw error;
}
const largeSingleIteration = runCode('i を 1e308 から 1e308 まで 1 ずつ増やしながら繰り返す:\n｜  表示する(i)\n');
if (JSON.stringify(largeSingleIteration) !== JSON.stringify(['1e+308'])) throw new Error(`Finite one-item loop failed: ${JSON.stringify(largeSingleIteration)}`);
try {
  runCode('i を 1e308 から 1.1e308 まで 1 ずつ増やしながら繰り返す:\n｜  表示する(i)\n');
  throw new Error('Non-advancing loop counter was accepted.');
} catch (error) {
  if (!String(error).includes('カウンタが数値の範囲内で進めません')) throw error;
}
const debugOutput = { current: [] };
const debugGenerator = makeRunner('answer = 42\n表示する(answer)\n', '', false, debugOutput, parseStrictInteger);
const assignmentStep = debugGenerator.next();
if (assignmentStep.done || assignmentStep.value.line !== 0 || assignmentStep.value.getVars().answer !== 42) {
  throw new Error(`Debug variable snapshot failed: ${JSON.stringify(assignmentStep)}`);
}
const printStep = debugGenerator.next();
if (printStep.done || printStep.value.line !== 1 || debugOutput.current[0] !== '42') {
  throw new Error(`Debug output step failed: ${JSON.stringify({ printStep, output: debugOutput.current })}`);
}
if (!debugGenerator.next().done) throw new Error('Debug generator did not finish after the final step.');
const prototypeNamedVariableGenerator = makeRunner('__proto__ = 7\n', '', false, { current: [] }, parseStrictInteger);
const prototypeNamedVariableStep = prototypeNamedVariableGenerator.next();
if (prototypeNamedVariableStep.done || prototypeNamedVariableStep.value.getVars()['__proto__'] !== 7) {
  throw new Error('A variable named __proto__ was lost from the debug snapshot.');
}
const falseBranchGenerator = makeRunner(
  'value = 0\nもし false ならば:\n｜  value = 1\nそうでなければ:\n｜  value = 2\n',
  '', false, { current: [] }, parseStrictInteger,
);
const falseBranchLines = [];
let falseBranchStep = falseBranchGenerator.next();
while (!falseBranchStep.done) {
  falseBranchLines.push(falseBranchStep.value.line);
  falseBranchStep = falseBranchGenerator.next();
}
if (JSON.stringify(falseBranchLines) !== JSON.stringify([0, 1, 3, 4])) {
  throw new Error(`False branch debug steps were skipped or misordered: ${JSON.stringify(falseBranchLines)}`);
}
const skippedLoopGenerator = makeRunner(
  'i を 3 から 1 まで 1 ずつ増やしながら繰り返す:\n｜  表示する(i)\n',
  '', false, { current: [] }, parseStrictInteger,
);
const skippedLoopStep = skippedLoopGenerator.next();
if (skippedLoopStep.done || skippedLoopStep.value.line !== 0 || skippedLoopStep.value.getVars().i !== 3) {
  throw new Error(`Zero-iteration loop header was not debugged: ${JSON.stringify(skippedLoopStep)}`);
}
if (!skippedLoopGenerator.next().done) throw new Error('Zero-iteration loop unexpectedly entered its body.');
const repeatedLoopGenerator = makeRunner(
  'i を 1 から 2 まで 1 ずつ増やしながら繰り返す:\n｜  表示する(i)\n',
  '', false, { current: [] }, parseStrictInteger,
);
const repeatedLoopLines = [];
let repeatedLoopStep = repeatedLoopGenerator.next();
while (!repeatedLoopStep.done) {
  repeatedLoopLines.push(repeatedLoopStep.value.line);
  repeatedLoopStep = repeatedLoopGenerator.next();
}
if (JSON.stringify(repeatedLoopLines) !== JSON.stringify([0, 1, 0, 1, 0])) {
  throw new Error(`Loop condition debug steps were skipped or misordered: ${JSON.stringify(repeatedLoopLines)}`);
}
try {
  runCode('i = 0\n1 == 1 の間繰り返す:\n｜  i = i + 1\n');
  throw new Error('Infinite loop was not stopped.');
} catch (error) {
  if (!String(error).includes('上限を超えました')) throw error;
}
const outputCapBuffer = { current: [] };
const outputCapGenerator = makeRunner(
  'i を 1 から 1001 まで 1 ずつ増やしながら繰り返す:\n｜  表示する(i)\n',
  '', false, outputCapBuffer, parseStrictInteger,
);
try {
  let step = outputCapGenerator.next();
  while (!step.done) step = outputCapGenerator.next();
  throw new Error('Output line limit was not enforced.');
} catch (error) {
  if (!String(error).includes('表示結果が上限')) throw error;
}
if (outputCapBuffer.current.length !== 1000) throw new Error(`Output cap retained the wrong number of lines: ${outputCapBuffer.current.length}`);
const oversizedOutputBuffer = { current: [] };
try {
  runCode('value = "x"\ni を 1 から 16 まで 1 ずつ増やしながら繰り返す:\n｜  value = value + value\n表示する(value, value)\n', '', false, oversizedOutputBuffer);
  throw new Error('Output character limit was not enforced.');
} catch (error) {
  if (!String(error).includes('表示結果が上限')) throw error;
}
try {
  runCode('items = []\ni を 1 から 10000 まで 1 ずつ増やしながら繰り返す:\n｜  items[i] = "abcdefghij"\n表示する(items)\n', '', true);
  throw new Error('Oversized array output bypassed the character limit.');
} catch (error) {
  if (!String(error).includes('表示結果が上限')) throw error;
}
for (const [source, expectedMessage] of [
  [' '.repeat(100001), '100000文字以内'],
  ['\n'.repeat(10000), '10000行以内'],
]) {
  try {
    runCode(source);
    throw new Error('Oversized pseudocode was accepted.');
  } catch (error) {
    if (!String(error).includes(expectedMessage)) throw error;
  }
}
try {
  runCode('表示する("入力済み")\n', 'x'.repeat(100001));
  throw new Error('Oversized program input was accepted.');
} catch (error) {
  if (!String(error).includes('プログラムへの入力は100000文字以内')) throw error;
}
try {
  runCode('n = 【整数を入力】\n', 'abc');
  throw new Error('Invalid integer input was accepted.');
} catch (error) {
  if (!String(error).includes('整数として読み取れません')) throw error;
}
for (const unsafeCode of [
  'globalThis.alert(1)\n',
  'value = 1\nresult = value++\n',
  'value = 1\nresult = --value\n',
  'value = sys_add(1, 2, 1)\n',
  '表示する(globalThis.location.href)\n',
  'value = []["constructor"]("return 7")()\n',
  'value = MATH_MAX(1, 2)\n',
  'value = MATH_TRUNC(1.2)\n',
  'value = sys_divide(1, 2, 1)\n',
  'value = sys_int_divide(3, 2, 1)\n',
  'value = sys_modulo(3, 2, 1)\n',
  'value = sys_subtract(3, 2, 1)\n',
  'value = sys_multiply(3, 2, 1)\n',
  'value = sys_power(3, 2, 1)\n',
  'value = sys_arr([1, 2])\n',
  'value = sys_get_index([1], 0, 1)\n',
  'value = sys_set_index([1], 0, 2, 1)\n',
]) {
  try {
    runCode(unsafeCode);
    throw new Error(`Unsupported JavaScript was executed: ${unsafeCode}`);
  } catch (error) {
    if (String(error).includes('Unsupported JavaScript was executed')) throw error;
  }
}
for (const invalidPseudoCode of [
  'value = missingValue + 1\n',
  'value = 1 < 2 < 3\n',
  'value = (1, 2)\n',
  'value = 最大値(1, 2,)\n',
  'value = true ! false\n',
  'elif = 1\n',
  'かつ = 1\n',
  'もし missingValue == 1 ならば:\n｜  value = 1\n',
  'missingValue の間繰り返す:\n｜  value = 1\n',
  'もし true ならば:\nvalue = 1\n',
  'もし true ならば:\n',
  '  value = 1\n',
  'そうでなければ:\nvalue = 1\n',
]) {
  try {
    runCode(invalidPseudoCode);
    throw new Error(`Invalid pseudocode was accepted: ${invalidPseudoCode}`);
  } catch (error) {
    if (String(error).includes('Invalid pseudocode was accepted')) throw error;
  }
}
for (const runtimeName of ['Array', 'Number', 'Object', 'Proxy', 'Infinity']) {
  try {
    runCode(`${runtimeName} = 1\n`);
    throw new Error(`Runtime helper name was accepted as a variable: ${runtimeName}`);
  } catch (error) {
    if (!String(error).includes('使用できない変数名です')) throw error;
  }
}

function runCode(code, input = '', isOneBased = false, outputBufferRef = { current: [] }) {
  const generator = makeRunner(code, input, isOneBased, outputBufferRef, parseStrictInteger);
  let step = generator.next();
  let steps = 0;
  while (!step.done) {
    if (++steps > 100000) throw new Error('Inline sample exceeded execution limit');
    step = generator.next();
  }
  return outputBufferRef.current;
}

let arithmeticSeed = 0x51f15e;
const nextArithmeticRandom = (maximum) => {
  arithmeticSeed = (Math.imul(arithmeticSeed, 1664525) + 1013904223) >>> 0;
  return arithmeticSeed % maximum;
};
const makeArithmeticLeaf = () => {
  const value = nextArithmeticRandom(9) + 1;
  return { source: String(value), value };
};
const makeArithmeticExpression = (depth = 0) => {
  const left = depth >= 3 || nextArithmeticRandom(4) === 0
    ? makeArithmeticLeaf()
    : makeArithmeticExpression(depth + 1);
  const operator = ['+', '-', '*', '/', '÷', '%'][nextArithmeticRandom(6)];
  const right = operator === '/' || operator === '÷' || operator === '%'
    ? makeArithmeticLeaf()
    : depth >= 3 || nextArithmeticRandom(4) === 0
      ? makeArithmeticLeaf()
      : makeArithmeticExpression(depth + 1);
  const value = operator === '+' ? left.value + right.value
    : operator === '-' ? left.value - right.value
      : operator === '*' ? left.value * right.value
        : operator === '/' ? left.value / right.value
          : operator === '÷' ? Math.trunc(left.value / right.value)
            : left.value % right.value;
  return { source: `(${left.source} ${operator} ${right.source})`, value };
};
for (let index = 0; index < 250; index++) {
  const expression = makeArithmeticExpression();
  const actual = runCode(`answer = ${expression.source}\n表示する(answer)\n`);
  const actualNumber = Number(actual[0]);
  if (!Number.isFinite(actualNumber) || Math.abs(actualNumber - expression.value) > Math.max(1e-9, Math.abs(expression.value) * 1e-12)) {
    throw new Error(`Generated arithmetic expression ${index} differed: ${expression.source} expected ${expression.value}, received ${JSON.stringify(actual)}`);
  }
}

console.log(`Verified ${cases.length} presets and focused runner edge cases.`);
