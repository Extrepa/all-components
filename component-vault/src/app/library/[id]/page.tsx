import prisma from '@/lib/db/prisma';
import { SandboxedPreview } from '@/components/sandboxed-preview';
import { CodeTabs } from '@/components/code-tabs';
import { explainComponent } from '@/app/actions';
import ReactMarkdown from 'react-markdown';
import { Bot, Sparkles } from 'lucide-react';

export default async function ComponentDetail({ params }: { params: { id: string } }) {
  const comp = await prisma.component.findUnique({ where: { id: params.id }, include: { pageSnapshot: true, explanation: true } });
  if (!comp) return <div>Not found</div>;

  return (
    <main className="min-h-screen bg-black flex flex-col h-screen overflow-hidden">
      <div className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/50">
        <h1 className="font-bold">{comp.name}</h1>
        {!comp.explanation && <form action={async () => { 'use server'; await explainComponent(comp.id); }}><button className="flex gap-2 bg-purple-600 text-white px-4 py-2 rounded-md"><Sparkles className="w-4 h-4" /> Analyze</button></form>}
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-zinc-800 bg-zinc-950 p-6 overflow-y-auto">
            {comp.explanation && <div className="mt-8"><h3 className="text-purple-400 mb-2 flex gap-2"><Bot className="w-4 h-4" /> AI Analysis</h3><p className="text-sm text-zinc-300">{comp.explanation.summary}</p></div>}
        </div>
        <div className="flex-1 bg-[#0d0d0d] overflow-y-auto p-8 space-y-8">
            <SandboxedPreview html={comp.htmlSnippet} css={comp.pageSnapshot.capturedCss} className="h-[400px] shadow-2xl" />
            <CodeTabs componentId={comp.id} rawHtml={comp.htmlSnippet} reactCode={comp.reactCode} />
            {comp.explanation && <div className="prose prose-invert bg-zinc-900/50 p-8 rounded-xl"><ReactMarkdown>{comp.explanation.markdownContent}</ReactMarkdown></div>}
        </div>
      </div>
    </main>
  );
}
