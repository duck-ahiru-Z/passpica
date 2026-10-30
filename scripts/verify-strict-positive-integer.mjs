import fs from 'node:fs';
import path from 'node:path';
import { parseStrictPositiveInteger } from '../src/lib/strictPositiveInteger.ts';

const cases = [
  ['1', false, 1],
  ['42', false, 42],
  [' 007 ', false, 7],
  ['', true, 1],
  ['', false, null],
  ['0', false, null],
  ['-1', false, null],
  ['+1', false, null],
  ['1.0', false, null],
  ['1.5', false, null],
  ['1e0', false, null],
  ['Infinity', false, null],
  ['9007199254740992', false, null],
];

for (const [value, blankMeansOne, expected] of cases) {
  const actual = parseStrictPositiveInteger(value, blankMeansOne);
  if (actual !== expected) throw new Error(`${JSON.stringify(value)} returned ${actual}; expected ${expected}`);
}

for (const slug of ['euclidean-algorithm-drill', 'permutation-combination-drill']) {
  const page = fs.readFileSync(path.join(process.cwd(), `src/app/learn/math/${slug}/page.tsx`), 'utf8');
  if (!page.includes('parseStrictPositiveInteger(ansVal)') || page.includes('parseInt(ansVal)')) {
    throw new Error(`${slug} must reject malformed integer answers instead of truncating them`);
  }
  if (slug === 'permutation-combination-drill') {
    for (const text of [
      'aria-label="場合の数の演習パターン"',
      'aria-label="場合の数の答え"',
      'role="img"',
      'aria-label={diagramDescription}',
    ]) {
      if (!page.includes(text)) throw new Error(`permutation-combination-drill is missing ${text}`);
    }
  }
}

console.log(`Strict positive integer input verified: ${cases.length} parser cases and both affected drills reject truncating parseInt answers.`);
