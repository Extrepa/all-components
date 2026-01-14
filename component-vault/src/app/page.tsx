import prisma from '@/lib/db/prisma';
import { IngestForm } from '@/components/ingest-form';
export const dynamic = 'force-dynamic';
export default async function Dashboard() {
  const archives = await prisma.siteArchive.findMany({ orderBy: { lastCrawledAt: 'desc' }, include: { _count: { select: { pages: true } } }, take: 10 });
  return (
    <main className="min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12 pt-10">
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Component Vault</h1>
        <IngestForm />
        <div className="grid gap-3">
            {archives.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="font-medium text-zinc-200">{site.domain}</div>
                <div className="text-zinc-500">{site.status}</div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
