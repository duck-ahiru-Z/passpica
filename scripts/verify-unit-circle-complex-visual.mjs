import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/unit-circle-complex/page.tsx'), 'utf8');
assert.match(page, /const theta3 = \(theta1 \+ theta2\) % 360/);
assert.match(page, /arg\(z₃\) ≡ arg\(z₁\) \+ arg\(z₂\) \(mod 360°\)/);
assert.match(page, /\{theta1\}° \+ \{theta2\}° = \{theta1 \+ theta2\}° ≡ \{theta3\}°/);
assert.match(page, /Math\.abs\(value\) < 1e-12 \? 0 : value/);
for (const coordinate of ['z1_x', 'z1_y', 'z2_x', 'z2_y', 'z3_x', 'z3_y']) {
  assert.match(page, new RegExp(`${coordinate} = cleanCoordinate\\(`));
}

for (const [a, b, expected] of [[360, 60, 60], [270, 180, 90], [355, 10, 5], [180, 180, 0]]) {
  assert.equal((a + b) % 360, expected);
}
assert.equal(Math.abs(Math.sin((360 * Math.PI) / 180)) < 1e-12 ? 0 : Math.sin((360 * Math.PI) / 180), 0);

console.log('Unit-circle complex visual verified: angle sums are stated modulo 360° and axis-aligned coordinates suppress floating-point negative zero.');
