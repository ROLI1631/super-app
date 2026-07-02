import { Metadata, NumericId, Timestamp } from './types';

export interface EventMessage<T = object> {
  readonly type: string;
  readonly payload: T;
  readonly sourceId?: NumericId;
  readonly timestamp: Timestamp;
  readonly metadata?: Metadata;
}

export type EventHandler<T extends object = object> = (event: EventMessage<T>) => void | Promise<void>;

export interface EventBus {
  publish<T extends object>(event: EventMessage<T>): Promise<void>;
  subscribe<T extends object>(type: string, handler: EventHandler<T>): void;
  unsubscribe<T extends object>(type: string, handler: EventHandler<T>): void;
}
