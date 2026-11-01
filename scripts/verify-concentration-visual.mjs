import fs from 'node:fs';
import { calculateMolarConcentration } from '../src/lib/concentrationVisual.ts';

const page = fs.readFileSync('src/app/learn/chemistry/concentration-visual/page.tsx', 'utf8');
const close = (actual, expected) => Math.abs(actual - expected) < 1e-12;

if (!page.includes('calculateMolarConcentration(moles, volume)')) throw new Error('The visual must calculate concentration from the current slider volume.');
if (!page.includes('const moles = 0.2;')) throw new Error('The visual must keep solute amount fixed.');
if (!page.includes('min="0.2" max="1.2" step="0.01"')) throw new Error('The volume slider must stay within its positive supported range.');
if (!page.includes('溶質粒子8個の物質量は一定')) throw new Error('The accessible graphic must communicate the fixed particle count.');
if (!page.includes('href="/learn/chemistry/mole-calculation-drill"') || !page.includes('モル濃度の計算問題で練習する')) throw new Error('The dilution visual must link directly to its related calculation practice.');

const particleList = page.match(/const particles = (\[\[[^\n]+?\]\]) as const;/)?.[1];
if (!particleList || JSON.parse(particleList).length !== 8) throw new Error('The visual must preserve its eight solute particles while diluting.');

for (const [volume, expected] of [[0.2, 1], [0.5, 0.4], [1, 0.2], [1.2, 1 / 6]]) {
  if (!close(calculateMolarConcentration(0.2, volume), expected)) throw new Error(`Concentration mismatch at ${volume} L.`);
}

for (const [moles, volume] of [[0, 1], [0.2, 0], [-1, 1], [1, -1], [Number.NaN, 1], [1, Number.POSITIVE_INFINITY]]) {
  let rejected = false;
  try {
    calculateMolarConcentration(moles, volume);
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  if (!rejected) throw new Error(`Invalid concentration input was accepted: n=${moles}, V=${volume}.`);
}

console.log('Concentration visual verified: slider range, fixed particles, dilution values, and invalid input handling.');
