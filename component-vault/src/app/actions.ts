'use server';
import prisma from '@/lib/db/prisma';
import { crawlerQueue } from '@/lib/queue/crawler-queue';
import { generateComponentDocs, transformToReact } from '@/lib/ai/client';
import { revalidatePath } from 'next/cache';

export async function ingestUrl(formData: FormData) {
  const url = formData.get('url') as string;
  if (!url) return;
  const archive = await prisma.siteArchive.upsert({
    where: { rootUrl: url },
    update: { status: 'PENDING' },
    create: { rootUrl: url, domain: new URL(url).hostname, status: 'PENDING' }
  });
  await crawlerQueue.add('crawl-site', { archiveId: archive.id, url, depth: 1 });
  revalidatePath('/');
}

export async function toggleFavorite(id: string) {
  const c = await prisma.component.findUnique({ where: { id } });
  if (c) await prisma.component.update({ where: { id }, data: { isFavorite: !c.isFavorite } });
  revalidatePath('/library');
}

export async function explainComponent(id: string) {
  const c = await prisma.component.findUnique({ where: { id }, include: { pageSnapshot: true } });
  if (!c) return;
  const data = await generateComponentDocs(c.htmlSnippet, c.type, c.pageSnapshot.capturedCss || '');
  await prisma.explanationDoc.create({
    data: { componentId: c.id, summary: data.summary, technicalNotes: data.technicalNotes, markdownContent: data.markdownContent, complexityRating: data.complexityRating, tags: data.suggestedTags }
  });
  revalidatePath(`/library/${id}`);
}

export async function generateReactCode(id: string) {
  const c = await prisma.component.findUnique({ where: { id } });
  if (!c) return;
  const reactCode = await transformToReact(c.htmlSnippet, c.type);
  await prisma.component.update({ where: { id }, data: { reactCode } });
  revalidatePath(`/library/${id}`);
}
