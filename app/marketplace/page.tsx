import { marketplaceApi } from '../../lib/services';

export default function MarketplacePage() {
  const listings = marketplaceApi.listListings();
  const offers = marketplaceApi.listOffers();
  const reservations = marketplaceApi.listReservations();

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Marketplace</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Current listings and activity</h1>
        <p className="mt-3 text-slate-400">Explore published marketplace listings, active offers, and reservations from the in-memory marketplace engine.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold text-white">Listings</h2>
          {listings.length > 0 ? (
            listings.map((listing) => (
              <div key={listing.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-lg font-semibold text-white">{listing.title}</p>
                <p className="mt-2 text-sm text-slate-400">{listing.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                  <span>Status: {listing.status}</span>
                  <span>Price: {listing.price ?? 'N/A'}</span>
                  <span>Category ID: {listing.categoryId ?? '—'}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No marketplace listings available.</p>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Offers</h2>
            <p className="mt-2 text-sm text-slate-400">Live offers created from marketplace activity.</p>
          </div>
          {offers.length > 0 ? (
            offers.map((offer: any) => (
              <div key={offer.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-sm font-semibold text-white">Offer #{offer.id}</p>
                <p className="mt-2 text-sm text-slate-400">Amount: {offer.amount}</p>
                <p className="mt-1 text-sm text-slate-400">Status: {offer.status}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No offers available.</p>
          )}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-white">Reservations</p>
            <p className="mt-2 text-slate-400">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''} tracked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
