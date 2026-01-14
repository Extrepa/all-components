'use client';
import { useState } from 'react';
import { generateReactCode } from '@/app/actions';
import { Code, FileCode, Download, Loader2, Copy, Check } from 'lucide-react';

export function CodeTabs({ componentId, rawHtml, reactCode }: { componentId: string; rawHtml: string; reactCode?: string | null }) {
  const [activeTab, setActiveTab] = useState<'html' | 'react'>('html');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateReactCode(componentId);
    setIsGenerating(false);
    setActiveTab('react');
  };

  const handleDownload = () => {
    if (!reactCode) return;
    const blob = new Blob([reactCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Component.tsx'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-zinc-800 overflow-hidden h-[500px] flex flex-col">
      <div className="flex justify-between px-4 border-b border-zinc-700/50 bg-zinc-900/50">
        <div className="flex">
            <button onClick={() => setActiveTab('html')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'html' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}>HTML</button>
            <button onClick={() => setActiveTab('react')} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'react' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}>React</button>
        </div>
        <div className="flex gap-2 items-center">
            {activeTab === 'react' && reactCode && <button onClick={handleDownload}><Download className="w-4 h-4 text-zinc-400" /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-0 bg-[#1e1e1e]">
        {activeTab === 'html' && <pre className="p-6 text-sm font-mono text-zinc-300 whitespace-pre-wrap">{rawHtml}</pre>}
        {activeTab === 'react' && (
          !reactCode ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium flex items-center gap-2">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate React Code'}
              </button>
            </div>
          ) : <pre className="p-6 text-sm font-mono text-blue-200 whitespace-pre-wrap">{reactCode}</pre>
        )}
      </div>
    </div>
  );
}
