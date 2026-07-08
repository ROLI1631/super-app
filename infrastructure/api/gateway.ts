import { ApiRequest, PlatformEvent, RAW_EVENT_CHANNEL } from '../../core/event';
import { EventBus, EventMessage } from '../../core/eventBus';
import { EventProtocol } from '../../core/protocol';
import { ProtocolEngine, ProtocolExecutionContext } from '../../core/protocolEngine';

export type RequestValidator = <T extends object>(request: ApiRequest<T>) => boolean;

export interface ApiGateway {
  dispatch<T extends object>(request: ApiRequest<T>): Promise<PlatformEvent<T>>;
}

export class DefaultApiGateway implements ApiGateway {
  constructor(
    private readonly eventBus: EventBus,
    private readonly protocol: EventProtocol,
    private readonly protocolEngine?: ProtocolEngine,
    private readonly validator?: RequestValidator,
  ) {}

  async dispatch<T extends object>(request: ApiRequest<T>): Promise<PlatformEvent<T>> {
    if (this.validator && !this.validator(request)) {
      throw new Error('Invalid request');
    }

    const context: ProtocolExecutionContext = {
      userId: request.userId,
      sessionId: request.sessionId,
      moduleId: request.moduleId,
    };

    if (this.protocolEngine) {
      const result = await this.protocolEngine.execute(request, context);
      if (!result.allowed) {
        throw new Error('Request not allowed by protocol engine');
      }

      // Merge any protocol metadata into request.metadata
      request = {
        ...request,
        metadata: { ...(request.metadata || {}), ...(result.metadata || {}) },
      } as ApiRequest<T>;
    }

    const event: PlatformEvent<T> = this.protocol.build(request);
    const message: EventMessage<PlatformEvent<T>> = {
      type: RAW_EVENT_CHANNEL,
      payload: event,
      timestamp: event.timestamp,
      sourceId: event.moduleId,
      metadata: event.metadata,
    };

    await this.eventBus.publish(message);
    return event;
  }
}
