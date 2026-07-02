'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { catalogApi } from '../../lib/services';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('query') ?? '';
  const results = query ? catalogApi.search(query) : [];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Search</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Find catalog items</h1>
        <p className="mt-3 text-slate-400">Search across products, services, and marketplace listings using the existing catalog search API.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <form className="flex gap-3">
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Enter search terms"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
            />
            <button type="submit" className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400">
              Search
            </button>
          </form>

          {query ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Results for <span className="font-semibold text-white">{query}</span></p>
              {results.length > 0 ? (
                <div className="grid gap-4">
                  {results.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                          <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-300">{item.kind}</span>
                      </div>
                      <div className="mt-3 text-sm text-slate-400">Category ID: {item.categoryId ?? '—'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No results found for this search term.</p>
              )}
            </div>
          ) : (
            <p className="text-slate-400">Use the search bar to look for catalog items.</p>
          )}
        </section>

        <aside className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quick links</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/categories" className="block text-slate-200 hover:text-white">Browse categories</Link>
              <Link href="/products" className="block text-slate-200 hover:text-white">View products</Link>
              <Link href="/services" className="block text-slate-200 hover:text-white">View services</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
