import { NumericId, Timestamp, Metadata } from '../core/types';

export type ListingStatus = 'draft' | 'published' | 'reserved' | 'ordered' | 'paid' | 'delivered' | 'cancelled' | 'archived';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type OrderStatus = 'created' | 'paid' | 'fulfilled' | 'cancelled';
export type ReservationStatus = 'active' | 'expired' | 'cancelled';
export type NegotiationStatus = 'open' | 'closed' | 'failed';

export interface Participant {
  readonly id: NumericId;
  readonly kind: 'buyer' | 'seller' | 'agent';
}

export interface Listing {
  id: NumericId;
  ownerId: NumericId;
  title: string;
  description?: string;
  categoryId?: NumericId;
  price?: number; // currency-free placeholder
  currency?: string;
  status: ListingStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Metadata;
}

export interface Offer {
  id: NumericId;
  listingId: NumericId;
  buyerId: NumericId;
  amount: number;
  currency?: string;
  status: OfferStatus;
  createdAt: Timestamp;
  metadata?: Metadata;
}

export interface Order {
  id: NumericId;
  listingId: NumericId;
  buyerId: NumericId;
  sellerId: NumericId;
  amount: number;
  currency?: string;
  status: OrderStatus;
  createdAt: Timestamp;
  metadata?: Metadata;
}

export interface Reservation {
  id: NumericId;
  listingId: NumericId;
  userId: NumericId;
  status: ReservationStatus;
  startsAt?: Timestamp;
  endsAt?: Timestamp;
  metadata?: Metadata;
}

export interface Negotiation {
  id: NumericId;
  listingId: NumericId;
  buyerId: NumericId;
  sellerId: NumericId;
  status: NegotiationStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  metadata?: Metadata;
}

export interface MarketplaceService {
  createListing(ownerId: NumericId, input: { title: string; description?: string; categoryId?: NumericId; price?: number }, ctx: ServiceContext): Promise<Listing>;
  getListing(id: NumericId): Listing | undefined;
  listListings(categoryId?: NumericId): Listing[];

  publishListing(listingId: NumericId, ctx: ServiceContext): Promise<Listing>;
  reserveListing(userId: NumericId, listingId: NumericId, ttlSeconds: number, ctx: ServiceContext): Promise<Reservation>;

  createOffer(buyerId: NumericId, listingId: NumericId, amount: number, ctx: ServiceContext): Promise<Offer>;
  getOffer(id: NumericId): Offer | undefined;

  createOrder(buyerId: NumericId, listingId: NumericId, amount: number, ctx: ServiceContext): Promise<Order>;
  getOrder(id: NumericId): Order | undefined;

  markOrderPaid(orderId: NumericId, ctx: ServiceContext): Promise<Order | undefined>;
  markOrderDelivered(orderId: NumericId, ctx: ServiceContext): Promise<Order | undefined>;

  cancelListing(listingId: NumericId, reason: string | undefined, ctx: ServiceContext): Promise<Listing | undefined>;
  archiveListing(listingId: NumericId, ctx: ServiceContext): Promise<Listing | undefined>;

  createReservation(userId: NumericId, listingId: NumericId, ctx: ServiceContext): Promise<Reservation>;

  createNegotiation(buyerId: NumericId, sellerId: NumericId, listingId: NumericId, ctx: ServiceContext): Promise<Negotiation>;
  updateNegotiationStatus(id: NumericId, status: NegotiationStatus, ctx: ServiceContext): Promise<Negotiation | undefined>;
}

export interface ServiceContext {
  readonly userId: NumericId;
  readonly sessionId: NumericId;
  readonly containerId: NumericId;
  readonly moduleId: NumericId;
}
