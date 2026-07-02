import { WalletRegistry, BalanceEngine, Ledger, AccountingEngine, Transaction, Wallet, LedgerEntry } from './finance';
import { NumericId, Timestamp } from '../core/types';
import { EventBus } from '../core/eventBus';
import { ProtocolEngine } from '../core/protocolEngine';
import { createTransactionCreatedEvent, createTransactionCompletedEvent, createTransactionCancelledEvent, createBalanceChangedEvent, createWalletCreatedEvent } from './financeEvents';

const createNumericId = (() => {
  let counter = 200000;
  return (): NumericId => {
    counter += 1;
    return counter;
  };
})();

function now(): Timestamp {
  return new Date().toISOString();
}

class InMemoryWalletRegistry implements WalletRegistry {
  private wallets = new Map<NumericId, Wallet>();
  private eventBus?: EventBus;
  constructor(eventBus?: EventBus) { this.eventBus = eventBus; }
  createWallet(ownerId: NumericId, currency: string, metadata?: any): Wallet {
    const id = createNumericId();
    const w: Wallet = { id, ownerId, currency, createdAt: now(), metadata };
    this.wallets.set(id, w);
    if (this.eventBus) this.eventBus.publish(createWalletCreatedEvent(w, undefined)).catch(() => {});
    return w;
  }
  getWallet(id: NumericId): Wallet | undefined { return this.wallets.get(id); }
  listWallets(): Wallet[] { return Array.from(this.wallets.values()); }
}

class InMemoryLedger implements Ledger {
  private entries: LedgerEntry[] = [];
  append(entry: LedgerEntry): void { this.entries.push(entry); }
  list(walletId?: NumericId): LedgerEntry[] { if (!walletId) return [...this.entries]; return this.entries.filter(e => e.walletId === walletId); }
}

class SimpleBalanceEngine implements BalanceEngine {
  private balances = new Map<NumericId, { available: number; reserved: number; locked: number; pending: number }>();
  constructor(private ledger: InMemoryLedger, private eventBus?: EventBus) {}
  getBalance(walletId: NumericId) {
    const b = this.balances.get(walletId) || { available: 0, reserved: 0, locked: 0, pending: 0 };
    return { available: b.available, reserved: b.reserved, locked: b.locked, pending: b.pending };
  }
  private ensure(walletId: NumericId) { if (!this.balances.has(walletId)) this.balances.set(walletId, { available: 0, reserved: 0, locked: 0, pending: 0 }); }
  adjust(walletId: NumericId, delta: Partial<{ available: number; reserved: number; locked: number; pending: number }>) {
    this.ensure(walletId);
    const curr = this.balances.get(walletId)!;
    if (delta.available !== undefined) curr.available += delta.available;
    if (delta.reserved !== undefined) curr.reserved += delta.reserved;
    if (delta.locked !== undefined) curr.locked += delta.locked;
    if (delta.pending !== undefined) curr.pending += delta.pending;
    const entry = { id: createNumericId(), transactionId: 0, walletId, debit: delta.available && delta.available < 0 ? -delta.available : 0, credit: delta.available && delta.available > 0 ? delta.available : 0, balanceAfter: curr.available, timestamp: now() } as LedgerEntry;
    this.ledger.append(entry);
    if (this.eventBus) this.eventBus.publish(createBalanceChangedEvent(entry, undefined)).catch(() => {});
  }
  hold(walletId: NumericId, amount: number) { this.ensure(walletId); const curr = this.balances.get(walletId)!; curr.available -= amount; curr.reserved += amount; this.adjust(walletId, {}); }
  release(walletId: NumericId, amount: number) { this.ensure(walletId); const curr = this.balances.get(walletId)!; curr.reserved -= amount; curr.available += amount; this.adjust(walletId, {}); }
}

class SimpleAccountingEngine implements AccountingEngine {
  private transactions = new Map<NumericId, Transaction>();
  private ledger: InMemoryLedger;
  private balanceEngine: SimpleBalanceEngine;
  private eventBus?: EventBus;
  private protocolEngine?: ProtocolEngine;
  constructor(ledger: InMemoryLedger, balanceEngine?: SimpleBalanceEngine, eventBus?: EventBus, protocolEngine?: ProtocolEngine) {
    this.ledger = ledger;
    this.balanceEngine = balanceEngine || new SimpleBalanceEngine(ledger, eventBus);
    this.eventBus = eventBus;
    this.protocolEngine = protocolEngine;
  }
  createTransaction(tx: Omit<Transaction, 'id' | 'status' | 'createdAt'>): Transaction {
    const id = createNumericId();
    const nowTs = now();
    const t: Transaction = { id, ...tx, status: 'created', createdAt: nowTs } as Transaction;
    this.transactions.set(id, t);
    if (this.eventBus) this.eventBus.publish(createTransactionCreatedEvent(t, undefined)).catch(() => {});
    // basic immediate effect for transfer
    if (t.type === 'transfer' && t.fromWalletId && t.toWalletId) {
      // debit from wallet
      this.balanceEngine.adjust(t.fromWalletId, { available: -t.amount });
      // credit to toWallet pending
      this.balanceEngine.adjust(t.toWalletId, { pending: t.amount });
      // ledger entries
      const e1 = { id: createNumericId(), transactionId: t.id, walletId: t.fromWalletId, debit: t.amount, credit: 0, balanceAfter: this.balanceEngine.getBalance(t.fromWalletId).available, timestamp: now() } as LedgerEntry;
      const e2 = { id: createNumericId(), transactionId: t.id, walletId: t.toWalletId, debit: 0, credit: t.amount, balanceAfter: this.balanceEngine.getBalance(t.toWalletId).available, timestamp: now() } as LedgerEntry;
      this.ledger.append(e1); this.ledger.append(e2);
    }
    return t;
  }
  completeTransaction(id: NumericId) {
    const t = this.transactions.get(id);
    if (!t) return undefined;
    t.status = 'completed';
    this.transactions.set(id, t);
    // settle pending to available for transfer
    if (t.type === 'transfer' && t.toWalletId) {
      this.balanceEngine.adjust(t.toWalletId, { pending: -t.amount, available: t.amount });
    }
    if (this.eventBus) this.eventBus.publish(createTransactionCompletedEvent(t, undefined)).catch(() => {});
    return t;
  }
  cancelTransaction(id: NumericId) {
    const t = this.transactions.get(id);
    if (!t) return undefined;
    t.status = 'cancelled';
    this.transactions.set(id, t);
    // reverse effects for transfer
    if (t.type === 'transfer' && t.fromWalletId && t.toWalletId) {
      this.balanceEngine.adjust(t.fromWalletId, { available: t.amount });
      this.balanceEngine.adjust(t.toWalletId, { pending: -t.amount });
    }
    if (this.eventBus) this.eventBus.publish(createTransactionCancelledEvent(t, undefined)).catch(() => {});
    return t;
  }
  listTransactions(walletId?: NumericId) { return Array.from(this.transactions.values()).filter(t => !walletId || t.fromWalletId === walletId || t.toWalletId === walletId); }
}

export function createInMemoryFinance(eventBus?: EventBus, protocolEngine?: ProtocolEngine) {
  const ledger = new InMemoryLedger();
  const balances = new SimpleBalanceEngine(ledger, eventBus);
  const wallets = new InMemoryWalletRegistry(eventBus);
  const accounting = new SimpleAccountingEngine(ledger, balances, eventBus, protocolEngine);
  return { walletRegistry: wallets, balanceEngine: balances, ledger, accountingEngine: accounting };
}
