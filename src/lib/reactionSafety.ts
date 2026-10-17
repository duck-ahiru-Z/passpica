const atomicMass = { carbon: 12.011, hydrogen: 1.008, nitrogen: 14.007, oxygen: 15.999 };

export function celluloseNitrateNitrogenPercent(degree: 1 | 2 | 3): number {
  const carbon = 6;
  const hydrogen = 10 - degree;
  const nitrogen = degree;
  const oxygen = 5 + 2 * degree;
  const molarMass = carbon * atomicMass.carbon
    + hydrogen * atomicMass.hydrogen
    + nitrogen * atomicMass.nitrogen
    + oxygen * atomicMass.oxygen;
  return nitrogen * atomicMass.nitrogen / molarMass * 100;
}

export function reactionEnergyProfile(activationEnergy: number, heatReleased: number) {
  const reactantY = 180;
  const pixelsPerKilojoule = 0.45;
  return {
    reactantY,
    transitionY: reactantY - activationEnergy * pixelsPerKilojoule,
    productY: reactantY + heatReleased * pixelsPerKilojoule,
  };
}
