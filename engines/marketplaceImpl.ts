import { MarketplaceService, Listing, Offer, Order, Reservation, Negotiation, ServiceContext } from './marketplace';
import { NumericId, Timestamp } from '../core/types';
import { EventBus, EventMessage } from '../core/eventBus';
import {
  createListingCreatedEvent,
  createListingPublishedEvent,
  createListingUpdatedEvent,
  createListingArchivedEvent,
  createOfferCreatedEvent,
  createReservationCreatedEvent,
  createReservationExpiredEvent,
  createOrderCreatedEvent,
  createOrderConfirmedEvent,
  createOrderCancelledEvent,
  createOrderCompletedEvent,
  createNegotiationStartedEvent,
  createNegotiationUpdatedEvent,
  createNegotiationClosedEvent,
} from './marketplaceEvents';
import { ProtocolEngine } from '../core/protocolEngine';
import { validateListingInput, validateOfferInput, validateReservationInput } from './marketplaceValidator';

const createNumericId = (() => {
  let counter = 100000; // marketplace local id space
  return (): NumericId => {
    counter += 1;
    return counter;
  };
})();

function now(): Timestamp {
  return new Date().toISOString();
}

export class InMemoryMarketplace implements MarketplaceService {
  private listings = new Map<NumericId, Listing>();
  private offers = new Map<NumericId, Offer>();
  private orders = new Map<NumericId, Order>();
  private reservations = new Map<NumericId, Reservation>();
  private negotiations = new Map<NumericId, Negotiation>();
  private eventBus?: EventBus;
  private protocolEngine?: ProtocolEngine;

  constructor(eventBus?: EventBus, protocolEngine?: ProtocolEngine) {
    this.eventBus = eventBus;
    this.protocolEngine = protocolEngine;
  }

  async createListing(ownerId: NumericId, input: { title: string; description?: string; categoryId?: NumericId; price?: number }, ctx: ServiceContext): Promise<Listing> {
    // Validate
    validateListingInput(input);

    // Protocol check
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.createListing', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: input }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }

    const id = createNumericId();
    const ts = now();
    const listing: Listing = {
      id,
      ownerId,
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      price: input.price,
      currency: undefined,
      status: 'draft',
      createdAt: ts,
      updatedAt: ts,
      metadata: { createdBy: ctx.userId }
    } as Listing;
    this.listings.set(id, listing);
    // Emit ListingCreated immutable event
    if (this.eventBus) {
      const ev: EventMessage = createListingCreatedEvent(listing, ctx.moduleId, {});
      // Attach protocol metadata if available
      if (this.protocolEngine) {
        // no-op: protocol metadata handled earlier; keep metadata {} for now
      }
      // fire-and-forget
      this.eventBus.publish(ev).catch(() => {});
    }
    return listing;
  }

  getListing(id: NumericId): Listing | undefined {
    return this.listings.get(id);
  }

  listListings(categoryId?: NumericId): Listing[] {
    const out: Listing[] = [];
    for (const l of Array.from(this.listings.values())) {
      if (categoryId && l.categoryId !== categoryId) continue;
      out.push(l);
    }
    return out;
  }

  async createOffer(buyerId: NumericId, listingId: NumericId, amount: number, ctx: ServiceContext) {
    validateOfferInput(listingId, amount);
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.createOffer', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { listingId, amount } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const id = createNumericId();
    const offer: Offer = {
      id,
      listingId,
      buyerId,
      amount,
      status: 'pending',
      createdAt: now(),
      metadata: { createdBy: ctx.userId }
    } as Offer;
    this.offers.set(id, offer);
    if (this.eventBus) {
      this.eventBus.publish(createOfferCreatedEvent(offer, ctx.moduleId, {})).catch(() => {});
    }
    return offer;
  }

  getOffer(id: NumericId): Offer | undefined {
    return this.offers.get(id);
  }

  listOffers(): Offer[] {
    return Array.from(this.offers.values());
  }

  async createOrder(buyerId: NumericId, listingId: NumericId, amount: number, ctx: ServiceContext) {
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.createOrder', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { listingId, amount } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const id = createNumericId();
    const listing = this.listings.get(listingId);
    const sellerId = listing ? listing.ownerId : ctx.moduleId;
    const order: Order = {
      id,
      listingId,
      buyerId,
      sellerId,
      amount,
      status: 'created',
      createdAt: now(),
      metadata: { createdBy: ctx.userId }
    } as Order;
    this.orders.set(id, order);
    // transition listing to ordered when order is created
    if (listing) {
      listing.status = 'ordered';
      listing.updatedAt = now();
      this.listings.set(listing.id, listing);
    }
    if (this.eventBus) {
      this.eventBus.publish(createOrderCreatedEvent(order, ctx.moduleId, {})).catch(() => {});
    }
    return order;
  }

  getOrder(id: NumericId): Order | undefined {
    return this.orders.get(id);
  }

  listOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  async createReservation(userId: NumericId, listingId: NumericId, ctx: ServiceContext) {
    validateReservationInput(listingId);
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.createReservation', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { listingId } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const id = createNumericId();
    const reservation: Reservation = {
      id,
      listingId,
      userId,
      status: 'active',
      startsAt: now(),
      endsAt: undefined,
      metadata: { createdBy: ctx.userId }
    } as Reservation;
    this.reservations.set(id, reservation);
    const listing = this.listings.get(listingId);
    if (listing) {
      listing.status = 'reserved';
      listing.updatedAt = now();
      this.listings.set(listing.id, listing);
    }
    if (this.eventBus) {
      this.eventBus.publish(createReservationCreatedEvent(reservation, ctx.moduleId, {})).catch(() => {});
    }
    return reservation;
  }

  getReservation(id: NumericId): Reservation | undefined {
    return this.reservations.get(id);
  }

  listReservations(): Reservation[] {
    return Array.from(this.reservations.values());
  }

  async createNegotiation(buyerId: NumericId, sellerId: NumericId, listingId: NumericId, ctx: ServiceContext) {
    const id = createNumericId();
    const negotiation: Negotiation = {
      id,
      listingId,
      buyerId,
      sellerId,
      status: 'open',
      createdAt: now(),
      metadata: { createdBy: ctx.userId }
    } as Negotiation;
    this.negotiations.set(id, negotiation);
    return negotiation;
  }

  async publishListing(listingId: NumericId, ctx: ServiceContext): Promise<Listing> {
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.publishListing', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { listingId } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error('listing_not_found');
    listing.status = 'published';
    listing.updatedAt = now();
    this.listings.set(listingId, listing);
    if (this.eventBus) {
      const ev = createListingPublishedEvent(listing, ctx.moduleId, {});
      this.eventBus.publish(ev).catch(() => {});
    }
    return listing;
  }

  async reserveListing(userId: NumericId, listingId: NumericId, ttlSeconds: number, ctx: ServiceContext): Promise<Reservation> {
    validateReservationInput(listingId);
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.reserveListing', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { listingId, ttlSeconds } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const nowTs = now();
    const id = createNumericId();
    const endsAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    const reservation: Reservation = {
      id,
      listingId,
      userId,
      status: 'active',
      startsAt: nowTs,
      endsAt,
      metadata: { createdBy: ctx.userId }
    } as Reservation;
    this.reservations.set(id, reservation);
    const listing = this.listings.get(listingId);
    if (listing) {
      listing.status = 'reserved';
      listing.updatedAt = now();
      this.listings.set(listing.id, listing);
    }
    if (this.eventBus) this.eventBus.publish(createReservationCreatedEvent(reservation, ctx.moduleId, {})).catch(() => {});
    return reservation;
  }

  async markOrderPaid(orderId: NumericId, ctx: ServiceContext): Promise<Order | undefined> {
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.markOrderPaid', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { orderId } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    order.status = 'paid';
    this.orders.set(orderId, order);
    const listing = this.listings.get(order.listingId);
    if (listing) {
      listing.status = 'paid';
      listing.updatedAt = now();
      this.listings.set(listing.id, listing);
    }
    if (this.eventBus) this.eventBus.publish(createOrderConfirmedEvent(order, ctx.moduleId, {})).catch(() => {});
    return order;
  }

  async markOrderDelivered(orderId: NumericId, ctx: ServiceContext): Promise<Order | undefined> {
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.markOrderDelivered', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { orderId } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    order.status = 'fulfilled';
    this.orders.set(orderId, order);
    const listing = this.listings.get(order.listingId);
    if (listing) {
      listing.status = 'delivered';
      listing.updatedAt = now();
      this.listings.set(listing.id, listing);
    }
    if (this.eventBus) this.eventBus.publish(createOrderCompletedEvent(order, ctx.moduleId, {})).catch(() => {});
    return order;
  }

  async cancelListing(listingId: NumericId, reason: string | undefined, ctx: ServiceContext): Promise<Listing | undefined> {
    if (this.protocolEngine) {
      const res = await this.protocolEngine.execute({ action: 'marketplace.cancelListing', userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId, containerId: ctx.containerId, payload: { listingId, reason } }, { userId: ctx.userId, sessionId: ctx.sessionId, moduleId: ctx.moduleId });
      if (!res.allowed) throw new Error('not_allowed');
    }
    const listing = this.listings.get(listingId);
    if (!listing) return undefined;
    listing.status = 'cancelled';
    listing.updatedAt = now();
    listing.metadata = { ...(listing.metadata || {}), cancelledReason: reason } as any;
    this.listings.set(listingId, listing);
    if (this.eventBus) this.eventBus.publish(createOrderCancelledEvent({ id: 0, listingId, buyerId: 0, sellerId: listing.ownerId, amount: 0, status: 'cancelled', createdAt: now() } as any, ctx.moduleId, {})).catch(() => {});
    return listing;
  }

  async archiveListing(listingId: NumericId, ctx: ServiceContext): Promise<Listing | undefined> {
    const listing = this.listings.get(listingId);
    if (!listing) return undefined;
    listing.status = 'archived';
    listing.updatedAt = now();
    this.listings.set(listingId, listing);
    return listing;
  }

  async updateNegotiationStatus(id: NumericId, status: Negotiation['status'], ctx: ServiceContext): Promise<Negotiation | undefined> {
    const n = this.negotiations.get(id);
    if (!n) return undefined;
    n.status = status;
    n.updatedAt = now() as any;
    this.negotiations.set(id, n);
    return n;
  }

  // Expire reservations whose endsAt is in the past and move listings back to published
  expireReservations(cutoff?: Timestamp) {
    const nowTs = cutoff || now();
    for (const r of Array.from(this.reservations.values())) {
      if (r.status === 'active' && r.endsAt && r.endsAt < nowTs) {
        r.status = 'expired';
        this.reservations.set(r.id, r);
        if (this.eventBus) this.eventBus.publish(createReservationExpiredEvent(r, undefined, {})).catch(() => {});
        const listing = this.listings.get(r.listingId);
        if (listing && listing.status === 'reserved') {
          listing.status = 'published';
          listing.updatedAt = now();
          this.listings.set(listing.id, listing);
        }
      }
    }
  }

  getNegotiation(id: NumericId): Negotiation | undefined {
    return this.negotiations.get(id);
  }
}
export function createInMemoryMarketplace(eventBus?: EventBus, protocolEngine?: ProtocolEngine): InMemoryMarketplace {
  return new InMemoryMarketplace(eventBus, protocolEngine);
}
