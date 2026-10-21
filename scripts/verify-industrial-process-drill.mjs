import assert from 'node:assert/strict';
import { generateIndustrialProblem, industrialPatterns } from '../src/lib/industrialProcessDrill.ts';

assert.equal(industrialPatterns.length, 11);
const mapped = new Map();
for (const pattern of industrialPatterns) {
  const problem = generateIndustrialProblem(pattern);
  assert.equal(problem.pattern, pattern);
  assert.ok(problem.options.includes(problem.answer), `${pattern} answer must be selectable`);
  assert.equal(new Set(problem.options).size, problem.options.length, `${pattern} options must be unique`);
  assert.ok(problem.explanation.length > 10);
  mapped.set(pattern, problem);
}
assert.match(mapped.get('contact-2').explanation, /V₂O₅/);
assert.match(mapped.get('ostwald-3').explanation, /副生NO/);
assert.match(mapped.get('solvay-2').explanation, /CO₂/);
assert.match(mapped.get('solvay-5').explanation, /再利用/);
const counts = Object.fromEntries(industrialPatterns.map(pattern => [pattern, 0]));
let previous = '';
const sampleCount = 11000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generateIndustrialProblem('mix');
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'mixed stages should not repeat consecutively');
  assert.ok(problem.options.includes(problem.answer));
  previous = problem.pattern;
}
for (const pattern of industrialPatterns) assert.equal(counts[pattern], 1000);
console.log(`Industrial process drill verified: ${industrialPatterns.length} fixed patterns and ${sampleCount} balanced mixed questions.`);

// Independently balance the reaction equations taught by each stage and
// ensure the answer names the expected product(s), not merely any option.
const reactionCases = {
  'contact-1': { equation: 'S + O2 -> SO2', products: ['SO2'], shown: 'S + O₂ → SO₂' },
  'contact-2': { equation: '2SO2 + O2 -> 2SO3', products: ['SO3'], shown: '2SO₂ + O₂ ⇄ 2SO₃' },
  'contact-3': { equation: 'SO3 + H2O -> H2SO4', products: ['H2SO4'], anchors: ['SO₃', '発煙硫酸', '硫酸'] },
  'ostwald-1': { equation: '4NH3 + 5O2 -> 4NO + 6H2O', products: ['NO'], shown: '4NH₃ + 5O₂ → 4NO + 6H₂O' },
  'ostwald-2': { equation: '2NO + O2 -> 2NO2', products: ['NO2'], shown: '2NO + O₂ → 2NO₂' },
  'ostwald-3': { equation: '3NO2 + H2O -> 2HNO3 + NO', products: ['HNO3', 'NO'], shown: '3NO₂ + H₂O → 2HNO₃ + NO' },
  'solvay-1': { equation: 'NaCl + H2O + NH3 + CO2 -> NaHCO3 + NH4Cl', products: ['NaHCO3'], shown: 'NaCl + H₂O + NH₃ + CO₂ → NaHCO₃↓ + NH₄Cl' },
  'solvay-2': { equation: '2NaHCO3 -> Na2CO3 + H2O + CO2', products: ['Na2CO3'], shown: '2NaHCO₃ → Na₂CO₃ + H₂O + CO₂' },
  'solvay-3': { equation: 'CaCO3 -> CaO + CO2', products: ['CaO', 'CO2'], shown: 'CaCO₃ → CaO + CO₂' },
  'solvay-4': { equation: 'CaO + H2O -> Ca(OH)2', products: ['Ca(OH)2'], shown: 'CaO + H₂O → Ca(OH)₂' },
  'solvay-5': { equation: '2NH4Cl + Ca(OH)2 -> CaCl2 + 2H2O + 2NH3', products: ['NH3'], shown: '2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2H₂O + 2NH₃' },
};
const subscripts = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
const normalize = text => text.replace(/[₀-₉]/g, digit => subscripts[digit]).replaceAll('↓', '').replaceAll('⇄', '→').replaceAll(' ', '');
const parseFormula = formula => {
  const tokens = formula.match(/[A-Z][a-z]?|\d+|[()]/g) ?? [];
  const stack = [{}];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '(') stack.push({});
    else if (token === ')') {
      const group = stack.pop();
      const multiplier = /^\d+$/.test(tokens[index + 1] ?? '') ? Number(tokens[++index]) : 1;
      for (const [element, count] of Object.entries(group)) stack.at(-1)[element] = (stack.at(-1)[element] ?? 0) + count * multiplier;
    } else if (/^[A-Z]/.test(token)) {
      const count = /^\d+$/.test(tokens[index + 1] ?? '') ? Number(tokens[++index]) : 1;
      stack.at(-1)[token] = (stack.at(-1)[token] ?? 0) + count;
    } else throw new Error(`Unexpected formula token ${token} in ${formula}`);
  }
  assert.equal(stack.length, 1, `unclosed formula group: ${formula}`);
  return stack[0];
};
const parseSide = side => {
  const total = {};
  for (const term of side.split('+')) {
    const match = term.trim().match(/^(\d*)(.*)$/);
    assert.ok(match?.[2], `invalid reaction term: ${term}`);
    const coefficient = match[1] ? Number(match[1]) : 1;
    for (const [element, count] of Object.entries(parseFormula(match[2]))) total[element] = (total[element] ?? 0) + coefficient * count;
  }
  return Object.fromEntries(Object.entries(total).sort(([left], [right]) => left.localeCompare(right)));
};

for (const [pattern, check] of Object.entries(reactionCases)) {
  const problem = mapped.get(pattern);
  const [left, right] = check.equation.split('->');
  assert.deepEqual(parseSide(left), parseSide(right), `${pattern} reaction must conserve each element`);
  for (const product of check.products) assert.ok(normalize(problem.answer).includes(product), `${pattern} answer must include ${product}`);
  if (check.shown) assert.ok(normalize(problem.explanation).includes(normalize(check.shown)), `${pattern} explanation must show the checked equation`);
  if (check.anchors) for (const anchor of check.anchors) assert.ok(problem.explanation.includes(anchor), `${pattern} explanation must mention ${anchor}`);
}
console.log(`Industrial process chemistry independently checked: balanced equations and answer products across ${Object.keys(reactionCases).length} stages.`);
