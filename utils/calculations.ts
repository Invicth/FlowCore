import { PipeDef, CalculationInput, ResultCell } from '../types';
import { GRAVITY, GAMMA_WATER, MIN_TRACTIVE_FORCE, FILL_RATIO } from '../constants';

/**
 * Helper to calculate hydraulic geometry based on Diameter (m) and Depth (m)
 */
const getGeometry = (D: number, y: number) => {
  // Check full or near full
  if (y >= D) {
    return { A: (Math.PI * D * D) / 4, P: Math.PI * D, Rh: D / 4, theta: 2 * Math.PI };
  }
  
  // Theta (radians) formula based on depth
  // theta = 2 * acos(1 - 2(y/D)) is standard, but keeping consistent trig logic:
  // Center to water surface distance = (y - D/2)
  // term = 2 * (y - D/2) / D = 2y/D - 1. 
  // Standard geom: Theta = 2 * acos(1 - 2y/D)
  const term = 1 - (2 * y) / D;
  // Safety clamp for acos
  const clampedTerm = Math.max(-1, Math.min(1, term));
  const theta = 2 * Math.acos(clampedTerm);

  // Area
  const area = (Math.pow(D, 2) / 8) * (theta - Math.sin(theta));
  
  // Perimeter
  const perimeter = 0.5 * theta * D;

  // Hydraulic Radius
  const Rh = perimeter > 0 ? area / perimeter : 0;

  return { A: area, P: perimeter, Rh, theta };
};

/**
 * Calculates Velocity and Flow using Darcy-Weisbach
 */
const calculateHydraulics = (Rh: number, S: number, A: number, ks: number, viscosity: number) => {
  if (Rh <= 0 || S <= 0) return { v: 0, q: 0 };

  const sqrt8gRhS = Math.sqrt(8 * GRAVITY * Rh * S);
  const term1 = ks / (14.8 * Rh);
  const term2 = (2.51 * viscosity) / (4 * Rh * sqrt8gRhS);
  
  // Avoid log(0) or negative
  if (term1 + term2 <= 0) return { v: 0, q: 0 };

  const velocity = -2 * sqrt8gRhS * Math.log10(term1 + term2);
  const flow = velocity * A;

  return { v: velocity, q: flow };
};

export const calculateCell = (
  pipe: PipeDef,
  slopePercent: number,
  inputs: CalculationInput
): ResultCell => {
  const { id_mm } = pipe;
  const { intensity, coeffC, ks, viscosity } = inputs;
  
  const D = id_mm / 1000;
  const S = slopePercent / 100;
  
  // Intensity conversion: I_ms = I / 3,600,000
  const intensityMs = intensity / 3600000;

  // --- PASO A: LÍMITE SUPERIOR (MAX) ---
  const yMax = FILL_RATIO * D; // 0.85 * D
  const geomMax = getGeometry(D, yMax);
  const tauMax = GAMMA_WATER * geomMax.Rh * S;

  // 1. Check if pipe even works at max capacity for self-cleaning
  if (tauMax < MIN_TRACTIVE_FORCE) {
    return {
      isValid: false,
      failReason: 'LOW_TAU_MAX',
      tauMax: tauMax,
      slope: slopePercent
    } as any;
  }

  const hydMax = calculateHydraulics(geomMax.Rh, S, geomMax.A, ks, viscosity);
  const areaMax = (coeffC * intensityMs) > 0 ? hydMax.q / (coeffC * intensityMs) : 0;

  // --- PASO B: LÍMITE INFERIOR (MIN) ---
  // Target: Tau = 0.15
  // 0.15 = 1000 * Rh * S  => Rh_target = 0.15 / (1000 * S)
  const RhTarget = MIN_TRACTIVE_FORCE / (GAMMA_WATER * S);
  
  let yMinFound = 0;
  let found = false;

  // Iteration parameters
  // Search from very low depth up to 0.85D
  const steps = 200;
  const stepSize = yMax / steps;

  for (let i = 1; i <= steps; i++) {
    const yTest = i * stepSize;
    const geomTest = getGeometry(D, yTest);
    
    // As hydraulic radius generally increases with depth (up to ~0.81D), 
    // the first time we cross RhTarget is our minimum depth.
    if (geomTest.Rh >= RhTarget) {
      yMinFound = yTest;
      found = true;
      break;
    }
  }

  // If we never reached the target Rh within 0.85D, the pipe is invalid 
  // (though theoretically if tauMax >= 0.15, we should have found it, 
  // unless 0.85D is strictly the only point meeting it, handling edge cases).
  if (!found) {
     return {
      isValid: false,
      failReason: 'LOW_TAU_MAX', // Should technically be rare if max passed
      tauMax: tauMax,
      slope: slopePercent
    } as any;
  }

  // Calculate hydraulics for yMin
  const geomMin = getGeometry(D, yMinFound);
  const hydMin = calculateHydraulics(geomMin.Rh, S, geomMin.A, ks, viscosity);
  const areaMin = (coeffC * intensityMs) > 0 ? hydMin.q / (coeffC * intensityMs) : 0;

  // Validating Range Logic
  if (areaMin > areaMax) {
    // This is physically odd in standard circular pipes (Q increases with y), 
    // but just in case of numerical instability.
    return {
      isValid: false,
      failReason: 'MIN_GREATER_THAN_MAX',
      tauMax: tauMax,
      slope: slopePercent
    } as any;
  }

  return {
    isValid: true,
    areaMax: areaMax,
    areaMin: areaMin,
    qMax: hydMax.q * 1000, // L/s
    qMin: hydMin.q * 1000, // L/s
    tauMax: tauMax,
    slope: slopePercent
  };
};

export const calculateAll = (inputs: CalculationInput, pipes: PipeDef[], slopes: number[]) => {
  return pipes.map(pipe => {
    const results: { [key: string]: ResultCell } = {};
    slopes.forEach(slope => {
      results[slope.toString()] = calculateCell(pipe, slope, inputs);
    });
    return { pipe, results };
  });
};