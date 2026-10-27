'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  type ByteMode,
} from '@/src/lib/informationNumberRepresentation';

const presets = [
  { label: '127（最大の正数）', value: 127 },
  { label: '128（最小の負数）', value: 128 },
  { label: '255（−1）', value: 255 },
];

export default function NumberRepresentationVisualPage() {
  const [value, setValue] = useState(13);
  const [mode, setMode] = useState<ByteMode>('unsigned');
  const [bitWidth, setBitWidth] = useState(8);
  const unsignedMaximum = 2 ** bitWidth - 1;
  const signedMinimum = -(2 ** (bitWidth - 1));
  const signedMaximum = 2 ** (bitWidth - 1) - 1;
  const bits = value.toString(2).padStart(bitWidth, '0');
  const weights = Array.from({ length: bitWidth }, (_, index) => mode === 'twos-complement' && index === 0 ? signedMinimum : 2 ** (bitWidth - index - 1));
  const contributions = [...bits].map((bit, index) => bit === '1' ? weights[index] : 0);
  const result = mode === 'twos-complement' && value >= 2 ** (bitWidth - 1) ? value - 2 ** bitWidth : value;

  function toggleBit(index: number) {
    const bitValue = 2 ** (bitWidth - index - 1);
    setValue((current) => current ^ bitValue);
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/learn" className="text-sm font-semibold text-blue-700 underline">← 学習室ポータルへ</Link>
        <header className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-700">情報I・デジタル表現</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">2進数と2の補数を動かして理解</h1>
          <p className="mt-3 leading-7 text-slate-600">同じビット列でも、符号なし整数か2の補数かで値の読み方が変わります。ビット幅を変えながら、表せる範囲と各ビットの重みを確かめましょう。</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block font-bold" htmlFor="bit-width-slider">ビット幅：{bitWidth} bit<input id="bit-width-slider" aria-label="ビット幅" className="mt-3 w-full accent-blue-700" type="range" min="4" max="16" step="1" value={bitWidth} onChange={event => { const nextWidth = Number(event.target.value); setBitWidth(nextWidth); setValue(current => Math.min(current, 2 ** nextWidth - 1)); }} /></label>
          <p className="mt-2 text-sm text-slate-600" aria-live="polite">符号なし：0〜{unsignedMaximum}　／　2の補数：{signedMinimum}〜{signedMaximum}</p>
        </section>

        <section aria-label="表現方法" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <fieldset>
            <legend className="mb-3 font-bold">読み取り方</legend>
            <div className="flex flex-wrap gap-3">
              {([{ id: 'unsigned', label: `符号なし（0〜${unsignedMaximum}）` }, { id: 'twos-complement', label: `2の補数（${signedMinimum}〜${signedMaximum}）` }] as const).map((option) => (
                <label key={option.id} className={`cursor-pointer rounded-xl border px-4 py-3 font-semibold ${mode === option.id ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-300'}`}>
                  <input className="mr-2 accent-blue-700" type="radio" name="byte-mode" value={option.id} checked={mode === option.id} onChange={() => setMode(option.id)} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-bold text-slate-500">現在のビット列</p><p className="font-mono text-3xl font-black tracking-[0.18em] sm:text-4xl" aria-live="polite">{bits}</p></div>
            <p className="text-2xl font-black text-blue-800" aria-live="polite">値：{result}</p>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
            {[...bits].map((bit, index) => (
              <button key={index} type="button" onClick={() => toggleBit(index)} aria-label={`${bitWidth - index - 1}ビット目を切り替え（現在${bit}、重み${weights[index]}）`} aria-pressed={bit === '1'} className={`rounded-xl border-2 p-3 text-center transition hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-blue-400 ${bit === '1' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-slate-50 text-slate-800'}`}>
                <span className="block text-xs opacity-80">2^{bitWidth - index - 1}</span><span className="block font-mono text-2xl font-black">{bit}</span><span className="block text-xs">重み {weights[index]}</span>
              </button>
            ))}
          </div>
          <label className="mt-7 block font-bold" htmlFor="byte-slider">{mode === 'twos-complement' ? `ビット列の符号なし表現（0〜${unsignedMaximum}）から設定` : `値からビット列を変更（0〜${unsignedMaximum}）`} <span className="font-mono text-blue-800">{value}</span></label>
          <input id="byte-slider" aria-label={mode === 'twos-complement' ? `ビット列の符号なし表現値（0〜${unsignedMaximum}）` : `符号なしの値（0〜${unsignedMaximum}）`} className="mt-3 w-full accent-blue-700" type="range" min="0" max={unsignedMaximum} value={value} onChange={(event) => setValue(Number(event.target.value))} />
          <div className="mt-4" aria-label="2の補数の例を試す">
            <p className="mb-2 text-sm text-slate-600">{mode === 'twos-complement' ? '2の補数の例を試す' : '選ぶと2の補数表示に切り替わります'}</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => <button key={preset.value} type="button" onClick={() => { setBitWidth(8); setMode('twos-complement'); setValue(preset.value); }} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100">{preset.label}</button>)}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-7" aria-live="polite">
          <h2 className="text-lg font-black">重みを足して値を読む</h2>
          <p className="mt-2 break-words font-mono text-lg leading-8">{contributions.filter((n) => n !== 0).join(' + ') || '0'} = <strong>{result}</strong></p>
          {mode === 'twos-complement' ? <p className="mt-3 text-sm leading-6 text-slate-700">2の補数では左端のビットだけ重みが {signedMinimum} です。負の重みと残りの正の重みを足すと値になります。</p> : <p className="mt-3 text-sm leading-6 text-slate-700">符号なしでは各ビットの重みはすべて正で、左端は {2 ** (bitWidth - 1)} です。{bitWidth}ビットで 0〜{unsignedMaximum} を表します。</p>}
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h2 className="font-black text-emerald-950">動かして理解できたら、問題で確認</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-900">進数変換・2の補数・ビットの重みを、個別またはランダムで練習できます。</p>
          </div>
          <Link href="/learn/information/number-representation-drill" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-2 font-bold text-white hover:bg-emerald-800 focus-visible:outline-4 focus-visible:outline-emerald-400 sm:mt-0">演習に進む →</Link>
        </section>
      </div>
    </main>
  );
}
