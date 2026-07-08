import { DefaultNavigationCore } from './navigationCoreImpl';
import { DefaultTimeCore } from './timeCoreImpl';
import { InMemoryIdentityCore } from './identityCoreImpl';
import { InMemoryJournal } from './journalImpl';
import { InProcessEventBus } from './eventBusImpl';
import { DefaultProtocol } from './protocol';
import { DefaultEventPipeline, MetadataEnricher } from './eventPipeline';
import { DefaultProtocolEngine, ProtocolEngine } from './protocolEngine';
import { NumericId, Timestamp } from './types';
import { createTemporalKernelFromJournal, TemporalKernel } from './temporal/TemporalFactory';

export interface CoreServices {
  readonly journal: InMemoryJournal;
  readonly eventBus: InProcessEventBus;
  readonly timeCore: DefaultTimeCore;
  readonly temporalKernel: TemporalKernel;
  readonly identityCore: InMemoryIdentityCore;
  readonly navigationCore: DefaultNavigationCore;
  readonly protocol: DefaultProtocol;
  readonly protocolEngine: ProtocolEngine;
  readonly eventPipeline: DefaultEventPipeline;
}

const defaultRoutes = {
  user: '/user/:id/:label',
  business: '/business/:id/:label',
};

const generateNumericId = (() => {
  let counter = 0;
  return (): NumericId => {
    counter += 1;
    return counter;
  };
})();

const timestampProvider = (): Timestamp => new Date().toISOString();

export interface CoreFactoryOptions {
  readonly metadataEnricher?: MetadataEnricher;
}

export function createDefaultCoreServices(options: CoreFactoryOptions = {}): CoreServices {
  const createJournal = () => new InMemoryJournal();
  const createEventBus = () => new InProcessEventBus();
  const createTimeCore = (journal: InMemoryJournal, temporal: TemporalKernel) => new DefaultTimeCore(journal, temporal);
  const createIdentityCore = () => new InMemoryIdentityCore(generateNumericId, timestampProvider);
  const createNavigationCore = () => new DefaultNavigationCore(defaultRoutes, '/');
  const createProtocol = () => new DefaultProtocol({
    nextId: () => generateNumericId(),
  } as any, timestampProvider);
  const createProtocolEngine = () => new DefaultProtocolEngine();
  const createEventPipeline = (bus: InProcessEventBus, time: DefaultTimeCore, journalInst: InMemoryJournal) =>
    new DefaultEventPipeline(bus, time, journalInst, options.metadataEnricher);

  const journal = createJournal();
  const temporalKernel = createTemporalKernelFromJournal(journal);
  const eventBus = createEventBus();
  const timeCore = createTimeCore(journal, temporalKernel);
  const identityCore = createIdentityCore();
  const navigationCore = createNavigationCore();
  const protocol = createProtocol();
  const protocolEngine = createProtocolEngine();
  const eventPipeline = createEventPipeline(eventBus, timeCore, journal);

  return {
    journal,
    eventBus,
    timeCore,
    temporalKernel,
    identityCore,
    navigationCore,
    protocol,
    protocolEngine,
    eventPipeline,
  };
}

