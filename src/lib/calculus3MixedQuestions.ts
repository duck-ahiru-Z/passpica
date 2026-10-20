import { BalancedRandom } from './balancedRandom.ts';
import { generateLimitProblem, limitLabels } from './calculus3Limits.ts';
import { generateDifferentiationProblem, differentiationLabels } from './calculus3Differentiation.ts';
import { generateIntegralProblem, integralLabels } from './calculus3Integrals.ts';
import { generateGeometryProblem, geometryLabels } from './calculus3Geometry.ts';
import { generateDifferentialEquationProblem, differentialEquationLabels } from './calculus3DifferentialEquations.ts';
import { generateCurveProblem, curveLabels } from './calculus3CurveAnalysis.ts';

export type Calculus3Area = 'limit' | 'differentiation' | 'curve-analysis' | 'integral' | 'geometry' | 'differential-equation';
export type Calculus3Question = {
  area: Calculus3Area;
  areaLabel: string;
  pattern: string;
  prompt: string;
  expression: string;
  expressionFormat: 'math' | 'text';
  options: string[];
  answer: string;
  acceptedAnswers?: string[];
  alternativeExplanations?: Record<string, string>;
  explanation: string;
};
export type Calculus3MixedMode = 'all' | Calculus3Area;

const areas: readonly Calculus3Area[] = ['limit', 'differentiation', 'curve-analysis', 'integral', 'geometry', 'differential-equation'];
const areaLabels: Record<Calculus3Area, string> = {
  limit: '極限', differentiation: '微分法', 'curve-analysis': '曲線分析', integral: '積分法', geometry: '面積・体積', 'differential-equation': '微分方程式',
};
const areaOptions: Record<Calculus3Area, readonly string[]> = {
  limit: [...new Set(Object.values(limitLabels))],
  differentiation: [...new Set(Object.values(differentiationLabels))],
  'curve-analysis': [...new Set(Object.values(curveLabels))],
  integral: [...new Set(Object.values(integralLabels))],
  geometry: [...new Set(Object.values(geometryLabels))],
  'differential-equation': [...new Set(Object.values(differentialEquationLabels))],
};

function createQuestion(area: Calculus3Area, random: () => number): Calculus3Question {
  switch (area) {
    case 'limit': {
      const problem = generateLimitProblem('mix', random);
      const isContinuity = problem.pattern === 'continuity';
      const isTrigonometric = problem.pattern === 'trigonometric';
      const expression = isContinuity
        ? problem.expression.replace(/,\\quad x=\d+\\text\{ で連続となる \}k$/, '')
        : isTrigonometric
          ? problem.expression.replace(/,\\quad \\text\{（x はラジアン）\}$/, '')
          : problem.expression;
      return {
        area, areaLabel: areaLabels[area], pattern: `${area}:${problem.pattern}`,
        prompt: isContinuity
          ? '次の関数が指定点で連続となる定数 k を求める条件は？'
          : isTrigonometric
            ? 'x はラジアンとして、次の極限を求めるとき最初に使う方針は？'
            : '次の極限を求めるとき、最初に使う方針は？',
        expression, expressionFormat: 'math', options: [...areaOptions[area]], answer: limitLabels[problem.pattern], explanation: problem.explanation,
      };
    }
    case 'differentiation': {
      const problem = generateDifferentiationProblem('mix', random);
      const isInverse = problem.pattern === 'inverse';
      const expression = isInverse
        ? problem.expression.replace(' の逆関数を g とする。', ',\\quad g=f^{-1},\\quad ').replace('g′', "g'")
        : problem.expression;
      return {
        area, areaLabel: areaLabels[area], pattern: `${area}:${problem.pattern}`,
        prompt: isInverse ? '逆関数 g の導関数を求めるとき、使う公式は？' : 'この式の導関数・指定値を求めるとき、最初に使う方法は？', expression,
        expressionFormat: 'math', options: [...areaOptions[area]], answer: differentiationLabels[problem.pattern], explanation: problem.explanation,
      };
    }
    case 'integral': {
      const problem = generateIntegralProblem('mix', random);
      return {
        area, areaLabel: areaLabels[area], pattern: `${area}:${problem.pattern}`,
        prompt: '次の積分を計算するとき、最初に使う方法は？', expression: problem.expression,
        expressionFormat: 'math', options: [...areaOptions[area]], answer: integralLabels[problem.pattern], explanation: `${problem.hint}。${problem.explanation}`,
      };
    }
    case 'curve-analysis': {
      const problem = generateCurveProblem('mix', random);
      return {
        area, areaLabel: areaLabels[area], pattern: `${area}:${problem.pattern}`,
        prompt: problem.prompt, expression: problem.expression,
        expressionFormat: 'math', options: [...areaOptions[area]], answer: curveLabels[problem.pattern], explanation: problem.explanation,
      };
    }
    case 'geometry': {
      const problem = generateGeometryProblem('mix', random);
      const prompt = problem.pattern === 'x-axis-rotation'
        ? `${problem.prompt} xで積分して立式するとき、最初に使う方法は？`
        : problem.pattern === 'y-axis-rotation'
          ? `${problem.prompt} yで積分して立式するとき、最初に使う方法は？`
          : problem.pattern === 'shell-method'
            ? `${problem.prompt} xで積分して体積を立式するとき、最初に使う方法は？`
            : problem.prompt;
      return {
        area, areaLabel: areaLabels[area], pattern: `${area}:${problem.pattern}`,
        prompt, expression: problem.expression,
        expressionFormat: 'math', options: [...areaOptions[area]], answer: geometryLabels[problem.pattern],
        acceptedAnswers: [geometryLabels[problem.pattern], ...Object.keys(problem.alternativeExplanations ?? {}).map(pattern => geometryLabels[pattern as keyof typeof geometryLabels])],
        alternativeExplanations: Object.fromEntries(Object.entries(problem.alternativeExplanations ?? {}).map(([pattern, explanation]) => [geometryLabels[pattern as keyof typeof geometryLabels], explanation])),
        explanation: problem.explanation,
      };
    }
    case 'differential-equation': {
      const problem = generateDifferentialEquationProblem('mix', random);
      return {
        area, areaLabel: areaLabels[area], pattern: `${area}:${problem.pattern}`,
        prompt: 'この条件から解・値を求めるとき、最初に使う方法は？', expression: problem.expression,
        expressionFormat: 'text', options: [...areaOptions[area]], answer: differentialEquationLabels[problem.pattern], explanation: problem.explanation,
      };
    }
  }
}

export function createCalculus3MixedQuestionPicker() {
  const areaPicker = new BalancedRandom(areas);
  const positionPickers = new Map(areas.map(area => [area, new BalancedRandom(Array.from({ length: areaOptions[area].length }, (_, index) => index))]));

  return {
    next(mode: Calculus3MixedMode = 'all', random = Math.random): Calculus3Question {
      const area = mode === 'all' ? areaPicker.next(random) : mode;
      const question = createQuestion(area, random);
      const correctPosition = positionPickers.get(area)!.next(random);
      const distractors = question.options.filter(option => option !== question.answer);
      for (let index = distractors.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [distractors[index], distractors[swapIndex]] = [distractors[swapIndex], distractors[index]];
      }
      const options = [...distractors];
      options.splice(correctPosition, 0, question.answer);
      return { ...question, options };
    },
  };
}
