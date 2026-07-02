import { Metadata, NumericId, Timestamp } from './types';

export type EventId = string;

export interface ApiRequest<T extends object = object> {
  readonly action: string;
  readonly payload: T;
  readonly userId: NumericId;
  readonly sessionId: NumericId;
  readonly containerId: NumericId;
  readonly moduleId: NumericId;
  readonly metadata?: Metadata;
}

export interface PlatformEvent<T extends object = object> {
  readonly eventId: EventId;
  readonly numericId: NumericId;
  readonly type: string;
  readonly timestamp: Timestamp;
  readonly userId: NumericId;
  readonly sessionId: NumericId;
  readonly containerId: NumericId;
  readonly moduleId: NumericId;
  readonly payload: T;
  readonly metadata?: Metadata;
}

export const RAW_EVENT_CHANNEL = 'core.event.raw';
export const PROCESSED_EVENT_CHANNEL = 'core.event.processed';
export const EVENT_RECORD_TYPE = 'platform.event';
