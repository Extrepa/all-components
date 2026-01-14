'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function SandboxedPreview({ html, css, className }: { html: string; css?: string | null; className?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;padding:2rem;background:#fff;}::-webkit-scrollbar{width:8px;}</style><style>${css || ''}</style></head><body>${html}</body></html>`);
    doc.close();
    setLoading(false);
  }, [html, css]);

  return (
    <div className={`relative bg-white/5 rounded-lg overflow-hidden border border-zinc-800 ${className}`}>
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10"><Loader2 className="animate-spin text-zinc-500" /></div>}
      <iframe ref={iframeRef} className="w-full h-full bg-white block" sandbox="allow-scripts allow-same-origin" />
    </div>
  );
}
