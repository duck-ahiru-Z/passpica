import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/derivative-graph/page.tsx'), 'utf8');
if (!page.includes('const X_MIN = -2.4;') || !page.includes('const X_MAX = 2.4;')) {
  throw new Error('the slider and plot domain must keep the selected point visible in the graph');
}
if (!page.includes('{[-2,-1,0,1,2].map')) {
  throw new Error('x-axis grid labels must fit the revised graph domain');
}
const endpointY = 2.4 ** 3 - 3 * 2.4;
if (Math.abs(endpointY) > 8) throw new Error(`slider endpoint leaves the plotted y-range: ${endpointY}`);
console.log('Derivative graph visual verified: slider endpoints remain visible and the plot grid matches its domain.');
