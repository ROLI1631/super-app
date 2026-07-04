import { ApiRequest, PlatformEvent } from './event';
import { NumericId, Timestamp } from './types';

export interface NumericIdProvider {
  nextId(): NumericId;
}

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
    private readonly numericIdProvider: NumericIdProvider,
    private readonly clock: () => Timestamp,
  ) {}

  build<T extends object>(request: ApiRequest<T>): PlatformEvent<T> {
    const numericId = this.numericIdProvider.nextId();
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
