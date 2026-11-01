import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calculateProjectileState,
  projectileGravity,
  projectileInitialHeight,
  projectileInitialSpeed,
} from '../src/lib/projectileMotion.ts';

const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} !== ${expected}`);

for (let angleDeg = 0; angleDeg <= 75; angleDeg += 5) {
  const atLaunch = calculateProjectileState(angleDeg, 0);
  close(atLaunch.x, 0, `launch x at ${angleDeg}°`);
  close(atLaunch.y, projectileInitialHeight, `launch y at ${angleDeg}°`);
  close(atLaunch.time, 0, `launch time at ${angleDeg}°`);
  assert.ok(atLaunch.vx0 > 0, `horizontal velocity should remain positive at ${angleDeg}°`);

  const atLanding = calculateProjectileState(angleDeg, 1);
  close(atLanding.time, atLanding.flightTime, `landing time at ${angleDeg}°`);
  close(atLanding.y, 0, `landing height at ${angleDeg}°`);
  close(atLanding.displayedY, 0, `displayed landing height at ${angleDeg}°`);
  assert.ok(atLanding.vy < 0, `object should be descending at landing for ${angleDeg}°`);
  close(atLanding.x, atLanding.range, `landing range at ${angleDeg}°`);
  const landingArrowLength = Math.min(48, Math.max(18, Math.abs(atLanding.vy) * 2.5));
  assert.ok(288 + landingArrowLength <= 350, `downward landing velocity arrow must fit in the diagram at ${angleDeg}°`);

  for (let percent = 0; percent <= 100; percent++) {
    const state = calculateProjectileState(angleDeg, percent / 100);
    const expectedTime = atLanding.flightTime * percent / 100;
    close(state.time, expectedTime, `time at ${angleDeg}°, ${percent}%`);
    close(state.x, atLanding.vx0 * expectedTime, `horizontal motion at ${angleDeg}°, ${percent}%`);
    close(state.vy, atLanding.vy0 - projectileGravity * expectedTime, `vertical velocity at ${angleDeg}°, ${percent}%`);
    assert.ok(state.y >= -1e-9, `height below ground at ${angleDeg}°, ${percent}%`);
    close(state.displayedY, Math.max(0, state.y), `displayed height at ${angleDeg}°, ${percent}%`);
  }

  if (atLanding.vy0 > 0) {
    const apexFraction = (atLanding.vy0 / projectileGravity) / atLanding.flightTime;
    const atApex = calculateProjectileState(angleDeg, apexFraction);
    close(atApex.vy, 0, `apex vertical velocity at ${angleDeg}°`);
    close(atApex.y, atLanding.maxHeight, `apex height at ${angleDeg}°`);
  }
}

assert.equal(calculateProjectileState(-10, 0.5).angleDeg, 0, 'angle lower bound');
assert.equal(calculateProjectileState(90, 0.5).angleDeg, 75, 'angle upper bound');
close(calculateProjectileState(30, -1).time, 0, 'time-fraction lower bound');
close(calculateProjectileState(30, 2).time, calculateProjectileState(30, 1).flightTime, 'time-fraction upper bound');

for (const [angleDeg, speed, height] of [[0, 5, 2], [45, 20, 5], [75, 30, 30]]) {
  const angle = angleDeg * Math.PI / 180;
  const launch = calculateProjectileState(angleDeg, 0, speed, height);
  const landing = calculateProjectileState(angleDeg, 1, speed, height);
  close(launch.y, height, `custom launch height at ${angleDeg}°`);
  close(launch.vx0, speed * Math.cos(angle), `custom horizontal launch speed at ${angleDeg}°`);
  close(launch.vy0, speed * Math.sin(angle), `custom vertical launch speed at ${angleDeg}°`);
  close(landing.flightTime, (launch.vy0 + Math.sqrt(launch.vy0 ** 2 + 2 * projectileGravity * height)) / projectileGravity, `custom flight time at ${angleDeg}°`);
  close(landing.y, 0, `custom landing height at ${angleDeg}°`);
  close(landing.range, launch.vx0 * landing.flightTime, `custom range at ${angleDeg}°`);
}
close(calculateProjectileState(45, 0.5, 40, 0).vx0, 30 * Math.cos(Math.PI / 4), 'custom speed should clamp to 30 m/s and height to 2 m');

assert.equal(calculateProjectileState(0, 0.5).vy, -projectileGravity * calculateProjectileState(0, 0.5).time, 'horizontal launch vertical velocity');
assert.ok(projectileInitialSpeed > 0 && projectileInitialHeight > 0);
const visualPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/physics/projectile-visual/page.tsx'), 'utf8');
if (!visualPage.includes('href="/learn/physics/motion-calculation-drill"') || !visualPage.includes('投射運動の計算演習へ')) throw new Error('projectile visual must link directly to its calculation drill');
assert.ok(visualPage.includes('Math.abs(vy) >= 0.01 ? <line') && visualPage.includes('sy(displayedY) + 30'), 'zero vertical speed should hide the velocity arrow and show a separate downward gravity arrow');
assert.ok(visualPage.includes('Math.min(48, Math.max(18, Math.abs(vy) * 2.5))') && visualPage.includes('Math.sign(vy) * verticalVelocityArrowLength'), 'nonzero vertical velocity arrows should remain visible and follow the velocity sign');
assert.ok(visualPage.includes('const H = 350;') && visualPage.includes('H - 62 - (value / (maxHeight + 3)) * (H - 95)'), 'the plot must reserve bottom space without changing its plotted y-scale');
assert.ok(visualPage.includes('H - 62 - (py / (maxHeight + 3)) * (H - 95)'), 'trajectory must use the same vertical scale as the axes and projectile marker');
const groundY = 350 - 62;
for (let angleDeg = 0; angleDeg <= 75; angleDeg += 5) {
  const landing = calculateProjectileState(angleDeg, 1);
  const plottedLandingY = 350 - 62 - (Math.max(0, landing.y) / (landing.maxHeight + 3)) * (350 - 95);
  close(plottedLandingY, groundY, `trajectory ground alignment at ${angleDeg}°`);
}
assert.ok(visualPage.includes('width={W} height={H}'), 'the plot clip region must include the reserved arrow margin below ground');
assert.ok(visualPage.includes("Math.abs(vy) < 0.01 ? '—'"), 'zero velocity should not be labeled with a false up/down direction');
assert.ok(visualPage.includes('id="vertical-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"'), 'vertical-vector arrowhead should point along its line after automatic rotation');
assert.ok(visualPage.includes('↓ 重力加速度 g = {projectileGravity} m/s²'), 'zero-speed state should label the acceleration separately from velocity');
assert.ok(visualPage.includes('重力加速度は下向き'), 'the accessible diagram description should distinguish zero velocity from downward acceleration');
assert.ok(visualPage.includes('setAngleDeg(Number(event.target.value)); setTimeFraction(1);'), 'changing launch angle should reset the timeline to the new trajectory landing point');
assert.ok(visualPage.includes('aria-label="初速度（メートル毎秒）"') && visualPage.includes('aria-label="初期高さ（メートル）"'), 'initial speed and height controls should be labeled for assistive technology');
assert.ok(visualPage.includes('setInitialSpeed(Number(event.target.value)); setTimeFraction(1);') && visualPage.includes('setInitialHeight(Number(event.target.value)); setTimeFraction(1);'), 'changing launch conditions should reset the timeline to the new trajectory landing point');
assert.ok(visualPage.includes('initialHeight + vy0 * t - 0.5 * projectileGravity * t * t'), 'the plotted trajectory must use the selected initial height');
console.log('Projectile motion verified: 16 launch angles × 101 timeline positions, three variable initial conditions, launch/apex/landing states, and input bounds.');
