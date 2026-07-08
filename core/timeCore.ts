import { JournalEntry } from './journal';
import { Metadata, NumericId, RecordType, Timestamp } from './types';
import { Coordinate } from './temporal/Coordinate';

export interface TimeCore {
  now(): Timestamp;
  toTimestamp(value: Date | string | number): Timestamp;
  parse(timestamp: Timestamp): Date;
  isValidTimestamp(value: string): boolean;
  nextCoordinate(identityId: NumericId): Coordinate;
  record(
    payload: object,
    recordType: RecordType,
    recorderId: NumericId,
    metadata?: Metadata,
  ): JournalEntry;
}

export interface TimeCoreProvider {
  getTimeCore(): TimeCore;
}
