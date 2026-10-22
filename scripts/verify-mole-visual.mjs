import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { AVOGADRO_CONSTANT, STANDARD_MOLAR_VOLUME_L, formatParticleCount, getMoleVisualState, moleVisualSubstances } from '../src/lib/moleVisual.ts';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'src/app/learn/chemistry/mole-concept-visual/page.tsx'), 'utf8');
const portal = fs.readFileSync(path.join(root, 'src/app/learn/page.tsx'), 'utf8');
const drill = fs.readFileSync(path.join(root, 'src/app/learn/chemistry/mole-calculation-drill/page.tsx'), 'utf8');

assert.equal(AVOGADRO_CONSTANT, 6.02e23);
assert.equal(STANDARD_MOLAR_VOLUME_L, 22.4);
assert.equal(moleVisualSubstances.length, 3);
for (const item of moleVisualSubstances) {
  for (const amount of [0.25, 0.5, 1, 1.5, 2]) {
    const state = getMoleVisualState(amount, item.id);
    assert.equal(state.particles, amount * 6.02e23);
    assert.equal(state.massGrams, amount * item.molarMass);
    assert.equal(state.gasVolumeLiters, amount * 22.4);
    assert.ok(state.diagramDots >= 1 && state.diagramDots <= 12);
  }
}
assert.equal(getMoleVisualState(1, 'water').massGrams, 18);
assert.equal(getMoleVisualState(1, 'carbon-dioxide').massGrams, 44);
assert.equal(getMoleVisualState(1, 'sodium-chloride').massGrams, 58.5);
assert.equal(moleVisualSubstances.find(item => item.id === 'water').entity, '水分子');
assert.equal(moleVisualSubstances.find(item => item.id === 'carbon-dioxide').entity, '二酸化炭素分子');
assert.equal(moleVisualSubstances.find(item => item.id === 'sodium-chloride').entity, 'NaClの式単位');
assert.equal(formatParticleCount(getMoleVisualState(1, 'water').particles), '6.02×10²³');
assert.equal(formatParticleCount(getMoleVisualState(2, 'water').particles), '1.20×10²⁴');
assert.equal(formatParticleCount(getMoleVisualState(0.25, 'water').particles), '1.51×10²³');
assert.throws(() => formatParticleCount(0), RangeError);
assert.throws(() => getMoleVisualState(0, 'water'), RangeError);
assert.throws(() => getMoleVisualState(Number.NaN, 'water'), RangeError);
assert.throws(() => getMoleVisualState(1, 'unknown'), RangeError);

for (const content of [
  'aria-label="モル質量を比べる物質"',
  'aria-label="物質量 n（mol）"',
  'role="img"',
  '1 mol は対象となる粒子を約 6.02×10²³ 個集めた量です',
  '1つの丸が1個の{substance.entity}という意味ではありません',
  '理想気体のモル体積 22.4 L/mol',
  'formatParticleCount(state.particles)',
  'href="/learn/chemistry/mole-calculation-drill"',
  'href="/learn/chemistry/concentration-visual"',
]) {
  assert.ok(page.includes(content), `visual page missing: ${content}`);
}
assert.ok(portal.includes("slug: 'mole-concept-visual'"));
assert.ok(portal.includes("practiceLink: '/learn/chemistry/mole-calculation-drill'"));
assert.ok(drill.includes('href="/learn/chemistry/mole-concept-visual"'));

console.log('Mole concept visual verified: Avogadro count, molar-mass and standard gas-volume scaling, three substances, slider endpoints, symbolic particle diagram, invalid inputs, and portal/drill links.');
