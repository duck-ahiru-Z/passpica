export interface IntegerTriangleSides {
  readonly angle: 60;
  readonly opposite: number;
  readonly adjacentB: number;
  readonly adjacentC: number;
  readonly alternateC: number;
}

const exactIntegerAmbiguousSides = [
  [8, 3, 7], [8, 5, 7], [15, 7, 13], [15, 8, 13], [16, 6, 14], [16, 10, 14],
  [21, 5, 19], [21, 16, 19], [24, 9, 21], [24, 15, 21], [30, 14, 26], [30, 16, 26],
  [32, 12, 28], [32, 20, 28], [35, 11, 31], [35, 24, 31], [40, 7, 37], [40, 15, 35],
  [40, 25, 35], [40, 33, 37], [42, 10, 38], [42, 32, 38], [45, 21, 39], [45, 24, 39],
  [48, 13, 43], [48, 18, 42], [48, 30, 42], [48, 35, 43],
] as const;

export function generateCosineRuleAmbiguousTriangle(random = Math.random): IntegerTriangleSides {
  const [adjacentB, adjacentC, opposite] = exactIntegerAmbiguousSides[
    Math.floor(random() * exactIntegerAmbiguousSides.length)
  ];
  return {
    angle: 60,
    opposite,
    adjacentB,
    adjacentC,
    alternateC: adjacentB - adjacentC,
  };
}

export function getCosineRuleAmbiguousTriangleCount(): number {
  return exactIntegerAmbiguousSides.length;
}
