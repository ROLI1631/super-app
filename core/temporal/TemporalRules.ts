export const TEMPORAL_LAWS = Object.freeze([
  'Independence',
  'Continuity',
  'NumericNature',
  'UniqueCoordinate',
  'CarryOver',
  'PresentationIndependence',
  'UniversalMotionOrder',
]);

export const TEMPORAL_GEAR_CAPACITIES = Object.freeze([
  10000, // G1 Global Cycle
  10000, // G2 Cycle
  364,   // G3 Register
  24,    // G4 Register
  60,    // G5 Register
  60,    // G6 Register
  100,   // G7 Register
  1000,  // G8 Register
] as const);

export const TEMPORAL_GEAR_WIDTHS = Object.freeze([
  4,
  4,
  3,
  2,
  2,
  2,
  2,
  4,
] as const);

export const TEMPORAL_SEPARATOR = '.';
export const TEMPORAL_VERSION = 'SAS-TIME-100.v1.0';
