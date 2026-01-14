import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import { SceneNode } from '../../../types';
import { exportAsPNG, exportAsJPG, exportAsSVG, parseScale } from '../../../utils/export';

interface ExportSectionProps {
  node: SceneNode;
  nodes: Record<string, SceneNode>;
  expanded: boolean;
  onToggle: () => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  node,
  nodes,
  expanded,
  onToggle
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'svg' | 'jpg'>('png');
  const [selectedScale, setSelectedScale] = useState('1x');

  const handleQuickExport = async (format: 'PNG' | 'SVG' | 'JPG', scale: string) => {
    const scaleNum = parseScale(scale);
    const fileName = `${node.name || 'export'}${scale !== '1x' ? `@${scale}` : ''}.${format.toLowerCase()}`;
    
    try {
      if (format === 'PNG') {
        await exportAsPNG(node, nodes, scaleNum, fileName);
      } else if (format === 'SVG') {
        exportAsSVG(node, nodes, scaleNum, fileName);
      } else if (format === 'JPG') {
        await exportAsJPG(node, nodes, scaleNum, 0.9, fileName);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleCustomExport = async () => {
    const scaleNum = parseScale(selectedScale);
    const fileName = `${node.name || 'export'}.${selectedFormat}`;
    
    try {
      if (selectedFormat === 'png') {
        await exportAsPNG(node, nodes, scaleNum, fileName);
      } else if (selectedFormat === 'svg') {
        exportAsSVG(node, nodes, scaleNum, fileName);
      } else if (selectedFormat === 'jpg') {
        await exportAsJPG(node, nodes, scaleNum, 0.9, fileName);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };
  return (
    <div className="border-b border-gray-700/50">
      <div className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700/30">
        <button 
          onClick={onToggle} 
          className="flex-1 flex items-center justify-between text-left transition-all"
        >
          <span className="text-[11px] font-medium text-gray-300">Export</span>
          {expanded ? (
            <ChevronDown size={14} className="text-gray-500 transition-transform" />
          ) : (
            <ChevronRight size={14} className="text-gray-500 transition-transform" />
          )}
        </button>
      </div>
      {expanded && (
        <div className="px-2 pb-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
          {/* Quick Export Buttons */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleQuickExport('PNG', '1x')}
                className="px-2 py-1.5 bg-gray-800/50 rounded text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-center gap-1"
                title="Export as PNG @1x"
              >
                <Download size={12} />
                PNG @1x
              </button>
              <button
                onClick={() => handleQuickExport('PNG', '2x')}
                className="px-2 py-1.5 bg-gray-800/50 rounded text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-center gap-1"
                title="Export as PNG @2x"
              >
                <Download size={12} />
                PNG @2x
              </button>
              <button
                onClick={() => handleQuickExport('PNG', '3x')}
                className="px-2 py-1.5 bg-gray-800/50 rounded text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-center gap-1"
                title="Export as PNG @3x"
              >
                <Download size={12} />
                PNG @3x
              </button>
              <button
                onClick={() => handleQuickExport('SVG', '1x')}
                className="px-2 py-1.5 bg-gray-800/50 rounded text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-center gap-1"
                title="Export as SVG"
              >
                <Download size={12} />
                SVG
              </button>
              <button
                onClick={() => handleQuickExport('JPG', '1x')}
                className="px-2 py-1.5 bg-gray-800/50 rounded text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-center gap-1"
                title="Export as JPG"
              >
                <Download size={12} />
                JPG
              </button>
            </div>
          </div>
          
          {/* Custom Export Settings */}
          <div className="bg-gray-800/50 rounded px-2 py-1.5 space-y-1.5 border-t border-gray-700 pt-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500">Format</span>
              <select 
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as 'png' | 'svg' | 'jpg')}
                className="bg-gray-700 rounded px-2 py-0.5 text-xs outline-none text-white border-none"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500">Scale</span>
              <select 
                value={selectedScale}
                onChange={(e) => setSelectedScale(e.target.value)}
                className="bg-gray-700 rounded px-2 py-0.5 text-xs outline-none text-white border-none"
              >
                <option value="0.5x">0.5x</option>
                <option value="1x">1x</option>
                <option value="1.5x">1.5x</option>
                <option value="2x">2x</option>
                <option value="3x">3x</option>
                <option value="4x">4x</option>
              </select>
            </div>
            <button
              onClick={handleCustomExport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1"
            >
              <Download size={12} />
              Export {node.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

