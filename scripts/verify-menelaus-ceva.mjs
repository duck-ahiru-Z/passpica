import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getCevaMasses } from '../src/lib/menelausCeva.ts';

const drillPage = fs.readFileSync('src/app/learn/math/menelaus-ceva-drill/page.tsx', 'utf8');
for (const requiredMarkup of [
  'aria-label="練習する定理パターン"',
  'aria-label="求める比の左側"',
  'aria-label="求める比の右側"',
  'role="status" aria-live="polite"',
]) {
  assert.ok(drillPage.includes(requiredMarkup), `Menelaus/Ceva drill is missing accessible feedback/control markup: ${requiredMarkup}`);
}

function gcd(x, y) {
  while (y) [x, y] = [y, x % y];
  return x;
}

for (let a = 1; a <= 5; a++) {
  for (let b = 1; b <= 5; b++) {
    for (let c = 1; c <= 5; c++) {
      for (let d = 1; d <= 5; d++) {
        const { mA, mB, mC, total } = getCevaMasses(a, b, c, d);
        // Barycentric ratios recover the exact side divisions from the prompt.
        assert.equal(mC * b, mB * a, `BD:DC must be ${a}:${b}`);
        assert.equal(mA * d, mC * c, `CE:EA must be ${c}:${d}`);

        const divisor = gcd(mC, total);
        const actual = `${mC / divisor}:${total / divisor}`;
        const expectedAreaRatio = `${a * d / gcd(a * d, total)}:${total / gcd(a * d, total)}`;
        assert.equal(actual, expectedAreaRatio, '△PAB:△ABC must match the P barycentric weight');
      }
    }
  }
}

// Independently reconstruct the displayed barycentric intersection and check
// that each drawn cevian hits the side at the ratio stated by the prompt.
// This guards the geometry/UI mapping, not just the helper's formula.
const cross = (u, v) => u.x * v.y - u.y * v.x;
const subtract = (u, v) => ({ x: u.x - v.x, y: u.y - v.y });
const lineIntersection = (p, r, q, s) => {
  const denominator = cross(r, s);
  const t = cross(subtract(q, p), s) / denominator;
  return { x: p.x + t * r.x, y: p.y + t * r.y };
};
const ratioOnSegment = (point, start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const t = Math.abs(dx) >= Math.abs(dy)
    ? (point.x - start.x) / dx
    : (point.y - start.y) / dy;
  return t / (1 - t);
};
const A = { x: 180, y: 30 };
const B = { x: 60, y: 190 };
const C = { x: 260, y: 190 };
const near = (actual, expected) => Math.abs(actual - expected) < 1e-10;

for (let a = 1; a <= 5; a++) {
  for (let b = 1; b <= 5; b++) {
    for (let c = 1; c <= 5; c++) {
      for (let d = 1; d <= 5; d++) {
        const { mA, mB, mC, total } = getCevaMasses(a, b, c, d);
        const P = {
          x: (mA * A.x + mB * B.x + mC * C.x) / total,
          y: (mA * A.y + mB * B.y + mC * C.y) / total,
        };
        const D = lineIntersection(A, subtract(P, A), B, subtract(C, B));
        const E = lineIntersection(B, subtract(P, B), C, subtract(A, C));
        const F = lineIntersection(C, subtract(P, C), A, subtract(B, A));
        assert.ok(near(ratioOnSegment(D, B, C), a / b), `drawn BD:DC mismatch at ${a}:${b}, ${c}:${d}`);
        assert.ok(near(ratioOnSegment(E, C, A), c / d), `drawn CE:EA mismatch at ${a}:${b}, ${c}:${d}`);
        assert.ok(near(ratioOnSegment(F, A, B), (b * d) / (a * c)), `drawn AF:FB mismatch at ${a}:${b}, ${c}:${d}`);
        assert.ok(near(Math.abs(cross(subtract(P, A), subtract(B, A))) / Math.abs(cross(subtract(C, A), subtract(B, A))), mC / total), `shaded area mismatch at ${a}:${b}, ${c}:${d}`);
      }
    }
  }
}

const reportedCase = getCevaMasses(3, 2, 2, 1);
assert.deepEqual(reportedCase, { mA: 6, mB: 2, mC: 3, total: 11 });
console.log('Menelaus/Ceva: all 625 combinations satisfy the stated ratios, reconstructed diagram intersections, and shaded area weights.');
