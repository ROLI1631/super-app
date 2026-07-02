import { NumericId } from '../core/types';

export function validateListingInput(input: { title?: string; description?: string; price?: number }) {
  if (!input || typeof input.title !== 'string' || input.title.trim() === '') {
    throw new Error('invalid_listing_title');
  }
  if (input.price !== undefined && typeof input.price !== 'number') {
    throw new Error('invalid_price');
  }
}

export function validateOfferInput(listingId: NumericId, amount: number) {
  if (!listingId) throw new Error('invalid_listing_id');
  if (typeof amount !== 'number' || amount < 0) throw new Error('invalid_offer_amount');
}

export function validateReservationInput(listingId: NumericId) {
  if (!listingId) throw new Error('invalid_listing_id');
}
