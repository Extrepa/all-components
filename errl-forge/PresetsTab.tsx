import React, { useRef, useState } from 'react';
import { ASSET_PRESETS } from '../constants';
import { Preset, MapleData, MapleCategory, MapleVersion } from '../types';
import { ArchivedTab } from './ArchivedTab';

interface PresetsTabProps {
  onSelectPreset: (preset: Preset) => void;
  onSelectMapleAsset: (asset: MapleData) => void;
  selectedPresetId?: string;
  selectedMapleAssetId?: string;
}

export const PresetsTab: React.FC<PresetsTabProps> = ({ 
  onSelectPreset, 
  onSelectMapleAsset,
  selectedPresetId,
  selectedMapleAssetId 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {/* Base Models Section */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Base Models</div>
        <div className="space-y-2">
          {ASSET_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`w-full text-left p-3 rounded border transition-all group flex items-center gap-3 ${
                selectedPresetId === preset.id
                  ? 'bg-indigo-900/30 border-indigo-500 hover:bg-indigo-900/40'
                  : 'bg-gray-800 hover:bg-gray-700 hover:border-indigo-500 border-transparent'
              }`}
            >
              {preset.imageUrl && (
                <img 
                  src={preset.imageUrl} 
                  alt={preset.name}
                  className="w-12 h-12 object-contain rounded bg-gray-900 border border-gray-700 pixelated shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-200 group-hover:text-white text-sm">{preset.name}</div>
                <div className="text-xs text-gray-500 capitalize">{preset.type}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Archived Database Assets Section */}
      <ArchivedTab
        onSelectAsset={(asset, version) => onSelectMapleAsset(asset)}
        selectedAssetId={selectedMapleAssetId?.replace('maple-', 'archived-')}
      />
    </div>
  );
};

