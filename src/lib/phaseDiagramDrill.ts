import { BalancedRandom } from './balancedRandom.ts';

export type PhasePattern = 'water-melting' | 'co2-melting' | 'water-one-atm' | 'co2-one-atm' | 'triple-point' | 'co2-triple-pressure' | 'critical-point' | 'supercritical';
export type PhaseMode = PhasePattern | 'mix';
export type PhaseProblem = { pattern: PhasePattern; label: string; question: string; answer: string; explanation: string };
export const phasePatterns: readonly PhasePattern[] = ['water-melting', 'co2-melting', 'water-one-atm', 'co2-one-atm', 'triple-point', 'co2-triple-pressure', 'critical-point', 'supercritical'];
const data: Record<PhasePattern, PhaseProblem> = {
  'water-melting': { pattern: 'water-melting', label: '水の融解曲線', question: '水の状態図で融解曲線の傾きはどちら向きか。', answer: '負の傾き（右下がり）', explanation: '氷は液体の水より密度が小さいため、圧力を上げると融点はわずかに下がります。図は温度が横軸、圧力が縦軸なので右下がりです。' },
  'co2-melting': { pattern: 'co2-melting', label: 'CO₂の融解曲線', question: '二酸化炭素の状態図で融解曲線の傾きはどちら向きか。', answer: '正の傾き（右上がり）', explanation: '三重点付近で固体CO₂のモル体積は液体より小さく、圧力を上げると融点が上がるため、温度横軸・圧力縦軸では右上がりです。' },
  'water-one-atm': { pattern: 'water-one-atm', label: '水の1気圧での加熱経路', question: '氷を1気圧で加熱すると、固体から気体へどのように変化するか。', answer: 'まず融解して液体になり、その後に蒸発する', explanation: '水の三重点圧力は約0.006気圧で、1気圧はその上です。加熱経路は融解曲線、次に蒸気圧曲線を横切ります。' },
  'co2-one-atm': { pattern: 'co2-one-atm', label: 'CO₂の1気圧での挙動', question: 'ドライアイスを1気圧で温めると、通常どのように気体になるか。', answer: '液体を経ず、固体から直接気体へ昇華する', explanation: 'CO₂の三重点圧力は約5.1気圧で、1気圧より高いため、1気圧では液体の領域を通りません。' },
  'triple-point': { pattern: 'triple-point', label: '三重点の意味', question: '状態図の三重点では、何が同時に平衡で共存するか。', answer: '固体・液体・気体の三相', explanation: '三重点は昇華曲線・融解曲線・蒸気圧曲線の交点で、固体・液体・気体が共存します。' },
  'co2-triple-pressure': { pattern: 'co2-triple-pressure', label: 'CO₂の三重点圧力と1気圧の比較', question: 'CO₂の三重点圧力（約5.1気圧）は、1気圧と比べてどうか。', answer: '1気圧より高い', explanation: 'CO₂の三重点は約5.18×10⁵ Pa（約5.1気圧）。1気圧は三重点より低圧側にあるので、常圧では液体になれません。' },
  'critical-point': { pattern: 'critical-point', label: '臨界点', question: '臨界点を超えた領域で、液体と気体の境界はどうなるか。', answer: '液体と気体の境界がなくなる', explanation: '臨界点より高温・高圧では気液の境界が消え、両方の性質をもつ超臨界流体になります。' },
  supercritical: { pattern: 'supercritical', label: '超臨界流体', question: '臨界温度と臨界圧力の両方を超えた物質の状態は何か。', answer: '超臨界流体', explanation: '臨界点を超えると液体・気体の区別がなくなり、超臨界流体として扱います。' },
};
export const phasePatternLabels = Object.fromEntries(phasePatterns.map(pattern => [pattern, data[pattern].label])) as Record<PhasePattern, string>;
const picker = new BalancedRandom(phasePatterns);
export function generatePhaseProblem(mode: PhaseMode, random = Math.random): PhaseProblem {
  return data[mode === 'mix' ? picker.next(random) : mode];
}
