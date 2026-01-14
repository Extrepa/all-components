import React, { useState, useEffect, useRef } from 'react';
import { AnimationSequence, GameAsset } from '../types';
import { animationService } from '../services/animationService';
import { AIProviderType } from '../services/aiProvider';
import { Play, Download, X, CheckCircle, RefreshCw, Grid3x3, Pause, Square } from 'lucide-react';
import { exportSpriteSheet, SpriteSheetLayout } from '../utils/spriteSheet';
import { generateSpriteSheetWithWorker } from '../utils/spriteSheetWorker';

type AssetType = GameAsset['type'];

interface AnimationGeneratorProps {
  assetName: string;
  basePrompt: string;
  assetType: AssetType;
  sourceImageUrl?: string;
  provider: AIProviderType;
  onComplete?: (sequences: AnimationSequence[]) => void;
  onCancel?: () => void;
}

const ANIMATION_KEYS = [
  { key: 'idle', label: 'Idle' },
  { key: 'walk', label: 'Walk' },
  { key: 'run', label: 'Run' },
  { key: 'jump', label: 'Jump' },
  { key: 'attack', label: 'Attack' },
  { key: 'hurt', label: 'Hurt' },
  { key: 'die', label: 'Die' },
  { key: 'special', label: 'Special' }
];

export const AnimationGenerator: React.FC<AnimationGeneratorProps> = ({
  assetName,
  basePrompt,
  assetType,
  sourceImageUrl,
  provider,
  onComplete,
  onCancel
}) => {
  const [selectedAnimations, setSelectedAnimations] = useState<string[]>(['idle', 'walk']);
  const [frameCount, setFrameCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ animationKey: string; frame: number; total: number } | null>(null);
  const [sequences, setSequences] = useState<AnimationSequence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [spriteSheetLayout, setSpriteSheetLayout] = useState<SpriteSheetLayout>({ type: 'horizontal' });
  const [isExportingSpriteSheet, setIsExportingSpriteSheet] = useState(false);
  const [playingSequence, setPlayingSequence] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<{ sequenceId: string; frameIndex: number } | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(200); // ms per frame

  const handleToggleAnimation = (key: string) => {
    setSelectedAnimations(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleGenerate = async () => {
    if (selectedAnimations.length === 0) {
      alert('Please select at least one animation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSequences([]);

    // Pre-create empty sequences for all animations so they show up immediately
    selectedAnimations.forEach((animationKey) => {
      const sequenceId = `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${animationKey}`;
      const emptySequence: AnimationSequence = {
        id: sequenceId,
        name: `${assetName} - ${animationKey}`,
        animationKey,
        frames: [],
        frameCount: 0,
        createdAt: Date.now()
      };
      setSequences(prev => [...prev, emptySequence]);
    });

    try {
      const generatedSequences = await animationService.generateMultipleAnimations(
        assetName,
        selectedAnimations,
        basePrompt,
        frameCount,
        assetType,
        sourceImageUrl,
        (animationKey, frameNumber, total) => {
          setProgress({ animationKey, frame: frameNumber, total });
        },
        (frame, sequenceId, animationKey) => {
          // Update sequence as frames complete - match by animationKey since sequenceId might differ
          setSequences(prev => {
            const updated = [...prev];
            const index = updated.findIndex(s => s.animationKey === animationKey);
            if (index >= 0) {
              const sequence = { ...updated[index] };
              // Add the completed frame if it doesn't already exist
              const frameExists = sequence.frames.some(f => f.id === frame.id);
              if (!frameExists && frame.imageUrl) {
                sequence.frames.push(frame);
                sequence.frames.sort((a, b) => a.frameNumber - b.frameNumber);
                sequence.frameCount = sequence.frames.length;
                // Update sequenceId if it changed
                if (sequence.id !== sequenceId) {
                  sequence.id = sequenceId;
                }
                updated[index] = sequence;
              }
            } else {
              // Create new sequence if it doesn't exist
              const newSequence: AnimationSequence = {
                id: sequenceId,
                name: `${assetName} - ${animationKey}`,
                animationKey,
                frames: frame.imageUrl ? [frame] : [],
                frameCount: frame.imageUrl ? 1 : 0,
                createdAt: Date.now()
              };
              updated.push(newSequence);
            }
            return updated;
          });
        }
      );

      // Final update with all sequences (in case any were missed)
      setSequences(generatedSequences);
      onComplete?.(generatedSequences);
    } catch (error: any) {
      console.error('Animation generation failed:', error);
      setError(error.message || 'Failed to generate animations');
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const handleDownloadFrame = (sequence: AnimationSequence, frame: number) => {
    const frameData = sequence.frames[frame];
    if (!frameData) return;

    const link = document.createElement('a');
    link.href = frameData.imageUrl;
    link.download = `${sequence.name}-${sequence.animationKey}-frame-${frame}.png`;
    link.click();
  };

  const handleDownloadAll = () => {
    sequences.forEach(sequence => {
      sequence.frames.forEach((frame, index) => {
        setTimeout(() => {
          handleDownloadFrame(sequence, index);
        }, index * 100);
      });
    });
  };

  const [spriteSheetProgress, setSpriteSheetProgress] = useState(0);

  const handleExportSpriteSheet = async () => {
    if (sequences.length === 0) return;

    setIsExportingSpriteSheet(true);
    setSpriteSheetProgress(0);
    try {
      // Use Web Worker for better performance
      const { image, metadata } = await generateSpriteSheetWithWorker(
        sequences,
        spriteSheetLayout,
        (progress) => setSpriteSheetProgress(progress)
      );

      // Download image
      const imageLink = document.createElement('a');
      imageLink.href = image;
      imageLink.download = `${assetName}-sprite-sheet.png`;
      document.body.appendChild(imageLink);
      imageLink.click();
      document.body.removeChild(imageLink);

      // Download metadata JSON
      const jsonStr = JSON.stringify(metadata, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(blob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `${assetName}-sprite-sheet.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);
    } catch (error: any) {
      console.error('Failed to export sprite sheet:', error);
      alert('Failed to export sprite sheet: ' + (error.message || 'Unknown error'));
    } finally {
      setIsExportingSpriteSheet(false);
      setSpriteSheetProgress(0);
    }
  };

  const handlePlayAnimation = (sequenceId: string) => {
    if (playingSequence === sequenceId) {
      // Stop playback
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setPlayingSequence(null);
      setCurrentFrame(null);
    } else {
      // Start playback
      const sequence = sequences.find(s => s.id === sequenceId);
      if (!sequence || sequence.frames.length === 0) return;

      setPlayingSequence(sequenceId);
      setCurrentFrame({ sequenceId, frameIndex: 0 });

      playbackIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (!prev) return null;
          const seq = sequences.find(s => s.id === prev.sequenceId);
          if (!seq) return null;

          const nextIndex = (prev.frameIndex + 1) % seq.frames.length;
          return { sequenceId: prev.sequenceId, frameIndex: nextIndex };
        });
      }, playbackSpeed);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Cleanup when sequences change
    if (playingSequence && !sequences.find(s => s.id === playingSequence)) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setPlayingSequence(null);
      setCurrentFrame(null);
    }
  }, [sequences, playingSequence]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-900/50">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Animation Generator</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isGenerating && sequences.length === 0 && (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">Select Animations</label>
              <div className="grid grid-cols-4 gap-2">
                {ANIMATION_KEYS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleToggleAnimation(key)}
                    className={`p-3 rounded border text-xs font-bold transition-all ${
                      selectedAnimations.includes(key)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">Frames per Animation</label>
              <select
                value={frameCount}
                onChange={(e) => setFrameCount(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm"
              >
                <option value={4}>4 frames</option>
                <option value={8}>8 frames</option>
                <option value={12}>12 frames</option>
              </select>
            </div>

            <div className="bg-gray-800/50 rounded p-3 border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Preview</div>
              <div className="text-sm text-gray-300">
                <div>Asset: <span className="text-indigo-400">{assetName}</span></div>
                <div>Animations: <span className="text-indigo-400">{selectedAnimations.length}</span></div>
                <div>Total Frames: <span className="text-indigo-400">{selectedAnimations.length * frameCount}</span></div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded p-3">
                <div className="text-sm text-red-400">{error}</div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={selectedAnimations.length === 0}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Generate Animations
            </button>
          </>
        )}

        {isGenerating && sequences.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-4" />
            <div className="text-sm text-gray-400 mb-2">Generating animations...</div>
            {progress && (
              <div className="text-xs text-gray-500">
                {progress.animationKey}: Frame {progress.frame} / {progress.total}
              </div>
            )}
          </div>
        )}

        {(sequences.length > 0 || isGenerating) && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-white">
                {isGenerating ? 'Generating Animations...' : 'Generated Animations'}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-800 rounded p-1">
                  <button
                    onClick={() => setSpriteSheetLayout({ type: 'horizontal' })}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      spriteSheetLayout.type === 'horizontal'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Horizontal Layout"
                  >
                    →
                  </button>
                  <button
                    onClick={() => setSpriteSheetLayout({ type: 'vertical' })}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      spriteSheetLayout.type === 'vertical'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Vertical Layout"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setSpriteSheetLayout({ type: 'grid', columns: 8 })}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      spriteSheetLayout.type === 'grid'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Grid Layout"
                  >
                    <Grid3x3 className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={handleExportSpriteSheet}
                  disabled={isExportingSpriteSheet}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white rounded text-xs font-bold flex items-center gap-2"
                  title="Export as Sprite Sheet"
                >
                  {isExportingSpriteSheet ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Grid3x3 className="w-3.5 h-3.5" />
                  )}
                  Sprite Sheet
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Frames
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sequences.map((sequence) => {
                const isPlaying = playingSequence === sequence.id;
                const displayFrameIndex = currentFrame?.sequenceId === sequence.id 
                  ? currentFrame.frameIndex 
                  : null;
                const isGeneratingSequence = isGenerating && progress?.animationKey === sequence.animationKey;
                
                return (
                  <div key={sequence.id} className="bg-gray-800 rounded border border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {sequence.name}
                          {isGeneratingSequence && (
                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sequence.animationKey} - {sequence.frames.length} / {frameCount} frames
                          {isGeneratingSequence && progress && (
                            <span className="text-indigo-400 ml-2">
                              (Generating frame {progress.frame}...)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayAnimation(sequence.id)}
                          className={`p-2 rounded transition-colors ${
                            isPlaying 
                              ? 'bg-red-600 hover:bg-red-500 text-white' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                          title={isPlaying ? 'Stop' : 'Play Animation'}
                        >
                          {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value={100}>Fast</option>
                          <option value={200}>Normal</option>
                          <option value={400}>Slow</option>
                        </select>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>

                    {/* Preview Area */}
                    {isPlaying && displayFrameIndex !== null && (
                      <div className="mb-3 flex justify-center">
                        <div className="relative">
                          <img
                            src={sequence.frames[displayFrameIndex]?.imageUrl}
                            alt={`Playing frame ${displayFrameIndex + 1}`}
                            className="w-32 h-32 object-contain rounded bg-gray-900 border-2 border-indigo-500 pixelated"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-indigo-400 font-bold">
                            Frame {displayFrameIndex + 1} / {sequence.frames.length}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-2">
                      {sequence.frames.map((frame, index) => {
                        const isCurrentFrame = isPlaying && displayFrameIndex === index;
                        return (
                          <div 
                            key={frame.id} 
                            className={`relative group ${
                              isCurrentFrame ? 'ring-2 ring-indigo-500' : ''
                            }`}
                          >
                            <img
                              src={frame.imageUrl}
                              alt={`Frame ${index}`}
                              className={`w-full aspect-square object-contain rounded bg-gray-900 border pixelated ${
                                isCurrentFrame ? 'border-indigo-500' : 'border-gray-700'
                              }`}
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => handleDownloadFrame(sequence, index)}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs"
                              >
                                Download
                              </button>
                            </div>
                            <div className={`absolute bottom-0 left-0 right-0 text-white text-[10px] text-center py-0.5 ${
                              isCurrentFrame ? 'bg-indigo-600' : 'bg-black/70'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        );
                      })}
                      {/* Show placeholder slots for frames that haven't been generated yet */}
                      {isGeneratingSequence && sequence.frames.length < frameCount && (
                        Array.from({ length: frameCount - sequence.frames.length }).map((_, i) => (
                          <div 
                            key={`placeholder-${i}`}
                            className="relative w-full aspect-square rounded bg-gray-900 border border-gray-700 border-dashed flex items-center justify-center"
                          >
                            <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
                            <div className="absolute bottom-0 left-0 right-0 text-gray-600 text-[10px] text-center py-0.5 bg-black/70">
                              {sequence.frames.length + i + 1}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

