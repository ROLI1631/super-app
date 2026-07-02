import Link from 'next/link';
import { catalogApi, financeApi, marketplaceApi } from '../lib/services';

export default function HomePage() {
  const categories = catalogApi.getHierarchy();
  const productCategory = categories.find((category) => category.label === 'Products');
  const serviceCategory = categories.find((category) => category.label === 'Services');
  const products = productCategory ? catalogApi.getByCategory(productCategory.id) : [];
  const services = serviceCategory ? catalogApi.getByCategory(serviceCategory.id) : [];
  const listings = marketplaceApi.listListings();
  const wallets = financeApi.listWallets();
  const wallet = wallets[0];

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/20">
        <div className="max-w-4xl space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Super App Marketplace</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">A working MVP for search, catalog, marketplace, wallet and profile.</h1>
            <p className="text-slate-300 sm:text-lg">Browse product and service listings, explore marketplace offers, view wallet balances, and discover user profile information from the existing core services.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/search?query=mobile" className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Search</p>
              <p className="mt-4 text-xl font-semibold text-white">Find catalog items</p>
            </Link>
            <Link href="/categories" className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Categories</p>
              <p className="mt-4 text-xl font-semibold text-white">{categories.length} categories</p>
            </Link>
            <Link href="/marketplace" className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Marketplace</p>
              <p className="mt-4 text-xl font-semibold text-white">{listings.length} listings</p>
            </Link>
            <Link href="/wallet" className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Wallet</p>
              <p className="mt-4 text-xl font-semibold text-white">{wallet ? `${wallet.currency} wallet` : 'No wallet found'}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Featured Products</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">New arrivals</h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-sky-400 hover:text-sky-300">View all</Link>
          </div>
          <div className="grid gap-4">
            {products.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Featured Services</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Popular offers</h2>
            </div>
            <Link href="/services" className="text-sm font-medium text-sky-400 hover:text-sky-300">Browse</Link>
          </div>
          <div className="grid gap-4">
            {services.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
