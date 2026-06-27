"use client";

import React from 'react';

export interface FractionRootValue {
  sign: '+' | '-';
  numCoeff: string;
  numRoot: string;
  den: string;
}

export const defaultFractionRoot: FractionRootValue = {
  sign: '+',
  numCoeff: '',
  numRoot: '',
  den: ''
};

interface Props {
  value: FractionRootValue;
  onChange: (val: FractionRootValue) => void;
  hideSign?: boolean;
}

export default function FractionRootInput({ value, onChange, hideSign = false }: Props) {
  const update = (key: keyof FractionRootValue, v: string) => {
    onChange({ ...value, [key]: v });
  };

  return (
    <div className="flex items-center gap-1 inline-flex align-middle">
      {!hideSign && (
        <select 
          className="border border-gray-400 py-1 px-0.5 bg-white text-sm font-bold text-center appearance-none"
          value={value.sign}
          onChange={(e) => update('sign', e.target.value)}
        >
          <option value="+">＋</option>
          <option value="-">－</option>
        </select>
      )}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <input 
            type="text" 
            className="w-8 border border-gray-400 p-1 text-center font-bold text-sm" 
            value={value.numCoeff} 
            onChange={e => update('numCoeff', e.target.value)} 
          />
          <span className="text-gray-500 font-serif italic font-bold">√</span>
          <input 
            type="text" 
            className="w-8 border border-gray-400 p-1 text-center font-bold text-sm" 
            value={value.numRoot} 
            onChange={e => update('numRoot', e.target.value)} 
          />
        </div>
        <div className="w-full border-b-[1.5px] border-slate-800 my-0.5"></div>
        <input 
          type="text" 
          className="w-12 border border-gray-400 p-1 text-center font-bold text-sm bg-gray-50" 
          value={value.den} 
          onChange={e => update('den', e.target.value)} 
          placeholder="1"
        />
      </div>
    </div>
  );
}

// Utility to parse and compare FractionRootValue to actual mathematically expected values
export function checkFractionRoot(val: FractionRootValue, expectedSign: 1 | -1, expectedNumCoeff: number, expectedNumRoot: number, expectedDen: number): boolean {
  let vSign = val.sign === '+' ? 1 : -1;
  let vNumCoeff = val.numCoeff.trim() === '' || val.numCoeff.trim() === '1' ? 1 : parseInt(val.numCoeff);
  if (val.numCoeff.trim() === '0') vNumCoeff = 0;
  if (val.numCoeff.trim() === '-1') { vSign *= -1; vNumCoeff = 1; }
  
  let vNumRoot = val.numRoot.trim() === '' || val.numRoot.trim() === '1' ? 1 : parseInt(val.numRoot);
  if (val.numRoot.trim() === '0') { vNumCoeff = 0; vNumRoot = 1; }
  
  let vDen = val.den.trim() === '' ? 1 : parseInt(val.den);
  if (vDen < 0) { vSign *= -1; vDen *= -1; }
  
  if (vNumCoeff === 0) {
    return expectedNumCoeff === 0;
  }
  
  // They must match perfectly in simplified radical form since it's a drill
  return vSign === expectedSign && vNumCoeff === expectedNumCoeff && vNumRoot === expectedNumRoot && vDen === expectedDen;
}
