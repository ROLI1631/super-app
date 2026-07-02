import { financeApi } from '../../lib/services';

export default function WalletPage() {
  const wallets = financeApi.listWallets();

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Wallet</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Your wallet balances and recent activity</h1>
        <p className="mt-3 text-slate-400">Review balances and transaction history from the existing finance engine.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {wallets.length > 0 ? (
          wallets.map((wallet) => {
            const balance = financeApi.getBalance(wallet.id);
            const transactions = financeApi.listTransactions(wallet.id);
            const ledger = financeApi.listLedgerEntries(wallet.id);
            return (
              <div key={wallet.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Wallet {wallet.id}</h2>
                    <p className="mt-2 text-sm text-slate-400">Currency: {wallet.currency}</p>
                  </div>
                  <div className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-300">Owner {wallet.ownerId}</div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-sm text-slate-400">Available</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{balance.available}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-sm text-slate-400">Pending</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{balance.pending}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-sm font-semibold text-white">Transactions</p>
                    {transactions.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                        {transactions.slice(0, 4).map((tx) => (
                          <li key={tx.id}>{tx.type} {tx.amount} {tx.currency} ({tx.status})</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-slate-400">No transactions yet.</p>
                    )}
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-sm font-semibold text-white">Ledger</p>
                    {ledger.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                        {ledger.slice(0, 4).map((entry: any) => (
                          <li key={entry.id}>#{entry.id} {entry.debit ? `-${entry.debit}` : `+${entry.credit}`} balance {entry.balanceAfter}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-slate-400">No ledger entries yet.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-400">No wallets available.</div>
        )}
      </div>
    </div>
  );
}
