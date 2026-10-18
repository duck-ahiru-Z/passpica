import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseRationalAnswer, rationalEquals } from '../src/lib/rationalInput.ts';
import { parseStrictPositiveInteger } from '../src/lib/strictPositiveInteger.ts';

const pageChecks = [
  ['complex-drill', 'parseStrictPositiveInteger(inN)', 'parseStrictPositiveInteger(inZn)'],
  ['sine-rule-drill', 'parseStrictPositiveInteger(ansDeg)'],
  ['cosine-rule-drill', 'parseStrictPositiveInteger(ansDeg)'],
  ['logarithm-drill', 'parseRationalAnswer(ansVal)', 'rationalEquals(answer,'],
];

for (const [slug, ...required] of pageChecks) {
  const page = fs.readFileSync(path.join(process.cwd(), `src/app/learn/math/${slug}/page.tsx`), 'utf8');
  for (const snippet of required) assert.ok(page.includes(snippet), `${slug} must use ${snippet}`);
  assert.ok(!/parseInt\((?:inN|inZn|ansDeg|parts\[|uStr)/.test(page), `${slug} must not truncate exact answers`);
}

for (const [input, expected] of [
  ['1', 1], ['12', 12], [' 007 ', 7], ['', null], ['0', null], ['-1', null],
  ['+1', null], ['1.0', null], ['1.8', null], ['1e2', null], ['12abc', null],
  ['9007199254740992', null],
]) assert.equal(parseStrictPositiveInteger(input), expected, `strict positive integer ${JSON.stringify(input)}`);

for (const [input, expected] of [
  ['7/3', { numerator: 7, denominator: 3 }], ['14/6', { numerator: 7, denominator: 3 }],
  ['7.8/3', null], ['7/3.5', null], ['7/3/2', null], ['7/0', null], ['1e2', null],
]) assert.deepEqual(parseRationalAnswer(input), expected, `strict rational ${JSON.stringify(input)}`);

assert.ok(rationalEquals(parseRationalAnswer('14/6'), { numerator: 7, denominator: 3 }));
console.log('Exact-answer parsing verified: 12 strict integer cases, 7 rational forms, and four drill integrations.');
