import { BalancedRandom } from './balancedRandom.ts';

export type TrigSynthesisPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';

export interface TrigSynthesisTerm {
  sign: 1 | -1;
  c: number;
  d: number;
}

export interface TrigSynthesisProblem {
  pattern: TrigSynthesisPattern;
  a: TrigSynthesisTerm;
  b: TrigSynthesisTerm;
  rOuter: number;
  rInner: number;
  ansAlpha: string;
  ansCos?: string;
  ansSin?: string;
  qStr: string;
}

const patterns: TrigSynthesisPattern[] = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
const mixedPatternPicker = new BalancedRandom(patterns);

function termStr(term: TrigSynthesisTerm, isFirst: boolean): string {
  const sign = term.sign === -1 ? '-' : isFirst ? '' : '+';
  if (term.c === 1 && term.d === 1) return isFirst ? `${sign}1` : sign;
  if (term.d === 1) return `${sign}${term.c}`;
  return `${sign}${term.c === 1 ? '' : term.c}\\sqrt{${term.d}}`;
}

export function generateTrigSynthesisProblem(
  selectedPattern: TrigSynthesisPattern | 'mix',
  random: () => number = Math.random,
): TrigSynthesisProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;
  let a: TrigSynthesisTerm;
  let b: TrigSynthesisTerm;
  let rOuter: number;
  let rInner: number;
  let ansAlpha: string;
  let ansCos: string | undefined;
  let ansSin: string | undefined;

  if (pattern === 'pattern1' || pattern === 'pattern2') {
    const pairs = pattern === 'pattern1'
      ? [
          { ax: 1, by: Math.sqrt(3), alpha: 'pi/3' },
          { ax: Math.sqrt(3), by: 1, alpha: 'pi/6' },
          { ax: 1, by: 1, alpha: 'pi/4' },
        ]
      : [
          { ax: 1, by: -Math.sqrt(3), alpha: '-pi/3' },
          { ax: Math.sqrt(3), by: -1, alpha: '-pi/6' },
          { ax: 1, by: -1, alpha: '-pi/4' },
        ];
    const pair = pairs[Math.floor(random() * pairs.length)];
    a = { sign: 1, c: 1, d: pair.ax === Math.sqrt(3) ? 3 : 1 };
    b = { sign: pair.by < 0 ? -1 : 1, c: 1, d: Math.abs(pair.by) === Math.sqrt(3) ? 3 : 1 };
    const sameTerms = a.d === b.d;
    rOuter = sameTerms ? 1 : 2;
    rInner = sameTerms ? 2 : 1;
    ansAlpha = pair.alpha;
  } else if (pattern === 'pattern3') {
    const pairs = [
      { ax: 6, bx: 2, r: 2, inner: 2, alpha: 'pi/6' },
      { ax: 2, bx: 6, r: 2, inner: 2, alpha: 'pi/3' },
      { ax: 9, bx: 3, r: 2, inner: 3, alpha: 'pi/6' },
      { ax: 3, bx: 9, r: 2, inner: 3, alpha: 'pi/3' },
    ];
    const pair = pairs[Math.floor(random() * pairs.length)];
    a = { sign: 1, c: pair.ax === 9 ? 3 : 1, d: pair.ax === 9 ? 1 : pair.ax };
    b = { sign: 1, c: pair.bx === 9 ? 3 : 1, d: pair.bx === 9 ? 1 : pair.bx };
    rOuter = pair.r;
    rInner = pair.inner;
    ansAlpha = pair.alpha;
  } else {
    const triples = [{ x: 3, y: 4, r: 5 }, { x: 4, y: 3, r: 5 }, { x: 5, y: 12, r: 13 }, { x: 12, y: 5, r: 13 }, { x: 8, y: 15, r: 17 }];
    const triple = triples[Math.floor(random() * triples.length)];
    const signX = random() > 0.5 ? 1 : -1;
    const signY = random() > 0.5 ? 1 : -1;
    a = { sign: signX, c: triple.x, d: 1 };
    b = { sign: signY, c: triple.y, d: 1 };
    rOuter = triple.r;
    rInner = 1;
    ansAlpha = 'alpha';
    ansCos = `${signX * triple.x}/${triple.r}`;
    ansSin = `${signY * triple.y}/${triple.r}`;
  }

  const aStr = termStr(a, true);
  let bStr = termStr(b, false);
  if (bStr === '+') bStr = '+1';
  if (bStr === '-') bStr = '-1';
  if (bStr === '+1') bStr = '+';
  if (bStr === '-1') bStr = '-';
  const qStr = `${aStr === '1' ? '' : aStr}\\sin\\theta ${bStr.replace(/^\+/, '+')}\\cos\\theta`;
  return { pattern, a, b, rOuter, rInner, ansAlpha, ansCos, ansSin, qStr };
}
