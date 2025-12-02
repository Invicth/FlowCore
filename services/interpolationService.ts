
import type { HunterDataPoint } from '../types';

/**
 * Calculates the flow rate (caudal) for a given number of hunter units using linear interpolation.
 * @param data - The dataset of hunter units and corresponding flow rates. It's assumed to be sorted by units.
 * @param x - The number of hunter units to calculate the flow rate for.
 * @returns The calculated flow rate in l/s, or null if data is empty.
 */
export const getCaudalInterpolado = (data: HunterDataPoint[], x: number): number | null => {
  if (data.length === 0) {
    return null;
  }
  
  // If x is less than or equal to the smallest unit value, return the smallest flow rate.
  if (x <= data[0].units) {
    return data[0].caudal;
  }

  // If x is greater than or equal to the largest unit value, return the largest flow rate.
  if (x >= data[data.length - 1].units) {
    return data[data.length - 1].caudal;
  }

  // Find the two points between which x lies and perform linear interpolation.
  for (let i = 0; i < data.length - 1; i++) {
    const p1 = data[i];
    const p2 = data[i + 1];

    if (x === p1.units) return p1.caudal;
    if (x === p2.units) return p2.caudal;

    if (x > p1.units && x < p2.units) {
      const { units: x1, caudal: y1 } = p1;
      const { units: x2, caudal: y2 } = p2;
      
      // Linear interpolation formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
      const interpolatedCaudal = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
      return interpolatedCaudal;
    }
  }

  // This fallback should theoretically not be reached with sorted, comprehensive data.
  return null;
};
