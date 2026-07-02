import { NumericId } from '../core/types';

export function validateTransactionInput(payload: { amount?: number; currency?: string }) {
  if (!payload) throw new Error('invalid_transaction');
  if (typeof payload.amount !== 'number' || payload.amount <= 0) throw new Error('invalid_amount');
  if (typeof payload.currency !== 'string' || payload.currency.trim() === '') throw new Error('invalid_currency');
}

export function validateWalletInput(ownerId: NumericId, currency: string) {
  if (!ownerId) throw new Error('invalid_owner');
  if (!currency || typeof currency !== 'string') throw new Error('invalid_currency');
}
