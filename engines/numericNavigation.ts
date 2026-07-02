import { AlphabetEngine } from './alphabetEngine';
import { NumericUniverseRegistry } from './numericUniverse';
import { NavigationCore } from '../core/navigationCore';
import { EventProtocol } from '../core/protocol';
import { EventBus } from '../core/eventBus';
import { ApiRequest } from '../core/event';

export interface NumericNavigator {
  resolveTargetByText(text: string, entityKind: string): number | undefined;
  navigateAndDispatch<T extends object>(
    text: string,
    entityKind: string,
    requestBuilder: (id: number) => ApiRequest<T>,
  ): Promise<void>;
}

export class DefaultNumericNavigator implements NumericNavigator {
  constructor(
    private readonly alphabet: AlphabetEngine,
    private readonly universe: NumericUniverseRegistry,
    private readonly navigation: NavigationCore,
    private readonly protocol: EventProtocol,
    private readonly bus: EventBus,
  ) {}

  resolveTargetByText(text: string, entityKind: string): number | undefined {
    const lang = this.alphabet.detectLanguage(text);
    const normalized = this.alphabet.normalizeWord(text, lang);

    // Attempt dictionary lookup
    const entry = this.alphabet.lookupDictionary(normalized, lang);
    if (entry) return entry.numericId;

    // Attempt numeric universe label match
    try {
      const json = this.universe.exportJson();
      const nodes = JSON.parse(json) as Array<Record<string, unknown>>;
      const found = nodes.find((n) => String(n.label).toLowerCase() === normalized.toLowerCase());
      if (found && typeof found['id'] === 'number') return found['id'] as number;
    } catch (e) {
      // ignore
    }

    // fallback: compute id from alphabet engine
    return this.alphabet.wordToNumericId(normalized, lang);
  }

  async navigateAndDispatch<T extends object>(
    text: string,
    entityKind: string,
    requestBuilder: (id: number) => ApiRequest<T>,
  ): Promise<void> {
    const id = this.resolveTargetByText(text, entityKind);
    if (!id) throw new Error('Unable to resolve target');

    const request = requestBuilder(id);
    const event = this.protocol.build(request);
    await this.bus.publish({ type: 'core.event.raw', payload: event, timestamp: event.timestamp, sourceId: event.moduleId, metadata: event.metadata });
  }
}
