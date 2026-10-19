import fs from 'node:fs';

const source = fs.readFileSync('src/app/learn/chemistry/organic-3d/page.tsx', 'utf8');
const boat = source.match(/cyclohexane_boat:\s*\{([\s\S]*?)\r?\n\s*\},\r?\n\s*cis_butene:/)?.[1];

if (!boat) throw new Error('Cyclohexane boat model is missing.');
if (!boat.includes("name: 'シクロヘキサン (舟型配座)'")) throw new Error('The model must be identified as the boat conformer.');
if (!boat.includes("element: 'H_flagpole'")) throw new Error('The boat model must preserve its flagpole hydrogens.');
if (!boat.includes('約 29 kJ/mol 高いエネルギー')) throw new Error('The boat conformer must use its approximately 29 kJ/mol energy difference.');
if (!boat.includes('ねじれ舟型は舟型より安定で、椅子型より約 23 kJ/mol')) throw new Error('The approximately 23 kJ/mol value must be distinguished as the twist-boat conformer.');
if (!source.includes('舟型が椅子型より不安定（約29kJ/mol）')) throw new Error('The flagpole explanation must use the boat conformer energy.');
if (source.includes('舟型が椅子型より不安定（約23kJ/mol）')) throw new Error('The old twist-boat energy must not be attributed to the boat conformer.');

console.log('Cyclohexane conformer content verified: boat energy is distinguished from twist-boat energy and flagpole geometry remains present.');
