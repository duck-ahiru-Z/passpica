import assert from 'node:assert/strict';
import fs from 'node:fs';
import { hasUniqueMode, isDataAnalysisAnswerCorrect, parseDataAnalysisAnswer } from '../src/lib/dataAnalysis1DValidation.ts';

const page = fs.readFileSync('src/app/learn/math/data-analysis-1d-drill/page.tsx', 'utf8');
assert.ok(page.includes('sum % n !== 0 || !hasUniqueMode(data, modeVal)'), 'mean adjustment must not produce a tied or incorrect mode');
assert.ok(page.includes('isDataAnalysisAnswerCorrect(answers, expected)'), 'the page must validate complete numeric answers');
for (const label of ['1変量データ分析の演習パターン', '平均値の答え', '中央値の答え', '最頻値の答え', '分散の答え', '変換後の平均値の答え', '変換後の分散の答え']) {
  assert.ok(page.includes(`aria-label="${label}"`), `missing accessible name: ${label}`);
}
assert.ok(page.includes('role="img" aria-label={`データのドットプロット'), 'the dot plot must have a useful accessible description');
assert.equal((page.match(/return \{ pattern: p, qStr, data, ans1: variance\.toString\(\), mean, expLines \};/g) ?? []).length, 2, 'both variance modes must retain the dataset mean separately from the variance answer');
assert.ok(page.includes('if (hasChecked && problem.mean !== undefined)'), 'the graph mean line must use the retained mean');
assert.ok(page.includes('平均値は${problem.mean}'), 'the graph description must announce the retained mean');
assert.ok(!page.includes('parseFloat(problem.ans1!)'), 'variance answers must never be mistaken for the mean on the graph');
assert.ok(page.includes('<ExplanationLine value={line} />'), 'Japanese explanation prose must stay outside KaTeX math mode');

assert.equal(hasUniqueMode([3, 3, 1, 2, 4], 3), true);
assert.equal(hasUniqueMode([3, 3, 1, 1, 4], 3), false, 'a tied mode must not be presented as unique');
assert.equal(hasUniqueMode([3, 2, 2, 4], 3), false, 'the designated answer must be the actual mode');
assert.equal(hasUniqueMode([], 3), false);

for (const invalid of ['', '1abc', '2.5xyz', '1e2', 'Infinity', 'NaN', '--1', '.']) {
  assert.equal(parseDataAnalysisAnswer(invalid), null, `invalid numeric answer accepted: ${invalid}`);
}
for (const [input, expected] of [['12', 12], ['-0.5', -0.5], ['.25', 0.25], ['2.', 2], [' 4.75 ', 4.75]]) {
  assert.equal(parseDataAnalysisAnswer(input), expected);
}
assert.equal(isDataAnalysisAnswerCorrect(['10', '8', '6'], ['10', '8', '6']), true);
assert.equal(isDataAnalysisAnswerCorrect(['10junk', '8', '6'], ['10', '8', '6']), false);
assert.equal(isDataAnalysisAnswerCorrect(['10', '8'], ['10', '8', '6']), false);
assert.equal(isDataAnalysisAnswerCorrect(['21', '16'], ['21', '16']), true);

console.log('One-variable data analysis validation verified: unique modes, strict numeric inputs, complete answer sets, accessible control/graph labels.');
