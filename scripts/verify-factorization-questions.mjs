import { areFactorizationsEquivalent, factorizationPatterns, generateFactorizationQuestion, normalizeFactorizationAnswer } from '../src/lib/factorizationQuestions.ts';
import fs from 'node:fs';
import path from 'node:path';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/factorization-strategy-drill/page.tsx'), 'utf8');
if (!/type="radio"\s+name="factorization-strategy"/.test(drillPage) || drillPage.includes('aria-pressed={choice === option}') || !drillPage.includes('role="status" aria-live="polite"')) {
  throw new Error('factorization choices must be a single-choice radio group with accessible answer feedback');
}
if (!drillPage.includes('setChoice(option); setChecked(false);')) {
  throw new Error('changing a factorization strategy must clear the previous feedback');
}
for (const requirement of ["mode === 'mix' && (", 'aria-label="因数分解した式"', '因数の積の形で答えてください。', 'placeholder="例：(x-3)(x+3)"', 'areFactorizationsEquivalent(factorAnswer, question.factorization)', 'const correct = strategyCorrect && factorizationCorrect', "disabled={!factorAnswer.trim() || (mode === 'mix' && !choice)}", '基礎練習：${labels[mode]}の型で因数分解しましょう', '解法選択：{strategyCorrect ?', '因数分解の式：{factorizationCorrect ?']) {
  if (!drillPage.includes(requirement)) throw new Error(`factorization practice is missing fixed-answer behavior: ${requirement}`);
}

const fixedRandom = () => 0.42;
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
}
if (normalizeFactorizationAnswer(' (x−3) (x+3) ') !== normalizeFactorizationAnswer('(x-3)(x+3)')) throw new Error('full-width minus and spacing should be accepted in factorization answers');
if (normalizeFactorizationAnswer('(x+4)²') !== normalizeFactorizationAnswer('(x+4)^2')) throw new Error('superscript powers should be accepted in factorization answers');
if (!areFactorizationsEquivalent('(x²−5)(x²−3)', '(x^2-3)(x^2-5)')) throw new Error('commuted quadratic factors must be accepted as equivalent');
if (!areFactorizationsEquivalent('(x-4)(x-4)', '(x-4)^2')) throw new Error('repeating a factor explicitly must be equivalent to its squared form');
if (!areFactorizationsEquivalent('(x-4)^2(x+1)', '(x+1)(x-4)(x-4)')) throw new Error('factored expressions with repeated powers must be accepted in either factor order');
if (!areFactorizationsEquivalent('(4x+3)(x+5)', '(4x+3)(1x+5)')) throw new Error('an omitted coefficient of 1 must be accepted as equivalent');
if (!areFactorizationsEquivalent('(x^2-3)(x+5)', '(1x^2-3)(1x+5)')) throw new Error('implicit coefficients of 1 must be accepted on linear and quadratic terms');
if (!areFactorizationsEquivalent('(x-1)(x+4)(x+2)', '(x+2)(x-1)(x+4)')) throw new Error('all reordered groups of factors must be accepted');
if (!areFactorizationsEquivalent('(x−3) (x+3)', '(x-3)(x+3)')) throw new Error('minus glyph and spacing normalization must still be applied during comparison');
if (areFactorizationsEquivalent('(x²−5)(x²−2)', '(x^2-3)(x^2-5)')) throw new Error('different factor products must not be accepted');
if (!areFactorizationsEquivalent('(x−3)(x+3)', '(x+3)(x−3)')) throw new Error('reordered factors with normalized minus signs must be accepted');
if (areFactorizationsEquivalent('(x-3)(x+3)', '(x-3)(x+2)')) throw new Error('a different constant factor must be rejected');
if (areFactorizationsEquivalent('x-3)(x+3)', '(x-3)(x+3)')) throw new Error('malformed parentheses must be rejected');
if (areFactorizationsEquivalent('(x-3)(x+3))', '(x-3)(x+3)')) throw new Error('trailing characters must be rejected');
if (areFactorizationsEquivalent('(x-3)(x+3)', '(x-3)(x+3)(x+1)')) throw new Error('an additional non-unit factor must not be ignored');
const degenerateCrossSequence = [0, 0, 0.5, 0.34, 0.34];
let degenerateCrossIndex = 0;
const nonIdentityCross = generateFactorizationQuestion('cross', () => degenerateCrossSequence[degenerateCrossIndex++]);
if (nonIdentityCross.factorization === '(2x+3)(2x+3)') throw new Error('cross-pattern practice must not degenerate into a perfect-square identity');
const unitCoefficientSequence = [0, 0, 0, 0, 0];
let unitCoefficientIndex = 0;
const unitCoefficientCross = generateFactorizationQuestion('cross', () => unitCoefficientSequence[unitCoefficientIndex++]);
if (unitCoefficientCross.factorization !== '(2x+1)(x+1)') throw new Error('cross-pattern display must omit an explicit coefficient of 1');
for (const [patternIndex, pattern] of factorizationPatterns.entries()) {
  const random = seededRandom(7001 + patternIndex);
  const expressions = new Set();
  for (let index = 0; index < 500; index += 1) {
    const question = generateFactorizationQuestion(pattern, random);
    if (question.pattern !== pattern || !question.expression || !question.factorization || !question.explanation) throw new Error(`incomplete ${pattern} question`);
    if (!question.options.includes(question.answer) || question.options.length !== factorizationPatterns.length) throw new Error(`invalid choices for ${pattern}`);
    if (pattern === 'common' && !question.explanation.includes('判別式')) throw new Error('common-factor questions must explain whether further factorization is possible');
    if (pattern === 'common' && !question.explanation.includes('< 0')) throw new Error('common-factor remainder must be irreducible over the reals');
    if (pattern === 'cross' && !/\(\d*x\+\d+\)\(\d*x\+\d+\)/.test(question.explanation)) throw new Error('tawagake must produce and explain two non-monic binomials');
    if (pattern === 'cross' && question.factorization.includes('1x')) throw new Error('tawagake display should omit a leading coefficient of 1');
    if (pattern === 'cross' && !question.explanation.includes('交差積')) throw new Error('tawagake must explain its cross products');
    if (pattern === 'substitution' && !/x\^4-/.test(question.expression)) throw new Error('substitution questions must require a difference of squares after substitution');
    if (pattern === 'substitution') {
      const [, middle, constant] = question.expression.match(/^x\^4-(\d+)x\^2\+(\d+)$/) ?? [];
      const a = Number(question.explanation.match(/X−(\d+)/)?.[1]);
      const b = Number(question.explanation.match(/\(X−\d+\)\(X−(\d+)\)/)?.[1]);
      if (!middle || !constant || a === b || Number.isInteger(Math.sqrt(a)) || Number.isInteger(Math.sqrt(b))) {
        throw new Error(`substitution question overlaps with a square identity: ${question.expression}`);
      }
      if (Number(middle) !== a + b || Number(constant) !== a * b) throw new Error(`substitution explanation does not match ${question.expression}`);
    }
    if (pattern === 'higher' && !question.explanation.includes('(x−1)(x+1)')) throw new Error('higher-degree explanation must finish the factorization');
    if (pattern === 'common') {
      const [, a, b, c] = question.expression.match(/^(\d+)x\^2 \+ (\d+)x \+ (\d+)$/);
      const [, factor, qa, qb, qc] = question.factorization.match(/^(\d+)\((\d+)x\^2\+(\d+)x\+(\d+)\)$/);
      if (Number(a) !== Number(factor) * Number(qa) || Number(b) !== Number(factor) * Number(qb) || Number(c) !== Number(factor) * Number(qc)) throw new Error('common-factor result does not expand to the question');
    }
    if (pattern === 'identity' && !question.explanation.includes(question.factorization.replaceAll('^2', '²').replaceAll('-', '−'))) throw new Error('identity result must agree with its explanation');
    if (pattern === 'cross' && !question.explanation.includes(`したがって ${question.factorization}`)) throw new Error('tawagake result must agree with its explanation');
    if (pattern === 'substitution' && !question.explanation.includes(`${question.factorization.replaceAll('^2', '²').replaceAll('-', '−')} とします。`)) throw new Error('substitution result must agree with its explanation');
    if (pattern === 'higher' && !question.explanation.includes(`${question.factorization.replaceAll('-', '−')} とします。`)) throw new Error('higher-degree result must agree with its explanation');
    expressions.add(question.expression);
  }
  const minimumDistinct = { common: 100, identity: 24, cross: 50, substitution: 15, higher: 5 }[pattern];
  if (expressions.size < minimumDistinct) throw new Error(`${pattern} exercised only ${expressions.size} distinct expressions; expected at least ${minimumDistinct}`);
}

const mixedQuestions = Array.from({ length: 1000 }, () => generateFactorizationQuestion('mix', fixedRandom));
const mixed = mixedQuestions.map(question => question.pattern);
for (const question of mixedQuestions) {
  if (!question.options.includes(question.answer) || !areFactorizationsEquivalent(question.factorization, question.factorization)) {
    throw new Error(`mixed practice must pair a strategy choice with a factorable answer: ${JSON.stringify(question)}`);
  }
  if (areFactorizationsEquivalent(`${question.factorization}x`, question.factorization)) {
    throw new Error(`mixed practice accepted an incorrect factorization: ${question.factorization}`);
  }
}
for (let start = 0; start < mixed.length; start += factorizationPatterns.length) {
  if (new Set(mixed.slice(start, start + factorizationPatterns.length)).size !== factorizationPatterns.length) throw new Error(`mixed batch ${start} omitted a pattern`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed mode repeated adjacent patterns');


console.log('Factorization strategy verified: 2,500 seeded fixed-mode questions with diverse expressions and 1,000 balanced mixed questions across all five patterns.');
