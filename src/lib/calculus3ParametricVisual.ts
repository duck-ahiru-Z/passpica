export const PARAMETRIC_VERTICAL_TANGENT_THRESHOLD = 0.001;
export const PARAMETRIC_HORIZONTAL_SLOPE_THRESHOLD = 0.0005;

export type ParametricCurveState = {
  x: number;
  y: number;
  dxdt: number;
  dydt: number;
  slope: number | null;
  speed: number;
};

export function getEllipseParametricState(t: number): ParametricCurveState {
  const x = 2 * Math.cos(t);
  const y = Math.sin(t);
  const dxdt = -2 * Math.sin(t);
  const dydt = Math.cos(t);
  const rawSlope = Math.abs(dxdt) < PARAMETRIC_VERTICAL_TANGENT_THRESHOLD
    ? null
    : dydt / dxdt;
  const slope = rawSlope !== null && Math.abs(rawSlope) < PARAMETRIC_HORIZONTAL_SLOPE_THRESHOLD
    ? 0
    : rawSlope;

  return { x, y, dxdt, dydt, slope, speed: Math.hypot(dxdt, dydt) };
}
