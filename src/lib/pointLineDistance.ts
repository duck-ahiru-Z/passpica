import { BalancedRandom } from './balancedRandom.ts';

export type PointLinePattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type PointLineMode = PointLinePattern | 'mix';

export interface PointLineProblem {
  pattern: PointLinePattern;
  a: number;
  b: number;
  c: number;
  px: number;
  py: number;
  ans1: number | string;
  ans2?: number | string;
  questionText: string;
}

const mixedPatternPicker = new BalancedRandom<PointLinePattern>(['pattern1', 'pattern2', 'pattern3', 'pattern4']);
const triples = [
  { a: 3, b: 4 }, { a: 4, b: 3 },
  { a: 5, b: 12 }, { a: 12, b: 5 },
  { a: 8, b: 15 }, { a: 15, b: 8 },
];

export function generatePointLineDistanceProblem(selectedPattern: PointLineMode, random = Math.random): PointLineProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;
  const draw = () => random();

  while (true) {
    const triple = triples[Math.floor(draw() * triples.length)];
    const a = triple.a * (draw() > 0.5 ? 1 : -1);
    const b = triple.b * (draw() > 0.5 ? 1 : -1);
    const norm = Math.sqrt(a * a + b * b);
    let px = 0;
    let py = 0;
    let c = 0;

    if (pattern === 'pattern1') {
      c = Math.floor(draw() * 50) - 25;
      if (c === 0) continue;
      const distance = Math.abs(c) % norm === 0 ? String(Math.abs(c) / norm) : `${Math.abs(c)}/${norm}`;
      const signC = c > 0 ? `+${c}` : String(c);
      return { pattern, a, b, c, px: 0, py: 0, ans1: distance, questionText: `原点 $(0,0)$ と 直線 $${a}x ${b > 0 ? '+' : ''}${b}y ${signC} = 0$ の距離 $d$ を求めよ。` };
    }

    if (pattern === 'pattern2' || pattern === 'pattern3') {
      px = Math.floor(draw() * 10) - 5;
      py = Math.floor(draw() * 10) - 5;
      c = Math.floor(draw() * (pattern === 'pattern2' ? 50 : 30)) - (pattern === 'pattern2' ? 25 : 15);
      const numerator = Math.abs(a * px + b * py + c);
      if (numerator === 0) continue;
      const distance = numerator % norm === 0 ? String(numerator / norm) : `${numerator}/${norm}`;

      if (pattern === 'pattern2') {
        const signC = c > 0 ? `+${c}` : (c < 0 ? String(c) : '');
        return { pattern, a, b, c, px, py, ans1: distance, questionText: `点 $(${px}, ${py})$ と 直線 $${a}x ${b > 0 ? '+' : ''}${b}y ${signC} = 0$ の距離 $d$ を求めよ。` };
      }

      let slope = '';
      if (-a % b === 0) slope = String(-a / b);
      else slope = b * -a > 0 ? `\\frac{${Math.abs(a)}}{${Math.abs(b)}}` : `-\\frac{${Math.abs(a)}}{${Math.abs(b)}}`;
      if (slope === '1') slope = '';
      if (slope === '-1') slope = '-';
      let intercept = '';
      if (-c % b === 0) intercept = String(-c / b);
      else intercept = b * -c > 0 ? `+\\frac{${Math.abs(c)}}{${Math.abs(b)}}` : `-\\frac{${Math.abs(c)}}{${Math.abs(b)}}`;
      if (-c % b === 0 && -c / b > 0) intercept = `+${intercept}`;
      return { pattern, a, b, c, px, py, ans1: distance, questionText: `点 $(${px}, ${py})$ と 直線 $y = ${slope}x ${intercept}$ の距離 $d$ を求めよ。` };
    }

    px = Math.floor(draw() * 10) - 5;
    py = Math.floor(draw() * 10) - 5;
    const targetDistance = Math.floor(draw() * 4) + 1;
    const base = a * px + b * py;
    const offset = targetDistance * norm;
    const answers = [offset - base, -offset - base].sort((left, right) => left - right);
    return {
      pattern,
      a,
      b,
      c: answers[0],
      px,
      py,
      ans1: String(answers[0]),
      ans2: String(answers[1]),
      questionText: `点 $(${px}, ${py})$ と 直線 $${a}x ${b > 0 ? '+' : ''}${b}y + k = 0$ の距離が $${targetDistance}$ のとき、定数 $k$ の値を求めよ。（カンマ区切りで2つ入力）`,
    };
  }
}
