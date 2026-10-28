import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const drill = fs.readFileSync(path.join(root, 'src/app/drill/page.tsx'), 'utf8');
const learn = fs.readFileSync(path.join(root, 'src/app/learn/page.tsx'), 'utf8');
if (learn.includes('製造プロセス流程図') || !learn.includes('製造プロセスフロー図')) {
  throw new Error('The industrial chemistry learning-card title must use the Japanese term フロー図.');
}

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
  'mathbc-mixed-drill', 'calculus3-mixed-drill', 'quadratic-equation-drill',
  'motion-calculation-drill', 'mole-calculation-drill', 'calculation-drill',
  'titration-drill', 'indicator-drill', 'crystal-lattice-drill', 'gas-collection-drill', 'flame-reaction-drill', 'metal-ion-drill', 'industrial-process-drill', 'organic-separation-drill', 'inorganic-colors-drill', 'phase-diagram-drill',
  'number-representation-drill',
  'trigonometry-graph-drill',
];
const aggregateDrills = new Set([
  'math1-mixed-drill', 'matha-mixed-drill', 'math2-mixed-drill', 'mathbc-mixed-drill', 'calculus3-mixed-drill',
]);
const requiredVisuals = [
  'unit-circle-complex',
  'conic-sections-visual',
  'calculus3-limit-visual', 'calculus3-derivative-visual',
  'calculus3-integral-visual', 'calculus3-volume-visual', 'calculus3-curvature-visual',
  'calculus3-parametric-visual', 'calculus3-differential-equation-visual', 'projectile-visual', 'energy-visual', 'motion-visual', 'spring-visual', 'simple-harmonic-visual', 'impulse-momentum-visual', 'circular-motion-visual',
  'mole-concept-visual', 'concentration-visual', 'stoichiometry-visual', 'ideal-gas-visual', 'crystal-lattice', 'titration-visual', 'weak-electrolyte-visual',
];

const drillEntries = readPortalEntries(drill);
const mathBcCardIndex = drill.indexOf("slug: 'mathbc-mixed-drill'");
const mathBcCardEnd = drill.indexOf('\n  },', mathBcCardIndex);
const mathBcCard = drill.slice(drill.lastIndexOf('  {', mathBcCardIndex), mathBcCardEnd);
if (!mathBcCard.includes('統計的な推測') || !mathBcCard.includes('全体ランダム')) {
  throw new Error('The Math B/C portal card must include Statistics and advertise its mixed-practice mode.');
}
const practiceModeDescriptions = [
  'calculus-drill', 'symmetric-polynomial-drill', 'circle-tangent-drill',
  'completing-square-drill', 'quadratic-equation-drill', 'quadratic-max-min-drill', 'sine-rule-drill', 'cosine-rule-drill', 'triangle-area-drill',
  'inscribed-circle-drill', 'linear-diophantine-drill', 'menelaus-ceva-drill',
  'roots-coefficients-drill', 'point-line-distance-drill', 'trig-synthesis-drill', 'trigonometry-graph-drill',
  'calculus3-integral-drill', 'indicator-drill',
  'calculus3-differentiation-drill',
];
for (const slug of practiceModeDescriptions) {
  const slugIndex = drill.indexOf(`slug: '${slug}'`);
  const cardStart = drill.lastIndexOf('  {', slugIndex);
  const cardEnd = drill.indexOf('\n  },', slugIndex);
  const description = drill.slice(cardStart, cardEnd);
  if (!description.includes('個別') || !description.includes('ランダム')) {
    throw new Error(`A drill with focused and mixed modes must explain both in its portal card: ${slug}`);
  }
}
const updatedDrillCopy = [
  ['calculus3-differentiation-drill', '合成・積・商・対数・媒介変数・陰関数・逆関数・高次導関数'],
  ['mole-calculation-drill', '元素の質量百分率'],
  ['mole-calculation-drill', '過剰試薬の残量'],
  ['mole-calculation-drill', '状態方程式の気体計算'],
  ['number-representation-drill', 'ビット幅ごとの表現範囲'],
  ['titration-drill', '酸濃度から塩基濃度を求める逆向き計算'],
  ['motion-calculation-drill', 'ばね振り子の周期と振動数'],
  ['calculus3-limit-drill', 'tan(kx)/x'],
  ['calculation-drill', '論理演算5種の個別練習'],
  ['factorization-strategy-drill', '因数分解の完成まで'],
  ['ac-circuit-drill', '位相差（進み・遅れ）'],
  ['ac-circuit-drill', '抵抗の平均電力'],
];
const moleCardStart = drill.indexOf("slug: 'mole-calculation-drill'");
const moleCardEnd = drill.indexOf('\n  },', moleCardStart);
const moleCard = drill.slice(moleCardStart, moleCardEnd);
if (!moleCard.includes('強酸／強塩基／弱酸／弱塩基のpH')) {
  throw new Error('Chemistry mole-calculation portal summary must distinguish strong- and weak-electrolyte pH practice.');
}
for (const [slug, phrase] of updatedDrillCopy) {
  const slugIndex = drill.indexOf(`slug: '${slug}'`);
  const cardStart = drill.lastIndexOf('  {', slugIndex);
  const cardEnd = drill.indexOf('\n  },', slugIndex);
  if (slugIndex < 0 || !drill.slice(cardStart, cardEnd).includes(phrase)) {
    throw new Error(`Drill portal summary is missing its current scope: ${slug} -> ${phrase}`);
  }
}
const motionCardStart = drill.indexOf("slug: 'motion-calculation-drill'");
const motionCardEnd = drill.indexOf('\n  },', motionCardStart);
if (!drill.slice(motionCardStart, motionCardEnd).includes('符号付き平均速度')) {
  throw new Error('Physics motion portal summary must distinguish signed average velocity from average speed.');
}
for (const filter of ['aria-label="科目で絞り込む"', 'aria-label="難易度で絞り込む"']) {
  if (!drill.includes(filter)) throw new Error(`Drill portal filter group must have an accessible name: ${filter}`);
}
if (!drill.includes('aria-pressed={selectedSubject === sub.id}') || !drill.includes('aria-pressed={selectedDifficulty === diff.id}')) {
  throw new Error('Drill portal filters must expose their selected state to assistive technology');
}
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
if (!learn.includes('4〜16ビットを一つずつ切り替え')) {
  throw new Error('Number-representation visual portal summary must reflect its current 4-to-16-bit range.');
}
for (const entry of learnEntries) {
  const file = routeFile(entry.link);
  if (!file || !fs.existsSync(file)) throw new Error(`Missing learning page for ${entry.slug}: ${entry.link}`);
}
const practiceLinks = [...learn.matchAll(/practiceLink:\s*'([^']+)'/g)].map(match => match[1]);
for (const link of practiceLinks) {
  const file = routeFile(link);
  if (!link.endsWith('-drill') || !file || !fs.existsSync(file)) {
    throw new Error(`Learning portal practice link must target an existing drill: ${link}`);
  }
}
const calculus3VisualPracticePairs = [
  ['/learn/math/conic-sections-visual', '/learn/math/ellipse-drill'],
  ['/learn/math/calculus3-limit-visual', '/learn/math/calculus3-limit-drill'],
  ['/learn/math/calculus3-derivative-visual', '/learn/math/calculus3-differentiation-drill'],
  ['/learn/math/calculus3-integral-visual', '/learn/math/calculus3-integral-drill'],
  ['/learn/math/calculus3-volume-visual', '/learn/math/calculus3-area-volume-drill'],
  ['/learn/math/calculus3-curvature-visual', '/learn/math/calculus3-curve-analysis-drill'],
  ['/learn/math/calculus3-parametric-visual', '/learn/math/calculus3-differentiation-drill'],
  ['/learn/math/calculus3-differential-equation-visual', '/learn/math/calculus3-differential-equation-drill'],
];
const circularMotionVisualRoute = '/learn/physics/circular-motion-visual';
const motionCalculationRoute = '/learn/physics/motion-calculation-drill';
const circularMotionVisual = fs.readFileSync(routeFile(circularMotionVisualRoute), 'utf8');
const motionCalculationPage = fs.readFileSync(routeFile(motionCalculationRoute), 'utf8');
if (!learnEntries.some(entry => entry.link === circularMotionVisualRoute)
  || !circularMotionVisual.includes(`href="${motionCalculationRoute}"`)
  || !motionCalculationPage.includes(`href="${circularMotionVisualRoute}"`)) {
  throw new Error('Circular-motion visual and fixed-plus-mixed mechanics drill must link to each other and from the learning portal.');
}
const titrationVisualRoute = '/learn/chemistry/titration-visual';
const titrationDrillRoute = '/learn/chemistry/titration-drill';
const titrationVisualEntry = learnEntries.find(entry => entry.link === titrationVisualRoute);
if (!titrationVisualEntry || !new RegExp(`slug: '${titrationVisualEntry.slug}'[\\s\\S]*?practiceLink: '${titrationDrillRoute}'`).test(learn)) {
  throw new Error('Chemistry titration visual portal card must link to its calculation drill');
}
const titrationVisualPage = fs.readFileSync(routeFile(titrationVisualRoute), 'utf8');
const titrationDrillPage = fs.readFileSync(routeFile(titrationDrillRoute), 'utf8');
if (!titrationVisualPage.includes(`href="${titrationDrillRoute}"`) || !titrationDrillPage.includes(`href="${titrationVisualRoute}"`)) {
  throw new Error('Chemistry titration visual and calculation drill must link to each other');
}
const acidBaseRoute = '/learn/chemistry/acid-base';
const moleCalculationRoute = '/learn/chemistry/mole-calculation-drill';
const acidBaseVisual = fs.readFileSync(routeFile(acidBaseRoute), 'utf8');
const moleCalculationPage = fs.readFileSync(routeFile(moleCalculationRoute), 'utf8');
if (!learnEntries.some(entry => entry.link === acidBaseRoute)
  || !acidBaseVisual.includes(`href="${moleCalculationRoute}"`)
  || !moleCalculationPage.includes(`href="${acidBaseRoute}"`)) {
  throw new Error('Strong-acid/base pH calculation and acid-base visual must be linked from both directions.');
}
const weakElectrolyteRoute = '/learn/chemistry/weak-electrolyte-visual';
const weakElectrolyteEntry = learnEntries.find(entry => entry.link === weakElectrolyteRoute);
const weakElectrolytePage = fs.readFileSync(routeFile(weakElectrolyteRoute), 'utf8');
if (!weakElectrolyteEntry || !new RegExp(`slug: 'weak-electrolyte-visual'[\\s\\S]*?practiceLink: '${moleCalculationRoute}'`).test(learn)
  || !weakElectrolytePage.includes(`href="${moleCalculationRoute}"`)
  || !moleCalculationPage.includes(`href="${weakElectrolyteRoute}"`)
  || !acidBaseVisual.includes(`href="${weakElectrolyteRoute}"`)) {
  throw new Error('Weak-electrolyte equilibrium visual and focused/mixed pH practice must be linked from the portal and related pages.');
}
const stoichiometryVisualRoute = '/learn/chemistry/stoichiometry-visual';
const stoichiometryVisualEntry = learnEntries.find(entry => entry.link === stoichiometryVisualRoute);
const stoichiometryVisualPage = fs.readFileSync(routeFile(stoichiometryVisualRoute), 'utf8');
if (!stoichiometryVisualEntry
  || !new RegExp(`slug: '${stoichiometryVisualEntry.slug}'[\\s\\S]*?practiceLink: '${moleCalculationRoute}'`).test(learn)
  || !stoichiometryVisualPage.includes(`href="${moleCalculationRoute}"`)
  || !moleCalculationPage.includes(`href="${stoichiometryVisualRoute}"`)) {
  throw new Error('Chemistry limiting-reagent visual and mole-calculation drill must link to each other from the portal and pages.');
}
const idealGasVisualRoute = '/learn/chemistry/ideal-gas-visual';
const idealGasVisualEntry = learnEntries.find(entry => entry.link === idealGasVisualRoute);
const idealGasVisualPage = fs.readFileSync(routeFile(idealGasVisualRoute), 'utf8');
if (!idealGasVisualEntry
  || !new RegExp(`slug: '${idealGasVisualEntry.slug}'[\\s\\S]*?practiceLink: '${moleCalculationRoute}'`).test(learn)
  || !idealGasVisualPage.includes(`href="${moleCalculationRoute}"`)
  || !moleCalculationPage.includes(`href="${idealGasVisualRoute}"`)) {
  throw new Error('Ideal-gas visual and mole calculation drill must link to each other from the portal and pages.');
}
const trigGraphDrillRoute = '/learn/math/trigonometry-graph-drill';
const trigGraphVisualRoute = '/learn/math/trigonometry-graph';
const trigGraphVisualEntry = learnEntries.find(entry => entry.link === trigGraphVisualRoute);
if (!trigGraphVisualEntry || !new RegExp(`slug: '${trigGraphVisualEntry.slug}'[\\s\\S]*?practiceLink: '${trigGraphDrillRoute}'`).test(learn)) {
  throw new Error('Trigonometry graph visual portal card must link to its focused-and-mixed drill');
}
const trigGraphVisualPage = fs.readFileSync(routeFile(trigGraphVisualRoute), 'utf8');
const trigGraphDrillPage = fs.readFileSync(routeFile(trigGraphDrillRoute), 'utf8');
if (!trigGraphVisualPage.includes(`href="${trigGraphDrillRoute}"`) || !trigGraphDrillPage.includes(`href="${trigGraphVisualRoute}"`)) {
  throw new Error('Trigonometry graph visual and drill must link to each other');
}
for (const [visualRoute, drillRoute] of calculus3VisualPracticePairs) {
  const visualEntry = learnEntries.find(entry => entry.link === visualRoute);
  if (!visualEntry || !new RegExp(`slug: '${visualEntry.slug}'[\\s\\S]*?practiceLink: '${drillRoute}'`).test(learn)) {
    throw new Error(`Calculus III learning portal card must link ${visualRoute} to ${drillRoute}`);
  }
  const visualPage = fs.readFileSync(routeFile(visualRoute), 'utf8');
  const drillPage = fs.readFileSync(routeFile(drillRoute), 'utf8');
  if (!visualPage.includes(`href="${drillRoute}"`)) {
    throw new Error(`Calculus III visual must link to its matching practice: ${visualRoute} -> ${drillRoute}`);
  }
  if (!drillPage.includes(`href="${visualRoute}"`)) {
    throw new Error(`Calculus III practice must link back to its visual: ${drillRoute} -> ${visualRoute}`);
  }
}
const conicVisualRoute = '/learn/math/conic-sections-visual';
const hyperbolaParabolaRoute = '/learn/math/hyperbola-parabola-drill';
const conicVisualPage = fs.readFileSync(routeFile(conicVisualRoute), 'utf8');
if (!conicVisualPage.includes('href="/learn/math/ellipse-drill"')
  || !conicVisualPage.includes(`href="${hyperbolaParabolaRoute}"`)
  || !fs.readFileSync(routeFile('/learn/math/ellipse-drill'), 'utf8').includes(`href="${conicVisualRoute}"`)
  || !fs.readFileSync(routeFile(hyperbolaParabolaRoute), 'utf8').includes(`href="${conicVisualRoute}"`)) {
  throw new Error('Conic visual and both equation-curve drills must link to each other.');
}
const organic3dPage = fs.readFileSync(routeFile(learnEntries.find(entry => entry.slug === 'organic-3d').link), 'utf8');
if (!learn.includes("title: '有機・高分子3D分子モデルビューア（立体構造）'")
  || !organic3dPage.includes('有機・高分子3D分子モデルビューア（立体構造）')
  || !learn.includes('シス・トランス異性体を3次元で回転・観察できます。')) {
  throw new Error('The organic 3D portal card must accurately describe the models and match its page heading.');
}
const volumeVisual = fs.readFileSync(path.join(root, 'src/app/learn/math/calculus3-volume-visual/page.tsx'), 'utf8');
if (!volumeVisual.includes('πx⁴') || !volumeVisual.includes('πb⁵/5') || !volumeVisual.includes('aria-label={`y=x²をx軸の周りに回転')) {
  throw new Error('Calculus III volume visual must connect the disk cross-section to the rotation volume and expose an accessible summary');
}
if (!learn.includes("practiceLink: '/learn/math/calculus3-area-volume-drill'")) {
  throw new Error('Calculus III volume visual must link to its related area and volume practice');
}
for (const slug of ['projectile-visual', 'motion-visual', 'simple-harmonic-visual', 'impulse-momentum-visual']) {
  const entry = learnEntries.find(candidate => candidate.slug === slug);
  if (!entry || !new RegExp(`slug: '${slug}'[\\s\\S]*?practiceLink: '/learn/physics/motion-calculation-drill'`).test(learn)) {
    throw new Error(`Physics visual ${slug} must link to its related mechanics practice`);
  }
}
const springVisual = fs.readFileSync(path.join(root, 'src/app/learn/physics/spring-visual/page.tsx'), 'utf8');
const motionDrill = fs.readFileSync(path.join(root, 'src/app/learn/physics/motion-calculation-drill/page.tsx'), 'utf8');
const springVisualEntry = learnEntries.find(entry => entry.slug === 'spring-visual');
if (!springVisualEntry || !new RegExp(`slug: 'spring-visual'[\\s\\S]*?practiceLink: '/learn/physics/motion-calculation-drill'`).test(learn)
  || !springVisual.includes('href="/learn/physics/motion-calculation-drill"')
  || !motionDrill.includes('href="/learn/physics/spring-visual"')) {
  throw new Error('The spring visual and its mechanics drill must link to each other.');
}
const harmonicVisual = fs.readFileSync(path.join(root, 'src/app/learn/physics/simple-harmonic-visual/page.tsx'), 'utf8');
if (!harmonicVisual.includes('href="/learn/physics/motion-calculation-drill"')
  || !motionDrill.includes('href="/learn/physics/simple-harmonic-visual"')
  || !learn.includes("slug: 'simple-harmonic-visual'")) {
  throw new Error('The simple-harmonic visual, mechanics drill and learning portal must link to each other.');
}

const phaseDiagram = fs.readFileSync(path.join(root, 'src/app/learn/chemistry/phase-diagram/page.tsx'), 'utf8');
if (!/role="img" aria-label=\{`\$\{info\.name\}の模式的な状態図/.test(phaseDiagram)) {
  throw new Error('Chemistry phase diagram must have an accessible, content-rich description');
}
const complexPlane = fs.readFileSync(path.join(root, 'src/app/learn/math/unit-circle-complex/page.tsx'), 'utf8');
if (!/role="img"\s+aria-label=\{`複素数平面/.test(complexPlane) || !complexPlane.includes('偏角を足します')) {
  throw new Error('Complex-plane visual must describe the values and meaning of its plotted product');
}
if (complexPlane.includes('**「長さは変えずに') || !complexPlane.includes('<strong>「長さは変えずに、角度だけ回転させる」</strong>')) {
  throw new Error('Complex-plane lesson emphasis must render as HTML instead of literal Markdown markers');
}
const trigonometry = fs.readFileSync(path.join(root, 'src/app/learn/math/trigonometry/page.tsx'), 'utf8');
if (!/role="img" aria-label=\{`角度\$\{angle\}度の単位円/.test(trigonometry)) {
  throw new Error('Trigonometry visual must describe its changing sine, cosine, and tangent values');
}
if (!trigonometry.includes('const tanUndefined = angle % 180 === 90') || !trigonometry.includes("tanは${tanUndefined ? '定義されない'")) {
  throw new Error('Trigonometry visual must agree on tangent being undefined at vertical angles');
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
const clientGeneratedState = fs.readFileSync(path.join(root, 'src/lib/useClientGeneratedState.ts'), 'utf8');
if (!clientGeneratedState.includes('useEffect(() => {\n    setValue(factoryRef.current());\n  }, []);')
  || clientGeneratedState.includes('requestAnimationFrame')) {
  throw new Error('Client-generated drill questions must initialize after hydration without waiting for an animation frame.');
}
const randomStateInitializer = /\buseState(?:<[^;\n]*?>)?\s*\(\s*(?:\(\s*\)\s*=>\s*)?(?:generate[A-Z]\w*|create[A-Z]\w*|[\w$.]+\.(?:next|pick))\s*\(/;
const unsafeRandomInitializers = pages.filter(file => randomStateInitializer.test(fs.readFileSync(file, 'utf8')));
if (unsafeRandomInitializers.length > 0) {
  throw new Error(`Random exercise state must be generated after hydration with useClientGeneratedState: ${unsafeRandomInitializers.join(', ')}`);
}

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

for (const slug of aggregateDrills) {
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

console.log(`Learning coverage verified: ${drillEntries.length} linked drills, ${practiceLinks.length} linked practice drills, ${learnEntries.length} linked learning pages (${requiredVisuals.length} required visuals), ${patternPages.length} fixed-plus-mixed pattern drills across all subjects, ${mathPages.length} math learning pages audited.`);
