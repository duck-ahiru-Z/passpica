export type PcmSettings = {
  sampleRate: number;
  bitDepth: number;
  channels: number;
  seconds: number;
};

export function getPcmDataSize({ sampleRate, bitDepth, channels, seconds }: PcmSettings): number {
  return (sampleRate * bitDepth * channels * seconds) / 8;
}

export function getPcmDiagramMarkerCount(sampleRate: number): number {
  return Math.max(2, Math.round(sampleRate / 2_940));
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} kB`;
  return `${bytes} byte`;
}
