import React, { useEffect, useRef, useState } from "react";
import { useSceneStore } from "../scene/store";

/**
 * PlaybackControls
 *
 * Drives the global playbackTimeMs in the scene store. Handles play/pause/stop,
 * speed adjustment, and quick deselect for convenience.
 */
export const PlaybackControls: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const setSelectedEntities = useSceneStore((s) => s.setSelectedEntities);
  const setPlaybackTime = useSceneStore((s) => s.setPlaybackTime);

  const handleStop = () => {
    setPlaying(false);
    startRef.current = null;
    setPlaybackTime(0);
  };

  useEffect(() => {
    const loop = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = (ts - startRef.current) * speed;
      setPlaybackTime(elapsed);
      if (playing) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    if (playing) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [playing, speed, setPlaybackTime]);

  return (
    <div className="motion-controls">
      <div className="transport">
        <div>
          <button onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={handleStop}>
            Stop
          </button>
          <button onClick={() => setSelectedEntities([])}>
            Deselect
          </button>
        </div>
        <label>
          <span>Speed</span>
          <input
            type="range"
            min={0.1}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed.toFixed(1)}x</span>
        </label>
      </div>
      <div className="status-chip">
        <span className="dot" />
        Live preview
      </div>
    </div>
  );
};
