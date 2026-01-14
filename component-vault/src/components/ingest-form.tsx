'use client';
import { ingestUrl } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { Search, Loader2 } from 'lucide-react';
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} type="submit" className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md">{pending ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}</button>;
}
export function IngestForm() {
  return (
    <form action={ingestUrl} className="relative w-full max-w-2xl mx-auto mb-12">
      <input name="url" type="url" placeholder="https://example.com" required className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-blue-500" />
      <SubmitButton />
    </form>
  );
}
