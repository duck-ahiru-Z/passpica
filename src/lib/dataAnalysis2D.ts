export function getCorrelationDirectionLabel(correlation: number): string {
  if (correlation >= 0.4) return '右上がり（正の相関）';
  if (correlation <= -0.4) return '右下がり（負の相関）';
  return 'バラバラ（無相関）';
}
