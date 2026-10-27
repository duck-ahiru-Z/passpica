import fs from 'node:fs';
import path from 'node:path';
import { formatMotionAnswer, generateMotionProblem, getMotionExplanation, isMotionMethodValid, motionPatterns } from '../src/lib/physicsMotionCalculation.ts';
import { calculateProjectileState } from '../src/lib/projectileMotion.ts';
import { calculateSimpleHarmonicState } from '../src/lib/simpleHarmonicMotion.ts';
import { calculateCircularMotion } from '../src/lib/circularMotion.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/physics/motion-calculation-drill/page.tsx'), 'utf8');
if (!/type="radio"\s+name="motion-method"/.test(drillPage) || drillPage.includes('onClick={() => setMethod(pattern)}')) {
  throw new Error('mechanics method selection must be a single-choice radio group');
}
if (!drillPage.includes('setMethod(pattern); setChecked(false);') || !drillPage.includes('setAnswer(event.target.value); setChecked(false);')) {
  throw new Error('changing a mechanics method or answer must clear old feedback');
}
if (!drillPage.includes("setMethod(selectedMode === 'mix' ? '' : selectedMode)") || !drillPage.includes("mode === 'mix' ? <fieldset") || !drillPage.includes('基礎練習：{motionLabels[mode]}に固定して繰り返します。')) {
  throw new Error('fixed mechanics practice must lock its formula while mixed practice asks learners to identify it');
}

const stableRandom = () => 0.37;
const checks = {
  speed: problem => {
    const [, distance, time] = problem.question.match(/([\d.]+) m を ([\d.]+) s/);
    return Math.abs(problem.answer - Number(distance) / Number(time)) < 1e-12 && problem.unit === 'm/s'
      && problem.question.includes('平均の速さ') && problem.explanation.startsWith('平均の速さ=');
  },
  averageVelocity: problem => {
    const [, displacement, time] = problem.question.match(/変位は (-?[\d.]+) m、移動にかかった時間は ([\d.]+) s/);
    const expected = Number(displacement) / Number(time);
    return problem.answer === expected && problem.unit === 'm/s'
      && problem.explanation.includes(`平均速度=変位/時間=(${displacement})/${time}=${formatMotionAnswer(expected)} m/s`)
      && problem.question.includes('右向きを正')
      && (expected >= 0 || problem.explanation.includes('負の値は左向き'));
  },
  acceleration: problem => {
    const [, initial, final, time] = problem.question.match(/([\d.]+) m\/s から ([\d.]+) m\/s に ([\d.]+) s/);
    return Math.abs(problem.answer - (Number(final) - Number(initial)) / Number(time)) < 1e-12 && problem.unit === 'm/s²';
  },
  freefall: problem => {
    const [, time, gravity] = problem.question.match(/の (\d+(?:\.\d+)?) s 後.*g=([\d.]+)/);
    return Math.abs(problem.answer - Number(time) * Number(gravity)) < 1e-12 && problem.unit === 'm/s';
  },
  work: problem => {
    const [, force, angle, distance] = problem.question.match(/([\d.]+) N の力を、移動方向に対して (\d+)° の向きに加え、物体が ([\d.]+) m/);
    const exactCosine = { 0: 1, 60: 0.5, 90: 0, 180: -1 }[Number(angle)];
    const expected = Number(force) * Number(distance) * exactCosine;
    return problem.answer === expected && problem.unit === 'J' && problem.explanation.includes(`${expected} J`);
  },
  momentum: problem => {
    const [, mass, velocity] = problem.question.match(/質量 ([\d.]+) kg .*? ([\d.]+) m\/s/);
    return Math.abs(problem.answer - Number(mass) * Number(velocity)) < 1e-12 && problem.unit === 'kg·m/s';
  },
  impulse: problem => {
    const [, force, time] = problem.question.match(/に ([\d.]+) N の一定の力を ([\d.]+) s/);
    const expected = Number(force) * Number(time);
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'N·s'
      && problem.explanation.includes(`I=FΔt=${force}×${time}=${formatMotionAnswer(expected)} N·s`);
  },
  impulseSigned: problem => {
    const [, direction, magnitude, time] = problem.question.match(/を正とする。物体に (右向き|左向き) へ ([\d.]+) N の一定の力を ([\d.]+) s/);
    const force = Number(magnitude) * (direction === '左向き' ? -1 : 1);
    const expected = force * Number(time);
    return problem.answer === expected && problem.unit === 'N·s'
      && problem.explanation.includes(`I=FΔt=${force}×${time}=${formatMotionAnswer(expected)} N·s`)
      && problem.explanation.includes('力積の符号は力の向きで決まる');
  },
  kineticEnergy: problem => {
    const [, mass, velocity] = problem.question.match(/質量 ([\d.]+) kg .*? ([\d.]+) m\/s/);
    return Math.abs(problem.answer - 0.5 * Number(mass) * Number(velocity) ** 2) < 1e-12 && problem.unit === 'J';
  },
  potentialEnergy: problem => {
    const [, mass, height, gravity] = problem.question.match(/質量 ([\d.]+) kg .*? ([\d.]+) m 高い位置.*g=([\d.]+)/);
    const expected = Number(mass) * Number(gravity) * Number(height);
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'J'
      && problem.explanation.includes(`Eₚ=mgh=${mass}×${gravity}×${height}=${formatMotionAnswer(expected)} J`);
  },
  energyConservation: problem => {
    const [, mass, height, gravity] = problem.question.match(/質量 ([\d.]+) kg .*?高さ ([\d.]+) m .*g=([\d.]+)/);
    const expected = Math.sqrt(2 * Number(gravity) * Number(height));
    return Number(mass) > 0 && Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'm/s'
      && problem.explanation.includes('力学的エネルギー保存')
      && problem.explanation.includes(`=${formatMotionAnswer(expected)} m/s`);
  },
  spring: problem => {
    const [, constant, extension] = problem.question.match(/ばね定数 ([\d.]+) N\/m のばねを ([\d.]+) m/);
    return Math.abs(problem.answer - Number(constant) * Number(extension)) < 1e-12 && problem.unit === 'N';
  },
  springSignedForce: problem => {
    const [, constant, magnitude, direction] = problem.question.match(/ばね定数 ([\d.]+) N\/m のばねを自然長から ([\d.]+) m (伸ばした|縮めた)/);
    const displacement = Number(magnitude) * (direction === '縮めた' ? -1 : 1);
    const expected = -Number(constant) * displacement;
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'N'
      && problem.question.includes('右向きを正')
      && problem.explanation.includes(`F=−${constant}×(${displacement})=${formatMotionAnswer(expected)} N`);
  },
  springEnergy: problem => {
    const [, constant, magnitude, direction] = problem.question.match(/ばね定数 ([\d.]+) N\/m のばねを自然長から ([\d.]+) m (伸ばした|縮めた)/);
    const displacement = Number(magnitude) * (direction === '縮めた' ? -1 : 1);
    const expected = 0.5 * Number(constant) * displacement ** 2;
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'J'
      && problem.explanation.includes(`(${displacement})²=${formatMotionAnswer(expected)} J`)
      && problem.explanation.includes('向きによらず0以上');
  },
  springPeriod: problem => {
    const [, mass, constant] = problem.question.match(/質量 ([\d.]+) kg .*ばね定数 ([\d.]+) N\/m/);
    const expected = 2 * Math.PI * Math.sqrt(Number(mass) / Number(constant));
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 's'
      && problem.explanation.includes(`T=2π√(m/k)=2π√(${mass}/${constant})=${formatMotionAnswer(expected)} s`);
  },
  springFrequency: problem => {
    const [, mass, constant] = problem.question.match(/質量 ([\d.]+) kg .*ばね定数 ([\d.]+) N\/m/);
    const expected = Math.sqrt(Number(constant) / Number(mass)) / (2 * Math.PI);
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'Hz'
      && problem.explanation.includes(`f=ω/(2π)=√(${constant}/${mass})/(2π)=${formatMotionAnswer(expected)} Hz`);
  },
  circularSpeed: problem => {
    const [, radius, period] = problem.question.match(/半径 ([\d.]+) m の円周上を ([\d.]+) s/);
    const expected = 2 * Math.PI * Number(radius) / Number(period);
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'm/s'
      && problem.explanation.includes(`v=2πr/T=2π×${radius}/${period}=${formatMotionAnswer(expected)} m/s`);
  },
  centripetalAcceleration: problem => {
    const [, speed, radius] = problem.question.match(/速さ ([\d.]+) m\/s、半径 ([\d.]+) m/);
    const expected = Number(speed) ** 2 / Number(radius);
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'm/s²'
      && problem.explanation.includes(`a=v²/r=${speed}²/${radius}=${formatMotionAnswer(expected)} m/s²`)
      && problem.explanation.includes('円の中心向き');
  },
  centripetalForce: problem => {
    const [, mass, speed, radius] = problem.question.match(/質量 ([\d.]+) kg、速さ ([\d.]+) m\/s、円運動の半径 ([\d.]+) m/);
    const expected = Number(mass) * Number(speed) ** 2 / Number(radius);
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'N'
      && problem.explanation.includes(`F=ma=mv²/r=${mass}×${speed}²/${radius}=${formatMotionAnswer(expected)} N`)
      && problem.explanation.includes('合力の中心向き成分');
  },
  angularCentripetalAcceleration: problem => {
    const [, radius, angularSpeed] = problem.question.match(/半径 ([\d.]+) m、角速度 ([\d.]+) rad\/s/);
    const expected = Number(radius) * Number(angularSpeed) ** 2;
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'm/s²'
      && problem.explanation.includes(`a=v²/r=(rω)²/r=rω²=${radius}×${angularSpeed}²=${formatMotionAnswer(expected)} m/s²`);
  },
};

if (formatMotionAnswer(30.000000000000007) !== '30' || formatMotionAnswer(2.4492935982947064e-15) !== '0') {
  throw new Error('answer display should hide floating-point noise');
}
if (!drillPage.includes('Number(formatMotionAnswer(problem.answer))') || !drillPage.includes('小数第6位まで')) {
  throw new Error('rounded displayed answers must be accepted at the stated input precision');
}
if (!drillPage.includes('isMotionMethodValid(problem, method)') || !drillPage.includes('getMotionExplanation(problem, method)')) {
  throw new Error('accepted alternative mechanics methods must be graded and explained with their own derivation');
}
if (!drillPage.includes('href="/learn/physics/projectile-visual"')) throw new Error('projectile mechanics drill must link back to its visual simulator');
if (!drillPage.includes('href="/learn/physics/motion-visual"') || !drillPage.includes('等加速度運動ビジュアルへ')) {
  throw new Error('mechanics calculation drill must link back to the constant-acceleration visual');
}
if (!drillPage.includes('href="/learn/physics/simple-harmonic-visual"') || !drillPage.includes('単振動ビジュアルへ')) {
  throw new Error('mechanics calculation drill must link back to the simple-harmonic visual');
}
if (!drillPage.includes('href="/learn/physics/circular-motion-visual"') || !drillPage.includes('等速円運動ビジュアルへ')) {
  throw new Error('mechanics calculation drill must link back to its circular-motion visual');
}
const circularMotionPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/physics/circular-motion-visual/page.tsx'), 'utf8');
if (!circularMotionPage.includes('href="/learn/physics/motion-calculation-drill"')
  || !circularMotionPage.includes('aria-label="円運動の半径"')
  || !circularMotionPage.includes('aria-label="円運動の速さ"')
  || !circularMotionPage.includes('向心加速度 a=v²/r=rω²')
  || !circularMotionPage.includes('F=ma=mv²/r')) {
  throw new Error('circular-motion visual must expose its diagram controls, core equations, and matching calculation drill');
}
const simpleHarmonicPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/physics/simple-harmonic-visual/page.tsx'), 'utf8');
if (!simpleHarmonicPage.includes('href="/learn/physics/motion-calculation-drill"')
  || !simpleHarmonicPage.includes('aria-label="振動の位相"')
  || !simpleHarmonicPage.includes('aria-label="振動する物体の質量"')
  || !simpleHarmonicPage.includes('aria-label="ばね定数"')
  || !simpleHarmonicPage.includes('aria-label="振幅"')) {
  throw new Error('simple-harmonic visual must provide the linked drill and named interactive controls');
}
if (!simpleHarmonicPage.includes('変位 x(t)=A cos(ωt)')
  || !simpleHarmonicPage.includes('GRAPH_LEFT - 8} y={GRAPH_TOP + 4')
  || !simpleHarmonicPage.includes('>+A</text>')
  || !simpleHarmonicPage.includes('>0</text>')
  || !simpleHarmonicPage.includes('>−A</text>')) {
  throw new Error('simple-harmonic displacement graph must label the formula, amplitude extrema and equilibrium axis');
}
if (!simpleHarmonicPage.includes('aria-label="エネルギー棒グラフの凡例"')
  || !simpleHarmonicPage.includes('bg-amber-400" />弾性エネルギー')
  || !simpleHarmonicPage.includes('bg-green-500" />運動エネルギー')) {
  throw new Error('simple-harmonic energy bar must visually identify potential and kinetic energy colors');
}
const motionVisualPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/physics/motion-visual/page.tsx'), 'utf8');
if (!motionVisualPage.includes('href="/learn/physics/motion-calculation-drill"') || !motionVisualPage.includes('等加速度運動の計算演習へ')) {
  throw new Error('constant-acceleration visual must link directly to its calculation drill');
}

for (const pattern of motionPatterns) {
  if (pattern.startsWith('projectile')) continue;
  const questions = new Set();
  const answers = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateMotionProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem) || !problem.explanation.trim()) throw new Error(`formula, unit, or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    questions.add(problem.question);
    answers.add(formatMotionAnswer(problem.answer));
  }
  const expectedVariants = pattern === 'projectileComponents' ? 12
    : ['energyConservation', 'springPeriod', 'springFrequency'].includes(pattern) ? (pattern === 'energyConservation' ? 6 : 5)
    : ['projectileMaxHeight', 'projectileFlightTime', 'projectileRange'].includes(pattern) ? 6 : 5;
  if (questions.size !== expectedVariants) throw new Error(`${pattern} generated ${questions.size}/${expectedVariants} expected variants`);
  if (['averageVelocity', 'springPeriod', 'springFrequency'].includes(pattern) && answers.size !== expectedVariants) {
    throw new Error(`${pattern} generated only ${answers.size}/${expectedVariants} distinct answer values`);
  }
}

for (const mass of [0.5, 1, 1.5, 2]) {
  for (const springConstant of [50, 100, 150, 200]) {
    for (const amplitude of [0.1, 0.2, 0.3]) {
      for (const phase of [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]) {
        const state = calculateSimpleHarmonicState({ mass, springConstant, amplitude, phase });
        const omega = Math.sqrt(springConstant / mass);
        const angle = 2 * Math.PI * phase;
        const expectedPotential = 0.5 * springConstant * amplitude ** 2 * Math.cos(angle) ** 2;
        const expectedKinetic = 0.5 * mass * amplitude ** 2 * omega ** 2 * Math.sin(angle) ** 2;
        if (Math.abs(state.period - 2 * Math.PI / omega) > 1e-12
          || Math.abs(state.frequency * state.period - 1) > 1e-12
          || Math.abs(state.displacement - amplitude * Math.cos(angle)) > 1e-12
          || Math.abs(state.velocity + amplitude * omega * Math.sin(angle)) > 1e-12
          || Math.abs(state.acceleration + omega ** 2 * state.displacement) > 1e-12
          || Math.abs(state.potentialEnergy - expectedPotential) > 1e-12
          || Math.abs(state.kineticEnergy - expectedKinetic) > 1e-12
          || Math.abs(state.totalEnergy - 0.5 * springConstant * amplitude ** 2) > 1e-12) {
          throw new Error(`simple-harmonic state mismatch at m=${mass}, k=${springConstant}, A=${amplitude}, phase=${phase}: ${JSON.stringify(state)}`);
        }
      }
    }
  }
}

for (const pattern of ['projectileComponents', 'projectileMaxHeight', 'projectileFlightTime', 'projectileRange']) {
  for (let index = 0; index < 100; index += 1) {
    const problem = generateMotionProblem(pattern);
    const angle = Number(problem.question.match(/(?:射出角 |から )(\d+)°/)[1]);
    const state = calculateProjectileState(angle, 0);
    const expected = pattern === 'projectileComponents'
      ? (problem.question.includes('水平方向') ? state.vx0 : state.vy0)
      : pattern === 'projectileMaxHeight' ? state.maxHeight
        : pattern === 'projectileFlightTime' ? state.flightTime : state.range;
    const expectedUnit = pattern === 'projectileComponents' ? 'm/s'
      : pattern === 'projectileMaxHeight' || pattern === 'projectileRange' ? 'm' : 's';
    if (problem.pattern !== pattern || Math.abs(problem.answer - expected) > 1e-12 || problem.unit !== expectedUnit) {
      throw new Error(`projectile calculation mismatch: ${JSON.stringify(problem)}`);
    }
    if (!problem.question.includes('小数第6位まで') || !problem.explanation.includes(formatMotionAnswer(problem.answer))) {
      throw new Error(`projectile prompt precision or explanation mismatch: ${JSON.stringify(problem)}`);
    }
  }
}

const energyProblem = generateMotionProblem('energyConservation', stableRandom);
if (!isMotionMethodValid(energyProblem, 'freefall')
  || !getMotionExplanation(energyProblem, 'freefall').includes('v²=v₀²+2gh')
  || isMotionMethodValid(energyProblem, 'work')) {
  throw new Error('height-based drop problems must accept the equivalent free-fall kinematics method and show its derivation');
}

const mixedQuestionCount = motionPatterns.length * 50;
const mixed = Array.from({ length: mixedQuestionCount }, () => generateMotionProblem('mix', stableRandom).pattern);
for (let start = 0; start <= mixed.length - motionPatterns.length; start += 1) {
  if (new Set(mixed.slice(start, start + motionPatterns.length)).size !== motionPatterns.length) throw new Error(`mixed set omitted a mechanics pattern in batch ${start / motionPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed mechanics practice repeated adjacent patterns');
for (const mass of [0.5, 1, 2, 5]) {
  for (const radius of [0.5, 1, 1.5, 3]) {
    for (const speed of [0.5, 2, 5, 8]) {
      for (const angleDegrees of [0, 45, 90, 135, 180, 225, 270, 315]) {
        const state = calculateCircularMotion(mass, radius, speed, angleDegrees);
        const speedMagnitude = Math.hypot(state.velocity.x, state.velocity.y);
        const accelerationMagnitude = Math.hypot(state.acceleration.x, state.acceleration.y);
        const dot = state.position.x * state.velocity.x + state.position.y * state.velocity.y;
        if (Math.abs(state.angularSpeed - speed / radius) > 1e-12
          || Math.abs(state.period * state.angularSpeed - 2 * Math.PI) > 1e-12
          || Math.abs(state.centripetalAcceleration - speed ** 2 / radius) > 1e-12
          || Math.abs(state.centripetalForce - mass * state.centripetalAcceleration) > 1e-12
          || Math.abs(Math.hypot(state.position.x, state.position.y) - radius) > 1e-12
          || Math.abs(speedMagnitude - speed) > 1e-12
          || Math.abs(accelerationMagnitude - state.centripetalAcceleration) > 1e-12
          || Math.abs(dot) > 1e-12) {
          throw new Error(`circular-motion state mismatch for m=${mass}, r=${radius}, v=${speed}, angle=${angleDegrees}: ${JSON.stringify(state)}`);
        }
      }
    }
  }
}
for (const invalid of [[0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 0], [1, 1, 1, Number.NaN]]) {
  let rejected = false;
  try { calculateCircularMotion(...invalid); } catch (error) { rejected = error instanceof RangeError; }
  if (!rejected) throw new Error(`invalid circular-motion parameters were not rejected: ${invalid}`);
}

console.log(`Physics mechanics verified: ${motionPatterns.length} focused patterns; ${mixed.length} balanced mixed questions; formula, unit, answer, variant, adjacency, display-rounding and visual-link checks; 432 SHM states and 512 circular-motion states.`);
