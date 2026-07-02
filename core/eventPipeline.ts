import { EventBus, EventHandler, EventMessage } from './eventBus';
import { TimeCore } from './timeCore';
import { Journal } from './journal';
import { AlphabetEngine } from '../engines/alphabetEngine';
import {
  EVENT_RECORD_TYPE,
  PlatformEvent,
  PROCESSED_EVENT_CHANNEL,
  RAW_EVENT_CHANNEL,
} from './event';

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
    private readonly alphabetEngine?: AlphabetEngine,
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

    this.timeCore.record(event, EVENT_RECORD_TYPE, event.moduleId, event.metadata);

    const enrichedMetadata = this.alphabetEngine
      ? this.enrichWithAlphabet(event.payload, event.metadata)
      : event.metadata;

    const processedEvent = {
      ...event,
      metadata: enrichedMetadata,
    } as PlatformEvent;

    await this.eventBus.publish({
      type: PROCESSED_EVENT_CHANNEL,
      payload: processedEvent,
      timestamp: event.timestamp,
      sourceId: event.moduleId,
      metadata: enrichedMetadata,
    });
  }

  private enrichWithAlphabet(payload: unknown, metadata: Record<string, unknown> | undefined) {
    const results: Record<string, unknown> = {};

    const walk = (node: unknown, path: string) => {
      if (node === null || node === undefined) return;
      if (typeof node === 'string') {
        const value = node as string;
        const language = this.alphabetEngine!.detectLanguage(value);
        const normalized = this.alphabetEngine!.normalizeWord(value, language);
        const tokens = this.alphabetEngine!.textToTokenIds(value, language);
        const numericId = this.alphabetEngine!.textToNumericId(value, language);
        const phraseTree = this.alphabetEngine!.parsePhrases(value, language);
        const searchGraph = this.alphabetEngine!.buildSearchGraph(value, language);

        results[path] = {
          original: value,
          normalized,
          language,
          tokens,
          numericId,
          phraseTree,
          searchGraph,
        };

        return;
      }

      if (Array.isArray(node)) {
        node.forEach((child, idx) => walk(child, `${path}[${idx}]`));
        return;
      }

      if (typeof node === 'object') {
        Object.entries(node as Record<string, unknown>).forEach(([k, v]) => {
          const nextPath = path ? `${path}.${k}` : k;
          walk(v, nextPath);
        });
        return;
      }
    };

    walk(payload, 'payload');

    const alphabetMeta = { alphabet: results };
    return Object.freeze({ ...(metadata || {}), ...alphabetMeta });
  }
}
