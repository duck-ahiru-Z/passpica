import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { calculateImpulseMomentum } from '../src/lib/impulseMomentum.ts';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'src/app/learn/physics/impulse-momentum-visual/page.tsx'), 'utf8');
const portal = fs.readFileSync(path.join(root, 'src/app/learn/page.tsx'), 'utf8');
const drill = fs.readFileSync(path.join(root, 'src/app/learn/physics/motion-calculation-drill/page.tsx'), 'utf8');

const representative = calculateImpulseMomentum(2, 2, 4, 1);
assert.deepEqual(representative, { initialMomentum: 4, impulse: 4, finalMomentum: 8, finalVelocity: 4 });
const braking = calculateImpulseMomentum(2, 3, -4, 1);
assert.deepEqual(braking, { initialMomentum: 6, impulse: -4, finalMomentum: 2, finalVelocity: 1 });
const reversal = calculateImpulseMomentum(2, 3, -8, 1);
assert.deepEqual(reversal, { initialMomentum: 6, impulse: -8, finalMomentum: -2, finalVelocity: -1 });
assert.deepEqual(calculateImpulseMomentum(1, -4, 0, 2), { initialMomentum: -4, impulse: 0, finalMomentum: -4, finalVelocity: -4 });
assert.deepEqual(calculateImpulseMomentum(3.5, -2, -7.5, 0), { initialMomentum: -7, impulse: -0, finalMomentum: -7, finalVelocity: -2 });

for (let massStep = 1; massStep <= 10; massStep += 1) {
  const mass = massStep / 2;
  for (let velocity = -10; velocity <= 10; velocity += 1) {
    for (let force = -20; force <= 20; force += 4) {
      for (let timeStep = 0; timeStep <= 20; timeStep += 2) {
        const duration = timeStep / 10;
        const state = calculateImpulseMomentum(mass, velocity, force, duration);
        assert.ok(Math.abs(state.finalMomentum - state.initialMomentum - state.impulse) < 1e-10);
        assert.ok(Math.abs(state.finalVelocity - (velocity + force * duration / mass)) < 1e-10);
      }
    }
  }
}

assert.throws(() => calculateImpulseMomentum(0, 1, 2, 1), RangeError);
assert.throws(() => calculateImpulseMomentum(-1, 1, 2, 1), RangeError);
assert.throws(() => calculateImpulseMomentum(1, Number.NaN, 2, 1), RangeError);
assert.throws(() => calculateImpulseMomentum(1, 1, Number.POSITIVE_INFINITY, 1), RangeError);
assert.throws(() => calculateImpulseMomentum(1, 1, 2, -0.1), RangeError);

for (const label of ['物体の質量', '物体の初速度', '加える一定の力', '力を加える時間']) {
  assert.ok(page.includes(`aria-label="${label}"`), `missing accessible slider name: ${label}`);
}
assert.ok(page.includes('role="img" aria-label={`右向きを正とする運動量図'), 'momentum diagram needs a dynamic accessible summary');
assert.equal((page.match(/markerUnits="userSpaceOnUse"/g) ?? []).length, 3, 'momentum vector arrowheads must remain a fixed, readable size independent of vector stroke width');
assert.ok(page.includes('力と時間の符号付き面積'), 'force-time diagram description must identify signed area as impulse');
assert.ok(page.includes('duration > 0 && force !== 0'), 'zero force must not render a nonzero-height shaded impulse area');
assert.ok(page.includes('初速度と力が逆向きなら、速さはいったん小さくなります。'), 'reversal explanation must distinguish slowing down from speeding up after reversal');
assert.ok(page.includes('Δp = pᵢ') || page.includes('Δp = p𝒇'), 'page should show the momentum-change relation');
assert.ok(page.includes('href="/learn/physics/motion-calculation-drill"'));
assert.ok(drill.includes('href="/learn/physics/impulse-momentum-visual"'));
assert.ok(portal.includes("slug: 'impulse-momentum-visual'"));
assert.ok(portal.includes("practiceLink: '/learn/physics/motion-calculation-drill'"));

console.log('Impulse/momentum visual verified: 25,410 parameter combinations, signed impulse and velocity reversal, zero-duration boundary, validation, accessible diagrams/sliders, and two-way portal/drill links.');
