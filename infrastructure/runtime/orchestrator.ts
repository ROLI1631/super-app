import { ApiRequest, PlatformEvent, PROCESSED_EVENT_CHANNEL } from '../../core/event';
import { EventBus, EventMessage } from '../../core/eventBus';
import { IdentityCore } from '../../core/identityCore';
import { ApiGateway } from '../api/gateway';
import { UniversalDecoder, UniversalDecodedView } from '../../engines/so8fi/universalDecoder';
import { BusinessRuntimeRouter } from './businessRouter';
import { NotificationEngine, NotificationRecord } from './notificationEngine';

export interface RuntimeExecutionResult {
  readonly eventId: string;
  readonly coordinate: string;
  readonly so8fiCode: string;
  readonly hash: string;
  readonly journalId: number;
  readonly result: unknown;
  readonly notification: NotificationRecord;
  readonly decoded: UniversalDecodedView;
}

export interface RuntimeOrchestrator {
  execute<T extends object>(request: ApiRequest<T>): Promise<RuntimeExecutionResult>;
}

export class DefaultRuntimeOrchestrator implements RuntimeOrchestrator {
  constructor(
    private readonly identityCore: IdentityCore,
    private readonly apiGateway: ApiGateway,
    private readonly eventBus: EventBus,
    private readonly businessRouter: BusinessRuntimeRouter,
    private readonly notificationEngine: NotificationEngine,
    private readonly universalDecoder: UniversalDecoder,
  ) {}

  async execute<T extends object>(request: ApiRequest<T>): Promise<RuntimeExecutionResult> {
    const identity = this.identityCore.resolveIdentity(request.userId);
    if (!identity) {
      throw new Error(`Identity not found for request user: ${request.userId}`);
    }

    const processedEventPromise = this.waitForProcessedEvent();
    const rawEvent = await this.apiGateway.dispatch(request);
    const processedEvent = await processedEventPromise;

    if (processedEvent.eventId !== rawEvent.eventId) {
      throw new Error(`Processed event mismatch: expected ${rawEvent.eventId}, got ${processedEvent.eventId}`);
    }

    const result = await this.businessRouter.execute(
      processedEvent.type,
      processedEvent.payload as Record<string, unknown>,
      {
        userId: processedEvent.userId,
        sessionId: processedEvent.sessionId,
        moduleId: processedEvent.moduleId,
        containerId: processedEvent.containerId,
      },
    );

    if (!processedEvent.coordinate || !processedEvent.so8fiCode || !processedEvent.hash || !processedEvent.journalId) {
      throw new Error('Processed event is missing temporal or SO8FI envelope data');
    }

    const notification = await this.notificationEngine.notify({
      userId: processedEvent.userId,
      eventId: processedEvent.eventId,
      coordinate: processedEvent.coordinate,
      so8fiCode: processedEvent.so8fiCode,
      hash: processedEvent.hash,
    });

    const decoded = this.universalDecoder.decodeFromJournal(processedEvent.journalId);

    return {
      eventId: processedEvent.eventId,
      coordinate: processedEvent.coordinate,
      so8fiCode: processedEvent.so8fiCode,
      hash: processedEvent.hash,
      journalId: processedEvent.journalId,
      result,
      notification,
      decoded,
    };
  }

  private waitForProcessedEvent(): Promise<PlatformEvent<object>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.eventBus.unsubscribe(PROCESSED_EVENT_CHANNEL, handler);
        reject(new Error('Timed out waiting for processed event'));
      }, 5000);

      const handler = (message: EventMessage<PlatformEvent<object>>) => {
        clearTimeout(timer);
        this.eventBus.unsubscribe(PROCESSED_EVENT_CHANNEL, handler);
        resolve(message.payload);
      };

      this.eventBus.subscribe(PROCESSED_EVENT_CHANNEL, handler);
    });
  }
}
