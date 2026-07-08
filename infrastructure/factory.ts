import { createDefaultCoreServices, CoreServices } from '../core/factory';
import { DefaultApiGateway } from './api/gateway';
import { CatalogApi } from './api/catalogApi';
import { createMarketplaceApi, MarketplaceApi } from './api/marketplaceApi';
import { createFinanceApi, FinanceApi } from './api/financeApi';
import { createInMemoryMarketplace } from '../engines/marketplaceImpl';
import { createInMemoryFinance } from '../engines/financeImpl';
import { DefaultNumericNavigator } from '../engines/numericNavigation';
import { InMemoryCatalog } from '../engines/catalogImpl';
import { InMemoryAttributeEngine } from '../engines/attributeEngineImpl';
import { IncrementalNumericIndex } from '../engines/numericIndexImpl';
import { SimpleAlphabetEngine } from '../engines/alphabetEngineImpl';
import { InMemoryNumericUniverse } from '../engines/numericUniverseImpl';
import { DefaultSo8fiCodeEngine } from '../engines/so8fi/so8fiCodeEngineImpl';
import { UniversalEncoder } from '../engines/so8fi/universalEncoder';
import { UniversalDecoder } from '../engines/so8fi/universalDecoder';
import { CatalogRegistry } from '../engines/catalog';
import { MarketplaceService } from '../engines/marketplace';
import { WalletRegistry, BalanceEngine, Ledger, AccountingEngine } from '../engines/finance';
import { NumericId } from '../core/types';
import { DefaultBusinessRuntimeRouter } from './runtime/businessRouter';
import { DefaultNotificationEngine } from './runtime/notificationEngine';
import { DefaultRuntimeOrchestrator, RuntimeOrchestrator } from './runtime/orchestrator';

export interface InfrastructureServices extends CoreServices {
  readonly numericIndex: IncrementalNumericIndex;
  readonly alphabetEngine: SimpleAlphabetEngine;
  readonly numericUniverse: InMemoryNumericUniverse;
  readonly numericNavigator: DefaultNumericNavigator;
  readonly so8fiCodeEngine: DefaultSo8fiCodeEngine;
  readonly universalEncoder: UniversalEncoder;
  readonly universalDecoder: UniversalDecoder;
  readonly catalog: CatalogRegistry;
  readonly attributeEngine: InMemoryAttributeEngine;
  readonly catalogApi: CatalogApi;
  readonly marketplaceApi: MarketplaceApi;
  readonly financeApi: FinanceApi;
  readonly marketplace: MarketplaceService;
  readonly walletRegistry: WalletRegistry;
  readonly balanceEngine: BalanceEngine;
  readonly ledger: Ledger;
  readonly accountingEngine: AccountingEngine;
  readonly apiGateway: DefaultApiGateway;
  readonly notificationEngine: DefaultNotificationEngine;
  readonly runtimeOrchestrator: RuntimeOrchestrator;
}

function createAlphabetMetadataEnricher(alphabetEngine: SimpleAlphabetEngine) {
  return {
    enrich(payload: unknown, metadata: Record<string, unknown> | undefined) {
      const results: Record<string, unknown> = {};

      const walk = (node: unknown, path: string) => {
        if (node === null || node === undefined) return;
        if (typeof node === 'string') {
          const value = node as string;
          const language = alphabetEngine.detectLanguage(value);
          const normalized = alphabetEngine.normalizeWord(value, language);
          const tokens = alphabetEngine.textToTokenIds(value, language);
          const numericId = alphabetEngine.textToNumericId(value, language);
          const phraseTree = alphabetEngine.parsePhrases(value, language);
          const searchGraph = alphabetEngine.buildSearchGraph(value, language);

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
          Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
            const nextPath = path ? `${path}.${key}` : key;
            walk(value, nextPath);
          });
        }
      };

      walk(payload, 'payload');
      return Object.freeze({ ...(metadata || {}), alphabet: results });
    },
  };
}

export function createDefaultInfrastructureServices(): InfrastructureServices {
  const numericUniverse = new InMemoryNumericUniverse();
  const alphabetEngine = new SimpleAlphabetEngine(['en'], numericUniverse);
  const core = createDefaultCoreServices({
    metadataEnricher: createAlphabetMetadataEnricher(alphabetEngine),
  });
  const so8fiCodeEngine = new DefaultSo8fiCodeEngine();
  const universalEncoder = new UniversalEncoder(core.journal, so8fiCodeEngine);
  const universalDecoder = new UniversalDecoder(core.journal, so8fiCodeEngine);

  const numericIndex = new IncrementalNumericIndex();
  const generateNumericId = (() => {
    let counter = 0;
    return (): NumericId => {
      counter += 1;
      return counter;
    };
  })();
  const catalog = new InMemoryCatalog(generateNumericId, alphabetEngine, numericUniverse);
  const attributeEngine = new InMemoryAttributeEngine();
  const marketplace = createInMemoryMarketplace(undefined, core.protocolEngine);
  const finance = createInMemoryFinance(undefined, core.protocolEngine);
  const apiGateway = new DefaultApiGateway(core.eventBus, core.protocol, core.protocolEngine, (req) => !!req.action && !!req.payload);
  const numericNavigator = new DefaultNumericNavigator(alphabetEngine, numericUniverse, core.navigationCore, core.protocol, core.eventBus);
  const businessRouter = new DefaultBusinessRuntimeRouter(
    marketplace,
    catalog,
    finance.walletRegistry,
    finance.balanceEngine,
    finance.accountingEngine,
    finance.ledger,
    numericUniverse,
  );
  const notificationEngine = new DefaultNotificationEngine(core.eventBus);
  const runtimeOrchestrator = new DefaultRuntimeOrchestrator(
    core.identityCore,
    apiGateway,
    core.eventBus,
    businessRouter,
    notificationEngine,
    universalDecoder,
  );
  const catalogApi = new CatalogApi(runtimeOrchestrator);
  const marketplaceApi = createMarketplaceApi(runtimeOrchestrator);
  const financeApi = createFinanceApi(runtimeOrchestrator);

  return {
    ...core,
    numericIndex,
    alphabetEngine,
    numericUniverse,
    numericNavigator,
    so8fiCodeEngine,
    universalEncoder,
    universalDecoder,
    catalog,
    attributeEngine,
    catalogApi,
    marketplaceApi,
    financeApi,
    marketplace,
    walletRegistry: finance.walletRegistry,
    balanceEngine: finance.balanceEngine,
    ledger: finance.ledger,
    accountingEngine: finance.accountingEngine,
    apiGateway,
    notificationEngine,
    runtimeOrchestrator,
  };
}
