import assert from 'node:assert/strict';
import katex from 'katex';
import { formatGeometricSequenceSumPrompt } from '../src/lib/sequenceSumPrompt.ts';

const cases = [
  [8, '-2', 6],
  [16, '\\frac{1}{2}', 7],
  [32, '-\\frac{1}{2}', 4],
];

for (const [initial, ratio, termCount] of cases) {
  const prompt = formatGeometricSequenceSumPrompt(initial, ratio, termCount);
  assert.equal(prompt.includes('$'), false, 'math text inside KaTeX must not add nested dollar delimiters');
  assert.match(prompt, new RegExp(`初項 ${initial} .*第 ${termCount} 項`));
  assert.doesNotThrow(() => katex.renderToString(prompt, { throwOnError: true, strict: 'ignore' }), `KaTeX must render ratio ${ratio}`);
}

console.log(`Geometric-sum prompts verified: ${cases.length} negative/integer/fractional ratios render without KaTeX parse errors.`);
