import Link from 'next/link';

const links = [
  { href: '/user/dashboard', label: 'Dashboard' },
  { href: '/user/profile', label: 'Профіль користувача' },
  { href: '/user/avatar', label: 'Аватар' },
  { href: '/user/personal-data', label: 'Персональні дані' },
  { href: '/user/locations', label: 'Локації' },
  { href: '/user/social', label: 'Соціальні мережі' },
  { href: '/user/search', label: 'Пошук' },
  { href: '/user/p2p', label: 'P2P' },
  { href: '/user/exchange', label: 'Біржа' },
  { href: '/user/dating-agency', label: 'Дейтінгове агентство' },
  { href: '/user/services', label: 'Сервіси' },
  { href: '/user/subscriptions', label: 'Підписки' },
];

export default function Sidebar() {
  return (
    <nav className="space-y-2">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
