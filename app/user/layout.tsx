import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export const metadata: Metadata = {
  title: 'User Dashboard | Super App',
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-3rem)] gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Меню
              </p>
            </div>
            <Sidebar />
          </aside>
          <main className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
            <Header />
            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
