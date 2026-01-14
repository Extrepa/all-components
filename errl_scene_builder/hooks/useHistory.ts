import { useState, useCallback } from "react";

/**
 * Generic history helper for time-travel state.
 * Keeps a timeline of states; new mutations truncate any "future" entries.
 */
export function useHistory<T>(initialState: T) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<T[]>([initialState]);

  const setState = useCallback(
    (next: T | ((prev: T) => T)) => {
      setHistory((prev) => {
        const current = prev[index];
        const resolved = typeof next === "function" ? (next as (p: T) => T)(current) : next;
        const newHistory = prev.slice(0, index + 1).concat([resolved]);
        setIndex(newHistory.length - 1);
        return newHistory;
      });
    },
    [index]
  );

  const undo = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => prev); // touch to keep closure aligned
    setIndex((i) => Math.min(i + 1, history.length - 1));
  }, [history.length]);

  return {
    state: history[index],
    setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}
