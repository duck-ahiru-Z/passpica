import assert from 'node:assert/strict';
import {
  calculateFallingEnergy,
  fallingObjectInitialHeight,
  fallingObjectMass,
  mechanicalEnergyGravity,
} from '../src/lib/mechanicalEnergy.ts';

let previousPotential = Number.POSITIVE_INFINITY;
let previousKinetic = Number.NEGATIVE_INFINITY;
for (let step = 0; step <= 200; step++) {
  const height = fallingObjectInitialHeight - step / 10;
  const state = calculateFallingEnergy(height);
  assert.equal(state.height, height);
  assert.equal(state.dropDistance, fallingObjectInitialHeight - height);
  assert.ok(Math.abs(state.potential - fallingObjectMass * mechanicalEnergyGravity * height) < 1e-10);
  assert.ok(Math.abs(state.kinetic - fallingObjectMass * mechanicalEnergyGravity * (fallingObjectInitialHeight - height)) < 1e-10);
  assert.ok(Math.abs(state.potential + state.kinetic - state.total) < 1e-10, `energy not conserved at h=${height}`);
  assert.ok(state.potential <= previousPotential + 1e-10, `potential energy rose during descent at h=${height}`);
  assert.ok(state.kinetic >= previousKinetic - 1e-10, `kinetic energy fell during descent at h=${height}`);
  assert.ok(state.potentialFraction >= 0 && state.potentialFraction <= 1);
  assert.ok(state.kineticFraction >= 0 && state.kineticFraction <= 1);
  assert.ok(Math.abs(state.potentialFraction + state.kineticFraction - 1) < 1e-10);
  previousPotential = state.potential;
  previousKinetic = state.kinetic;
}

const top = calculateFallingEnergy(fallingObjectInitialHeight);
assert.equal(top.potential, top.total);
assert.equal(top.kinetic, 0);
const ground = calculateFallingEnergy(0);
assert.equal(ground.potential, 0);
assert.equal(ground.kinetic, ground.total);
assert.equal(calculateFallingEnergy(-4).height, 0);
assert.equal(calculateFallingEnergy(100).height, fallingObjectInitialHeight);

console.log('Mechanical-energy visual verified: 201 heights, conservation, monotonic transfer, endpoint states, and slider bounds.');
