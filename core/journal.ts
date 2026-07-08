import { NumericId } from './types';

export interface JournalEntry {
  readonly id: NumericId;
  readonly coordinate: string;
  readonly so8fiCode: string;
  readonly identityId: NumericId;
  readonly intent: string;
  readonly protocol: string;
  readonly event: Readonly<{
    readonly eventId: string;
    readonly eventType: string;
  }>;
  readonly businessResult: unknown;
  readonly notificationResult: unknown;
  readonly hash: string;
  readonly signature: string;
  readonly version: string;
}

export interface JournalQuery {
  readonly identityId?: NumericId;
  readonly intent?: string;
  readonly protocol?: string;
  readonly fromCoordinate?: string;
  readonly toCoordinate?: string;
  readonly version?: string;
}

export interface JournalReader {
  readAll(): readonly JournalEntry[];
  readById(id: NumericId): JournalEntry | undefined;
  query(filter: JournalQuery): readonly JournalEntry[];
}

export interface JournalWriter {
  append(entry: Omit<JournalEntry, 'id'>): JournalEntry;
}

export interface Journal extends JournalReader, JournalWriter {}
