"use client";

import { useState } from 'react';
import Link from 'next/link';

type MoleculeId = 'methane' | 'ethane' | 'ethylene' | 'acetylene' | 'benzene' | 'cyclohexane_chair' | 'cyclohexane_boat' | 'cis_butene' | 'trans_butene';

interface Atom {
  id: string;
  element: 'C' | 'H' | 'H_axial' | 'H_equatorial' | 'H_flagpole'; // H_axial/H_equatorial for cyclohexane, H_flagpole for boat
  x: number;
  y: number;
  z: number;
}

interface Bond {
  u: string; // Atom ID 1
  v: string; // Atom ID 2
  type: 'single' | 'double' | 'triple' | 'aromatic';
}

interface MoleculeData {
  id: MoleculeId;
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: Bond[];
  description: string;
}

// 3D分子データ定義
const MOLECULES: Record<MoleculeId, MoleculeData> = {
  methane: {
    id: 'methane',
    name: 'メタン (正四面体)',
    formula: 'CH₄',
    atoms: [
      { id: 'C', element: 'C', x: 0, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: 0, y: 0, z: 55 },
      { id: 'H2', element: 'H', x: 51.8, y: 0, z: -18.3 },
      { id: 'H3', element: 'H', x: -25.9, y: 44.9, z: -18.3 },
      { id: 'H4', element: 'H', x: -25.9, y: -44.9, z: -18.3 }
    ],
    bonds: [
      { u: 'C', v: 'H1', type: 'single' },
      { u: 'C', v: 'H2', type: 'single' },
      { u: 'C', v: 'H3', type: 'single' },
      { u: 'C', v: 'H4', type: 'single' }
    ],
    description: '炭素原子を中心とし、4個の水素原子が正四面体の頂点に配位した立体構造です。結合角はすべて 109.5° です。'
  },
  ethane: {
    id: 'ethane',
    name: 'エタン (ねじれ型配座)',
    formula: 'C₂H₆',
    atoms: [
      { id: 'C1', element: 'C', x: -30, y: 0, z: 0 },
      { id: 'C2', element: 'C', x: 30, y: 0, z: 0 },
      // C1 に結合した水素
      { id: 'H11', element: 'H', x: -65, y: 0, z: 45 },
      { id: 'H12', element: 'H', x: -65, y: 39, z: -22.5 },
      { id: 'H13', element: 'H', x: -65, y: -39, z: -22.5 },
      // C2 に結合した水素 (ねじれ型: 対向面の中間に配置)
      { id: 'H21', element: 'H', x: 65, y: 0, z: -45 },
      { id: 'H22', element: 'H', x: 65, y: 39, z: 22.5 },
      { id: 'H23', element: 'H', x: 65, y: -39, z: 22.5 }
    ],
    bonds: [
      { u: 'C1', v: 'C2', type: 'single' },
      { u: 'C1', v: 'H11', type: 'single' },
      { u: 'C1', v: 'H12', type: 'single' },
      { u: 'C1', v: 'H13', type: 'single' },
      { u: 'C2', v: 'H21', type: 'single' },
      { u: 'C2', v: 'H22', type: 'single' },
      { u: 'C2', v: 'H23', type: 'single' }
    ],
    description: '炭素-炭素単結合は自由に回転できます。反発が最小になる「ねじれ型」が最も安定で、重なり合う「重なり型」はエネルギー的に不安定になります。'
  },
  ethylene: {
    id: 'ethylene',
    name: 'エチレン (平面二重結合)',
    formula: 'C₂H₄',
    atoms: [
      { id: 'C1', element: 'C', x: -35, y: 0, z: 0 },
      { id: 'C2', element: 'C', x: 35, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: -70, y: 45, z: 0 },
      { id: 'H2', element: 'H', x: -70, y: -45, z: 0 },
      { id: 'H3', element: 'H', x: 70, y: 45, z: 0 },
      { id: 'H4', element: 'H', x: 70, y: -45, z: 0 }
    ],
    bonds: [
      { u: 'C1', v: 'C2', type: 'double' },
      { u: 'C1', v: 'H1', type: 'single' },
      { u: 'C1', v: 'H2', type: 'single' },
      { u: 'C2', v: 'H3', type: 'single' },
      { u: 'C2', v: 'H4', type: 'single' }
    ],
    description: '炭素同士が二重結合（σ結合とπ結合）で結ばれており、結合軸の周りで自由に回転できません。すべての原子が同一平面上に存在します。'
  },
  acetylene: {
    id: 'acetylene',
    name: 'アセチレン (直線三重結合)',
    formula: 'C₂H₂',
    atoms: [
      { id: 'C1', element: 'C', x: -30, y: 0, z: 0 },
      { id: 'C2', element: 'C', x: 30, y: 0, z: 0 },
      { id: 'H1', element: 'H', x: -80, y: 0, z: 0 },
      { id: 'H2', element: 'H', x: 80, y: 0, z: 0 }
    ],
    bonds: [
      { u: 'C1', v: 'C2', type: 'triple' },
      { u: 'C1', v: 'H1', type: 'single' },
      { u: 'C2', v: 'H2', type: 'single' }
    ],
    description: '炭素間が三重結合で結ばれ、結合角は180°です。分子全体が一直線に並ぶため、対称性の高い平面構造となります。'
  },
  benzene: {
    id: 'benzene',
    name: 'ベンゼン環 (共鳴平面構造)',
    formula: 'C₆H₆',
    atoms: [
      // 炭素環 (半径50)
      { id: 'C1', element: 'C', x: 50, y: 0, z: 0 },
      { id: 'C2', element: 'C', x: 25, y: 43.3, z: 0 },
      { id: 'C3', element: 'C', x: -25, y: 43.3, z: 0 },
      { id: 'C4', element: 'C', x: -50, y: 0, z: 0 },
      { id: 'C5', element: 'C', x: -25, y: -43.3, z: 0 },
      { id: 'C6', element: 'C', x: 25, y: -43.3, z: 0 },
      // 水素 (半径85)
      { id: 'H1', element: 'H', x: 85, y: 0, z: 0 },
      { id: 'H2', element: 'H', x: 42.5, y: 73.6, z: 0 },
      { id: 'H3', element: 'H', x: -42.5, y: 73.6, z: 0 },
      { id: 'H4', element: 'H', x: -85, y: 0, z: 0 },
      { id: 'H5', element: 'H', x: -42.5, y: -73.6, z: 0 },
      { id: 'H6', element: 'H', x: 42.5, y: -73.6, z: 0 }
    ],
    bonds: [
      // 便宜上芳香族結合(交互にdouble/singleのように見えるが共鳴構造)
      { u: 'C1', v: 'C2', type: 'aromatic' },
      { u: 'C2', v: 'C3', type: 'aromatic' },
      { u: 'C3', v: 'C4', type: 'aromatic' },
      { u: 'C4', v: 'C5', type: 'aromatic' },
      { u: 'C5', v: 'C6', type: 'aromatic' },
      { u: 'C6', v: 'C1', type: 'aromatic' },
      // CH結合
      { u: 'C1', v: 'H1', type: 'single' },
      { u: 'C2', v: 'H2', type: 'single' },
      { u: 'C3', v: 'H3', type: 'single' },
      { u: 'C4', v: 'H4', type: 'single' },
      { u: 'C5', v: 'H5', type: 'single' },
      { u: 'C6', v: 'H6', type: 'single' }
    ],
    description: '炭素原子6個が正六角形の平面を作り、二重結合と単結合が重なり合った共鳴ハイブリッド状態を成しています（結合距離はすべて同等）。'
  },
  cyclohexane_chair: {
    id: 'cyclohexane_chair',
    name: 'シクロヘキサン (椅子型配座)',
    formula: 'C₆H₁₂',
    atoms: [
      // 炭素原子（交互にzが上下に歪む）
      { id: 'C1', element: 'C', x: 45, y: 0, z: 15 },
      { id: 'C2', element: 'C', x: 22.5, y: 39, z: -15 },
      { id: 'C3', element: 'C', x: -22.5, y: 39, z: 15 },
      { id: 'C4', element: 'C', x: -45, y: 0, z: -15 },
      { id: 'C5', element: 'C', x: -22.5, y: -39, z: 15 },
      { id: 'C6', element: 'C', x: 22.5, y: -39, z: -15 },
      // アキシアル水素（赤色・上下方向）
      { id: 'H1a', element: 'H_axial', x: 45, y: 0, z: 50 },     // C1(up): H(up)
      { id: 'H2a', element: 'H_axial', x: 22.5, y: 39, z: -50 },  // C2(down): H(down)
      { id: 'H3a', element: 'H_axial', x: -22.5, y: 39, z: 50 },  // C3(up): H(up)
      { id: 'H4a', element: 'H_axial', x: -45, y: 0, z: -50 },   // C4(down): H(down)
      { id: 'H5a', element: 'H_axial', x: -22.5, y: -39, z: 50 }, // C5(up): H(up)
      { id: 'H6a', element: 'H_axial', x: 22.5, y: -39, z: -50 }, // C6(down): H(down)
      // エキトリアル水素（青色・赤道方向）
      { id: 'H1e', element: 'H_equatorial', x: 75, y: 0, z: -5 },
      { id: 'H2e', element: 'H_equatorial', x: 37.5, y: 65, z: 5 },
      { id: 'H3e', element: 'H_equatorial', x: -37.5, y: 65, z: -5 },
      { id: 'H4e', element: 'H_equatorial', x: -75, y: 0, z: 5 },
      { id: 'H5e', element: 'H_equatorial', x: -37.5, y: -65, z: -5 },
      { id: 'H6e', element: 'H_equatorial', x: 37.5, y: -65, z: 5 }
    ],
    bonds: [
      // CC結合
      { u: 'C1', v: 'C2', type: 'single' },
      { u: 'C2', v: 'C3', type: 'single' },
      { u: 'C3', v: 'C4', type: 'single' },
      { u: 'C4', v: 'C5', type: 'single' },
      { u: 'C5', v: 'C6', type: 'single' },
      { u: 'C6', v: 'C1', type: 'single' },
      // CHアキシアル結合
      { u: 'C1', v: 'H1a', type: 'single' },
      { u: 'C2', v: 'H2a', type: 'single' },
      { u: 'C3', v: 'H3a', type: 'single' },
      { u: 'C4', v: 'H4a', type: 'single' },
      { u: 'C5', v: 'H5a', type: 'single' },
      { u: 'C6', v: 'H6a', type: 'single' },
      // CHエキトリアル結合
      { u: 'C1', v: 'H1e', type: 'single' },
      { u: 'C2', v: 'H2e', type: 'single' },
      { u: 'C3', v: 'H3e', type: 'single' },
      { u: 'C4', v: 'H4e', type: 'single' },
      { u: 'C5', v: 'H5e', type: 'single' },
      { u: 'C6', v: 'H6e', type: 'single' }
    ],
    description: 'すべての炭素原子が正四面体のsp³構造角(109.5°)を保ち、ねじれひずみも発生しない最も安定な構造です。赤が縦方向（アキシアル）、青が外側方向（エキトリアル）の水素です。'
  },
  cyclohexane_boat: {
    id: 'cyclohexane_boat',
    name: 'シクロヘキサン (舟型配座)',
    formula: 'C₆H₁₂',
    atoms: [
      // 炭素原子（C1とC4の両端が立ち上がる）
      { id: 'C1', element: 'C', x: 45, y: 0, z: 25 },
      { id: 'C2', element: 'C', x: 22.5, y: 39, z: -10 },
      { id: 'C3', element: 'C', x: -22.5, y: 39, z: -10 },
      { id: 'C4', element: 'C', x: -45, y: 0, z: 25 },
      { id: 'C5', element: 'C', x: -22.5, y: -39, z: -10 },
      { id: 'C6', element: 'C', x: 22.5, y: -39, z: -10 },
      // 水素（特殊なフラッグポール水素を強調表示）
      { id: 'H1f', element: 'H_flagpole', x: 20, y: 0, z: 50 },  // C1フラッグポール
      { id: 'H4f', element: 'H_flagpole', x: -20, y: 0, z: 50 }, // C4フラッグポール
      // その他一般水素
      { id: 'H1o', element: 'H', x: 65, y: 0, z: 45 },
      { id: 'H2a', element: 'H', x: 22.5, y: 65, z: -30 },
      { id: 'H2b', element: 'H', x: 35, y: 39, z: 10 },
      { id: 'H3a', element: 'H', x: -22.5, y: 65, z: -30 },
      { id: 'H3b', element: 'H', x: -35, y: 39, z: 10 },
      { id: 'H4o', element: 'H', x: -65, y: 0, z: 45 },
      { id: 'H5a', element: 'H', x: -22.5, y: -65, z: -30 },
      { id: 'H5b', element: 'H', x: -35, y: -39, z: 10 },
      { id: 'H6a', element: 'H', x: 22.5, y: -65, z: -30 },
      { id: 'H6b', element: 'H', x: 35, y: -39, z: 10 }
    ],
    bonds: [
      { u: 'C1', v: 'C2', type: 'single' },
      { u: 'C2', v: 'C3', type: 'single' },
      { u: 'C3', v: 'C4', type: 'single' },
      { u: 'C4', v: 'C5', type: 'single' },
      { u: 'C5', v: 'C6', type: 'single' },
      { u: 'C6', v: 'C1', type: 'single' },
      // フラッグポール水素結合
      { u: 'C1', v: 'H1f', type: 'single' },
      { u: 'C4', v: 'H4f', type: 'single' },
      // その他結合
      { u: 'C1', v: 'H1o', type: 'single' },
      { u: 'C2', v: 'H2a', type: 'single' },
      { u: 'C2', v: 'H2b', type: 'single' },
      { u: 'C3', v: 'H3a', type: 'single' },
      { u: 'C3', v: 'H3b', type: 'single' },
      { u: 'C4', v: 'H4o', type: 'single' },
      { u: 'C5', v: 'H5a', type: 'single' },
      { u: 'C5', v: 'H5b', type: 'single' },
      { u: 'C6', v: 'H6a', type: 'single' },
      { u: 'C6', v: 'H6b', type: 'single' }
    ],
    description: 'C1とC4が同一方向を向いた配座です。頂点の緑色の水素同士（フラッグポール水素）が近接し、強い立体反発（ひずみ）を受けるため、椅子型に比べてエネルギー的に約 23 kJ/mol 不安定です。'
  },
  cis_butene: {
    id: 'cis_butene',
    name: 'シス-2-ブテン (幾何異性体・折れ曲がり型)',
    formula: 'C₄H₈',
    atoms: [
      // 主鎖 C2=C3 二重結合
      { id: 'C2', element: 'C', x: -25, y: 0, z: 0 },
      { id: 'C3', element: 'C', x: 25, y: 0, z: 0 },
      // シス配置のメチル基炭素 C1, C4 (上側に折れ曲がる)
      { id: 'C1', element: 'C', x: -55, y: 45, z: 0 },
      { id: 'C4', element: 'C', x: 55, y: 45, z: 0 },
      // C2, C3 に直結したH (下側)
      { id: 'H2', element: 'H', x: -35, y: -45, z: 0 },
      { id: 'H3', element: 'H', x: 35, y: -45, z: 0 },
      // C1 (メチル基) の水素
      { id: 'H11', element: 'H', x: -80, y: 45, z: 25 },
      { id: 'H12', element: 'H', x: -80, y: 45, z: -25 },
      { id: 'H13', element: 'H', x: -45, y: 75, z: 0 },
      // C4 (メチル基) の水素
      { id: 'H41', element: 'H', x: 80, y: 45, z: 25 },
      { id: 'H42', element: 'H', x: 80, y: 45, z: -25 },
      { id: 'H43', element: 'H', x: 45, y: 75, z: 0 }
    ],
    bonds: [
      { u: 'C2', v: 'C3', type: 'double' },
      { u: 'C2', v: 'C1', type: 'single' },
      { u: 'C3', v: 'C4', type: 'single' },
      { u: 'C2', v: 'H2', type: 'single' },
      { u: 'C3', v: 'H3', type: 'single' },
      { u: 'C1', v: 'H11', type: 'single' },
      { u: 'C1', v: 'H12', type: 'single' },
      { u: 'C1', v: 'H13', type: 'single' },
      { u: 'C4', v: 'H41', type: 'single' },
      { u: 'C4', v: 'H42', type: 'single' },
      { u: 'C4', v: 'H43', type: 'single' }
    ],
    description: '二重結合の同じ側にメチル基（-CH₃）が配置され、分子がC型に折れ曲がっています。このシス配置の折れ曲がり構造は、天然ゴム（ポリイソプレン）の分子鎖でも繰り返され、分子間に隙間を作りゴムに「弾性（伸びる性質）」をもたらします。'
  },
  trans_butene: {
    id: 'trans_butene',
    name: 'トランス-2-ブテン (幾何異性体・直線的構造)',
    formula: 'C₄H₈',
    atoms: [
      // 主鎖 C2=C3 二重結合
      { id: 'C2', element: 'C', x: -25, y: 0, z: 0 },
      { id: 'C3', element: 'C', x: 25, y: 0, z: 0 },
      // トランス配置のメチル基炭素 C1, C4 (対角線上に配置)
      { id: 'C1', element: 'C', x: -55, y: -45, z: 0 },
      { id: 'C4', element: 'C', x: 55, y: 45, z: 0 },
      // C2, C3 に直結したH (対角)
      { id: 'H2', element: 'H', x: -35, y: 45, z: 0 },
      { id: 'H3', element: 'H', x: 35, y: -45, z: 0 },
      // C1 (メチル基) の水素
      { id: 'H11', element: 'H', x: -80, y: -45, z: 25 },
      { id: 'H12', element: 'H', x: -80, y: -45, z: -25 },
      { id: 'H13', element: 'H', x: -45, y: -75, z: 0 },
      // C4 (メチル基) の水素
      { id: 'H41', element: 'H', x: 80, y: 45, z: 25 },
      { id: 'H42', element: 'H', x: 80, y: 45, z: -25 },
      { id: 'H43', element: 'H', x: 45, y: 75, z: 0 }
    ],
    bonds: [
      { u: 'C2', v: 'C3', type: 'double' },
      { u: 'C2', v: 'C1', type: 'single' },
      { u: 'C3', v: 'C4', type: 'single' },
      { u: 'C2', v: 'H2', type: 'single' },
      { u: 'C3', v: 'H3', type: 'single' },
      { u: 'C1', v: 'H11', type: 'single' },
      { u: 'C1', v: 'H12', type: 'single' },
      { u: 'C1', v: 'H13', type: 'single' },
      { u: 'C4', v: 'H41', type: 'single' },
      { u: 'C4', v: 'H42', type: 'single' },
      { u: 'C4', v: 'H43', type: 'single' }
    ],
    description: '二重結合の対角線上にメチル基が配置され、分子が全体として直線的な階段状になっています。トランス配置（トランス-ポリイソプレン等）は分子鎖が規則正しく並びやすく結晶化するため、弾性を失い「プラスチック様の硬い樹脂（グッタペルカ）」となります。'
  }
};

export default function Organic3DPage() {
  const [selectedMol, setSelectedMol] = useState<MoleculeId>('methane');
  
  // 3D 回転角（度数法）
  const [yaw, setYaw] = useState<number>(30);   // Y軸周り
  const [pitch, setPitch] = useState<number>(20); // X軸周り

  const currentMol = MOLECULES[selectedMol];

  // 3Dプロット定数
  const width = 300;
  const height = 300;
  const cx = 150;
  const cy = 150;

  // 3D座標変換と射影計算
  const projectAtoms = (): Record<string, { px: number; py: number; pz: number; id: string; element: string }> => {
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    const projected: Record<string, { px: number; py: number; pz: number; id: string; element: string }> = {};

    currentMol.atoms.forEach(atom => {
      // 1. Y軸回転 (Yaw)
      const x1 = atom.x * Math.cos(radYaw) - atom.z * Math.sin(radYaw);
      const z1 = atom.x * Math.sin(radYaw) + atom.z * Math.cos(radYaw);
      const y1 = atom.y;

      // 2. X軸回転 (Pitch)
      const x2 = x1;
      const y2 = y1 * Math.cos(radPitch) - z1 * Math.sin(radPitch);
      const z2 = y1 * Math.sin(radPitch) + z1 * Math.cos(radPitch);

      // SVG座標へマッピング (z2は奥行き)
      projected[atom.id] = {
        px: cx + x2,
        py: cy - y2,
        pz: z2,
        id: atom.id,
        element: atom.element
      };
    });

    return projected;
  };

  const projectedAtoms = projectAtoms();

  // 3D描画要素のリスト生成（アトムとボンドを混在させてZソートする Painters Algorithm）
  interface RenderItem {
    type: 'bond' | 'atom';
    z: number;
    payload: any;
  }

  const getRenderItems = (): RenderItem[] => {
    const items: RenderItem[] = [];

    // ボンドを追加
    currentMol.bonds.forEach(bond => {
      const uProj = projectedAtoms[bond.u];
      const vProj = projectedAtoms[bond.v];
      if (uProj && vProj) {
        items.push({
          type: 'bond',
          z: (uProj.pz + vProj.pz) / 2, // ボンドの中心点 Z を深度とする
          payload: {
            u: uProj,
            v: vProj,
            bondType: bond.type
          }
        });
      }
    });

    // アトムを追加
    Object.values(projectedAtoms).forEach(atom => {
      items.push({
        type: 'atom',
        z: atom.pz,
        payload: atom
      });
    });

    // Zが奥（マイナス）から手前（プラス）へ昇順ソート
    return items.sort((a, b) => a.z - b.z);
  };

  const sortedRenderItems = getRenderItems();

  // ボンドの二重線・三重線・通常の並行線オフセットを描画
  const renderBond = (payload: any, index: number) => {
    const { u, v, bondType } = payload;
    const dx = v.px - u.px;
    const dy = v.py - u.py;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len === 0) return null;

    // 垂直単位ベクトル
    const px = -dy / len;
    const py = dx / len;

    if (bondType === 'double') {
      const offset = 2.5;
      return (
        <g key={`bond-${index}`}>
          <line x1={u.px + px * offset} y1={u.py + py * offset} x2={v.px + px * offset} y2={v.py + py * offset} stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          <line x1={u.px - px * offset} y1={u.py - py * offset} x2={v.px - px * offset} y2={v.py - py * offset} stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }

    if (bondType === 'triple') {
      const offset = 4.0;
      return (
        <g key={`bond-${index}`}>
          <line x1={u.px} y1={u.py} x2={v.px} y2={v.py} stroke="#64748b" strokeWidth="2.5" />
          <line x1={u.px + px * offset} y1={u.py + py * offset} x2={v.px + px * offset} y2={v.py + py * offset} stroke="#64748b" strokeWidth="2.5" />
          <line x1={u.px - px * offset} y1={u.py - py * offset} x2={v.px - px * offset} y2={v.py - py * offset} stroke="#64748b" strokeWidth="2.5" />
        </g>
      );
    }

    if (bondType === 'aromatic') {
      // ベンゼン環の共鳴結合（太い1本線と内側の点線で表現すると美しい）
      const offset = 5.0;
      // 内側（中心 cx, cy に向けて）に破線を引く
      const cxProj = cx;
      const cyProj = cy;
      const mx = (u.px + v.px) / 2;
      const my = (u.py + v.py) / 2;
      const tLen = Math.sqrt((cxProj - mx) * (cxProj - mx) + (cyProj - my) * (cyProj - my));
      const ox = tLen > 0 ? ((cxProj - mx) / tLen) * offset : px * offset;
      const oy = tLen > 0 ? ((cyProj - my) / tLen) * offset : py * offset;

      return (
        <g key={`bond-${index}`}>
          <line x1={u.px} y1={u.py} x2={v.px} y2={v.py} stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
          <line x1={u.px + ox} y1={u.py + oy} x2={v.px + ox} y2={v.py + oy} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
        </g>
      );
    }

    // 単結合
    return (
      <line
        key={`bond-${index}`}
        x1={u.px}
        y1={u.py}
        x2={v.px}
        y2={v.py}
        stroke="#cbd5e1"
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  };

  // 原子球の描画
  const renderAtom = (atom: any, index: number) => {
    let r = 11;
    let fill = '#334155'; // C (Slate-700)
    let stroke = '#0f172a';
    let textFill = '#ffffff';
    let label = 'C';

    if (atom.element.startsWith('H')) {
      r = 7;
      textFill = '#475569';
      label = 'H';
      
      if (atom.element === 'H') {
        fill = '#ffffff';
        stroke = '#94a3b8';
      } else if (atom.element === 'H_axial') {
        fill = '#fee2e2'; // 赤み
        stroke = '#ef4444'; // アキシアルは赤
        textFill = '#b91c1c';
      } else if (atom.element === 'H_equatorial') {
        fill = '#dbeafe'; // 青み
        stroke = '#3b82f6'; // エキトリアルは青
        textFill = '#1d4ed8';
      } else if (atom.element === 'H_flagpole') {
        fill = '#dcfce7'; // 緑み
        stroke = '#10b981'; // フラッグポールは緑
        textFill = '#047857';
      }
    }

    return (
      <g key={`atom-${index}`} className="select-none">
        {/* 原子球 */}
        <circle
          cx={atom.px}
          cy={atom.py}
          r={r}
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
        />
        {/* 原子シンボルラベル */}
        <text
          x={atom.px}
          y={atom.py + 0.5}
          fill={textFill}
          fontSize={r > 10 ? '9' : '6'}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {label}
        </text>
      </g>
    );
  };

  // 角度リセット
  const handleResetAngles = () => {
    setYaw(30);
    setPitch(20);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-800 font-sans text-xs">
      
      {/* ページヘッダー */}
      <div className="border-b border-gray-300 pb-2">
        <nav className="text-[10px] text-gray-500 mb-1">
          <Link href="/">トップ</Link> &gt; <Link href="/learn">学習室</Link> &gt; 有機化学・立体構造
        </nav>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          有機・高分子3D立体モデルビューア（シクロヘキサン立体配座）
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          メタンやベンゼンといった代表的な有機分子、シクロヘキサンの「椅子型」「舟型」配座、高分子のシス・トランスによる折れ曲がり構造を3D回転モデルで直感的に学びます。
        </p>
      </div>

      {/* 分子選択パネル */}
      <div className="border border-gray-300 bg-gray-50 p-4 space-y-2.5">
        <span className="font-bold text-slate-700 block">■ 観察したい分子構造を選択してください</span>
        
        {/* グループ1：基本有機物 */}
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 block font-semibold">【基本有機化合物】</span>
          <div className="flex flex-wrap gap-1">
            {(['methane', 'ethane', 'ethylene', 'acetylene', 'benzene'] as MoleculeId[]).map(id => (
              <button
                key={id}
                onClick={() => setSelectedMol(id)}
                className={`retro-btn-classic text-[11px] ${selectedMol === id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {MOLECULES[id].name}
              </button>
            ))}
          </div>
        </div>

        {/* グループ2：シクロヘキサン配座 */}
        <div className="space-y-1 pt-1.5 border-t border-dashed border-gray-300">
          <span className="text-[10px] text-gray-400 block font-semibold">【環状構造・配座異性】</span>
          <div className="flex flex-wrap gap-1">
            {(['cyclohexane_chair', 'cyclohexane_boat'] as MoleculeId[]).map(id => (
              <button
                key={id}
                onClick={() => setSelectedMol(id)}
                className={`retro-btn-classic text-[11px] ${selectedMol === id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {MOLECULES[id].name}
              </button>
            ))}
          </div>
        </div>

        {/* グループ3：高分子シス・トランス */}
        <div className="space-y-1 pt-1.5 border-t border-dashed border-gray-300">
          <span className="text-[10px] text-gray-400 block font-semibold">【幾何異性体・高分子鎖の折れ曲がり】</span>
          <div className="flex flex-wrap gap-1">
            {(['cis_butene', 'trans_butene'] as MoleculeId[]).map(id => (
              <button
                key={id}
                onClick={() => setSelectedMol(id)}
                className={`retro-btn-classic text-[11px] ${selectedMol === id ? 'bg-[#cbd5e1] font-bold' : ''}`}
              >
                {MOLECULES[id].name}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* メインレイアウト：3Dキャンバス ＋ コントロール・解説 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左・中央：3Dプロットキャンバス (2/3) */}
        <div className="lg:col-span-2 border border-gray-300 bg-white p-6 flex flex-col items-center justify-between min-h-[400px]">
          
          <div className="text-center w-full border-b border-gray-200 pb-2 mb-4 font-bold text-slate-700 flex justify-between items-center">
            <span>3D分子モデル：{currentMol.name}</span>
            <span className="font-mono text-xs bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">{currentMol.formula}</span>
          </div>

          {/* SVG 3Dビューアキャンバス */}
          <div className="flex items-center justify-center flex-grow w-full relative">
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="border border-dashed border-gray-200 bg-gray-50/30 overflow-visible"
            >
              {/* 3Dアイテム描画 */}
              {sortedRenderItems.map((item, index) => {
                if (item.type === 'bond') {
                  return renderBond(item.payload, index);
                } else {
                  return renderAtom(item.payload, index);
                }
              })}
            </svg>
            
            {/* 3D座標軸インジケータ (左下に小さく表示) */}
            <div className="absolute bottom-2 left-2 w-16 h-16 border border-gray-200 bg-white/80 p-1 rounded select-none pointer-events-none">
              <span className="text-[8px] text-gray-400 block font-mono text-center">3D Axis</span>
              {/* 簡易軸表示 */}
              <svg viewBox="0 0 50 50" className="w-full h-10 overflow-visible">
                {/* 軸の向きはyaw/pitchに連動して計算可能だが簡易的な基準のみ */}
                <line x1="25" y1="25" x2="45" y2="25" stroke="#ef4444" strokeWidth="1.5" /> <text x="47" y="27" fontSize="7" fill="#ef4444" fontWeight="bold">X</text>
                <line x1="25" y1="25" x2="25" y2="5" stroke="#10b981" strokeWidth="1.5" /> <text x="23" y="4" fontSize="7" fill="#10b981" fontWeight="bold">Y</text>
                <line x1="25" y1="25" x2="15" y2="35" stroke="#3b82f6" strokeWidth="1.5" /> <text x="9" y="41" fontSize="7" fill="#3b82f6" fontWeight="bold">Z</text>
              </svg>
            </div>
          </div>

          {/* 回転コントロール */}
          <div className="w-full mt-6 border-t border-gray-200 pt-4 space-y-4 max-w-md">
            
            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>左右回転 (Yaw)</span>
                  <span className="font-mono text-blue-700">{yaw}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={yaw}
                  onChange={(e) => setYaw(parseInt(e.target.value))}
                  className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>上下回転 (Pitch)</span>
                  <span className="font-mono text-blue-700">{pitch}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full cursor-ew-resize h-1 bg-gray-200 rounded appearance-none border border-gray-400"
                />
              </div>

            </div>

            <div className="text-center pt-2">
              <button
                onClick={handleResetAngles}
                className="retro-btn-classic text-[10px] bg-slate-50 border-slate-300 hover:bg-slate-100 py-1 px-3"
              >
                アングルを初期化
              </button>
            </div>

          </div>

        </div>

        {/* 右側：分子の解説・配座ひずみの要点 (1/3) */}
        <div className="col-span-1 space-y-6">
          
          {/* 分子構造の解説 */}
          <div className="retro-box space-y-3">
            <h3 className="font-bold border-b border-gray-300 pb-1.5 text-slate-800 flex items-center gap-1">
              <span>■</span> 立体構造のポイント
            </h3>
            <div className="text-[11px] leading-relaxed text-gray-600 space-y-2">
              <p className="font-bold text-slate-800">{currentMol.name}</p>
              <p>{currentMol.description}</p>
            </div>

            {/* シクロヘキサン用のカラー解説 */}
            {selectedMol === 'cyclohexane_chair' && (
              <div className="bg-blue-50/50 border border-blue-200 p-2.5 space-y-1.5 text-[10px] leading-normal">
                <span className="font-bold text-blue-800 block">💡 椅子型のカラー表記について:</span>
                <ul className="list-disc pl-4 space-y-1 text-blue-700">
                  <li><strong className="text-red-600">赤色の水素 (H_axial)</strong>: アキシアル（軸）方向の水素。環の平面に対して垂直方向に上下に飛び出しています。</li>
                  <li><strong className="text-blue-600">青色の水素 (H_equatorial)</strong>: エキトリアル（赤道）方向の水素。環の周囲（赤道側）に平らに飛び出しています。</li>
                </ul>
              </div>
            )}

            {/* シクロヘキサン舟型用のひずみ解説 */}
            {selectedMol === 'cyclohexane_boat' && (
              <div className="bg-green-50/50 border border-green-200 p-2.5 space-y-1.5 text-[10px] leading-normal">
                <span className="font-bold text-green-800 block">💡 舟型のフラッグポール水素:</span>
                <p className="text-green-700">
                  頂点にある<strong className="text-emerald-700">緑色の2つの水素 (H_flagpole)</strong> は、お互いに非常に近い位置（フラッグポールポジション）で向き合っており、強い反発力を受けます。これが舟型が椅子型より不安定（約23kJ/mol）になる主原因です。
                </p>
              </div>
            )}
          </div>

          {/* 炭素の混成軌道と結合角のチートシート */}
          <div className="retro-box leading-relaxed space-y-2.5 bg-gray-50">
            <h3 className="font-bold border-b border-gray-300 pb-1 text-slate-800">
              ■ 混成軌道と立体配置の整理
            </h3>
            
            <table className="w-full text-[10px] leading-normal border-collapse border border-gray-300 bg-white">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-1 border-r border-gray-300 text-left">結合の種類</th>
                  <th className="p-1 border-r border-gray-300 text-left">混成軌道</th>
                  <th className="p-1 text-left">結合角 / 形状</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-1 border-r border-gray-300 font-bold text-slate-700">単結合 (C-C)</td>
                  <td className="p-1 border-r border-gray-300 font-mono">sp³</td>
                  <td className="p-1">109.5° / 正四面体</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-1 border-r border-gray-300 font-bold text-slate-700">二重結合 (C=C)</td>
                  <td className="p-1 border-r border-gray-300 font-mono">sp²</td>
                  <td className="p-1">120° / 平面三角形</td>
                </tr>
                <tr>
                  <td className="p-1 border-r border-gray-300 font-bold text-slate-700">三重結合 (C≡C)</td>
                  <td className="p-1 border-r border-gray-300 font-mono">sp</td>
                  <td className="p-1">180° / 直線形</td>
                </tr>
              </tbody>
            </table>

            <div className="text-[9px] text-gray-500 leading-normal pt-1.5">
              ※シクロヘキサンの椅子型と舟型は「配座異性体」と呼ばれ、単結合の回転（環の反転）によって互いに行き来できますが、二重結合を持つブテンのシス・トランスは「幾何異性体（立体異性体）」であり、共有結合を切らない限り互いに変換できません。
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
