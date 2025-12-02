
import type { PotablePipe } from './types';

/**
 * Tabla de diámetros comerciales para tuberías de agua potable a presión.
 * Contiene el diámetro nominal en pulgadas/mm y el diámetro interno (ID) real en mm.
 * Referencia: PVC Cédula 40 (SCH40).
 */
export const PVC_SCH40_PIPES: PotablePipe[] = [
  { nominal: '1/2"', nominal_mm: 15, id_mm: 15.7 },
  { nominal: '3/4"', nominal_mm: 20, id_mm: 20.9 },
  { nominal: '1"', nominal_mm: 25, id_mm: 26.6 },
  { nominal: '1 1/4"', nominal_mm: 32, id_mm: 35.0 },
  { nominal: '1 1/2"', nominal_mm: 40, id_mm: 40.8 },
  { nominal: '2"', nominal_mm: 50, id_mm: 52.4 },
  { nominal: '2 1/2"', nominal_mm: 65, id_mm: 62.6 },
  { nominal: '3"', nominal_mm: 80, id_mm: 77.9 },
  { nominal: '4"', nominal_mm: 100, id_mm: 102.2 },
];

/**
 * Lista de diámetros comerciales estándar para tuberías de desagüe por gravedad.
 * Unidades en milímetros (mm).
 * Referencia: PVC Sanitario.
 */
export const PVC_SANITARY_PIPES_MM: number[] = [40, 50, 75, 110, 160, 200];
