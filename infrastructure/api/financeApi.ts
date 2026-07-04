import { WalletRegistry, BalanceEngine, AccountingEngine } from '../../engines/finance';

export class FinanceApi {
  constructor(private readonly walletRegistry: WalletRegistry, private readonly balanceEngine: BalanceEngine, private readonly accounting: AccountingEngine) {}

  getWallet(id: number) {
    return this.walletRegistry.getWallet(id);
  }

  listWallets() {
    return this.walletRegistry.listWallets();
  }

  getBalance(walletId: number) {
    return this.balanceEngine.getBalance(walletId);
  }

  listTransactions(walletId?: number) {
    return this.accounting.listTransactions(walletId);
  }

  listLedgerEntries(walletId?: number) {
    // @ts-ignore
    return (this.accounting as any).ledger ? (this.accounting as any).ledger.list(walletId) : [];
  }
}

export function createFinanceApi(walletRegistry: WalletRegistry, balanceEngine: BalanceEngine, accounting: AccountingEngine) {
  return new FinanceApi(walletRegistry, balanceEngine, accounting);
}
