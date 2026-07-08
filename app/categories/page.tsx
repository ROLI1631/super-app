import Link from 'next/link';
import { catalogApi } from '../../lib/services';

export default function CategoriesPage() {
  const categories = catalogApi.getHierarchy();
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Marketplace Categories</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Browse categories and available listings</h1>
        <p className="mt-3 text-slate-400">Explore product, service and marketplace groups built from the shared catalog engine.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {categories.map((category: any) => {
          const items = catalogApi.getByCategory(category.id);
          return (
            <Link key={category.id} href={`/search?query=${encodeURIComponent(category.label)}`} className="group rounded-3xl border border-slate-800 bg-slate-950 p-6 transition hover:border-slate-700 hover:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{category.label}</h2>
                  <p className="mt-2 text-sm text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-300 group-hover:bg-slate-700">View</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
