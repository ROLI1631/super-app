import { createDefaultCoreServices } from '../core/factory';

describe('Marketplace lifecycle flows', () => {
  it('publish and reserve and expire reservation', async () => {
    const core = createDefaultCoreServices();
    const m = core.marketplace;
    const events: any[] = [];
    core.eventBus.subscribe('Marketplace.ListingPublished', (e) => events.push(e));
    core.eventBus.subscribe('Marketplace.ReservationCreated', (e) => events.push(e));
    core.eventBus.subscribe('Marketplace.ReservationExpired', (e) => events.push(e));

    const owner = 10;
    const listing = await m.createListing(owner, { title: 'Item A', price: 5 }, { userId: owner, sessionId: owner, containerId: 0, moduleId: 0 });
    await m.publishListing(listing.id, { userId: owner, sessionId: owner, containerId: 0, moduleId: 0 });
    expect(m.getListing(listing.id)?.status).toBe('published');

    const res = await m.reserveListing(20, listing.id, 1 /* ttl 1s */, { userId: 20, sessionId: 20, containerId: 0, moduleId: 0 });
    expect(res.status).toBe('active');
    expect(m.getListing(listing.id)?.status).toBe('reserved');

    // expire by using cutoff in the future
    m.expireReservations(new Date(Date.now() + 2000).toISOString());
    const r = m.getReservation(res.id);
    expect(r?.status).toBe('expired');
    expect(m.getListing(listing.id)?.status).toBe('published');
    // events emitted
    const types = events.map((e) => e.type);
    expect(types).toContain('Marketplace.ListingPublished');
    expect(types).toContain('Marketplace.ReservationCreated');
    expect(types).toContain('Marketplace.ReservationExpired');
  });

  it('order lifecycle: create -> pay -> deliver', async () => {
    const core = createDefaultCoreServices();
    const m = core.marketplace;
    const owner = 30;
    const listing = await m.createListing(owner, { title: 'Item B', price: 20 }, { userId: owner, sessionId: owner, containerId: 0, moduleId: 0 });
    await m.publishListing(listing.id, { userId: owner, sessionId: owner, containerId: 0, moduleId: 0 });

    const order = await m.createOrder(40, listing.id, 20, { userId: 40, sessionId: 40, containerId: 0, moduleId: 0 });
    expect(order.status).toBe('created');
    expect(m.getListing(listing.id)?.status).toBe('ordered');

    const paid = await m.markOrderPaid(order.id, { userId: 40, sessionId: 40, containerId: 0, moduleId: 0 });
    expect(paid?.status).toBe('paid');

    const done = await m.markOrderDelivered(order.id, { userId: 40, sessionId: 40, containerId: 0, moduleId: 0 });
    expect(done?.status).toBe('fulfilled');
    expect(m.getListing(listing.id)?.status).toBe('delivered');
  });

  it('negotiation flow', async () => {
    const core = createDefaultCoreServices();
    const m = core.marketplace;
    const owner = 50;
    const listing = await m.createListing(owner, { title: 'Item C' }, { userId: owner, sessionId: owner, containerId: 0, moduleId: 0 });
    const neg = await m.createNegotiation(60, owner, listing.id, { userId: 60, sessionId: 60, containerId: 0, moduleId: 0 });
    expect(neg.status).toBe('open');
    const updated = await m.updateNegotiationStatus(neg.id, 'closed', { userId: 60, sessionId: 60, containerId: 0, moduleId: 0 });
    expect(updated?.status).toBe('closed');
  });
});
