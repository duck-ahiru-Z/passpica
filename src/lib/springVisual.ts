export const springConstant = 200;
export const springMinimumExtension = -0.2;
export const springMaximumExtension = 0.2;

export type SpringVisualState = {
  extension: number;
  restoringForce: number;
  elasticPotentialEnergy: number;
};

export function getSpringVisualState(extension: number): SpringVisualState {
  if (!Number.isFinite(extension)) {
    throw new RangeError('spring extension must be finite');
  }

  const boundedExtension = Math.min(springMaximumExtension, Math.max(springMinimumExtension, extension));
  return {
    extension: boundedExtension,
    restoringForce: boundedExtension === 0 ? 0 : -springConstant * boundedExtension,
    elasticPotentialEnergy: 0.5 * springConstant * boundedExtension ** 2,
  };
}
