import { EventBus, EventHandler, EventMessage } from './eventBus';
import { TimeCore } from './timeCore';
import { Journal } from './journal';
import {
  EVENT_RECORD_TYPE,
  PlatformEvent,
  PROCESSED_EVENT_CHANNEL,
  RAW_EVENT_CHANNEL,
} from './event';

export interface MetadataEnricher {
  enrich(payload: unknown, metadata: Record<string, unknown> | undefined): Record<string, unknown>;
}

export interface EventPipeline {
  subscribe(handler: EventHandler<PlatformEvent>): void;
  unsubscribe(handler: EventHandler<PlatformEvent>): void;
}

export class DefaultEventPipeline implements EventPipeline {
  private readonly handlerMap = new Map<EventHandler<PlatformEvent>, EventHandler<PlatformEvent>>();
  constructor(
    private readonly eventBus: EventBus,
    private readonly timeCore: TimeCore,
    private readonly journal: Journal,
    private readonly metadataEnricher?: MetadataEnricher,
  ) {
    this.eventBus.subscribe(RAW_EVENT_CHANNEL, this.handleRawEvent.bind(this));
  }

  subscribe(handler: EventHandler<PlatformEvent>): void {
    const wrapped: EventHandler<PlatformEvent> = (message) => handler(message as EventMessage<PlatformEvent>);
    this.handlerMap.set(handler, wrapped);
    this.eventBus.subscribe(PROCESSED_EVENT_CHANNEL, wrapped);
  }

  unsubscribe(handler: EventHandler<PlatformEvent>): void {
    const wrapped = this.handlerMap.get(handler);
    if (wrapped) {
      this.eventBus.unsubscribe(PROCESSED_EVENT_CHANNEL, wrapped);
      this.handlerMap.delete(handler);
    }
  }

  private async handleRawEvent(eventMessage: EventMessage<PlatformEvent>): Promise<void> {
    const event = eventMessage.payload;

    const journalEntry = this.timeCore.record(event, EVENT_RECORD_TYPE, event.userId, event.metadata);

    const enrichedMetadata = this.metadataEnricher
      ? this.metadataEnricher.enrich(event.payload, event.metadata)
      : event.metadata;

    const processedEvent = {
      ...event,
      journalId: journalEntry.id,
      timestamp: journalEntry.coordinate,
      coordinate: journalEntry.coordinate,
      so8fiCode: journalEntry.so8fiCode,
      hash: journalEntry.hash,
      metadata: enrichedMetadata,
    } as PlatformEvent;

    await this.eventBus.publish({
      type: PROCESSED_EVENT_CHANNEL,
      payload: processedEvent,
      timestamp: journalEntry.coordinate,
      sourceId: event.moduleId,
      metadata: enrichedMetadata,
    });
  }

}
