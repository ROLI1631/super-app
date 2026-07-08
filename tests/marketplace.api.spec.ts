import { createDefaultInfrastructureServices } from '../infrastructure/factory';

describe('Marketplace API read-only', () => {
  it('exposes listings, offers, reservations, orders, negotiations', async () => {
    const core = createDefaultInfrastructureServices();

    const m = core.marketplace;
    const api = core.marketplaceApi;

    const owner = core.identityCore.registerIdentity({
      kind: 'user',
      handle: 'owner',
    });

    const buyer = core.identityCore.registerIdentity({
      kind: 'user',
      handle: 'buyer',
    });

    const reserver = core.identityCore.registerIdentity({
      kind: 'user',
      handle: 'reserver',
    });

    const customer = core.identityCore.registerIdentity({
      kind: 'user',
      handle: 'customer',
    });

    const negotiator = core.identityCore.registerIdentity({
      kind: 'user',
      handle: 'negotiator',
    });

    const listing = await m.createListing(
      owner.id,
      { title: 'Api Item' },
      {
        userId: owner.id,
        sessionId: owner.id,
        containerId: 0,
        moduleId: 0,
      },
    );

    const offer = await m.createOffer(
      buyer.id,
      listing.id,
      5,
      {
        userId: buyer.id,
        sessionId: buyer.id,
        containerId: 0,
        moduleId: 0,
      },
    );

    const reservation = await m.createReservation(
      reserver.id,
      listing.id,
      {
        userId: reserver.id,
        sessionId: reserver.id,
        containerId: 0,
        moduleId: 0,
      },
    );

    const order = await m.createOrder(
      customer.id,
      listing.id,
      5,
      {
        userId: customer.id,
        sessionId: customer.id,
        containerId: 0,
        moduleId: 0,
      },
    );

    const negotiation = await m.createNegotiation(
      negotiator.id,
      owner.id,
      listing.id,
      {
        userId: negotiator.id,
        sessionId: negotiator.id,
        containerId: 0,
        moduleId: 0,
      },
    );

    expect(await api.getListing(listing.id, owner.id)).toBeDefined();
    expect(await api.getOffer(offer.id, buyer.id)).toBeDefined();
    expect(await api.getReservation(reservation.id, reserver.id)).toBeDefined();
    expect(await api.getOrder(order.id, customer.id)).toBeDefined();
    expect(await api.getNegotiation(negotiation.id, negotiator.id)).toBeDefined();

    expect((await api.listListings(undefined, owner.id)).length).toBeGreaterThanOrEqual(1);
    expect((await api.listOffers(buyer.id)).length).toBeGreaterThanOrEqual(1);
    expect((await api.listReservations(reserver.id)).length).toBeGreaterThanOrEqual(1);
    expect((await api.listOrders(customer.id)).length).toBeGreaterThanOrEqual(1);
  });
});