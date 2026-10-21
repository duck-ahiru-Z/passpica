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
  assert.ok(problem.explanation.includes('係数比') && problem.explanation.includes('L に直して'));
  assert.ok(isTitrationAnswerCorrect(String(problem.answer), problem.answer));
  assert.ok(!isTitrationAnswerCorrect(String(problem.answer + 1), problem.answer));
}
for (const pattern of titrationPatterns) {
  assert.equal(counts[pattern], 3_000, `${pattern} should occur equally often in complete balanced cycles`);
  assert.equal(prompts[pattern].size, 3, `${pattern} should rotate through distinct numerical variants`);
  const fixed = generateTitrationProblem(pattern);
  assert.equal(fixed.pattern, pattern);
}
assert.match(generateTitrationProblem('diprotic-acid').explanation, /H₂SO₄ \+ 2NaOH → Na₂SO₄ \+ 2H₂O/);
assert.match(generateTitrationProblem('divalent-base').explanation, /2HCl \+ Ca\(OH\)₂ → CaCl₂ \+ 2H₂O/);
assert.match(generateTitrationProblem('coefficient-ratio').explanation, /2H₃PO₄ \+ 3Ca\(OH\)₂ → Ca₃\(PO₄\)₂ \+ 6H₂O/);

const page = fs.readFileSync('src/app/learn/chemistry/titration-drill/page.tsx', 'utf8');
const visualPage = fs.readFileSync('src/app/learn/chemistry/acid-base/page.tsx', 'utf8');
const portal = fs.readFileSync('src/app/drill/page.tsx', 'utf8');
assert.match(page, /全パターンランダム/);
assert.match(page, /aria-label="酸のモル濃度（小数第3位まで）"/);
assert.match(page, /problem\.explanation/);
assert.match(page, /小数第3位まで、許容誤差 ±0\.0005/);
assert.match(page, /酸のモル濃度（小数第3位まで）/);
assert.equal(isTitrationAnswerCorrect('0.067', 1 / 15), true, 'three-decimal rounded titration concentrations should be accepted');
assert.equal(isTitrationAnswerCorrect('0.066', 1 / 15), false, 'answers outside the displayed rounding tolerance should be rejected');
assert.match(page, /href="\/learn\/chemistry\/acid-base"/);
assert.match(visualPage, /href="\/learn\/chemistry\/titration-drill"/);
assert.match(portal, /\/learn\/chemistry\/titration-drill/);
console.log(`Chemistry titration verified: 12,000 mixed questions; balanced counts ${JSON.stringify(counts)}; 3 variants per pattern; equations, fixed modes, numeric grading, units, and explanations.`);
