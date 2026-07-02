import { createDefaultCoreServices } from '../core/factory';
import { createMarketplaceApi } from '../api/marketplaceApi';

describe('Marketplace API read-only', () => {
  it('exposes listings, offers, reservations, orders, negotiations', async () => {
    const core = createDefaultCoreServices();
    const m = core.marketplace;
    const api = createMarketplaceApi(m as any);

    const owner = 70;
    const listing = await m.createListing(owner, { title: 'Api Item' }, { userId: owner, sessionId: owner, containerId: 0, moduleId: 0 });
    const offer = await m.createOffer(80, listing.id, 5, { userId: 80, sessionId: 80, containerId: 0, moduleId: 0 });
    const res = await m.createReservation(90, listing.id, { userId: 90, sessionId: 90, containerId: 0, moduleId: 0 });
    const order = await m.createOrder(100, listing.id, 5, { userId: 100, sessionId: 100, containerId: 0, moduleId: 0 });
    const neg = await m.createNegotiation(110, owner, listing.id, { userId: 110, sessionId: 110, containerId: 0, moduleId: 0 });

    expect(api.getListing(listing.id)).toBeDefined();
    expect(api.getOffer(offer.id)).toBeDefined();
    expect(api.getReservation(res.id)).toBeDefined();
    expect(api.getOrder(order.id)).toBeDefined();
    expect(api.getNegotiation(neg.id)).toBeDefined();

    expect(api.listListings().length).toBeGreaterThanOrEqual(1);
    expect(api.listOffers().length).toBeGreaterThanOrEqual(1);
    expect(api.listReservations().length).toBeGreaterThanOrEqual(1);
    expect(api.listOrders().length).toBeGreaterThanOrEqual(1);
  });
});
