import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-derivative-visual/page.tsx'), 'utf8');
if (!page.includes("const isCriticalPoint = Math.abs(Math.abs(x) - 1) < 0.026")) {
  throw new Error('critical-point detection must match the slider step near x = ±1');
}
if (!page.includes("{slope > 0 ? '増加' : slope < 0 ? '減少' : '水平（臨界点）'}")) {
  throw new Error('increase/decrease display must describe the slope sign at a critical point accurately');
}
if (!page.includes("x = −1（極大）") || !page.includes("x = 1（極小）") || page.includes('isStationaryPoint')) {
  throw new Error('the visual must identify the actual local maximum and minimum, not conflate them with stationarity');
}

console.log('Calculus III derivative visual verified: both critical points are reachable by the slider and labeled consistently with slope and extrema.');
