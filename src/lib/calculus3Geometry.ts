import { BalancedRandom } from './balancedRandom.ts';

export type GeometryPattern = 'between-curves' | 'x-axis-rotation' | 'y-axis-rotation' | 'shell-method' | 'curve-length';
export type GeometryMode = GeometryPattern | 'mix';
export type GeometryProblem = { pattern: GeometryPattern; prompt: string; expression: string; answer: number; explanation: string };

export const geometryPatterns: readonly GeometryPattern[] = ['between-curves', 'x-axis-rotation', 'y-axis-rotation', 'shell-method', 'curve-length'];
export const geometryLabels: Record<GeometryPattern, string> = { 'between-curves': '2曲線間の面積', 'x-axis-rotation': 'x軸回転体の体積（円板法）', 'y-axis-rotation': 'y軸回転体の体積（円環法）', 'shell-method': 'y軸回転体の体積（円筒殻法）', 'curve-length': '曲線の長さ' };

const picker = new BalancedRandom(geometryPatterns);
const variants = {
  'between-curves': new BalancedRandom([1, 2, 3, 4, 5]),
  'x-axis-rotation': new BalancedRandom([1, 2, 3, 4, 5]),
  'y-axis-rotation': new BalancedRandom([1, 2, 3, 4, 5]),
  'shell-method': new BalancedRandom([1, 2, 3, 4, 5]),
  'curve-length': new BalancedRandom([1, 2, 3, 4, 5]),
};

export function generateGeometryProblem(mode: GeometryMode, random = Math.random): GeometryProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const value = variants[pattern].next(random);
  const problems: Record<GeometryPattern, GeometryProblem> = {
    'between-curves': {
      pattern,
      prompt: '2曲線に囲まれた部分の面積を求める。',
      expression: `y=${value}x,\\quad y=x^2\\quad(0\\le x\\le${value})`,
      answer: value ** 3 / 6,
      explanation: `区間内では ${value}x が上、x² が下。∫₀^${value}(${value}x−x²)dx=${value ** 3}/6。`,
    },
    'x-axis-rotation': {
      pattern,
      prompt: '曲線とx軸、x=0、x=1で囲まれた領域をx軸の周りに回転させた立体の体積を求める。',
      expression: `y=x^{${value}}\\quad(0\\le x\\le1)`,
      answer: Math.PI / (2 * value + 1),
      explanation: `円板法で V=π∫₀¹(x^${value})²dx=π/${2 * value + 1}。`,
    },
    'y-axis-rotation': {
      pattern,
      prompt: `曲線とx軸、x=0およびx=${value}で囲まれた領域をy軸の周りに回転させた立体の体積を求める。`,
      expression: `y=\\sqrt{x}\\quad(0\\le x\\le${value})`,
      answer: (4 * Math.PI * value ** 2.5) / 5,
      explanation: `高さ y の断面は内半径 y²、外半径 ${value} の円環。V=π∫₀^√${value}(${value}²−y⁴)dy=4π×${value}^(5/2)/5。`,
    },
    'shell-method': {
      pattern,
      prompt: `領域 y=x, x軸, x=0, x=${value} に囲まれた部分を y軸の周りに回転させた体積を求める。`,
      expression: `y=x\\quad(0\\le x\\le${value})`,
      answer: (2 * Math.PI * value ** 3) / 3,
      explanation: `高さ x、半径 x の円筒殻で考える。V=2π∫₀^${value} x·x dx=2π×${value}³/3。`,
    },
    'curve-length': {
      pattern,
      prompt: 'この区間における曲線の長さを求める。',
      expression: `y=\\frac{2}{3}x^{3/2}\\quad(0\\le x\\le${value})`,
      answer: (2 / 3) * ((value + 1) ** 1.5 - 1),
      explanation: `y′=√x なので L=∫₀^${value}√(1+x)dx=(2/3)((${value + 1})^(3/2)−1)。`,
    },
  };
  return problems[pattern];
}
