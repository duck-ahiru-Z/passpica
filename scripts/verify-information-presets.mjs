import assert from 'node:assert/strict';
import { exam2026Honshi } from '../src/data/pseudo-lang/exam2026Honshi.ts';
import { exam2026Tsuishi } from '../src/data/pseudo-lang/exam2026Tsuishi.ts';
import { exam2025TsuishiFig2 } from '../src/data/pseudo-lang/exam2025TsuishiFig2.ts';
import { exam2025TsuishiFig5 } from '../src/data/pseudo-lang/exam2025TsuishiFig5.ts';

assert.ok(!exam2026Honshi.includes('実装してください'), '2026 main preset must not be a placeholder');
assert.ok(exam2026Honshi.includes('最大値('), '2026 main preset must exercise the maximum function');
assert.ok(exam2026Honshi.includes('到着 = [0, 3, 4, 10, 11, 12]'), '2026 main preset must retain its documented shortened data');
assert.ok(!exam2026Tsuishi.includes('実装してください'), '2026 retake preset must not be a placeholder');
assert.ok(exam2026Tsuishi.includes('採用先') && exam2026Tsuishi.includes('セット を 1 から 4'), '2026 retake preset must demonstrate non-duplicating quiz-set selection');
assert.equal(exam2025TsuishiFig2.isOneBased, true);
assert.equal((exam2025TsuishiFig2.code.match(/【整数を入力】/g) ?? []).length, 4);
assert.equal(exam2025TsuishiFig5.isOneBased, true);
assert.ok(exam2025TsuishiFig5.code.includes('【文字列を入力】'));
assert.ok(exam2025TsuishiFig5.code.includes('表示する("分類番号："'));

console.log('Information I presets verified: both 2026 examples are implemented, 2025 input presets are interactive, and array-index conventions are set.');
