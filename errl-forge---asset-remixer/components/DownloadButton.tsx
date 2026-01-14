import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2, ChevronDown, Image, FileJson, Archive } from 'lucide-react';
import { MapleCategory, MapleVersion, MapleData } from '../types';
import { getPagedMapleData, getMapleSpriteUrl, getIconUrl, fetchPetImage } from '../services/mapleStoryService';
import JSZip from 'jszip';

interface DownloadButtonProps {
  activeCategory: MapleCategory;
  activeVersion: MapleVersion;
  onProgress?: (count: number) => void;
  onDownloadStateChange?: (isDownloading: boolean, count: number) => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ activeCategory, activeVersion, onProgress, onDownloadStateChange }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadMenu && downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadMenu]);

  const handleDownload = async (type: 'thumbnails' | 'json' | 'both') => {
    try {
      setIsDownloading(true);
      setDownloadCount(0);
      if (onDownloadStateChange) onDownloadStateChange(true, 0);
      setShowDownloadMenu(false);
      
      // Fetch all data for current category and version
      const allAssets: MapleData[] = [];
      let page = 0;
      const limit = activeVersion === '62' ? 1000 : 100;
      let hasMore = true;
      
      while (hasMore) {
        const result = await getPagedMapleData(activeCategory, activeVersion, page, limit, '', false);
        const data = result.items || [];
        allAssets.push(...data);
        setDownloadCount(allAssets.length);
        if (onProgress) onProgress(allAssets.length);
        if (onDownloadStateChange) onDownloadStateChange(true, allAssets.length);
        
        if (data.length < limit || !result.hasMore) {
          hasMore = false;
        } else {
          page++;
          // Safety limit
          if (page > 500) hasMore = false;
        }
      }
      
      const zip = new JSZip();
      let thumbnailSuccessCount = 0;
      let thumbnailFailCount = 0;
      
      // Download thumbnails if needed
      if (type === 'thumbnails' || type === 'both') {
        for (const asset of allAssets) {
          try {
            let imgBlob: Blob | null = null;
            
            // Handle different URL types
            if (asset.imgUrl?.startsWith('data:')) {
              // For pets or other assets with data URLs, convert to blob
              try {
                const response = await fetch(asset.imgUrl);
                imgBlob = await response.blob();
              } catch (error) {
                console.warn(`Failed to convert data URL to blob for ${asset.name}:`, error);
                thumbnailFailCount++;
                continue;
              }
            } else {
              // For regular URLs, try to get the correct thumbnail URL
              let thumbnailUrl = asset.imgUrl;
              
              // If imgUrl is missing or invalid, try to get the icon URL
              if (!thumbnailUrl || thumbnailUrl === '') {
                thumbnailUrl = getMapleSpriteUrl(asset.id, asset.category, activeVersion);
              }
              
              // For pets, try to fetch the full pet data to get the image
              if (asset.category === 'pet' && !thumbnailUrl.startsWith('data:')) {
                try {
                  const petImage = await fetchPetImage(asset.id, activeVersion);
                  if (petImage) {
                    // Convert data URL to blob
                    const response = await fetch(petImage);
                    imgBlob = await response.blob();
                  }
                } catch (error) {
                  console.warn(`Failed to fetch pet image for ${asset.name}:`, error);
                }
              }
              
              // If we don't have a blob yet, try fetching from URL
              if (!imgBlob && thumbnailUrl && !thumbnailUrl.startsWith('data:')) {
                try {
                  const imgResponse = await fetch(thumbnailUrl, { mode: 'cors' });
                  if (!imgResponse.ok) throw new Error(`HTTP ${imgResponse.status}`);
                  const contentType = imgResponse.headers.get('content-type') || '';
                  // Check if response is actually an image to avoid CORB
                  if (!contentType.startsWith('image/')) {
                    throw new Error('Response is not an image');
                  }
                  imgBlob = await imgResponse.blob();
                } catch (error) {
                  // CORB or other fetch errors - try alternative URL
                  console.warn(`Failed to fetch from ${thumbnailUrl}, trying alternative:`, error);
                  
                  // Try icon URL as fallback
                  const iconUrl = getIconUrl(asset.id, asset.category, activeVersion);
                  if (iconUrl && iconUrl !== thumbnailUrl) {
                    try {
                      const iconResponse = await fetch(iconUrl, { mode: 'cors' });
                      if (iconResponse.ok) {
                        const contentType = iconResponse.headers.get('content-type') || '';
                        if (contentType.startsWith('image/')) {
                          imgBlob = await iconResponse.blob();
                        }
                      }
                    } catch (e) {
                      // Fallback also failed
                    }
                  }
                  
                  if (!imgBlob) {
                    thumbnailFailCount++;
                    continue;
                  }
                }
              }
            }
            
            if (!imgBlob) {
              thumbnailFailCount++;
              continue;
            }
            
            // Add image to zip file
            const sanitizedName = asset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = type === 'both' 
              ? `thumbnails/${activeVersion}_${activeCategory}_${asset.id}_${sanitizedName}.png`
              : `${activeVersion}_${activeCategory}_${asset.id}_${sanitizedName}.png`;
            zip.file(filename, imgBlob);
            
            thumbnailSuccessCount++;
          } catch (error) {
            console.warn(`Failed to download thumbnail for ${asset.name}:`, error);
            thumbnailFailCount++;
          }
        }
      }
      
      // Add JSON data if needed
      if (type === 'json' || type === 'both') {
        const jsonData = JSON.stringify(allAssets, null, 2);
        const jsonFilename = type === 'both' ? 'data.json' : `${activeVersion}_${activeCategory}_data.json`;
        zip.file(jsonFilename, jsonData);
      }
      
      // Generate zip file and download
      if (type === 'json') {
        // For JSON only, download as JSON file directly
        const jsonData = JSON.stringify(allAssets, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeVersion}_${activeCategory}_data.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Downloaded ${allAssets.length} items as JSON!`);
      } else {
        // For thumbnails or both, download as ZIP
        if (type === 'thumbnails' && thumbnailSuccessCount === 0) {
          alert('No thumbnails were downloaded. All downloads failed.');
          return;
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        
        let filename = '';
        if (type === 'thumbnails') {
          filename = `${activeVersion}_${activeCategory}_thumbnails.zip`;
        } else {
          filename = `${activeVersion}_${activeCategory}_complete.zip`;
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);
        
        if (type === 'thumbnails') {
          alert(`Downloaded ${thumbnailSuccessCount} thumbnails as ZIP${thumbnailFailCount > 0 ? ` (${thumbnailFailCount} failed)` : ''}!`);
        } else {
          alert(`Downloaded ${thumbnailSuccessCount} thumbnails and JSON data as ZIP${thumbnailFailCount > 0 ? ` (${thumbnailFailCount} thumbnails failed)` : ''}!`);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
      if (onDownloadStateChange) onDownloadStateChange(false, downloadCount);
    }
  };

  return (
    <div className="relative" ref={downloadMenuRef}>
      <button
        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
        disabled={isDownloading}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors ${
          isDownloading 
            ? 'bg-indigo-900 border-indigo-500 text-indigo-300' 
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Download options for current category and version"
      >
        {isDownloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>
      
      {showDownloadMenu && !isDownloading && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[140px]">
          <button
            onClick={() => handleDownload('thumbnails')}
            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
            <span>Thumbnails</span>
          </button>
          <button
            onClick={() => handleDownload('json')}
            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => handleDownload('both')}
            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 transition-colors border-t border-gray-700"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Both (ZIP)</span>
          </button>
        </div>
      )}
    </div>
  );
};

