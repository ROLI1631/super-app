import Link from 'next/link';
import { catalogApi } from '../../lib/services';

export default function ProductsPage() {
  const categories = catalogApi.getHierarchy();
  const productCategory = categories.find((category) => category.label.toLowerCase() === 'products');
  const products = productCategory ? catalogApi.getByCategory(productCategory.id) : [];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Products</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Available product listings</h1>
        <p className="mt-3 text-slate-400">Browse catalog items, search by name, and review pricing from the core catalog engine.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 transition hover:border-slate-700 hover:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{product.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{product.description}</p>
              </div>
              <div className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-300">Product</div>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
              <span>Status: {product.status ?? 'unknown'}</span>
              <span>Category ID: {product.categoryId ?? '—'}</span>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-400">No products available yet.</div>
        )}
      </div>
    </div>
  );
}
