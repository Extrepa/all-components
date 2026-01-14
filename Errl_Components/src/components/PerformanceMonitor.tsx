import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  isVisible: boolean;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    isVisible: false,
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);

  useFrame((_, delta) => {
    frameCountRef.current++;
    const now = performance.now();
    const timeSinceLastUpdate = now - lastTimeRef.current;

    // Track frame time in milliseconds
    const frameTimeMs = delta * 1000;
    frameTimesRef.current.push(frameTimeMs);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    if (timeSinceLastUpdate >= 1000) {
      // Update stats every second
      const fps = Math.round((frameCountRef.current * 1000) / timeSinceLastUpdate);
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Calculate average frame time
      const avgFrameTime =
        frameTimesRef.current.length > 0
          ? frameTimesRef.current.reduce((a, b) => a + b, 0) /
            frameTimesRef.current.length
          : 16.67;

      setStats((prev) => ({
        fps,
        frameTime: Math.round(avgFrameTime * 100) / 100,
        isVisible: prev.isVisible,
      }));
    }
  });

  useEffect(() => {
    // Toggle visibility with 'P' key
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setStats((prev) => ({ ...prev, isVisible: !prev.isVisible }));
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  if (!stats.isVisible) return null;

  const fpsColor = stats.fps >= 55 ? '#00ff00' : stats.fps >= 30 ? '#ffff00' : '#ff0000';

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 10000,
        background: 'rgba(5, 5, 16, 0.9)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        color: '#f9f5ff',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ marginBottom: '0.5rem', opacity: 0.7 }}>
        Performance Monitor (Press P to toggle)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div>
          FPS:{' '}
          <span style={{ color: fpsColor, fontWeight: 'bold' }}>
            {stats.fps}
          </span>
        </div>
        <div>
          Frame Time:{' '}
          <span style={{ color: fpsColor }}>
            {stats.frameTime}ms
          </span>
        </div>
      </div>
    </div>
  );
}

