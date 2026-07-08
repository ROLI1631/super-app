import { DEFAULT_TEMPORAL_CONFIG, TemporalConfig } from './TemporalConfig';
import { DefaultTemporalKernel, TemporalKernel } from './TemporalKernel';
import { TemporalValidator } from './TemporalValidator';
import { JournalReader } from '../journal';

export type { TemporalKernel } from './TemporalKernel';

export function createTemporalKernel(config: TemporalConfig = DEFAULT_TEMPORAL_CONFIG): TemporalKernel {
  const validator = new TemporalValidator();
  return new DefaultTemporalKernel(config, validator);
}

export function createTemporalKernelFromJournal(
  journal: JournalReader,
  config: TemporalConfig = DEFAULT_TEMPORAL_CONFIG,
): TemporalKernel {
  const validator = new TemporalValidator();
  const entries = journal.readAll();
  const last = entries[entries.length - 1];
  const initialCoordinate = last?.coordinate;
  return new DefaultTemporalKernel(config, validator, initialCoordinate);
}
