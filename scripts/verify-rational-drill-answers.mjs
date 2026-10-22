import fs from 'node:fs';
import path from 'node:path';
import { parseRationalParts, rationalEquals } from '../src/lib/rationalInput.ts';

const routes = [
  ['roots-coefficients-drill', 'parseRationalParts(ansNumStr.trim() === \'\' ? \'0\' : ansNumStr, ansDenStr)'],
  ['calculus-drill', 'parseRationalParts(inputNum, inputDen)'],
];

for (const [slug, expectedCall] of routes) {
  const page = fs.readFileSync(path.join(process.cwd(), `src/app/learn/math/${slug}/page.tsx`), 'utf8');
  if (!page.includes(expectedCall) || !page.includes('rationalEquals(')) {
    throw new Error(`${slug} must use strict rational parsing and exact rational equality`);
  }
  if (slug === 'calculus-drill'
    && (!page.includes('aria-label="面積 S の分子"')
      || !page.includes('aria-label="面積 S の分母。整数の場合は空欄でも可"')
      || !page.includes('aria-label={`面積グラフ。')
      || !page.includes('aria-pressed={selectedMode === m.id}'))) {
    throw new Error('calculus-drill must expose named answer fields, selected modes, and a descriptive graph to assistive technology');
  }
}

const cases = [
  { input: ['3', '4'], expected: { numerator: 3, denominator: 4 } },
  { input: ['6', '8'], expected: { numerator: 3, denominator: 4 } },
  { input: ['', ''], expected: null },
  { input: ['0', '0'], expected: null },
  { input: ['1.5', '2'], expected: null },
  { input: ['1e1', '2'], expected: null },
  { input: ['3', '2.0'], expected: null },
  { input: ['9007199254740992', '1'], expected: null },
];

for (const { input, expected } of cases) {
  const actual = parseRationalParts(...input);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`parseRationalParts(${JSON.stringify(input)}) returned ${JSON.stringify(actual)}; expected ${JSON.stringify(expected)}`);
  }
}

if (!rationalEquals(parseRationalParts('6', '8'), { numerator: 3, denominator: 4 })) {
  throw new Error('equivalent fractions must remain acceptable');
}

console.log(`Rational drill answers verified: ${cases.length} strict parser cases, equivalent fractions, and both drill integrations.`);
