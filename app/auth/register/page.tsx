import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Register</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Create your account</h1>
        <p className="mt-3 text-slate-400">Register a user profile to connect with marketplace and wallet experiences.</p>
      </div>

      <form className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-sm">
        <label className="space-y-3 text-sm text-slate-300">
          <span>Username</span>
          <input type="text" placeholder="so8fi" className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        <label className="space-y-3 text-sm text-slate-300">
          <span>Email</span>
          <input type="email" placeholder="you@example.com" className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        <label className="space-y-3 text-sm text-slate-300">
          <span>Password</span>
          <input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
        </label>
        <button className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400">Create Account</button>
      </form>

      <p className="text-sm text-slate-400">
        Already registered? <Link href="/auth/login" className="text-sky-300 hover:text-white">Sign in instead</Link>.
      </p>
    </div>
  );
}
