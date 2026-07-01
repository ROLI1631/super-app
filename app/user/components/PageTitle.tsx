export default function PageTitle({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 shadow-xl shadow-slate-950/20">
      <h1 className="text-4xl font-semibold text-slate-100">{title}</h1>
    </div>
  );
}
