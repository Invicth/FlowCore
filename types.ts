

export interface PipeDef {
  nombre: string;
  id_mm: number;
}

export interface CalculationInput {
  intensity: number; // mm/hr
  coeffC: number;    // dimensionless
  ks: number;        // meters
  viscosity: number; // m^2/s
  fillRatio: number; // percentage (0-100)
}

export interface ResultCell {
  isValid: boolean;
  failReason?: 'LOW_TAU_MAX' | 'MIN_GREATER_THAN_MAX'; // Reason for failure
  areaMax?: number;  // m^2 (Calculated at y/D max)
  areaMin?: number;  // m^2 (Calculated at y where Tau = 0.15)
  qMax?: number;     // L/s (at y/D max)
  qMin?: number;     // L/s (at min depth)
  tauMax: number;    // kg/m^2 (at y/D max)
  slope: number;     // %
}

export interface ResultRow {
  pipe: PipeDef;
  results: {
    [slopeKey: string]: ResultCell;
  };
}

export enum Slope {
  S05 = 0.5,
  S10 = 1.0,
  S20 = 2.0
}

export interface HunterDataPoint {
  units: number;
  caudal: number;
}

export interface PotablePipe {
  nominal: string;
  nominal_mm: number;
  id_mm: number;
}

export interface PotableWaterResult {
  theoreticalDiameter: number;
  commercialPipe: PotablePipe;
}

export interface DrainageResult {
  recommendedDiameter: number;
  flowVelocity: number;
  pipeCapacityLps: number;
  waterHeight: number;
}