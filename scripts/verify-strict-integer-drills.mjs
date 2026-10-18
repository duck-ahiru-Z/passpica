import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseStrictInteger } from '../src/lib/strictInteger.ts';

for (const [input, expected] of [
  ['0', 0], ['-12', -12], ['+8', 8], [' 007 ', 7], ['', null],
  ['1.2', null], ['1e2', null], ['2abc', null], ['--3', null],
  ['9007199254740992', null],
]) assert.equal(parseStrictInteger(input), expected, `strict integer ${JSON.stringify(input)}`);
assert.equal(parseStrictInteger('', 0), 0);
assert.equal(parseStrictInteger('', 1), 1);

const integrations = [
  ['circle-tangent-drill', 'parseStrictInteger(a, 0)', 'parseStrictInteger(b, 0)', 'parseStrictInteger(c, 0)'],
  ['ellipse-drill', 'parseStrictInteger(ans1)', 'parseStrictInteger(ans2)'],
  ['hyperbola-parabola-drill', 'parseStrictInteger(ans1', 'parseStrictInteger(ans2'],
  ['cross-multiply-drill', 'parseStrictInteger(ansK, 1)', 'parseStrictInteger(ansP)', 'uk === null'],
];
for (const [slug, ...snippets] of integrations) {
  const page = fs.readFileSync(path.join(process.cwd(), `src/app/learn/math/${slug}/page.tsx`), 'utf8');
  for (const snippet of snippets) assert.ok(page.includes(snippet), `${slug} must use strict integer validation (${snippet})`);
}

console.log('Strict integer answer parsing verified: 10 input cases, blank defaults, and four geometry/factorization drill integrations.');
