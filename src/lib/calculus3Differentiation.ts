import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type DifferentiationPattern = 'chain' | 'product' | 'logarithmic' | 'parametric' | 'ellipse-parametric' | 'implicit' | 'inverse' | 'higher';
export type DifferentiationMode = DifferentiationPattern | 'mix';
export type DifferentiationProblem = { pattern: DifferentiationPattern; expression: string; answer: number; explanation: string };

export const differentiationPatterns: readonly DifferentiationPattern[] = ['chain', 'product', 'logarithmic', 'parametric', 'ellipse-parametric', 'implicit', 'inverse', 'higher'];
export const differentiationLabels: Record<DifferentiationPattern, string> = {
  chain: '合成関数の微分', product: '積の微分', logarithmic: '対数微分', parametric: '媒介変数表示', 'ellipse-parametric': '楕円の媒介変数微分',
  implicit: '陰関数の微分', inverse: '逆関数の微分', higher: '高次導関数',
};

export function isDifferentiationAnswerCorrect(input: string, expected: number): boolean {
  return isNumericAnswerCorrect(input, expected, 3);
}

const picker = new BalancedRandom(differentiationPatterns);
const variants = {
  chain: new BalancedRandom(Array.from({ length: 9 }, (_, index) => ({ a: Math.floor(index / 3) + 1, n: (index % 3) + 2 }))),
  product: new BalancedRandom([2, 3, 4, 5]),
  logarithmic: new BalancedRandom([1, 2, 3, 4, 5]),
  parametric: new BalancedRandom([1, 2, 4, 5]),
  'ellipse-parametric': new BalancedRandom([{ label: '\\pi/6', value: Math.PI / 6 }, { label: '\\pi/4', value: Math.PI / 4 }, { label: '\\pi/3', value: Math.PI / 3 }, { label: '2\\pi/3', value: 2 * Math.PI / 3 }]),
  implicit: new BalancedRandom([1, 2, 3, 4, 5]),
  inverse: new BalancedRandom([1, 2, 3, 4, 5]),
  higher: new BalancedRandom([1, 2, 3, 4, 5]),
};

export function generateDifferentiationProblem(mode: DifferentiationMode, random = Math.random): DifferentiationProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const chain = pattern === 'chain' ? variants.chain.next(random) : { a: 1, n: 2 };
  const productPower = pattern === 'product' ? variants.product.next(random) : 2;
  const logPower = pattern === 'logarithmic' ? variants.logarithmic.next(random) : 1;
  const parametricC = pattern === 'parametric' ? variants.parametric.next(random) : 1;
  const ellipseAngle = pattern === 'ellipse-parametric' ? variants['ellipse-parametric'].next(random) : { label: '\\pi/4', value: Math.PI / 4 };
  const implicitA = pattern === 'implicit' ? variants.implicit.next(random) : 1;
  const implicitProductTerm = implicitA === 1 ? 'xy' : `${implicitA}xy`;
  const implicitYTerm = implicitA === 1 ? 'y' : `${implicitA}y`;
  const implicitXTerm = implicitA === 1 ? 'x' : `${implicitA}x`;
  const inverseA = pattern === 'inverse' ? variants.inverse.next(random) : 1;
  const higherA = pattern === 'higher' ? variants.higher.next(random) : 1;
  const chainInner = chain.a === 1 ? 'x²+1' : `${chain.a}x²+1`;
  const chainPower = chain.n - 1;
  const chainPowerSuffix = chainPower === 1 ? '' : `^${chainPower}`;
  const all: Record<DifferentiationPattern, DifferentiationProblem> = {
    chain: { pattern, expression: `\\left.\\frac{dy}{dx}\\right|_{x=1},\\quad y=(${chain.a === 1 ? '' : chain.a}x^2+1)^{${chain.n}}`, answer: 2 * chain.a * chain.n * (chain.a + 1) ** (chain.n - 1), explanation: `連鎖律より y′=${2 * chain.a * chain.n}x(${chainInner})${chainPowerSuffix}。x=1で ${2 * chain.a * chain.n * (chain.a + 1) ** (chain.n - 1)}。` },
    product: {
      pattern,
      expression: `\\left.\\frac{dy}{dx}\\right|_{x=\\pi/2},\\quad y=x^{${productPower}}\\sin x`,
      answer: productPower * (Math.PI / 2) ** (productPower - 1),
      explanation: `積の微分で y′=${productPower}x^${productPower - 1} sin x+x^${productPower} cos x。x=π/2では sin(π/2)=1、cos(π/2)=0。よって y′=${productPower}(π/2)^${productPower - 1}=${(productPower * (Math.PI / 2) ** (productPower - 1)).toFixed(3)}。`,
    },
    logarithmic: { pattern, expression: `\\left.\\frac{dy}{dx}\\right|_{x=1},\\quad y=x^{${logPower}x}\\ (x>0)`, answer: logPower, explanation: `対数微分で y′=x^(${logPower}x)·${logPower}(ln x+1)。x=1で ${logPower}。` },
    parametric: { pattern, expression: `\\left.\\frac{dy}{dx}\\right|_{t=1},\\quad x=t^2+1,\\ y=t^3-${parametricC}t`, answer: (3 - parametricC) / 2, explanation: `dy/dx=(3t²−${parametricC})/(2t)。t=1で ${((3 - parametricC) / 2).toFixed(3)}。` },
    'ellipse-parametric': { pattern, expression: `\\left.\\frac{dy}{dx}\\right|_{t=${ellipseAngle.label}},\\quad x=2\\cos t,\\ y=\\sin t`, answer: -Math.cos(ellipseAngle.value) / (2 * Math.sin(ellipseAngle.value)), explanation: `dx/dt=−2sin t、dy/dt=cos t。したがって dy/dx=(dy/dt)/(dx/dt)=−cos t/(2sin t)。t=${ellipseAngle.label} で ${(-Math.cos(ellipseAngle.value) / (2 * Math.sin(ellipseAngle.value))).toFixed(3)}。ビジュアルと同じ楕円です。` },
    implicit: { pattern, expression: `\\left.\\frac{dy}{dx}\\right|_{(x,y)=(1,2)},\\quad x^2+${implicitProductTerm}+y^2=${5 + 2 * implicitA}`, answer: -(2 + 2 * implicitA) / (implicitA + 4), explanation: `陰関数微分で y′=−(2x+${implicitYTerm})/(${implicitXTerm}+2y)。点(1,2)で ${(-(2 + 2 * implicitA) / (implicitA + 4)).toFixed(3)}。` },
    inverse: { pattern, expression: `g=f^{-1},\\quad f(x)=x^3+${inverseA}x,\\quad g^{\\prime}(${inverseA + 1})`, answer: 1 / (inverseA + 3), explanation: `f(1)=${inverseA + 1}、f′(1)=${inverseA + 3}。逆関数の微分公式より g′(${inverseA + 1})=1/${inverseA + 3}。` },
    higher: { pattern, expression: `\\left.y^{\\prime\\prime}\\right|_{x=0},\\quad y=e^{${higherA}x}`, answer: higherA ** 2, explanation: `y′′=${higherA ** 2}e^(${higherA}x)。x=0で ${higherA ** 2}。` },
  };
  return all[pattern];
}
