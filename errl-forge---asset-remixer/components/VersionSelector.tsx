import React, { useState } from 'react';
import { MapleVersion, MapleCategory } from '../types';
import { DownloadButton } from './DownloadButton';

interface VersionSelectorProps {
  activeVersion: MapleVersion;
  activeCategory: MapleCategory;
  onVersionChange: (version: MapleVersion) => void;
  isDownloading?: boolean;
  downloadCount?: number;
  onDownloadProgress?: (count: number) => void;
  onDownloadStateChange?: (isDownloading: boolean, count: number) => void;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  activeVersion,
  activeCategory,
  onVersionChange,
  isDownloading: externalIsDownloading,
  downloadCount: externalDownloadCount,
  onDownloadProgress,
  onDownloadStateChange
}) => {
  const [internalIsDownloading, setInternalIsDownloading] = useState(false);
  const [internalDownloadCount, setInternalDownloadCount] = useState(0);
  
  const isDownloading = externalIsDownloading !== undefined ? externalIsDownloading : internalIsDownloading;
  const downloadCount = externalDownloadCount !== undefined ? externalDownloadCount : internalDownloadCount;
  return (
    <>
      <div className="px-3 py-2 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">DB Ver.</span>
          <select 
            value={activeVersion} 
            onChange={(e) => onVersionChange(e.target.value as MapleVersion)}
            className="bg-gray-800 text-xs text-white border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 flex-1 min-w-0"
          >
            <option value="210">GMS v210</option>
            <option value="177">GMS v177</option>
            <option value="95">GMS v95</option>
            <option value="83">GMS v83</option>
            <option value="62">GMS v62</option>
          </select>
          <DownloadButton 
            activeCategory={activeCategory} 
            activeVersion={activeVersion}
            onProgress={(count) => {
              setInternalDownloadCount(count);
              if (onDownloadProgress) onDownloadProgress(count);
            }}
            onDownloadStateChange={(downloading, count) => {
              setInternalIsDownloading(downloading);
              setInternalDownloadCount(count);
              if (onDownloadStateChange) onDownloadStateChange(downloading, count);
            }}
          />
        </div>
      </div>
      
      {/* Download Progress Bar */}
      {isDownloading && (
        <div className="px-3 py-1 bg-indigo-900/30 border-b border-indigo-500/30 flex items-center justify-between">
          <span className="text-[9px] text-indigo-300 font-bold">Fetching Archive...</span>
          <span className="text-[9px] text-indigo-300">{downloadCount} items</span>
        </div>
      )}
    </>
  );
};

