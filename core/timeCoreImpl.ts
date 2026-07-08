import { createHash } from 'crypto';
import { JournalEntry, JournalWriter } from './journal';
import { Metadata, NumericId, RecordType, Timestamp } from './types';
import { TimeCore } from './timeCore';
import { TemporalKernel } from './temporal/TemporalKernel';

export type TimeIdGenerator = () => NumericId;

export class DefaultTimeCore implements TimeCore {
  constructor(
    private readonly journal: JournalWriter,
    private readonly temporalKernel: TemporalKernel,
  ) {}

  now(): Timestamp {
    return this.temporalKernel.peek();
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
    if (this.temporalKernel.validateCoordinate(timestamp)) {
      throw new Error('Temporal coordinates are numeric movement values and cannot be parsed as Date');
    }

    if (!this.isValidTimestamp(timestamp)) {
      throw new Error(`Invalid timestamp value: ${timestamp}`);
    }

    return new Date(timestamp);
  }

  isValidTimestamp(value: string): boolean {
    return this.temporalKernel.validateCoordinate(value) || !Number.isNaN(Date.parse(value));
  }

  nextCoordinate(identityId: NumericId) {
    return this.temporalKernel.next(identityId);
  }

  record(
    payload: object,
    recordType: RecordType,
    recorderId: NumericId,
    metadata?: Metadata,
  ): JournalEntry {
    const coordinate = this.temporalKernel.next(recorderId).serialize();
    const canonicalPayload = JSON.stringify({ payload, metadata: metadata ?? {} });
    const so8fiCode = `SO8FI.${Buffer.from(canonicalPayload, 'utf8').toString('base64url')}`;
    const intent = (payload as { readonly type?: string })?.type ?? recordType;
    const eventId = (payload as { readonly eventId?: string })?.eventId ?? `journal:${coordinate}`;
    const eventType = (payload as { readonly type?: string })?.type ?? recordType;
    const hash = createHash('sha256')
      .update(`${recorderId}|${recordType}|${coordinate}|${so8fiCode}`)
      .digest('hex');

    return this.journal.append({
      coordinate,
      so8fiCode,
      identityId: recorderId,
      intent,
      protocol: recordType,
      event: {
        eventId,
        eventType,
      },
      businessResult: null,
      notificationResult: null,
      hash,
      signature: `sig:${hash}`,
      version: this.temporalKernel.version(),
    });
  }
}
