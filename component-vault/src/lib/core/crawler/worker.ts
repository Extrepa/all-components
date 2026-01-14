import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { chromium } from 'playwright';
import { PageAnalyzer } from '../analyzer/page-analyzer';
import { ComponentType } from '@prisma/client';

const connection = { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') };

const worker = new Worker('crawler-queue', async (job: Job) => {
  const { archiveId, url } = job.data;
  console.log(`[Job ${job.id}] 🕷️ Scanning: ${url}`);
  try {
    await prisma.siteArchive.update({ where: { id: archiveId }, data: { status: 'PROCESSING' } });
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const content = await page.content();
    const title = await page.title();
    
    // Attempt CSS Extraction
    const cssPayload = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => (l as HTMLLinkElement).href);
        const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n');
        return `/* Extracted */ \n ${links.map(u => `@import url("${u}");`).join('\n')} \n ${styles}`;
    });

    const analyzer = new PageAnalyzer(content, url);
    const extracted = analyzer.extractAll();

    const snapshot = await prisma.pageSnapshot.create({
      data: { siteArchiveId: archiveId, url, title, capturedCss: cssPayload }
    });

    for (const comp of extracted) {
      const dbType = Object.values(ComponentType).includes(comp.type as any) ? (comp.type as ComponentType) : ComponentType.UNKNOWN;
      await prisma.component.create({
        data: {
          pageSnapshotId: snapshot.id,
          name: `${comp.type} - ${comp.selector}`,
          type: dbType,
          htmlSnippet: comp.html,
          complexityScore: comp.score,
          tags: [comp.type.toLowerCase()],
          isReact: comp.html.includes('data-react'),
          isTailwind: comp.html.includes('text-') || comp.html.includes('flex-')
        }
      });
    }

    await browser.close();
    await prisma.siteArchive.update({ where: { id: archiveId }, data: { status: 'COMPLETED', lastCrawledAt: new Date() } });
    console.log(`[Job ${job.id}] ✅ Done. Saved ${extracted.length} components.`);
  } catch (error) {
    console.error(error);
    await prisma.siteArchive.update({ where: { id: archiveId }, data: { status: 'FAILED' } });
  }
}, { connection });
