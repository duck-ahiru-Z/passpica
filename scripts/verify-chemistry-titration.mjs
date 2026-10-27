import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateTitrationProblem, isTitrationAnswerCorrect, titrationPatterns } from '../src/lib/chemistryTitration.ts';

const counts = Object.fromEntries(titrationPatterns.map(pattern => [pattern, 0]));
const prompts = Object.fromEntries(titrationPatterns.map(pattern => [pattern, new Set()]));
for (let i = 0; i < 12_000; i += 1) {
  const problem = generateTitrationProblem('mix');
  counts[problem.pattern] += 1;
  prompts[problem.pattern].add(problem.question);
  assert.ok(Number.isFinite(problem.answer) && problem.answer > 0);
  assert.ok(problem.question.includes('mL') && problem.question.includes('mol/L'));
  assert.ok(problem.question.includes(({ 'one-to-one': '一価酸', 'unknown-base-concentration': '濃度未知の一価塩基', 'diprotic-acid': '二価酸', 'divalent-base': '二価塩基', 'coefficient-ratio': '三価酸' })[problem.pattern]));
  assert.ok(problem.explanation.includes('係数比') && problem.explanation.includes('L に直して'));
  const volumes = [...problem.question.matchAll(/([\d.]+) mL/g)].map(([, amount]) => Number(amount));
  const [, acidCoefficient, baseCoefficient] = problem.explanation.match(/n\(酸\):n\(塩基\)=(\d+):(\d+)/);
  assert.equal(volumes.length, 2, `each titration question must expose acid and base volumes: ${problem.question}`);
  const [acidVolume, baseVolume] = volumes;
  const expectedAnswer = problem.pattern === 'unknown-base-concentration'
    ? Number(problem.question.match(/濃度 ([\d.]+) mol\/L/)[1]) * acidVolume / baseVolume * Number(baseCoefficient) / Number(acidCoefficient)
    : Number(problem.question.match(/、([\d.]+) mol\/L の/)[1]) * baseVolume / acidVolume * Number(acidCoefficient) / Number(baseCoefficient);
  assert.ok(Math.abs(problem.answer - expectedAnswer) < 1e-12, `concentration must follow the displayed volume and stoichiometric ratio: ${JSON.stringify(problem)}`);
  assert.ok(isTitrationAnswerCorrect(String(problem.answer), problem.answer));
  assert.ok(!isTitrationAnswerCorrect(String(problem.answer + 1), problem.answer));
}
for (const pattern of titrationPatterns) {
  assert.equal(counts[pattern], 2_400, `${pattern} should occur equally often in complete balanced cycles`);
  assert.equal(prompts[pattern].size, 3, `${pattern} should rotate through distinct numerical variants`);
  const fixed = generateTitrationProblem(pattern);
  assert.equal(fixed.pattern, pattern);
}
assert.match(generateTitrationProblem('diprotic-acid').explanation, /H₂SO₄ \+ 2NaOH → Na₂SO₄ \+ 2H₂O/);
assert.match(generateTitrationProblem('divalent-base').explanation, /2HCl \+ Ca\(OH\)₂ → CaCl₂ \+ 2H₂O/);
assert.match(generateTitrationProblem('coefficient-ratio').explanation, /2H₃PO₄ \+ 3Ca\(OH\)₂ → Ca₃\(PO₄\)₂ \+ 6H₂O/);
assert.match(generateTitrationProblem('one-to-one').question, /一価酸 .*一価塩基/);
assert.match(generateTitrationProblem('diprotic-acid').question, /二価酸 .*一価塩基/);
assert.match(generateTitrationProblem('divalent-base').question, /一価酸 .*二価塩基/);
assert.match(generateTitrationProblem('coefficient-ratio').question, /三価酸 .*二価塩基/);
const unknownBase = generateTitrationProblem('unknown-base-concentration', () => 0.999);
const [, unknownAcidVolume, unknownAcidConcentration, unknownBaseVolume] = unknownBase.question.match(/一価酸 HCl 水溶液 ([\d.]+) mL（濃度 ([\d.]+) mol\/L）.*濃度未知の一価塩基 NaOH 水溶液で滴定したところ ([\d.]+) mL/);
const expectedUnknownBaseConcentration = Number(unknownAcidConcentration) * Number(unknownAcidVolume) / Number(unknownBaseVolume);
assert.ok(Math.abs(unknownBase.answer - expectedUnknownBaseConcentration) < 1e-12);
assert.ok(unknownBase.question.includes('塩基のモル濃度を求めよ。'));
assert.ok(unknownBase.explanation.includes(`c(塩基)=${Number(expectedUnknownBaseConcentration.toFixed(6))} mol/L`));

const page = fs.readFileSync('src/app/learn/chemistry/titration-drill/page.tsx', 'utf8');
const visualPage = fs.readFileSync('src/app/learn/chemistry/acid-base/page.tsx', 'utf8');
const portal = fs.readFileSync('src/app/drill/page.tsx', 'utf8');
assert.match(page, /全パターンランダム/);
assert.match(page, /\$\{answerSubstance\}のモル濃度（小数第3位まで）/);
assert.match(page, /problem\.explanation/);
assert.match(page, /小数第3位まで、許容誤差 ±0\.0005/);
assert.equal(isTitrationAnswerCorrect('0.067', 1 / 15), true, 'three-decimal rounded titration concentrations should be accepted');
assert.equal(isTitrationAnswerCorrect('0.066', 1 / 15), false, 'answers outside the displayed rounding tolerance should be rejected');
assert.match(page, /href="\/learn\/chemistry\/acid-base"/);
assert.match(visualPage, /href="\/learn\/chemistry\/titration-drill"/);
assert.match(portal, /\/learn\/chemistry\/titration-drill/);
console.log(`Chemistry titration verified: 12,000 mixed questions; balanced counts ${JSON.stringify(counts)}; 3 variants per pattern; forward/reverse concentration questions, equations, fixed modes, numeric grading, units, and explanations.`);
