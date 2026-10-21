import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { celluloseNitrateNitrogenPercent, reactionEnergyProfile } from '../src/lib/reactionSafety.ts';

const expected = [6.8, 11.1, 14.1];
for (const [index, degree] of [1, 2, 3].entries()) {
  assert.ok(Math.abs(celluloseNitrateNitrogenPercent(degree) - expected[index]) < 0.1);
}

for (const activationEnergy of [40, 150]) {
  for (const heatReleased of [20, 120]) {
    const profile = reactionEnergyProfile(activationEnergy, heatReleased);
    assert.ok(profile.transitionY >= 20 && profile.transitionY <= 240);
    assert.ok(profile.productY >= 20 && profile.productY <= 240);
  }
}

const energyPage = await readFile(new URL('../src/app/learn/chemistry/reaction-safety/page.tsx', import.meta.url), 'utf8');
assert.match(energyPage, /aria-label=\{`発熱反応の模式図。活性化エネルギー \$\{activationEnergy\} kJ、エンタルピー変化 ΔH −\$\{reactionHeat\} kJ`\}/);
assert.match(energyPage, /const energyPath = `M \$\{rx\} \$\{ry\} C 120 \$\{ry\}, 150 \$\{ty\}, \$\{tx\} \$\{ty\} C 250 \$\{ty\}, 280 \$\{py\}, \$\{px\} \$\{py\} L \$\{px \+ 50\} \$\{py\}`/);
for (const [activationEnergy, heatReleased] of [[40, 20], [150, 120]]) {
  const { reactantY, transitionY, productY } = reactionEnergyProfile(activationEnergy, heatReleased);
  assert.ok(transitionY < reactantY, 'activation barrier must rise above the reactants');
  assert.ok(productY > reactantY, 'products must lie below reactants for exothermic ΔH');
  assert.equal(reactantY - transitionY, activationEnergy * 0.45);
  assert.equal(productY - reactantY, heatReleased * 0.45);
}

const page = energyPage;
assert.match(page, /C₆H₇O₂\(ONO₂\)₃/);
assert.match(page, /ΔH = −\{reactionHeat\} kJ/);
assert.match(page, /硝酸エステル基/);
assert.doesNotMatch(page, /濃硝酸と濃硫酸|アルコール・エーテル混合溶媒|音速レベル/);

console.log('Reaction safety checks passed: composition, nitrogen percentage, graph bounds, and safe copy.');
