import { useCallback } from 'react';

export const useErrlSound = () => {
  const playTone = useCallback((freq: number, type: 'sine' | 'square' | 'triangle', duration: number) => {
    if (typeof window === 'undefined') return;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  }, []);

  const playHover = () => playTone(800, 'sine', 0.1);
  const playClick = () => {
    playTone(400, 'triangle', 0.1);
    setTimeout(() => playTone(600, 'sine', 0.2), 50);
  };

  return { playHover, playClick };
};