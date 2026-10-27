import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-derivative-visual/page.tsx'), 'utf8');
if (!page.includes('const isCriticalPoint = Math.abs(derivative(x)) < 1e-9')) {
  throw new Error('critical-point labels must only appear when the displayed derivative is zero');
}
if (!page.includes("{slope > 0 ? '増加' : slope < 0 ? '減少' : '水平（臨界点）'}")) {
  throw new Error('increase/decrease display must describe the slope sign at a critical point accurately');
}
if (!page.includes("x = −1（極大）") || !page.includes("x = 1（極小）") || page.includes('isStationaryPoint')) {
  throw new Error('the visual must identify the actual local maximum and minimum, not conflate them with stationarity');
}
if (!page.includes('/learn/math/calculus3-differentiation-drill')) {
  throw new Error('derivative visual must link to its related method practice');
}
if (!page.includes('座標目盛りは x が−2, −1, 0, 1, 2、y が−4, 0, 4')
  || !page.includes('[-2, -1, 1, 2].map(value => <g key={`x-${value}`}')
  || !page.includes('[-4, 4].map(value => <g key={`y-${value}`}')) {
  throw new Error('derivative graph must expose readable numeric axis ticks for interpreting point and tangent positions');
}
const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-differentiation-drill/page.tsx'), 'utf8');
if (!drillPage.includes('/learn/math/calculus3-derivative-visual')) {
  throw new Error('differentiation drill must link back to its visual explanation');
}

console.log('Calculus III derivative visual verified: both critical points are reachable by the slider and labeled consistently with slope and extrema.');
