import { ApiRequest, PlatformEvent } from './event';
import { NumericIndex } from '../engines/numericIndex';
import { Timestamp } from './types';

export interface EventProtocol {
  build<T extends object>(request: ApiRequest<T>): PlatformEvent<T>;
}

function deepFreeze<T extends object>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach((child) => {
    if (typeof child === 'object' && child !== null) {
      deepFreeze(child as T);
    }
  });

  return value;
}

export class DefaultProtocol implements EventProtocol {
  constructor(
    private readonly numericIndex: NumericIndex,
    private readonly clock: () => Timestamp,
  ) {}

  build<T extends object>(request: ApiRequest<T>): PlatformEvent<T> {
    const numericId = this.numericIndex.nextId('event');
    const event: PlatformEvent<T> = {
      eventId: `event:${numericId}`,
      numericId,
      type: request.action,
      timestamp: this.clock(),
      userId: request.userId,
      sessionId: request.sessionId,
      containerId: request.containerId,
      moduleId: request.moduleId,
      payload: request.payload,
      metadata: request.metadata,
    };

    return deepFreeze(event);
  }
}
