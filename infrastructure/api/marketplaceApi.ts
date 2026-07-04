import { MarketplaceService } from '../../engines/marketplace';
import { ServiceContext } from '../../engines/marketplace';

export class MarketplaceApi {
  constructor(private readonly svc: MarketplaceService) {}

  async createListing(userId: number, input: { title: string; description?: string; categoryId?: number; price?: number }) {
    const ctx: ServiceContext = {
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    };
    return this.svc.createListing(userId, input, ctx);
  }

  async createOffer(userId: number, listingId: number, amount: number) {
    const ctx: ServiceContext = { userId, sessionId: userId, containerId: 0, moduleId: 0 };
    return this.svc.createOffer(userId, listingId, amount, ctx);
  }

  getListing(id: number) {
    return this.svc.getListing(id);
  }

  getOffer(id: number) {
    return this.svc.getOffer(id);
  }

  getReservation(id: number) {
    // @ts-ignore
    return (this.svc as any).getReservation ? (this.svc as any).getReservation(id) : undefined;
  }

  getOrder(id: number) {
    return this.svc.getOrder(id);
  }

  getNegotiation(id: number) {
    // @ts-ignore
    return (this.svc as any).getNegotiation ? (this.svc as any).getNegotiation(id) : undefined;
  }

  listListings(categoryId?: number) {
    return this.svc.listListings(categoryId);
  }

  listOrders() {
    // @ts-ignore
    return (this.svc as any).listOrders ? (this.svc as any).listOrders() : [];
  }

  listReservations() {
    // @ts-ignore
    return (this.svc as any).listReservations ? (this.svc as any).listReservations() : [];
  }

  listOffers() {
    // @ts-ignore
    return (this.svc as any).listOffers ? (this.svc as any).listOffers() : [];
  }
}

export function createMarketplaceApi(svc: MarketplaceService) {
  return new MarketplaceApi(svc);
}
