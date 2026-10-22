import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getTitrationCurvePoints, getTitrationVisualState } from '../src/lib/chemistryTitrationVisual.ts';

const initial = getTitrationVisualState(0);
assert.equal(initial.phase, 'acidic');
assert.ok(Math.abs(initial.ph - 1) < 1e-12);
assert.equal(initial.indicator, 'colorless');

const equivalence = getTitrationVisualState(25);
assert.equal(equivalence.phase, 'equivalence');
assert.equal(equivalence.ph, 7);
assert.equal(equivalence.acidMoles, equivalence.baseMoles);
assert.equal(equivalence.indicator, 'colorless', 'phenolphthalein is still colorless at pH 7');

const afterEquivalence = getTitrationVisualState(26);
assert.equal(afterEquivalence.phase, 'basic');
assert.ok(afterEquivalence.ph > 10);
assert.equal(afterEquivalence.indicator, 'pink');
assert.ok(afterEquivalence.ph > equivalence.ph);
assert.ok(getTitrationVisualState(50).ph > afterEquivalence.ph);
assert.equal(getTitrationVisualState(-20).baseVolumeMl, 0);
assert.equal(getTitrationVisualState(100).baseVolumeMl, 50);
assert.throws(() => getTitrationVisualState(Number.NaN), RangeError);

const curve = getTitrationCurvePoints(120);
assert.equal(curve.length, 121);
assert.equal(curve[0].volumeMl, 0);
assert.equal(curve.at(-1).volumeMl, 50);
assert.ok(curve.every(point => Number.isFinite(point.ph) && point.ph >= 0 && point.ph <= 14));
assert.ok(curve.find(point => point.volumeMl === 25)?.ph === 7);
assert.throws(() => getTitrationCurvePoints(1), RangeError);
assert.throws(() => getTitrationCurvePoints(2.5), RangeError);

const page = fs.readFileSync('src/app/learn/chemistry/titration-visual/page.tsx', 'utf8');
const drill = fs.readFileSync('src/app/learn/chemistry/titration-drill/page.tsx', 'utf8');
const portal = fs.readFileSync('src/app/learn/page.tsx', 'utf8');
assert.match(page, /aria-label="加えた水酸化ナトリウム水溶液の体積"/);
assert.match(page, /role="img" aria-label=\{`塩酸/);
assert.match(page, /フェノールフタレインはpH約8\.3から変色/);
assert.match(page, /中和に必要な体積/);
assert.match(page, /href="\/learn\/chemistry\/titration-drill"/);
assert.match(drill, /href="\/learn\/chemistry\/titration-visual"/);
assert.match(portal, /slug: 'titration-visual'[\s\S]*?practiceLink: '\/learn\/chemistry\/titration-drill'/);

console.log('Chemistry titration visual verified: strong-acid/strong-base pH, equivalence, phenolphthalein transition, bounded slider, 121 curve samples, accessible controls, portal entry, and linked drill.');
