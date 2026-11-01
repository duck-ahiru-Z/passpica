import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/industrial-process/page.tsx'), 'utf8');

function atomCounts(formula) {
  const tokens = formula.match(/[A-Z][a-z]?|\d+|[()]/g) ?? [];
  if (tokens.join('') !== formula) throw new Error(`unsupported chemical formula: ${formula}`);
  const stack = [{}];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '(') {
      stack.push({});
    } else if (token === ')') {
      const group = stack.pop();
      if (!group || stack.length === 0) throw new Error(`unmatched chemical formula parenthesis: ${formula}`);
      const multiplier = /^\d+$/.test(tokens[index + 1] ?? '') ? Number(tokens[++index]) : 1;
      for (const [element, amount] of Object.entries(group)) {
        stack.at(-1)[element] = (stack.at(-1)[element] ?? 0) + multiplier * amount;
      }
    } else if (/^[A-Z]/.test(token)) {
      const amount = /^\d+$/.test(tokens[index + 1] ?? '') ? Number(tokens[++index]) : 1;
      stack.at(-1)[token] = (stack.at(-1)[token] ?? 0) + amount;
    } else {
      throw new Error(`unexpected number in chemical formula: ${formula}`);
    }
  }
  if (stack.length !== 1) throw new Error(`unclosed chemical formula parenthesis: ${formula}`);
  return stack[0];
}

function assertBalancedEquation(equation, context) {
  const sides = equation.split(/➔|⇄/);
  if (sides.length !== 2) throw new Error(`${context} must contain exactly one reaction arrow: ${equation}`);
  const countSide = side => side.split('+').reduce((total, rawTerm) => {
    const term = rawTerm.trim().replace(/↓$/, '');
    const match = term.match(/^(\d*)\s*([A-Z][A-Za-z0-9()]*)$/);
    if (!match) throw new Error(`${context} contains an unsupported reaction term: ${rawTerm}`);
    const coefficient = match[1] ? Number(match[1]) : 1;
    for (const [element, amount] of Object.entries(atomCounts(match[2]))) {
      total[element] = (total[element] ?? 0) + coefficient * amount;
    }
    return total;
  }, {});
  const reactants = countSide(sides[0]);
  const products = countSide(sides[1]);
  const elements = new Set([...Object.keys(reactants), ...Object.keys(products)]);
  for (const element of elements) {
    if (reactants[element] !== products[element]) {
      throw new Error(`${context} is not atom-balanced (${element}: ${reactants[element] ?? 0} vs ${products[element] ?? 0}): ${equation}`);
    }
  }
}

const processBlocks = [...page.matchAll(/^  (contact|ostwald|solvay): \{([\s\S]*?)^  \},?$/gm)];
if (processBlocks.length !== 3) throw new Error(`expected three process definitions, found ${processBlocks.length}`);
for (const [, id, block] of processBlocks) {
  const overall = block.match(/overallReaction: '([^']+)'/)?.[1];
  if (!overall) throw new Error(`${id} is missing its overall reaction`);
  assertBalancedEquation(overall, `${id} overall reaction`);
  const stageSection = block.match(/stages: \[([\s\S]*?)\n    \],/);
  if (!stageSection) throw new Error(`${id} is missing its stage reactions`);
  const stageReactions = [...stageSection[1].matchAll(/reaction: '([^']+)'/g)].map(([, value]) => value);
  if (stageReactions.length === 0) throw new Error(`${id} has no stage reactions`);
  for (const reactionList of stageReactions) {
    for (const equation of reactionList.split(';')) assertBalancedEquation(equation.trim(), `${id} stage reaction`);
  }
}

for (const [needle, label] of [
  ['overflow-x-auto', 'a horizontally scrollable diagram viewport'],
  ['min-w-[510px]', 'a readable minimum diagram size on narrow screens'],
  ['図は左右にスクロールできます。', 'mobile scroll guidance'],
  ['aria-pressed={selectedProcess === p.id}', 'an accessible active-process state'],
  ['${proc.stages.map(stage => `${stage.name}、${stage.reaction}`).join(\'。\')}', 'an accessible summary of all selected process stages'],
  ['href="/learn/chemistry/industrial-process-drill"', 'a direct link to process-sequence practice'],
  ['工業的製法の問題で練習する →', 'a clear label for the related practice'],
]) {
  if (!page.includes(needle)) throw new Error(`industrial process visual is missing ${label}`);
}
for (const id of ['contact', 'ostwald', 'solvay']) {
  if (!page.includes(`${id}: {`)) throw new Error(`industrial process visual is missing ${id}`);
}
if (!page.includes("'4NH3 + 5O2 ➔ 4NO + 6H2O'")) {
  throw new Error('Ostwald flow diagram must include the water product in the balanced ammonia oxidation equation.');
}

console.log('Industrial process visual verified: all three selectable processes, accessible flow summaries, and mobile-readable horizontal scrolling are present.');
