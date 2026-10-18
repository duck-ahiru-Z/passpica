import assert from 'node:assert/strict';
import { calculateRlcSeriesState } from '../src/lib/rlcSeriesCircuit.ts';

const close = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);
};

const resonant = calculateRlcSeriesState({
  resistance: 100,
  inductance: 0.45032,
  capacitanceMicrofarads: 90,
  frequency: 25,
  voltagePeak: 50,
});
close(resonant.inductiveReactance, resonant.capacitiveReactance, 0.01);
close(resonant.netReactance, 0, 0.01);
close(resonant.impedance, 100, 0.01);
close(resonant.currentPeak, 0.5, 0.0001);
close(resonant.voltageLeadAngleDegrees, 0, 0.01);
close(resonant.resonanceFrequency, 25, 0.01);

const inductive = calculateRlcSeriesState({
  resistance: 100,
  inductance: 0.45032,
  capacitanceMicrofarads: 90,
  frequency: 120,
  voltagePeak: 50,
});
assert.ok(inductive.netReactance > 0 && inductive.voltageLeadAngleDegrees > 0);

const capacitive = calculateRlcSeriesState({
  resistance: 100,
  inductance: 0.45032,
  capacitanceMicrofarads: 90,
  frequency: 10,
  voltagePeak: 50,
});
assert.ok(capacitive.netReactance < 0 && capacitive.voltageLeadAngleDegrees < 0);

for (const frequency of [10, 15, 25, 50, 90, 120]) {
  const state = calculateRlcSeriesState({ ...resonant, frequency });
  close(state.impedance, Math.hypot(100, state.inductiveReactance - state.capacitiveReactance));
  close(state.currentPeak * state.impedance, 50);
  assert.ok(state.currentPeak <= resonant.currentPeak + 1e-9, 'resonance must maximize current for the same R, L, C, and voltage');
}

for (const field of ['resistance', 'inductance', 'capacitanceMicrofarads', 'frequency', 'voltagePeak']) {
  for (const value of [0, -1, Infinity, NaN]) {
    assert.throws(() => calculateRlcSeriesState({ ...resonant, [field]: value }), RangeError, `${field}=${value}`);
  }
}

console.log('RLC series circuit verified: resonance, inductive/capacitive phase, impedance/current laws, current maximum, and parameter bounds.');
