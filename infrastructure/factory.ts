import { createDefaultCoreServices, CoreServices } from '../core/factory';
import { DefaultApiGateway } from './api/gateway';
import { CatalogApi } from './api/catalogApi';
import { createInMemoryMarketplace } from '../engines/marketplaceImpl';
import { createInMemoryFinance } from '../engines/financeImpl';
import { DefaultNumericNavigator } from '../engines/numericNavigation';
import { InMemoryCatalog } from '../engines/catalogImpl';
import { InMemoryAttributeEngine } from '../engines/attributeEngineImpl';
import { IncrementalNumericIndex } from '../engines/numericIndexImpl';
import { SimpleAlphabetEngine } from '../engines/alphabetEngineImpl';
import { InMemoryNumericUniverse } from '../engines/numericUniverseImpl';
import { CatalogRegistry } from '../engines/catalog';
import { MarketplaceService } from '../engines/marketplace';
import { WalletRegistry, BalanceEngine, Ledger, AccountingEngine } from '../engines/finance';
import { NumericId } from '../core/types';

export interface InfrastructureServices extends CoreServices {
  readonly numericIndex: IncrementalNumericIndex;
  readonly alphabetEngine: SimpleAlphabetEngine;
  readonly numericUniverse: InMemoryNumericUniverse;
  readonly numericNavigator: DefaultNumericNavigator;
  readonly catalog: CatalogRegistry;
  readonly attributeEngine: InMemoryAttributeEngine;
  readonly catalogApi: CatalogApi;
  readonly marketplace: MarketplaceService;
  readonly walletRegistry: WalletRegistry;
  readonly balanceEngine: BalanceEngine;
  readonly ledger: Ledger;
  readonly accountingEngine: AccountingEngine;
  readonly apiGateway: DefaultApiGateway;
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
  const catalogApi = new CatalogApi(catalog);
  const marketplace = createInMemoryMarketplace(core.eventBus, core.protocolEngine);
  const finance = createInMemoryFinance(core.eventBus, core.protocolEngine);
  const apiGateway = new DefaultApiGateway(core.eventBus, core.protocol, core.protocolEngine, (req) => !!req.action && !!req.payload);
  const numericNavigator = new DefaultNumericNavigator(alphabetEngine, numericUniverse, core.navigationCore, core.protocol, core.eventBus);

  return {
    ...core,
    numericIndex,
    alphabetEngine,
    numericUniverse,
    numericNavigator,
    catalog,
    attributeEngine,
    catalogApi,
    marketplace,
    walletRegistry: finance.walletRegistry,
    balanceEngine: finance.balanceEngine,
    ledger: finance.ledger,
    accountingEngine: finance.accountingEngine,
    apiGateway,
  };
}
