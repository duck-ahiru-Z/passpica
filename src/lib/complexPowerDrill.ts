export interface ComplexPowerDrillProblem {
  zStr: string;
  r: number;
  rStr: string;
  theta: number;
  thetaStr: string;
  n: number;
  zn: number;
}

export const complexPowerDrillProblems: ComplexPowerDrillProblem[] = [
  { zStr: '1 + i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: Math.PI / 4, thetaStr: '\\frac{\\pi}{4}', n: 8, zn: 16 },
  { zStr: '1 - i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: 7 * Math.PI / 4, thetaStr: '\\frac{7\\pi}{4}', n: 8, zn: 16 },
  { zStr: '-1 + i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: 3 * Math.PI / 4, thetaStr: '\\frac{3\\pi}{4}', n: 8, zn: 16 },
  { zStr: '-1 - i', r: Math.sqrt(2), rStr: '\\sqrt{2}', theta: 5 * Math.PI / 4, thetaStr: '\\frac{5\\pi}{4}', n: 8, zn: 16 },
  { zStr: '1 + \\sqrt{3}i', r: 2, rStr: '2', theta: Math.PI / 3, thetaStr: '\\frac{\\pi}{3}', n: 6, zn: 64 },
  { zStr: '-1 + \\sqrt{3}i', r: 2, rStr: '2', theta: 2 * Math.PI / 3, thetaStr: '\\frac{2\\pi}{3}', n: 3, zn: 8 },
  { zStr: '-1 - \\sqrt{3}i', r: 2, rStr: '2', theta: 4 * Math.PI / 3, thetaStr: '\\frac{4\\pi}{3}', n: 3, zn: 8 },
  { zStr: '1 - \\sqrt{3}i', r: 2, rStr: '2', theta: 5 * Math.PI / 3, thetaStr: '\\frac{5\\pi}{3}', n: 6, zn: 64 },
  { zStr: '\\frac{\\sqrt{2}}{2} + \\frac{\\sqrt{2}}{2}i', r: 1, rStr: '1', theta: Math.PI / 4, thetaStr: '\\frac{\\pi}{4}', n: 8, zn: 1 },
  { zStr: '\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i', r: 1, rStr: '1', theta: Math.PI / 6, thetaStr: '\\frac{\\pi}{6}', n: 12, zn: 1 },
  { zStr: '\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i', r: 1, rStr: '1', theta: Math.PI / 3, thetaStr: '\\frac{\\pi}{3}', n: 6, zn: 1 },
  { zStr: '-\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i', r: 1, rStr: '1', theta: 2 * Math.PI / 3, thetaStr: '\\frac{2\\pi}{3}', n: 3, zn: 1 },
  { zStr: '-\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i', r: 1, rStr: '1', theta: 5 * Math.PI / 6, thetaStr: '\\frac{5\\pi}{6}', n: 12, zn: 1 },
];
