export default function Header() {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.32em] text-slate-400">
          Користувацький кабінет
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-100">
          User Dashboard
        </h1>
      </div>
      <p className="max-w-xl text-sm leading-6 text-slate-400">
        Використайте меню зліва, щоб перейти до потрібної секції. Кожна сторінка має власну область контенту.
      </p>
    </header>
  );
}
