import { EventMessage } from '../core/eventBus';
import { Listing, Offer, Order, Reservation, Negotiation } from './marketplace';
import { Timestamp, NumericId } from '../core/types';

export const ListingCreated = 'Marketplace.ListingCreated';
export const ListingPublished = 'Marketplace.ListingPublished';
export const ListingUpdated = 'Marketplace.ListingUpdated';
export const ListingArchived = 'Marketplace.ListingArchived';

export const OfferCreated = 'Marketplace.OfferCreated';
export const OfferAccepted = 'Marketplace.OfferAccepted';
export const OfferRejected = 'Marketplace.OfferRejected';

export const ReservationCreated = 'Marketplace.ReservationCreated';
export const ReservationExpired = 'Marketplace.ReservationExpired';

export const OrderCreated = 'Marketplace.OrderCreated';
export const OrderConfirmed = 'Marketplace.OrderConfirmed';
export const OrderCancelled = 'Marketplace.OrderCancelled';
export const OrderCompleted = 'Marketplace.OrderCompleted';

export const NegotiationStarted = 'Marketplace.NegotiationStarted';
export const NegotiationUpdated = 'Marketplace.NegotiationUpdated';
export const NegotiationClosed = 'Marketplace.NegotiationClosed';

function ts(): Timestamp {
  return new Date().toISOString();
}

export function createListingCreatedEvent(listing: Listing, sourceId?: NumericId, metadata?: Record<string, unknown>): EventMessage<{ listing: Listing }> {
  return {
    type: ListingCreated,
    payload: { listing },
    sourceId,
    timestamp: ts(),
    metadata: { immutable: true, ...(metadata || {}) },
  };
}

export function createListingPublishedEvent(listing: Listing, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return {
    type: ListingPublished,
    payload: { listing },
    sourceId,
    timestamp: ts(),
    metadata: { immutable: true, ...(metadata || {}) },
  };
}

export function createListingUpdatedEvent(listing: Listing, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return {
    type: ListingUpdated,
    payload: { listing },
    sourceId,
    timestamp: ts(),
    metadata: { ...(metadata || {}) },
  };
}

export function createListingArchivedEvent(listing: Listing, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return {
    type: ListingArchived,
    payload: { listing },
    sourceId,
    timestamp: ts(),
    metadata: { immutable: true, ...(metadata || {}) },
  };
}

export function createOfferCreatedEvent(offer: Offer, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return {
    type: OfferCreated,
    payload: { offer },
    sourceId,
    timestamp: ts(),
    metadata: { ...(metadata || {}) },
  };
}

export function createOfferAcceptedEvent(offer: Offer, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: OfferAccepted, payload: { offer }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createOfferRejectedEvent(offer: Offer, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: OfferRejected, payload: { offer }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createReservationCreatedEvent(reservation: Reservation, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: ReservationCreated, payload: { reservation }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createReservationExpiredEvent(reservation: Reservation, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: ReservationExpired, payload: { reservation }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createOrderCreatedEvent(order: Order, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: OrderCreated, payload: { order }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createOrderConfirmedEvent(order: Order, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: OrderConfirmed, payload: { order }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createOrderCancelledEvent(order: Order, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: OrderCancelled, payload: { order }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createOrderCompletedEvent(order: Order, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: OrderCompleted, payload: { order }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createNegotiationStartedEvent(neg: Negotiation, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: NegotiationStarted, payload: { negotiation: neg }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createNegotiationUpdatedEvent(neg: Negotiation, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: NegotiationUpdated, payload: { negotiation: neg }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}

export function createNegotiationClosedEvent(neg: Negotiation, sourceId?: NumericId, metadata?: Record<string, unknown>) {
  return { type: NegotiationClosed, payload: { negotiation: neg }, sourceId, timestamp: ts(), metadata: { ...(metadata || {}) } };
}
