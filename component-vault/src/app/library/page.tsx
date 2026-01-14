import prisma from '@/lib/db/prisma';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { SearchToolbar } from '@/components/search-toolbar';
import { FavoriteButton } from '@/components/favorite-button';
import { ComponentType } from '@prisma/client';
export const dynamic = 'force-dynamic';

export default async function LibraryPage({ searchParams }: { searchParams: { q?: string; type?: string; stack?: string; fav?: string } }) {
  const where: any = {};
  if (searchParams.q) where.OR = [{ name: { contains: searchParams.q, mode: 'insensitive' } }, { tags: { has: searchParams.q.toLowerCase() } }];
  if (searchParams.type) where.type = searchParams.type as ComponentType;
  if (searchParams.fav) where.isFavorite = true;

  const components = await prisma.component.findMany({ where, orderBy: { createdAt: 'desc' }, include: { pageSnapshot: true }, take: 100 });
  return (
    <main className="p-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Library</h1>
      <SearchToolbar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((comp) => (
          <div key={comp.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col relative">
             <div className="absolute top-2 right-2 z-20"><FavoriteButton id={comp.id} isFavorite={comp.isFavorite} /></div>
             <div className="h-40 bg-zinc-950 p-4 border-b border-zinc-800 overflow-hidden relative">
                <pre className="text-[10px] text-zinc-600 opacity-50">{comp.htmlSnippet.slice(0, 300)}</pre>
                <Link href={`/library/${comp.id}`} className="absolute inset-0 z-10" />
             </div>
             <div className="p-4"><h3 className="font-medium text-zinc-200">{comp.name}</h3></div>
          </div>
        ))}
      </div>
    </main>
  );
}
