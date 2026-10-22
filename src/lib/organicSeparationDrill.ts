import { BalancedRandom } from './balancedRandom.ts';

export type OrganicSeparationPattern = 'aniline' | 'benzoicAcid' | 'phenol';
export type OrganicSeparationMode = OrganicSeparationPattern | 'mix';
export type OrganicSeparationProblem = { pattern: OrganicSeparationPattern; prompt: string; answer: string; explanation: string };
export const organicSeparationPatterns: readonly OrganicSeparationPattern[] = ['aniline', 'benzoicAcid', 'phenol'];
export const organicSeparationLabels: Record<OrganicSeparationPattern, string> = {
  aniline: 'HClによるアニリンの抽出', benzoicAcid: 'NaHCO₃による安息香酸の抽出', phenol: 'NaOHによるフェノールの抽出',
};
const problemData: Record<OrganicSeparationPattern, OrganicSeparationProblem> = {
  aniline: {
    pattern: 'aniline', prompt: 'アニリン・安息香酸・フェノール・ニトロベンゼンの混合エーテル溶液に希塩酸を加えて振り混ぜる。水層へ移る物質はどれか。',
    answer: 'アニリン', explanation: '塩基性のアニリンはHClと反応してイオン性のアニリン塩酸塩になり、水層へ移ります。エーテルは上層、水層は下層です。',
  },
  benzoicAcid: {
    pattern: 'benzoicAcid', prompt: 'アニリンを除いた混合物にNaHCO₃水溶液を加える。炭酸より強い酸として反応し、水層へ移る物質はどれか。',
    answer: '安息香酸', explanation: '安息香酸は炭酸より強い酸なのでNaHCO₃と反応し、水溶性の安息香酸ナトリウムになります。フェノールは炭酸より弱酸のため、この段階ではエーテル層に残ります。',
  },
  phenol: {
    pattern: 'phenol', prompt: 'アニリンと安息香酸を除いたエーテル層にNaOH水溶液を加える。水層へ移る物質はどれか。',
    answer: 'フェノール', explanation: 'フェノールはNaOHと反応して水溶性のナトリウムフェノキシドになり、水層へ移ります。中性のニトロベンゼンはエーテル層に残ります。',
  },
};
const picker = new BalancedRandom(organicSeparationPatterns);
const promptVariants: Record<OrganicSeparationPattern, BalancedRandom<string>> = {
  aniline: new BalancedRandom([
    problemData.aniline.prompt,
    '4物質の混合エーテル溶液を希塩酸で抽出する。塩酸と反応して水に溶ける塩をつくる物質はどれか。',
    '安息香酸・フェノール・ニトロベンゼンとアニリンを含むエーテル層にHCl水溶液を加えた。下層の水層へ移る成分はどれか。',
  ]),
  benzoicAcid: new BalancedRandom([
    problemData.benzoicAcid.prompt,
    'アニリンを除いたエーテル層にNaHCO₃水溶液を加える。炭酸より強い酸として塩をつくり、水層へ移る物質はどれか。',
    'フェノールと安息香酸が残るエーテル層を炭酸水素ナトリウム水溶液で抽出する。水溶性の塩になるのはどちらか。',
  ]),
  phenol: new BalancedRandom([
    problemData.phenol.prompt,
    'アニリンと安息香酸を取り除いた後、残ったフェノール・ニトロベンゼンのエーテル溶液をNaOH水溶液で抽出する。水層へ移るのはどれか。',
    '炭酸水素ナトリウムではエーテル層に残ったフェノールを、NaOH水溶液で抽出した。水溶性の塩になる物質はどれか。',
  ]),
};
export function generateOrganicSeparationProblem(mode: OrganicSeparationMode, random = Math.random): OrganicSeparationProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  return { ...problemData[pattern], prompt: promptVariants[pattern].next(random) };
}
