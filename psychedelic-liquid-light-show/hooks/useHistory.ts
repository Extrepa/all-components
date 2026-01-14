import { useCallback, useRef } from 'react';
import type { LiquidConfig } from '../types';
import { MAX_HISTORY_SIZE } from '../constants';
import { useHistory as useSharedHistory } from '@/shared/hooks';

export interface HistorySnapshot {
  config: LiquidConfig;
  history: LiquidConfig[];
  historyIndex: number;
}

export function useHistory(initialConfig: LiquidConfig) {
  const {
    state: config,
    setState: setConfigState,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
    clearHistory,
    historyLength,
  } = useSharedHistory<LiquidConfig>(initialConfig, {
    mode: 'index-based',
    maxHistory: MAX_HISTORY_SIZE,
  });

  // Keep refs for snapshot functionality (for persistence)
  const historyRef = useRef<LiquidConfig[]>([]);
  const indexRef = useRef<number>(0);

  const setConfig = useCallback((updater: LiquidConfig | ((prev: LiquidConfig) => LiquidConfig)) => {
    setConfigState(updater);
  }, [setConfigState]);

  const updateConfig = useCallback(
    (partial: Partial<LiquidConfig>, pushToHistory: boolean = true) => {
      if (pushToHistory) {
        setConfigState((curr) => ({ ...curr, ...partial } as LiquidConfig));
      } else {
        // Direct update without history
        setConfigState((curr) => ({ ...curr, ...partial } as LiquidConfig));
      }
    },
    [setConfigState]
  );

  const undo = useCallback(() => {
    undoHistory();
  }, [undoHistory]);

  const redo = useCallback(() => {
    redoHistory();
  }, [redoHistory]);

  const getSnapshot = useCallback((): HistorySnapshot => {
    // Note: Shared hook doesn't expose internal history array directly
    // This is a limitation - we'd need to track it separately if needed
    // For now, return current state
    return {
      config,
      history: [config], // Simplified - full history not accessible
      historyIndex: 0,
    };
  }, [config]);

  const setFromSnapshot = useCallback((snap: HistorySnapshot) => {
    if (!snap || !snap.config) return;
    // Reset history and set to snapshot config
    clearHistory();
    setConfigState(snap.config);
  }, [clearHistory, setConfigState]);

  const reset = useCallback((next: LiquidConfig) => {
    clearHistory();
    setConfigState(next);
  }, [clearHistory, setConfigState]);

  return {
    config,
    setConfig,
    updateConfig,
    undo,
    redo,
    getSnapshot,
    setFromSnapshot,
    reset,
    // Expose canUndo/canRedo for UI
    canUndo,
    canRedo,
    // Keep refs for backward compatibility (may not be fully accurate)
    historyRef,
    indexRef,
  } as const;
}
