import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface StylesSectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export const StylesSection: React.FC<StylesSectionProps> = ({
  expanded,
  onToggle
}) => {
  return (
    <div className="border-b border-gray-700/50">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30 text-left"
      >
        <span className="text-[11px] font-medium text-gray-300">Styles</span>
        {expanded ? (
          <ChevronDown size={14} className="text-gray-500" />
        ) : (
          <ChevronRight size={14} className="text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="px-2 pb-2 space-y-1">
          <div className="px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700/30 rounded cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-gray-600 bg-gray-700"></div>
              <span>No styles yet</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

