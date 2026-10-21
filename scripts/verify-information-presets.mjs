import assert from 'node:assert/strict';
import { exam2026Honshi } from '../src/data/pseudo-lang/exam2026Honshi.ts';
import { exam2026Tsuishi } from '../src/data/pseudo-lang/exam2026Tsuishi.ts';
import { exam2025TsuishiFig2 } from '../src/data/pseudo-lang/exam2025TsuishiFig2.ts';
import { exam2025TsuishiFig5 } from '../src/data/pseudo-lang/exam2025TsuishiFig5.ts';
import { examBinarySearch } from '../src/data/pseudo-lang/examBinarySearch.ts';
import { parseStrictInteger } from '../src/lib/strictInteger.ts';

assert.ok(!exam2026Honshi.includes('実装してください'), '2026 main preset must not be a placeholder');
assert.ok(exam2026Honshi.includes('最大値('), '2026 main preset must exercise the maximum function');
assert.ok(exam2026Honshi.includes('到着 = [0, 3, 4, 10, 11, 12]'), '2026 main preset must retain its documented shortened data');
assert.ok(!exam2026Tsuishi.includes('実装してください'), '2026 retake preset must not be a placeholder');
assert.ok(exam2026Tsuishi.includes('saidai = 5') && exam2026Tsuishi.includes('c を 1 から 4 まで'), '2026 retake preset must define four sets with a five-question subject limit');
assert.ok(exam2026Tsuishi.includes('Saiyou[i] == 0') && exam2026Tsuishi.includes('Saiyou[i] = c'), '2026 retake preset must not assign one question to multiple sets');
const categoriesMatch = exam2026Tsuishi.match(/Bunya = \[([0-5,\s]+)\]/);
assert.ok(categoriesMatch, '2026 retake preset must provide the six-category study data');
const categories = categoriesMatch[1].split(',').map(value => Number(value.trim()));
assert.equal(categories.length, 193, 'the practice data should contain 193 questions');
const selectedSets = Array(categories.length).fill(0);
for (let set = 1; set <= 4; set++) {
  const counts = Array(6).fill(0);
  for (let index = 0; index < categories.length; index++) {
    const category = categories[index];
    if (selectedSets[index] === 0 && counts[category] < 5) {
      selectedSets[index] = set;
      counts[category]++;
    }
  }
  assert.ok(counts.every(count => count === 5), `set ${set} must contain five questions from each category`);
}
assert.equal(new Set(selectedSets.filter(Boolean)).size, 4);
assert.equal(selectedSets.filter(Boolean).length, 120, 'four sets should select 120 unique questions');
assert.equal(exam2025TsuishiFig2.isOneBased, true);
assert.equal((exam2025TsuishiFig2.code.match(/【整数を入力】/g) ?? []).length, 4);
assert.equal(exam2025TsuishiFig5.isOneBased, true);
assert.ok(exam2025TsuishiFig5.code.includes('【文字列を入力】'));
assert.ok(exam2025TsuishiFig5.code.includes('表示する("分類番号："'));
assert.ok(examBinarySearch.includes('は添字'));
assert.ok(!examBinarySearch.includes('番目にありました'), 'zero-based search results must not be mislabeled as ordinal positions');

for (const [input, expected] of [['0', 0], ['-12', -12], ['+7', 7], [' 42 ', 42]]) {
  assert.equal(parseStrictInteger(input), expected, `integer input ${JSON.stringify(input)} should be accepted`);
}
for (const input of ['1.5', '1e2', '12kg', '', '9007199254740992']) {
  assert.equal(parseStrictInteger(input), null, `integer input ${JSON.stringify(input)} should be rejected`);
}
const pseudoLangPage = await (await import('node:fs/promises')).readFile(new URL('../src/app/learn/information/pseudo-lang/page.tsx', import.meta.url), 'utf8');
assert.ok(pseudoLangPage.includes('const parsed = parseStrictInteger(value);'), 'pseudocode integer input must reject decimals rather than truncating them');
assert.ok(!pseudoLangPage.includes('Number.parseInt(value, 10)'), 'pseudocode integer input must not silently truncate decimal input');

console.log('Information I presets and strict pseudocode integer input verified.');
