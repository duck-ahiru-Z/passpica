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
assert.equal(moleVisualSubstances.length, 5);
for (const item of moleVisualSubstances) {
  assert.equal(item.elements.reduce((sum, element) => sum + element.mass, 0), item.molarMass, `${item.formula} elemental masses must sum to its molar mass`);
  for (const amount of [0.25, 0.5, 1, 1.5, 2]) {
    const state = getMoleVisualState(amount, item.id);
    assert.equal(state.particles, amount * 6.02e23);
    assert.equal(state.massGrams, amount * item.molarMass);
    assert.equal(state.gasVolumeLiters, amount * 22.4);
    assert.ok(Math.abs(state.elementalComposition.reduce((sum, element) => sum + element.massPercent, 0) - 100) < 1e-12);
    assert.deepEqual(state.elementalComposition.map(element => element.massGrams), item.elements.map(element => amount * element.mass));
    assert.ok(state.diagramDots >= 1 && state.diagramDots <= 12);
  }
}
assert.equal(getMoleVisualState(1, 'water').massGrams, 18);
assert.equal(getMoleVisualState(1, 'carbon-dioxide').massGrams, 44);
assert.equal(getMoleVisualState(1, 'sodium-chloride').massGrams, 58.5);
assert.equal(getMoleVisualState(1, 'ammonia').massGrams, 17);
assert.equal(getMoleVisualState(1, 'calcium-carbonate').massGrams, 100);
assert.equal(getMoleVisualState(1, 'water').elementalComposition.find(element => element.symbol === 'O').massPercent, 16 / 18 * 100);
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
  '気体と仮定した体積 V',
  '水や NaCl は、気体と仮定した場合の対応量',
  '${amountMol.toFixed(2)} mol 中の元素別質量割合',
  '(element.mass * amountMol).toFixed(2)',
  '元素の質量割合 = 元素の質量 ÷ 化合物のモル質量 × 100',
  'formatParticleCount(state.particles)',
  'href="/learn/chemistry/mole-calculation-drill"',
  'href="/learn/chemistry/concentration-visual"',
]) {
  assert.ok(page.includes(content), `visual page missing: ${content}`);
}
assert.ok(portal.includes("slug: 'mole-concept-visual'"));
assert.ok(portal.includes("practiceLink: '/learn/chemistry/mole-calculation-drill'"));
assert.ok(drill.includes('href="/learn/chemistry/mole-concept-visual"'));

console.log('Mole concept visual verified: Avogadro count, molar mass, elemental composition, standard gas-volume scaling, five substances, slider endpoints, symbolic particle diagram, invalid inputs, and portal/drill links.');
