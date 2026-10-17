import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/industrial-process/page.tsx'), 'utf8');
for (const [needle, label] of [
  ['overflow-x-auto', 'a horizontally scrollable diagram viewport'],
  ['min-w-[510px]', 'a readable minimum diagram size on narrow screens'],
  ['図は左右にスクロールできます。', 'mobile scroll guidance'],
  ['aria-pressed={selectedProcess === p.id}', 'an accessible active-process state'],
  ['${proc.stages.map(stage => `${stage.name}、${stage.reaction}`).join(\'。\')}', 'an accessible summary of all selected process stages'],
]) {
  if (!page.includes(needle)) throw new Error(`industrial process visual is missing ${label}`);
}
for (const id of ['contact', 'ostwald', 'solvay']) {
  if (!page.includes(`${id}: {`)) throw new Error(`industrial process visual is missing ${id}`);
}

console.log('Industrial process visual verified: all three selectable processes, accessible flow summaries, and mobile-readable horizontal scrolling are present.');
