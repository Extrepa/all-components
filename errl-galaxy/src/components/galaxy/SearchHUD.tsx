import React, { useState } from 'react';
import { useGalaxyStore } from '../../store/useGalaxyStore';

// Accept the data as a prop
export const SearchHUD = ({ data }: { data: any[] }) => {
  const [query, setQuery] = useState('');
  const setTargetNodeId = useGalaxyStore((s) => s.setTargetNodeId);

  // Filter logic
  const results = query 
    ? data.filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="absolute top-8 right-8 z-50 flex flex-col items-end gap-2 w-80">
      {/* 1. The Input Field */}
      <div className="relative w-full group">
        <input 
          type="text" 
          placeholder="INITIATE WARP..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-black/40 border border-white/20 text-white font-mono text-sm p-3 rounded-lg outline-none focus:border-errl-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] backdrop-blur-md transition-all placeholder:text-white/20"
        />
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-errl-cyan opacity-50" />
      </div>

      {/* 2. The Results Dropdown */}
      {results.length > 0 && (
        <div className="w-full bg-black/80 border border-white/10 rounded-lg overflow-hidden backdrop-blur-xl max-h-60 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTargetNodeId(item.id); // Trigger Warp
                setQuery(''); // Clear search
              }}
              className="w-full text-left p-3 hover:bg-errl-cyan/20 border-b border-white/5 flex justify-between items-center group transition-colors"
            >
              <span className="font-bold text-sm text-white group-hover:text-errl-cyan">{item.name}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{item.tier}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};