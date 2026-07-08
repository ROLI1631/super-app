import { NumericId } from '../../core/types';
import { CatalogRegistry } from '../../engines/catalog';
import { MarketplaceService, ServiceContext } from '../../engines/marketplace';
import { AccountingEngine, BalanceEngine, Ledger, WalletRegistry } from '../../engines/finance';
import { NumericUniverseRegistry } from '../../engines/numericUniverse';

export interface RuntimeExecutionContext {
  readonly userId: NumericId;
  readonly sessionId: NumericId;
  readonly moduleId: NumericId;
  readonly containerId: NumericId;
}

export interface BusinessRuntimeRouter {
  execute(action: string, payload: Record<string, unknown>, context: RuntimeExecutionContext): Promise<unknown>;
}

export class DefaultBusinessRuntimeRouter implements BusinessRuntimeRouter {
  constructor(
    private readonly marketplace: MarketplaceService,
    private readonly catalog: CatalogRegistry,
    private readonly walletRegistry: WalletRegistry,
    private readonly balanceEngine: BalanceEngine,
    private readonly accountingEngine: AccountingEngine,
    private readonly ledger: Ledger,
    private readonly numericUniverse: NumericUniverseRegistry,
  ) {}

  async execute(action: string, payload: Record<string, unknown>, context: RuntimeExecutionContext): Promise<unknown> {
    const serviceContext: ServiceContext = {
      userId: context.userId,
      sessionId: context.sessionId,
      moduleId: context.moduleId,
      containerId: context.containerId,
    };

    switch (action) {
      case 'marketplace.createListing':
        return this.marketplace.createListing(
          payload.ownerId as NumericId,
          payload.input as { title: string; description?: string; categoryId?: NumericId; price?: number },
          serviceContext,
        );
      case 'marketplace.createOffer':
        return this.marketplace.createOffer(
          payload.userId as NumericId,
          payload.listingId as NumericId,
          payload.amount as number,
          serviceContext,
        );
      case 'marketplace.getListing':
        return this.marketplace.getListing(payload.id as NumericId);
      case 'marketplace.getOffer':
        return this.marketplace.getOffer(payload.id as NumericId);
      case 'marketplace.getReservation':
        return (this.marketplace as any).getReservation(payload.id as NumericId);
      case 'marketplace.getOrder':
        return this.marketplace.getOrder(payload.id as NumericId);
      case 'marketplace.getNegotiation':
        return (this.marketplace as any).getNegotiation(payload.id as NumericId);
      case 'marketplace.listListings':
        return this.marketplace.listListings(payload.categoryId as NumericId | undefined);
      case 'marketplace.listOrders':
        return (this.marketplace as any).listOrders ? (this.marketplace as any).listOrders() : [];
      case 'marketplace.listReservations':
        return (this.marketplace as any).listReservations ? (this.marketplace as any).listReservations() : [];
      case 'marketplace.listOffers':
        return (this.marketplace as any).listOffers ? (this.marketplace as any).listOffers() : [];

      case 'catalog.search':
        return this.catalog.search(payload.query as string, payload.language as string | undefined);
      case 'catalog.getById':
        return this.catalog.findById(payload.id as NumericId);
      case 'catalog.getByCategory':
        return this.catalog.findByCategory(payload.categoryId as NumericId);
      case 'catalog.getHierarchy':
        return this.catalog.listCategories(payload.parentId as NumericId | undefined);
      case 'catalog.discoverAttributes':
        return this.catalog.discoverAttributes(payload.categoryId as NumericId);

      case 'finance.getWallet':
        return this.walletRegistry.getWallet(payload.id as NumericId);
      case 'finance.listWallets':
        return this.walletRegistry.listWallets();
      case 'finance.getBalance':
        return this.balanceEngine.getBalance(payload.walletId as NumericId);
      case 'finance.listTransactions':
        return this.accountingEngine.listTransactions(payload.walletId as NumericId | undefined);
      case 'finance.listLedgerEntries':
        return this.ledger.list(payload.walletId as NumericId | undefined);

      case 'numeric.getNode':
        return this.numericUniverse.findById(payload.id as NumericId);
      case 'numeric.getChildren':
        return this.numericUniverse.findChildren(payload.id as NumericId);
      case 'numeric.getParent':
        return this.numericUniverse.findParent(payload.id as NumericId);
      case 'numeric.searchById':
        return this.numericUniverse.findById(payload.id as NumericId);
      case 'numeric.searchByPath': {
        const path = payload.path as NumericId[];
        return path.map((id) => this.numericUniverse.findById(id)).filter((node) => node !== undefined);
      }
      default:
        return undefined;
    }
  }
}
