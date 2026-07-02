import { JournalEntry, JournalWriter } from './journal';
import { Metadata, NumericId, RecordType, Timestamp } from './types';

export interface TimeCore {
  now(): Timestamp;
  toTimestamp(value: Date | string | number): Timestamp;
  parse(timestamp: Timestamp): Date;
  isValidTimestamp(value: string): boolean;
  record(
    payload: object,
    recordType: RecordType,
    recorderId: NumericId,
    metadata?: Metadata,
  ): JournalEntry<object>;
}

export interface TimeCoreProvider {
  getTimeCore(): TimeCore;
}
