import { createDefaultInfrastructureServices } from '../infrastructure/factory';

describe('Marketplace (TOM8) basic flows', () => {
  it('creates listing and offer', async () => {
    const core = createDefaultInfrastructureServices();
    const marketplace = core.marketplace;
    const events: any[] = [];
    core.eventBus.subscribe('Marketplace.ListingCreated', (e) => events.push(e));

    const ownerId = 1;
    const listing = await marketplace.createListing(ownerId, { title: 'Test Item', description: 'Nice', price: 10 }, { userId: ownerId, sessionId: ownerId, containerId: 0, moduleId: 0 });
    expect(listing).toBeDefined();
    expect(listing.title).toBe('Test Item');

    const offer = await marketplace.createOffer(2, listing.id, 9, { userId: 2, sessionId: 2, containerId: 0, moduleId: 0 });
    expect(offer).toBeDefined();
    expect(offer.listingId).toBe(listing.id);
    // ListingCreated should have been emitted
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].type).toBe('Marketplace.ListingCreated');
  });
});
