import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getSpringVisualState,
  springConstant,
  springMaximumExtension,
  springMinimumExtension,
} from '../src/lib/springVisual.ts';

const page = fs.readFileSync('src/app/learn/physics/spring-visual/page.tsx', 'utf8');
assert.ok(page.includes('href="/learn/physics/motion-calculation-drill"'), 'the visual should link to the mechanics drill');
assert.ok(page.includes('aria-label="ばねの変位"'), 'the displacement slider needs an accessible label');
assert.ok(page.includes('F = −kx') && page.includes('U=½kx²'), 'the visual should teach restoring force and elastic potential energy');

let previousEnergy = 0;
for (let step = 0; step <= 40; step += 1) {
  const extension = springMinimumExtension + step / 100;
  const state = getSpringVisualState(extension);
  assert.equal(state.extension, extension);
  assert.ok(Math.abs(state.restoringForce + springConstant * extension) < 1e-12);
  assert.ok(Math.abs(state.elasticPotentialEnergy - 0.5 * springConstant * extension ** 2) < 1e-12);
  if (step > 0 && extension <= 0) assert.ok(state.elasticPotentialEnergy <= previousEnergy + 1e-12, 'energy should decrease toward natural length from compression');
  if (extension > 0) assert.ok(state.elasticPotentialEnergy >= previousEnergy - 1e-12, 'energy should increase with extension after natural length');
  previousEnergy = state.elasticPotentialEnergy;
}

const compressed = getSpringVisualState(-0.12);
const extended = getSpringVisualState(0.12);
assert.equal(compressed.restoringForce, 24);
assert.equal(extended.restoringForce, -24);
assert.equal(compressed.elasticPotentialEnergy, extended.elasticPotentialEnergy);
assert.equal(getSpringVisualState(0).restoringForce, 0);
assert.equal(getSpringVisualState(0).elasticPotentialEnergy, 0);
assert.equal(getSpringVisualState(-1).extension, springMinimumExtension);
assert.equal(getSpringVisualState(1).extension, springMaximumExtension);
assert.throws(() => getSpringVisualState(Number.NaN), RangeError);

console.log('Spring visual verified: Hooke’s law, force direction, symmetric energy, natural-length state, bounds, and accessible drill link.');
