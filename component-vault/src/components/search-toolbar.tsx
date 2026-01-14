'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Star } from 'lucide-react';

export function SearchToolbar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams.toString());
    term ? params.set('q', term) : params.delete('q');
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  const handleFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 mb-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input onChange={(e) => handleSearch(e.target.value)} defaultValue={searchParams.get('q')?.toString()} placeholder="Search..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:ring-1 focus:ring-blue-500 outline-none" />
      </div>
      <button onClick={() => handleFilter('fav', searchParams.get('fav') ? null : 'true')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-zinc-400">
        <Star className={`w-4 h-4 ${searchParams.get('fav') ? 'fill-yellow-500 text-yellow-500' : ''}`} /> Favorites
      </button>
    </div>
  );
}
