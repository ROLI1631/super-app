import { Metadata, NumericId, RecordType, Timestamp } from './types';

export interface JournalEntry<T extends object = object> {
  readonly id: NumericId;
  readonly createdAt: Timestamp;
  readonly recorderId: NumericId;
  readonly recordType: RecordType;
  readonly payload: T;
  readonly metadata?: Metadata;
}

export interface JournalQuery {
  readonly recordType?: RecordType;
  readonly recorderId?: NumericId;
  readonly since?: Timestamp;
  readonly until?: Timestamp;
}

export interface JournalReader {
  readAll(): readonly JournalEntry<object>[];
  readById(id: NumericId): JournalEntry<object> | undefined;
  query(filter: JournalQuery): readonly JournalEntry<object>[];
}

export interface JournalWriter {
  append(entry: Omit<JournalEntry<object>, 'createdAt'>): JournalEntry<object>;
}

export interface Journal extends JournalReader, JournalWriter {}
