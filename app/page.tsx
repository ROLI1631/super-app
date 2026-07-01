export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Welcome to Super App
        </h1>
        <p className="mt-6 text-lg text-slate-300">
          This Next.js 15 project uses the App Router, TypeScript, and Tailwind CSS.
        </p>
      </div>
    </main>
  );
}
