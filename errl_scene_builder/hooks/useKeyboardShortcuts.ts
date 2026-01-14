import { useEffect } from "react";

type Props = {
  onDelete: () => void;
  onDeselect: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export const useKeyboardShortcuts = ({ onDelete, onDeselect, onUndo, onRedo }: Props) => {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDelete();
      }
      if (e.key === "Escape") {
        onDeselect();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        onRedo();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onDelete, onDeselect, onRedo, onUndo]);
};
