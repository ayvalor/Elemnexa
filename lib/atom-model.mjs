/** Deterministic illustrative nucleus coordinates; particle size/spacing are not to scale. */
export function nucleusPoints(protons, neutrons) {
  const total = protons + neutrons;
  if (!Number.isInteger(protons) || !Number.isInteger(neutrons) || protons < 1 || protons > 118 || neutrons < 0 || neutrons > 176) throw new Error('Particle counts are outside the model range.');
  return Array.from({ length: total }, (_, index) => {
    // Distribute both species throughout the sphere rather than separating them into hemispheres.
    const isProton = Math.floor((index + 1) * protons / total) > Math.floor(index * protons / total);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    const vertical = 1 - 2 * (index + .5) / total;
    const radius = total === 1 ? 0 : 23 * Math.cbrt((index + .5) / total);
    return { x: Math.cos(angle) * Math.sqrt(1 - vertical * vertical) * radius, y: vertical * radius, z: Math.sin(angle) * Math.sqrt(1 - vertical * vertical) * radius, isProton };
  });
}

export const shellPalette = ['#5eead4', '#93c5fd', '#c4b5fd', '#fda4af', '#fcd34d', '#86efac', '#f9a8d4'];
