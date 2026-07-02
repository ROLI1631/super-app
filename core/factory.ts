import { DefaultNavigationCore } from './navigationCoreImpl';
import { DefaultTimeCore } from './timeCoreImpl';
import { InMemoryIdentityCore } from './identityCoreImpl';
import { InMemoryJournal } from './journalImpl';
import { InProcessEventBus } from './eventBusImpl';
import { IncrementalNumericIndex } from '../engines/numericIndexImpl';
import { SimpleAlphabetEngine } from '../engines/alphabetEngineImpl';
import { InMemoryNumericUniverse } from '../engines/numericUniverseImpl';
import { DefaultProtocol } from './protocol';
import { DefaultEventPipeline } from './eventPipeline';
import { DefaultApiGateway } from '../api/gateway';
import { DefaultProtocolEngine, ProtocolEngine } from './protocolEngine';
import { DefaultNumericNavigator, NumericNavigator } from '../engines/numericNavigation';
import { InMemoryCatalog } from '../engines/catalogImpl';
import { CatalogRegistry } from '../engines/catalog';
import { InMemoryAttributeEngine } from '../engines/attributeEngineImpl';
import { CatalogApi } from '../api/catalogApi';
import { createInMemoryMarketplace } from '../engines/marketplaceImpl';
import { MarketplaceService } from '../engines/marketplace';
import { createInMemoryFinance } from '../engines/financeImpl';
import { WalletRegistry, BalanceEngine, Ledger, AccountingEngine } from '../engines/finance';
import { NumericId, Timestamp } from './types';

export interface CoreServices {
  readonly journal: InMemoryJournal;
  readonly eventBus: InProcessEventBus;
  readonly timeCore: DefaultTimeCore;
  readonly identityCore: InMemoryIdentityCore;
  readonly navigationCore: DefaultNavigationCore;
  readonly numericIndex: IncrementalNumericIndex;
  readonly alphabetEngine: SimpleAlphabetEngine;
  readonly numericUniverse: InMemoryNumericUniverse;
  readonly protocol: DefaultProtocol;
  readonly protocolEngine: ProtocolEngine;
  readonly eventPipeline: DefaultEventPipeline;
  readonly apiGateway: DefaultApiGateway;
  readonly numericNavigator: NumericNavigator;
  readonly catalog: CatalogRegistry;
  readonly attributeEngine: InMemoryAttributeEngine;
  readonly catalogApi: CatalogApi;
  readonly marketplace: MarketplaceService;
  readonly walletRegistry: WalletRegistry;
  readonly balanceEngine: BalanceEngine;
  readonly ledger: Ledger;
  readonly accountingEngine: AccountingEngine;
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

export function createDefaultCoreServices(): CoreServices {
  // Providers (dependency injection style)
  const createJournal = () => new InMemoryJournal();
  const createEventBus = () => new InProcessEventBus();
  const createNumericIndex = () => new IncrementalNumericIndex();
  const createNumericUniverse = () => new InMemoryNumericUniverse();
  const createAlphabetEngine = (universe: InMemoryNumericUniverse) => new SimpleAlphabetEngine(['en'], universe);
  const createTimeCore = (journal: InMemoryJournal) => new DefaultTimeCore(journal, generateNumericId, timestampProvider);
  const createIdentityCore = () => new InMemoryIdentityCore(generateNumericId, timestampProvider);
  const createNavigationCore = () => new DefaultNavigationCore(defaultRoutes, '/');
  const createProtocol = (index: IncrementalNumericIndex) => new DefaultProtocol(index, timestampProvider);
  const createProtocolEngine = () => new DefaultProtocolEngine();
  const createEventPipeline = (bus: InProcessEventBus, time: DefaultTimeCore, journalInst: InMemoryJournal, alphabet: SimpleAlphabetEngine) =>
    new DefaultEventPipeline(bus, time, journalInst, alphabet);
  const createApiGateway = (bus: InProcessEventBus, protocol: DefaultProtocol, protocolEngine: ProtocolEngine) =>
    new DefaultApiGateway(bus, protocol, protocolEngine, (req) => !!req.action && !!req.payload);
  const createNumericNavigator = (
    alphabet: SimpleAlphabetEngine,
    universe: InMemoryNumericUniverse,
    navigation: DefaultNavigationCore,
    protocol: DefaultProtocol,
    bus: InProcessEventBus,
  ) => new DefaultNumericNavigator(alphabet, universe, navigation, protocol, bus);
  const createCatalog = (idGen: () => NumericId, alphabet?: SimpleAlphabetEngine, universe?: InMemoryNumericUniverse) =>
    new InMemoryCatalog(idGen, alphabet, universe);
  const createAttributeEngine = () => new InMemoryAttributeEngine();
  const createCatalogApi = (catalog: CatalogRegistry) => new CatalogApi(catalog);
  const createMarketplace = (bus?: InProcessEventBus, protocolEngine?: ProtocolEngine) => createInMemoryMarketplace(bus, protocolEngine);
  const createFinance = (bus?: InProcessEventBus, protocolEngine?: ProtocolEngine) => createInMemoryFinance(bus, protocolEngine);

  const journal = createJournal();
  const eventBus = createEventBus();
  const numericIndex = createNumericIndex();
  const numericUniverse = createNumericUniverse();
  const alphabetEngine = createAlphabetEngine(numericUniverse);
  const timeCore = createTimeCore(journal);
  const identityCore = createIdentityCore();
  const navigationCore = createNavigationCore();
  const protocol = createProtocol(numericIndex);
  const protocolEngine = createProtocolEngine();
  const eventPipeline = createEventPipeline(eventBus, timeCore, journal, alphabetEngine);
  const apiGateway = createApiGateway(eventBus, protocol, protocolEngine);
  const numericNavigator = createNumericNavigator(alphabetEngine, numericUniverse, navigationCore, protocol, eventBus);
  const catalog = createCatalog(generateNumericId, alphabetEngine, numericUniverse);
  const attributeEngine = createAttributeEngine();
  const catalogApi = createCatalogApi(catalog);
  const marketplace = createMarketplace(eventBus, protocolEngine);
  const finance = createFinance(eventBus, protocolEngine);

  return {
    journal,
    eventBus,
    timeCore,
    identityCore,
    navigationCore,
    numericIndex,
    alphabetEngine,
    numericUniverse,
    protocol,
    protocolEngine,
    eventPipeline,
    apiGateway,
    numericNavigator,
    catalog,
    attributeEngine,
    catalogApi,
    marketplace,
    walletRegistry: finance.walletRegistry,
    balanceEngine: finance.balanceEngine,
    ledger: finance.ledger,
    accountingEngine: finance.accountingEngine,
  };
}

