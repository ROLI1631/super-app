import { NumericId, Timestamp, Metadata } from '../core/types';

export type TransactionType = 'debit' | 'credit' | 'transfer' | 'refund' | 'adjustment' | 'hold' | 'release';
export type TransactionStatus = 'created' | 'completed' | 'cancelled' | 'failed';

export interface Transaction {
  id: NumericId;
  readonly type: TransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly fromWalletId?: NumericId;
  readonly toWalletId?: NumericId;
  status: TransactionStatus;
  readonly createdAt: Timestamp;
  metadata?: Metadata;
}

export interface Wallet {
  id: NumericId;
  ownerId: NumericId;
  currency: string;
  createdAt: Timestamp;
  metadata?: Metadata;
}

export interface Balance {
  available: number;
  reserved: number;
  locked: number;
  pending: number;
}

export interface LedgerEntry {
  id: NumericId;
  transactionId: NumericId;
  walletId: NumericId;
  debit: number; // positive value means debit
  credit: number; // positive value means credit
  balanceAfter: number;
  timestamp: Timestamp;
  metadata?: Metadata;
}

export interface Invoice {
  id: NumericId;
  walletId: NumericId;
  amount: number;
  currency: string;
  issuedAt: Timestamp;
  metadata?: Metadata;
}

export interface BalanceEngine {
  getBalance(walletId: NumericId): Balance;
  adjust(walletId: NumericId, delta: Partial<Balance>): void;
  hold(walletId: NumericId, amount: number): void;
  release(walletId: NumericId, amount: number): void;
}

export interface Ledger {
  append(entry: LedgerEntry): void;
  list(walletId?: NumericId): LedgerEntry[];
}

export interface AccountingEngine {
  createTransaction(tx: Omit<Transaction, 'id' | 'status' | 'createdAt'>): Transaction;
  completeTransaction(id: NumericId): Transaction | undefined;
  cancelTransaction(id: NumericId): Transaction | undefined;
  listTransactions(walletId?: NumericId): Transaction[];
}

export interface WalletRegistry {
  createWallet(ownerId: NumericId, currency: string, metadata?: Metadata): Wallet;
  getWallet(id: NumericId): Wallet | undefined;
  listWallets(): Wallet[];
}

export interface CommissionEngine {
  calculate(transaction: Transaction): Record<string, unknown>;
}

export interface RewardEngine {
  issue(transaction: Transaction): Record<string, unknown>;
}

export interface DiscountEngine {
  apply(transaction: Transaction): Record<string, unknown>;
}
