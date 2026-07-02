import { JournalEntry, JournalWriter } from './journal';
import { Metadata, NumericId, RecordType, Timestamp } from './types';
import { TimeCore } from './timeCore';

export type TimeIdGenerator = () => NumericId;

export class DefaultTimeCore implements TimeCore {
  constructor(
    private readonly journal: JournalWriter,
    private readonly generateId: TimeIdGenerator,
    private readonly clock: () => Timestamp = () => new Date().toISOString(),
  ) {}

  now(): Timestamp {
    return this.clock();
  }

  toTimestamp(value: Date | string | number): Timestamp {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }

    if (!this.isValidTimestamp(value)) {
      throw new Error(`Invalid timestamp value: ${value}`);
    }

    return new Date(value).toISOString();
  }

  parse(timestamp: Timestamp): Date {
    if (!this.isValidTimestamp(timestamp)) {
      throw new Error(`Invalid timestamp value: ${timestamp}`);
    }

    return new Date(timestamp);
  }

  isValidTimestamp(value: string): boolean {
    return !Number.isNaN(Date.parse(value));
  }

  record(
    payload: object,
    recordType: RecordType,
    recorderId: NumericId,
    metadata?: Metadata,
  ): JournalEntry<object> {
    const entry: Omit<JournalEntry<object>, 'createdAt'> = {
      id: this.generateId(),
      recorderId,
      recordType,
      payload,
      metadata,
    };

    return this.journal.append(entry);
  }
}
