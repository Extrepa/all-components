import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SectionWrapperProps } from '../types';

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  expanded,
  onToggle,
  children,
  className = ''
}) => {
  return (
    <div className={`border-b border-gray-700/50 ${className}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-1.5 py-1 hover:bg-gray-700/30 text-left"
      >
        <span className="text-[11px] font-medium text-gray-300">{title}</span>
        {expanded ? (
          <ChevronDown size={14} className="text-gray-500" />
        ) : (
          <ChevronRight size={14} className="text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="px-1.5 pb-1.5 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

