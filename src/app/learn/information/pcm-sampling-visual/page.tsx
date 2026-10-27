'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatBytes, getPcmDataSize } from '@/src/lib/informationPcm';

const sampleRates = [22050, 32000, 44100, 48000, 96000];
const bitDepths = [8, 16, 24];

export default function PcmSamplingVisualPage() {
  const [sampleRate, setSampleRate] = useState(44100);
  const [bitDepth, setBitDepth] = useState(16);
  const [channels, setChannels] = useState(2);
  const [seconds, setSeconds] = useState(1);
  const bytes = getPcmDataSize({ sampleRate, bitDepth, channels, seconds });
  const formatCoordinate = (value: number) => (Math.round(value * 1000) / 1000).toString();
  const waveform = Array.from({ length: 15 }, (_, index) => {
    const x = formatCoordinate(34 + (index / 14) * 572);
    const y = formatCoordinate(105 - Math.sin((index / 14) * Math.PI * 4) * 57);
    return `${x},${y}`;
  }).join(' ');
  const continuousWave = Array.from({ length: 121 }, (_, index) => {
    const x = formatCoordinate(30 + (index / 120) * 580);
    const y = formatCoordinate(105 - Math.sin((index / 120) * Math.PI * 4) * 57);
    return `${x},${y}`;
  }).join(' ');

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/learn" className="text-sm font-semibold text-blue-700 underline">← 学習室ポータルへ</Link>
        <header className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-700">情報I・音声のデジタル化</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">標本化とPCMデータ量を動かして理解</h1>
          <p className="mt-3 leading-7 text-slate-600">音を一定間隔で標本化し、各標本をビットで記録します。条件を変えて、1秒あたりのデータ量がどう変わるか試せます。</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="wave-heading">
          <h2 id="wave-heading" className="font-black">音の波を一定間隔で記録する（概念図）</h2>
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="wave-title wave-desc" className="mt-3 w-full">
            <title id="wave-title">連続した音の波と標本点</title>
            <desc id="wave-desc">青い曲線が連続した音の波、丸い点が一定間隔で取り出した標本です。点の数は仕組みを示す概念図で、選択した標本化周波数の全標本数ではありません。</desc>
            <line x1="30" y1="105" x2="610" y2="105" stroke="#94a3b8" strokeWidth="1" />
            <polyline points={continuousWave} fill="none" stroke="#2563eb" strokeWidth="3" />
            <polyline points={waveform} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5 5" />
            {waveform.split(' ').map((point, index) => {
              const [cx, cy] = point.split(',');
              return <circle key={index} cx={cx} cy={cy} r="5" fill="#f97316" stroke="white" strokeWidth="2" />;
            })}
          </svg>
          <div className="flex flex-wrap gap-4 text-sm"><span><span className="mr-2 inline-block h-1 w-5 align-middle bg-blue-600" />連続した音の波</span><span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500 align-middle" />一定間隔の標本</span></div>
          <p className="mt-3 text-xs leading-5 text-slate-500">図の点は標本化の考え方だけを示しています。実際の音声では、たとえば44.1 kHzなら1秒間に44,100個の標本を記録します。</p>
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2" aria-label="PCMの記録条件">
          <label className="space-y-2 font-bold">標本化周波数
            <select aria-label="標本化周波数" value={sampleRate} onChange={event => setSampleRate(Number(event.target.value))} className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3">
              {sampleRates.map(rate => <option key={rate} value={rate}>{(rate / 1000).toString()} kHz（{rate.toLocaleString()} 標本/秒）</option>)}
            </select>
          </label>
          <label className="space-y-2 font-bold">量子化ビット数
            <select aria-label="量子化ビット数" value={bitDepth} onChange={event => setBitDepth(Number(event.target.value))} className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3">
              {bitDepths.map(depth => <option key={depth} value={depth}>{depth} bit/標本</option>)}
            </select>
          </label>
          <fieldset className="space-y-2">
            <legend className="font-bold">チャンネル数</legend>
            <div className="flex flex-wrap gap-3">{[{ value: 1, label: 'モノラル（1 ch）' }, { value: 2, label: 'ステレオ（2 ch）' }].map(option => <label key={option.value} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3"><input type="radio" name="pcm-channels" checked={channels === option.value} onChange={() => setChannels(option.value)} />{option.label}</label>)}</div>
          </fieldset>
          <label className="space-y-2 font-bold">記録時間
            <select aria-label="記録時間" value={seconds} onChange={event => setSeconds(Number(event.target.value))} className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3">
              {[1, 5, 10, 30, 60].map(duration => <option key={duration} value={duration}>{duration} 秒</option>)}
            </select>
          </label>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-7" aria-live="polite">
          <h2 className="text-lg font-black">データ量を計算</h2>
          <p className="mt-2 break-words font-mono text-sm leading-7 sm:text-base">標本化周波数 × 量子化ビット数 × チャンネル数 × 秒数 ÷ 8</p>
          <p className="mt-1 text-sm text-slate-700">{sampleRate.toLocaleString()} × {bitDepth} × {channels} × {seconds} ÷ 8 = {bytes.toLocaleString()} byte</p>
          <p className="mt-2 text-3xl font-black text-amber-950">約 {formatBytes(bytes)}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">非圧縮PCMの理論値です。ヘッダーなどの付加情報は含みません。標本化周波数は1秒間の標本数、量子化ビット数は1標本あたりの記録ビット数です。</p>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div><h2 className="font-black text-emerald-950">理解できたら、計算問題で確認</h2><p className="mt-1 text-sm leading-6 text-emerald-900">標本化のデータ量を、個別または全パターンランダムで練習できます。</p></div>
          <Link href="/learn/information/calculation-drill" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 focus-visible:outline-4 focus-visible:outline-emerald-400 sm:mt-0">計算ドリルへ →</Link>
        </section>
      </div>
    </main>
  );
}
