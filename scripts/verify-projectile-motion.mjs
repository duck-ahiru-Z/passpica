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

assert.equal(calculateProjectileState(0, 0.5).vy, -projectileGravity * calculateProjectileState(0, 0.5).time, 'horizontal launch vertical velocity');
assert.ok(projectileInitialSpeed > 0 && projectileInitialHeight > 0);
const visualPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/physics/projectile-visual/page.tsx'), 'utf8');
assert.ok(visualPage.includes('Math.abs(vy) < 0.01 ? 30'), 'zero vertical speed should still show the downward gravity direction in the diagram');
assert.ok(visualPage.includes('↓ 重力加速度 g = {projectileGravity} m/s²'), 'zero-speed state should label the acceleration separately from velocity');
assert.ok(visualPage.includes('重力加速度は下向き'), 'the accessible diagram description should distinguish zero velocity from downward acceleration');
console.log('Projectile motion verified: 16 launch angles × 101 timeline positions, launch/apex/landing conditions, and input bounds.');
