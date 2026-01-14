'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Database } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Sites', href: '/sites', icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r border-zinc-800 bg-black h-screen fixed left-0 top-0 p-6 flex flex-col">
      <div className="mb-10 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">E</div>
        <span className="font-bold text-xl tracking-tight text-white">Vault</span>
      </div>
      <nav className="space-y-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={clsx('flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all', isActive ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-900')}>
              <item.icon className="w-4 h-4" /> {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
