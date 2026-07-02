import { catalogApi } from '../../lib/services';

export default function ServicesPage() {
  const categories = catalogApi.getHierarchy();
  const serviceCategory = categories.find((category) => category.label.toLowerCase() === 'services');
  const services = serviceCategory ? catalogApi.getByCategory(serviceCategory.id) : [];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Services</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Service offerings from the core marketplace</h1>
        <p className="mt-3 text-slate-400">View available service items and explore core-managed listings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 transition hover:border-slate-700 hover:bg-slate-900">
            <h2 className="text-xl font-semibold text-white">{service.title}</h2>
            <p className="mt-3 text-slate-400">{service.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
              <span>Status: {service.status ?? 'unknown'}</span>
              <span>Category: {service.categoryId ?? 'n/a'}</span>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-400">No service items available yet.</div>
        )}
      </div>
    </div>
  );
}
