import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const drill = fs.readFileSync(path.join(root, 'src/app/drill/page.tsx'), 'utf8');
const learn = fs.readFileSync(path.join(root, 'src/app/learn/page.tsx'), 'utf8');

function readPortalEntries(source) {
  return [...source.matchAll(/link:\s*'([^']+)'/g)].map(match => {
    const link = match[1];
    return { slug: link.split('/').filter(Boolean).at(-1), link };
  });
}

function routeFile(link) {
  if (!link?.startsWith('/learn/')) return null;
  return path.join(root, 'src/app', link.slice(1), 'page.tsx');
}

const requiredDrills = [
  'math1-mixed-drill', 'matha-mixed-drill', 'math2-mixed-drill',
  'mathbc-mixed-drill', 'calculus3-mixed-drill',
  'motion-calculation-drill', 'mole-calculation-drill', 'calculation-drill',
];
const requiredVisuals = [
  'unit-circle-complex',
  'calculus3-limit-visual', 'calculus3-derivative-visual',
  'calculus3-integral-visual', 'calculus3-curvature-visual',
  'calculus3-parametric-visual', 'projectile-visual', 'motion-visual',
  'concentration-visual',
];

const drillEntries = readPortalEntries(drill);
const drillSlugs = new Set(drillEntries.map(entry => entry.slug));
for (const slug of requiredDrills) {
  if (!drillSlugs.has(slug)) throw new Error(`Missing drill portal entry: ${slug}`);
}
for (const entry of drillEntries) {
  const file = routeFile(entry.link);
  if (!file || !fs.existsSync(file)) throw new Error(`Missing drill page for ${entry.slug}: ${entry.link}`);
}

const learnEntries = readPortalEntries(learn);
const learnSlugs = new Set(learnEntries.map(entry => entry.slug));
for (const slug of requiredVisuals) {
  if (!learnSlugs.has(slug)) throw new Error(`Missing learning portal visual: ${slug}`);
}
for (const entry of learnEntries) {
  const file = routeFile(entry.link);
  if (!file || !fs.existsSync(file)) throw new Error(`Missing learning page for ${entry.slug}: ${entry.link}`);
}

const learnRoot = path.join(root, 'src/app/learn');
function collectPages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectPages(entryPath);
    return entry.isFile() && entry.name === 'page.tsx' ? [entryPath] : [];
  });
}
const pages = collectPages(learnRoot);
const mathPages = pages.filter(file => file.includes(`${path.sep}math${path.sep}`));
function importedSources(source, file) {
  const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(match => match[1]);
  return imports.flatMap(specifier => {
    if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return [];
    const base = specifier.startsWith('@/') ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
    const dependency = ['.ts', '.tsx', '.js', '.jsx'].map(extension => {
      const dependency = `${base}${extension}`;
      return fs.existsSync(dependency) ? fs.readFileSync(dependency, 'utf8') : null;
    }).find(Boolean);
    return dependency ? [dependency] : [];
  });
}
function includesBalancedRandom(source, file) {
  return source.includes('BalancedRandom') || importedSources(source, file).some(dependency => dependency.includes('BalancedRandom'));
}
const patternPages = pages.filter(file => {
  const source = fs.readFileSync(file, 'utf8');
  return /type\s+\w*Pattern\s*=/.test(source)
    || importedSources(source, file).some(dependency => /export\s+const\s+\w*Patterns\b/.test(dependency));
});
const incompletePatternPages = patternPages.filter(file => {
  const source = fs.readFileSync(file, 'utf8');
  return !includesBalancedRandom(source, file)
    || !/<select\b/.test(source)
    || !/value=['"]mix['"]/.test(source)
    || !/全パターンランダム|全パターンをランダム|ミックスモード/.test(source);
});
if (incompletePatternPages.length > 0) {
  throw new Error(`Pattern drills must offer fixed-pattern and mixed modes with balanced selection: ${incompletePatternPages.join(', ')}`);
}

for (const slug of requiredDrills) {
  const entry = drillEntries.find(candidate => candidate.slug === slug);
  const source = fs.readFileSync(routeFile(entry.link), 'utf8');
  if (!includesBalancedRandom(source, routeFile(entry.link)) || !/<select\b/.test(source) || !/全体ランダム|全パターンランダム|全分野ランダム|value=['"]all['"]/.test(source)) {
    throw new Error(`Aggregate drill must provide balanced topic selection and a mixed mode: ${slug}`);
  }
}

const linkedDrillRoutes = new Set(drillEntries.map(entry => entry.link));
const unlistedDrills = pages
  .filter(file => /-drill[\\/]page\.tsx$/.test(file))
  .map(file => `/${path.relative(path.join(root, 'src/app'), path.dirname(file)).split(path.sep).join('/')}`)
  .filter(route => !linkedDrillRoutes.has(route));
if (unlistedDrills.length > 0) throw new Error(`Math drill pages missing from the portal: ${unlistedDrills.join(', ')}`);

console.log(`Learning coverage verified: ${drillEntries.length} linked drills, ${learnEntries.length} linked learning pages (${requiredVisuals.length} required visuals), ${patternPages.length} fixed-plus-mixed pattern drills across all subjects, ${mathPages.length} math learning pages audited.`);
