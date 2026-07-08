import { TEMPORAL_GEAR_CAPACITIES, TEMPORAL_GEAR_WIDTHS, TEMPORAL_VERSION } from './TemporalRules';

export interface TemporalConfig {
  readonly capacities: readonly number[];
  readonly widths: readonly number[];
  readonly version: string;
}

export const DEFAULT_TEMPORAL_CONFIG: TemporalConfig = Object.freeze({
  capacities: [...TEMPORAL_GEAR_CAPACITIES],
  widths: [...TEMPORAL_GEAR_WIDTHS],
  version: TEMPORAL_VERSION,
});
