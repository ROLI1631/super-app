import { EventMessage } from '../core/eventBus';
import { Transaction, Wallet, LedgerEntry, Invoice } from './finance';
import { NumericId, Timestamp } from '../core/types';

const ts = (): Timestamp => new Date().toISOString();

export const TransactionCreated = 'Finance.TransactionCreated';
export const TransactionCompleted = 'Finance.TransactionCompleted';
export const TransactionCancelled = 'Finance.TransactionCancelled';
export const BalanceChanged = 'Finance.BalanceChanged';
export const WalletCreated = 'Finance.WalletCreated';
export const RewardIssued = 'Finance.RewardIssued';
export const CommissionCalculated = 'Finance.CommissionCalculated';
export const InvoiceGenerated = 'Finance.InvoiceGenerated';

export function createTransactionCreatedEvent(tx: Transaction, sourceId?: NumericId): EventMessage<{ transaction: Transaction }> {
  return { type: TransactionCreated, payload: { transaction: tx }, sourceId, timestamp: ts() };
}

export function createTransactionCompletedEvent(tx: Transaction, sourceId?: NumericId) {
  return { type: TransactionCompleted, payload: { transaction: tx }, sourceId, timestamp: ts() };
}

export function createTransactionCancelledEvent(tx: Transaction, sourceId?: NumericId) {
  return { type: TransactionCancelled, payload: { transaction: tx }, sourceId, timestamp: ts() };
}

export function createBalanceChangedEvent(entry: LedgerEntry, sourceId?: NumericId) {
  return { type: BalanceChanged, payload: { entry }, sourceId, timestamp: ts() };
}

export function createWalletCreatedEvent(wallet: Wallet, sourceId?: NumericId) {
  return { type: WalletCreated, payload: { wallet }, sourceId, timestamp: ts() };
}

export function createRewardIssuedEvent(payload: any, sourceId?: NumericId) {
  return { type: RewardIssued, payload, sourceId, timestamp: ts() };
}

export function createCommissionCalculatedEvent(payload: any, sourceId?: NumericId) {
  return { type: CommissionCalculated, payload, sourceId, timestamp: ts() };
}

export function createInvoiceGeneratedEvent(invoice: Invoice, sourceId?: NumericId) {
  return { type: InvoiceGenerated, payload: { invoice }, sourceId, timestamp: ts() };
}
