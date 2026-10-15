import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const drill = fs.readFileSync(path.join(root, 'src/app/drill/page.tsx'), 'utf8');
const learn = fs.readFileSync(path.join(root, 'src/app/learn/page.tsx'), 'utf8');

const requiredDrills = [
  'math1-mixed-drill', 'matha-mixed-drill', 'math2-mixed-drill',
  'mathbc-mixed-drill', 'calculus3-mixed-drill',
  'motion-calculation-drill', 'mole-calculation-drill', 'calculation-drill',
];
const requiredVisuals = [
  'calculus3-limit-visual', 'calculus3-derivative-visual',
  'calculus3-integral-visual', 'calculus3-curvature-visual',
  'calculus3-parametric-visual', 'projectile-visual', 'motion-visual',
  'concentration-visual',
];

for (const slug of requiredDrills) {
  if (!drill.includes(`'${slug}'`)) throw new Error(`Missing drill portal entry: ${slug}`);
}
for (const slug of requiredVisuals) {
  if (!learn.includes(`'${slug}'`)) throw new Error(`Missing learning portal visual: ${slug}`);
}

const mathRoot = path.join(root, 'src/app/learn/math');
const pages = fs.readdirSync(mathRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => path.join(mathRoot, entry.name, 'page.tsx'))
  .filter(file => fs.existsSync(file));
const patternPagesWithoutBalance = pages.filter(file => {
  const source = fs.readFileSync(file, 'utf8');
  return /patterns|Pattern/.test(source) && /Math\.random/.test(source) && !source.includes('BalancedRandom');
});
if (patternPagesWithoutBalance.length > 0) {
  throw new Error(`Pattern pages without BalancedRandom: ${patternPagesWithoutBalance.join(', ')}`);
}

console.log(`Learning coverage verified: ${requiredDrills.length} drill entries, ${requiredVisuals.length} visual entries, ${pages.length} math pages audited.`);
