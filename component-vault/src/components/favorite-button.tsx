'use client';
import { toggleFavorite } from '@/app/actions';
import { Star } from 'lucide-react';
import { useTransition } from 'react';

export function FavoriteButton({ id, isFavorite }: { id: string, isFavorite: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button onClick={(e) => { e.preventDefault(); startTransition(async () => await toggleFavorite(id)); }} disabled={isPending} className={`p-2 rounded-full hover:bg-white/10 ${isFavorite ? 'text-yellow-400' : 'text-zinc-600'}`}>
      <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
    </button>
  );
}
