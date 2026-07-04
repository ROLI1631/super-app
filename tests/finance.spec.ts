import { createDefaultInfrastructureServices } from '../infrastructure/factory';

describe('Finance Engine (TOM9) basic flows', () => {
  it('creates wallets and processes a transfer', () => {
    const core = createDefaultInfrastructureServices();
    const walletReg = core.walletRegistry;
    const balance = core.balanceEngine;
    const accounting = core.accountingEngine as any;

    const w1 = walletReg.createWallet(1, 'USD');
    const w2 = walletReg.createWallet(2, 'USD');

    expect(w1).toBeDefined();
    expect(w2).toBeDefined();

    // seed balance
    balance.adjust(w1.id, { available: 100 });
    const tx = accounting.createTransaction({ type: 'transfer', amount: 30, currency: 'USD', fromWalletId: w1.id, toWalletId: w2.id });
    expect(tx).toBeDefined();
    expect(tx.status).toBe('created');

    const list = accounting.listTransactions(w1.id);
    expect(list.length).toBeGreaterThanOrEqual(1);

    const completed = accounting.completeTransaction(tx.id);
    expect(completed?.status).toBe('completed');

    const b1 = balance.getBalance(w1.id);
    const b2 = balance.getBalance(w2.id);
    expect(b1.available).toBeGreaterThanOrEqual(70);
    expect(b2.available).toBeGreaterThanOrEqual(30);
  });
});
