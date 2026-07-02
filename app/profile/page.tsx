import { identityCore } from '../../lib/services';

export default function ProfilePage() {
  const identities = identityCore.listIdentities();
  const profile = identities[0];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Profile</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">User profile</h1>
        <p className="mt-3 text-slate-400">View identity information managed by the existing identity core.</p>
      </div>

      {profile ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Handle</p>
              <p className="mt-3 text-2xl font-semibold text-white">{profile.handle}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Alias</p>
              <p className="mt-3 text-2xl font-semibold text-white">{profile.alias ?? 'No alias'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-sm text-slate-400">ID</p>
              <p className="mt-3 text-xl font-semibold text-white">{profile.id}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-sm text-slate-400">Kind</p>
              <p className="mt-3 text-xl font-semibold text-white">{profile.kind}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-slate-400">No profile information available.</div>
      )}
    </div>
  );
}
